/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Immutable detached data tests.
 * @module tests/shared/immutableData
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { copyJsonData, immutableCopy } from '../../src/shared/immutableData.js';

test('creates mutable detached copies without changing the source', () => {
    const original = { values: [1, { value: null }] };
    const copy = copyJsonData(original);
    copy.values[1].value = true;
    assert.equal(original.values[1].value, null);
});

test('freezes all detached objects and arrays, but not the caller', () => {
    const original = { values: [1, { value: null }] };
    const copy = immutableCopy(original);
    assert.ok(Object.isFrozen(copy));
    assert.ok(Object.isFrozen(copy.values));
    assert.ok(Object.isFrozen(copy.values[1]));
    assert.throws(() => { copy.values[1].value = false; }, TypeError);
    original.values[1].value = true;
    assert.equal(copy.values[1].value, null);
    assert.equal(Object.isFrozen(original), false);
});

test('rejects invalid internal copy inputs with native TypeError', () => {
    assert.throws(() => copyJsonData(undefined), TypeError);
    assert.throws(() => immutableCopy({ nested: Infinity }), TypeError);
});

test('preserves primitives and special own keys', () => {
    for (const value of [null, false, 0, '', 1.25]) {
        assert.equal(immutableCopy(value), value);
    }
    const copy = immutableCopy(JSON.parse('{"__proto__":{"x":1}}'));
    assert.ok(Object.isFrozen(copy.__proto__));
    assert.equal(Object.getPrototypeOf(copy), Object.prototype);
});
