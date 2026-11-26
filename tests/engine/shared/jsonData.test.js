/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview JSON data safety and detached copy tests.
 * @module tests/engine/shared/jsonData
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectJsonData } from '../../../src/engine/shared/jsonData.js';

test('copies all JSON value kinds and detaches repeated acyclic references', () => {
    const shared = { nested: [null, false, 0, 'text', 1.5] };
    const source = { first: shared, second: shared };
    const result = inspectJsonData(source);
    assert.deepEqual(result.issues, []);
    assert.deepEqual(result.value, source);
    assert.notEqual(result.value.first, shared);
    assert.notEqual(result.value.first, result.value.second);
    result.value.first.nested.push('new');
    assert.equal(shared.nested.length, 5);
    assert.equal(result.value.second.nested.length, 5);
});

test('rejects unsupported data values without coercion', () => {
    const invalid = [undefined, NaN, Infinity, -Infinity, 1n, Symbol(), () => {}, new Date(),
        new Map(), new Set(), new Number(1), Object.create({ inherited: true })];
    for (const value of invalid) {
        const result = inspectJsonData(value);
        assert.equal(result.value, undefined);
        assert.equal(result.issues[0].path, '');
    }
});

test('rejects cycles and continues independent safe branches', () => {
    const source = { z: undefined, a: {} };
    source.a.back = source;
    const result = inspectJsonData(source);
    assert.equal(result.value, undefined);
    assert.deepEqual(result.issues.map((issue) => issue.path), ['/a/back', '/z']);
});

test('does not invoke accessors and escapes diagnostic paths', () => {
    let called = false;
    const source = Object.defineProperty({}, 'a~/b', {
        enumerable: true,
        get() {
            called = true;
            throw new Error('Unexpected getter call');
        },
    });
    const result = inspectJsonData(source);
    assert.equal(called, false);
    assert.equal(result.value, undefined);
    assert.equal(result.issues[0].path, '/a~0~1b');
});

test('rejects sparse arrays, extra array properties and symbols', () => {
    const sparse = [];
    sparse.length = 4294967295;
    const extra = [1];
    extra.extra = 2;
    const symbol = { [Symbol()]: 1 };
    for (const value of [sparse, extra, symbol, Array(2)]) {
        assert.ok(inspectJsonData(value).issues.length > 0);
    }
});

test('handles arbitrary JSON keys without prototype mutation', () => {
    const source = JSON.parse('{"__proto__":{"polluted":true},"constructor":1,"toString":null}');
    const result = inspectJsonData(source);
    assert.deepEqual(result.issues, []);
    assert.deepEqual(result.value, source);
    assert.equal(Object.getPrototypeOf(result.value), Object.prototype);
    assert.equal(Object.hasOwn(result.value, '__proto__'), true);
    assert.equal({}.polluted, undefined);
});

test('accepts null-prototype records and rejects hidden application data', () => {
    const source = Object.create(null);
    source.name = 'value';
    assert.deepEqual(inspectJsonData(source).value, { name: 'value' });
    const hidden = Object.defineProperty({}, 'hidden', { value: 1 });
    assert.equal(inspectJsonData(hidden).issues[0].path, '/hidden');
});

test('handles deep data without recursive call stack dependence', () => {
    const source = {};
    let current = source;
    for (let depth = 0; depth < 12000; depth++) {
        current.next = {};
        current = current.next;
    }
    const result = inspectJsonData(source);
    assert.deepEqual(result.issues, []);
    current = result.value;
    for (let depth = 0; depth < 12000; depth++) {
        current = current.next;
    }
    assert.deepEqual(current, {});
});

test('propagates reflective failures to the operation boundary', () => {
    const failure = new Error('inspection failed');
    const source = new Proxy({}, {
        getPrototypeOf() {
            throw failure;
        },
    });
    assert.throws(() => inspectJsonData(source), (error) => error === failure);
});

test('bounds shared-subtree amplification without limiting ordinary tree size', () => {
    let graph = { value: 1 };
    for (let depth = 0; depth < 40; depth++) {
        graph = { left: graph, right: graph };
    }
    const first = inspectJsonData(graph);
    assert.equal(first.value, undefined);
    assert.equal(first.issues.length, 1);
    assert.match(first.issues[0].message, /Shared data expansion exceeds inspection allowance/);
    assert.deepEqual(inspectJsonData(graph).issues, first.issues);

    const ordinary = Array.from({ length: 70000 }, (_, index) => ({ index }));
    const result = inspectJsonData(ordinary);
    assert.deepEqual(result.issues, []);
    assert.deepEqual(result.value, ordinary);
    assert.notEqual(result.value[0], ordinary[0]);
});

test('charges repeated scalar children before scheduling a large shared subtree', () => {
    const shared = Array(65536).fill(0);
    const result = inspectJsonData({ first: shared, second: shared });
    assert.equal(result.value, undefined);
    assert.deepEqual(result.issues, [{
        path: '/second', message: 'Shared data expansion exceeds inspection allowance.',
    }]);
});
