/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Iterative equality of inspected JSON data.
 * @module shared/jsonEquality
 */

/**
 * Compares validated JSON values without recursion or serialization.
 * @param {*} left - Inspected JSON value.
 * @param {*} right - Inspected JSON value.
 * @returns {boolean} Structural equality.
 */
export function areJsonValuesEqual(left, right) {
    const pending = [[left, right]];
    while (pending.length > 0) {
        const [a, b] = pending.pop();
        if (a === b) {
            continue;
        }
        if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object'
            || Array.isArray(a) !== Array.isArray(b)) {
            return false;
        }
        const keys = Object.keys(a);
        if (keys.length !== Object.keys(b).length) {
            return false;
        }
        for (const key of keys) {
            if (!Object.hasOwn(b, key)) {
                return false;
            }
            pending.push([a[key], b[key]]);
        }
    }
    return true;
}
