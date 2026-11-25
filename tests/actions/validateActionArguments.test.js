/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Submitted argument and specialized validator contracts.
 * @module tests/actions/validateActionArguments
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { validateActionDefinition } from '../../src/actions/validateActionDefinition.js';
import { validateActionArguments } from '../../src/actions/validateActionArguments.js';

/**
 * Constructs a validated definition for argument tests.
 * @param {object} args - Specification map.
 * @returns {object} Immutable definition.
 */
function definition(args) {
    const result = validateActionDefinition({
        type: 'game.testAction', enabled: true, turnCostSuccess: 1, turnCostFail: 0, arguments: args,
    });
    assert.equal(result.status, 'completed');
    return result.definition;
}

/**
 * Constructs a specialized diagnostic.
 * @returns {object} Argument finding.
 */
function finding() {
    return { source: 'args', code: 'INVALID_VALUE', severity: 'error', path: '/target', message: 'Invalid target.' };
}

test('accepts every supported argument type and preserves explicit null, false and zero', () => {
    const def = definition({
        text: { type: 'string', required: true },
        number: { type: 'number', required: true },
        integer: { type: 'integer', required: true },
        flag: { type: 'boolean', required: true },
        record: { type: 'object', required: true },
        items: { type: 'array', required: true },
        absent: { type: 'null', required: false },
    });
    const args = { text: '', number: 0, integer: -1, flag: false, record: {}, items: [], absent: null };
    const result = validateActionArguments(def, args);
    assert.equal(result.status, 'completed');
    assert.deepEqual(result.args, args);
    delete args.absent;
    assert.equal(Object.hasOwn(validateActionArguments(def, args).args, 'absent'), false);
});

test('rejects missing, unknown and invalid arguments with deterministic findings', () => {
    const def = definition({
        target: { type: 'string', required: true },
        amount: { type: 'integer', required: true },
        optional: { type: 'boolean', required: false },
    });
    const result = validateActionArguments(def, { amount: '1', optional: null, 'bad/~': true });
    assert.equal(result.status, 'rejected');
    assert.equal(Object.hasOwn(result, 'args'), false);
    assert.deepEqual(result.diagnostics.map(({ code, path }) => [code, path]), [
        ['INVALID_TYPE', '/amount'],
        ['INVALID_TYPE', '/optional'],
        ['REQUIRED_FIELD', '/target'],
        ['UNKNOWN_FIELD', '/bad~1~0'],
    ]);
});

test('checks exact allowed values and safe integer boundaries without coercion', () => {
    const def = definition({
        direction: { type: 'string', required: true, allowedValues: ['east', 'west'] },
        amount: { type: 'integer', required: true },
        zero: { type: 'number', required: true, allowedValues: [0] },
    });
    assert.equal(validateActionArguments(def, {
        direction: 'east', amount: Number.MAX_SAFE_INTEGER, zero: -0,
    }).status, 'completed');
    for (const direction of ['East', 'e', ' east', null]) {
        assert.equal(validateActionArguments(def, { direction, amount: 1, zero: 0 }).status, 'rejected');
    }
    for (const amount of [0.1, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity, '1']) {
        assert.equal(validateActionArguments(def, { direction: 'east', amount, zero: 0 }).status, 'rejected');
    }
});

test('validates reference syntax without requiring world existence or authority', () => {
    for (const kind of ['actor', 'entity', 'location', 'participant', 'world', 'player']) {
        const def = definition({ target: { type: 'string', required: true, referenceKind: kind } });
        const valid = kind === 'world' ? 'world' : 'unknownId';
        assert.equal(validateActionArguments(def, { target: valid }).status, 'completed');
        for (const target of ['bad.id', ' bad', '', 'Upper', 1]) {
            assert.equal(validateActionArguments(def, { target }).status, 'rejected');
        }
        if (kind !== 'world' && kind !== 'player') {
            assert.equal(validateActionArguments(def, { target: 'world' }).status, 'rejected');
        }
    }
});

