/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared inspected record shape checks.
 * @module tests/engine/shared/recordShape
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { isRecord, missingFields, unknownFields } from '../../../src/engine/shared/recordShape.js';

test('distinguishes inspected records from arrays and primitives', () => {
    for (const value of [{}, Object.create(null), JSON.parse('{"__proto__":1}')]) {
        assert.equal(isRecord(value), true);
    }
    for (const value of [null, [], 1, false, '', undefined]) {
        assert.equal(isRecord(value), false);
    }
});

test('finds missing and unknown own fields without confusing inherited names', () => {
    const record = JSON.parse('{"z":0,"a":null,"__proto__":false}');
    assert.deepEqual(missingFields(record, ['constructor', 'z', 'toString', 'a']), ['constructor', 'toString']);
    assert.deepEqual(unknownFields(record, ['z']), ['__proto__', 'a']);
    assert.deepEqual(missingFields(record, ['a', '__proto__']), []);
});
