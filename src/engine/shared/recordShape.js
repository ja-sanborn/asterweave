/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Structural predicates for already inspected JSON data.
 * @module shared/recordShape
 */

/**
 * Checks whether inspected JSON data is a record, not an array or primitive.
 * Does not inspect or validate arbitrary JavaScript objects.
 * @param {unknown} value - Previously inspected JSON data.
 * @returns {boolean} Whether the value is a record.
 */
export function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Finds missing own fields in the supplied schema order.
 * @param {object} value - Inspected record.
 * @param {ReadonlyArray<string>} required - Required keys.
 * @returns {string[]} Missing keys.
 */
export function missingFields(value, required) {
    return required.filter((key) => !Object.hasOwn(value, key));
}

/**
 * Finds unrecognized own fields in code-unit order.
 * @param {object} value - Inspected record.
 * @param {ReadonlyArray<string>} allowed - Permitted keys.
 * @returns {string[]} Unrecognized keys.
 */
export function unknownFields(value, allowed) {
    const keys = new Set(allowed);
    return Object.keys(value).sort().filter((key) => !keys.has(key));
}