test('specialized validation receives immutable detached data only after generic success', () => {
    const def = definition({ data: { type: 'object', required: true } });
    const input = { data: { items: [1] } };
    let calls = 0;
    const validator = (args) => {
        calls++;
        assert.notEqual(args, input);
        assert.throws(() => args.data.items.push(2), TypeError);
        return [];
    };
    assert.equal(validateActionArguments(def, {}, validator).status, 'rejected');
    assert.equal(calls, 0);
    const result = validateActionArguments(def, input, validator);
    assert.equal(calls, 1);
    input.data.items.push(3);
    assert.deepEqual(result.args.data.items, [1]);
    assert.throws(() => { result.args.data = {}; }, TypeError);
});

test('specialized findings are immutable, detached and deduplicated', () => {
    const def = definition({ target: { type: 'string', required: true } });
    const diagnostic = finding();
    const result = validateActionArguments(def, { target: 'a' }, () => [diagnostic, diagnostic]);
    diagnostic.message = 'changed';
    assert.equal(result.status, 'rejected');
    assert.equal(result.diagnostics.length, 1);
    assert.equal(result.diagnostics[0].message, 'Invalid target.');
    assert.throws(() => { result.diagnostics[0].message = 'changed'; }, TypeError);
});

test('invalid specialized returns and unexpected exceptions propagate', () => {
    const def = definition({});
    for (const validator of [
        () => undefined, () => ({}), () => [null], () => [{ ...finding(), extra: true }],
        () => [{ ...finding(), source: 'definition' }], () => [{ ...finding(), path: 'bad' }],
        async () => [], () => [Object.create({ ...finding() })],
    ]) {
        assert.throws(() => validateActionArguments(def, {}, validator), TypeError);
    }
    assert.throws(() => validateActionArguments(def, {}, null), TypeError);
    const error = new Error('unexpected');
    assert.throws(() => validateActionArguments(def, {}, () => { throw error; }), (caught) => caught === error);
});

test('rejects non-data arguments and never invokes ordinary getters', () => {
    const def = definition({ data: { type: 'object', required: true } });
    let called = false;
    const input = { get data() { called = true; return {}; } };
    const cyclic = {};
    cyclic.self = cyclic;
    for (const args of [null, [], undefined, input, { data: cyclic }, { data: { fn() {} } }]) {
        assert.equal(validateActionArguments(def, args).status, 'rejected');
    }
    assert.equal(called, false);
    const error = new Error('inspection failed');
    const proxy = new Proxy({}, { ownKeys() { throw error; } });
    assert.throws(() => validateActionArguments(def, proxy), (caught) => caught === error);
});

test('prototype-related argument names require explicit own declarations and values', () => {
    const def = definition(JSON.parse('{"constructor":{"type":"string","required":true}}'));
    assert.equal(validateActionArguments(def, {}).status, 'rejected');
    assert.equal(validateActionArguments(def, { constructor: 'item' }).status, 'completed');
    assert.equal(validateActionArguments(definition({}), { constructor: 'item' }).status, 'rejected');
    assert.equal(validateActionArguments(definition({}), JSON.parse('{"__proto__":{}}')).status, 'rejected');
});

test('rejects unsupported validator categories before invocation', () => {
    const def = definition({});
    let calls = 0;
    for (const validator of [
        async () => { calls++; return []; },
        function* () { calls++; },
        async function* () { calls++; },
    ]) {
        assert.throws(() => validateActionArguments(def, {}, validator), TypeError);
    }
    assert.equal(calls, 0);
});

test('rejects accidental native Promise returns without unhandled rejection or thenable execution', async () => {
    const def = definition({});
    assert.throws(() => validateActionArguments(def, {}, () => Promise.resolve([])), TypeError);
    assert.throws(() => validateActionArguments(def, {}, () => Promise.reject(new Error('private'))), TypeError);
    let accessed = false;
    const thenable = { get then() { accessed = true; throw new Error('must not execute'); } };
    assert.throws(() => validateActionArguments(def, {}, () => thenable), TypeError);
    assert.equal(accessed, false);
    // Allow the native test runner to detect any unhandled rejection.
    await setImmediate();
});
