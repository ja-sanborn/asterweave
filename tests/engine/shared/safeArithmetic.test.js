/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Safe-integer arithmetic boundary tests.
 * @module tests/engine/shared/safeArithmetic
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    addNonnegative,
    isNonnegativeSafeInteger,
    isPositiveSafeInteger,
} from '../../../src/engine/shared/safeArithmetic.js';

test('checks positive and nonnegative integer ranges without coercion', () => {
    assert.ok(isNonnegativeSafeInteger(0));
    assert.equal(isPositiveSafeInteger(0), false);
    assert.ok(isPositiveSafeInteger(Number.MAX_SAFE_INTEGER));
    for (const value of [-1, 1.2, Infinity, NaN, '1', Number.MAX_SAFE_INTEGER + 1]) {
        assert.equal(isNonnegativeSafeInteger(value), false);
        assert.equal(isPositiveSafeInteger(value), false);
    }
});

test('adds exact safe integers and detects overflow before addition', () => {
    assert.equal(addNonnegative(1, 2), 3);
    assert.equal(addNonnegative(Number.MAX_SAFE_INTEGER - 1, 1), Number.MAX_SAFE_INTEGER);
    assert.equal(addNonnegative(Number.MAX_SAFE_INTEGER, 0), Number.MAX_SAFE_INTEGER);
    assert.equal(addNonnegative(Number.MAX_SAFE_INTEGER, 1), undefined);
    assert.throws(() => addNonnegative(-1, 1), RangeError);
    assert.throws(() => addNonnegative(1, Infinity), RangeError);
});
