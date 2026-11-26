/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview JSON structural equality tests.
 * @module tests/engine/shared/jsonEquality.test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { areJsonValuesEqual } from '../../../src/engine/shared/jsonEquality.js';

test('JSON equality preserves types, array order and unordered record keys', () => {
    assert.equal(areJsonValuesEqual({ a: [null, -0], b: true }, { b: true, a: [null, 0] }), true);
    assert.equal(areJsonValuesEqual([1, 2], [2, 1]), false);
    assert.equal(areJsonValuesEqual(1, '1'), false);
    assert.equal(areJsonValuesEqual([], {}), false);
});

test('JSON equality handles deep validated trees iteratively', () => {
    let left = null;
    let right = null;
    for (let index = 0; index < 20000; index++) {
        left = [left];
        right = [right];
    }
    assert.equal(areJsonValuesEqual(left, right), true);
});

test('two absent optional values compare equal without treating null as absence', () => {
    assert.equal(areJsonValuesEqual(undefined, undefined), true);
    assert.equal(areJsonValuesEqual(undefined, null), false);
});
