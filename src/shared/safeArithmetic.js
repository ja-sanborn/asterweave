/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Safe integer predicates and checked addition.
 * @module shared/safeArithmetic
 */

/**
 * Tests a nonnegative safe-integer value.
 * @param {unknown} value - Candidate number.
 * @returns {boolean} Whether it satisfies the range.
 */
export function isNonnegativeSafeInteger(value) {
    return Number.isSafeInteger(value) && value >= 0;
}

/**
 * Tests a positive safe-integer value.
 * @param {unknown} value - Candidate number.
 * @returns {boolean} Whether it satisfies the range.
 */
export function isPositiveSafeInteger(value) {
    return Number.isSafeInteger(value) && value > 0;
}

/**
 * Adds nonnegative safe integers without overflow or rounding.
 * @param {number} left - First operand.
 * @param {number} right - Second operand.
 * @returns {number|undefined} Exact sum, or undefined on overflow.
 * @throws {RangeError} If either operand violates the internal contract.
 */
export function addNonnegative(left, right) {
    if (!isNonnegativeSafeInteger(left) || !isNonnegativeSafeInteger(right)) {
        throw new RangeError('Expected nonnegative safe integers.');
    }
    if (left > Number.MAX_SAFE_INTEGER - right) {
        return undefined;
    }
    return left + right;
}
