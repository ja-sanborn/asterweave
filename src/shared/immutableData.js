/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Detached JSON copies and iterative recursive freezing.
 * @module shared/immutableData
 */

import { inspectJsonData } from './jsonData.js';

/**
 * Copies JSON-compatible data without retaining mutable caller references.
 * @param {*} value - JSON-compatible data.
 * @returns {*} Detached mutable copy.
 * @throws {TypeError} If the internal data contract is violated.
 */
export function copyJsonData(value) {
    const inspected = inspectJsonData(value);
    if (inspected.issues.length > 0) {
        throw new TypeError('Expected JSON-compatible data.');
    }
    return inspected.value;
}

/**
 * Copies and recursively freezes JSON-compatible data.
 * @param {*} value - JSON-compatible data.
 * @returns {*} Detached read-only copy.
 * @throws {TypeError} If the internal data contract is violated.
 */
export function immutableCopy(value) {
    const copy = copyJsonData(value);
    const pending = [copy];
    while (pending.length > 0) {
        const current = pending.pop();
        if (current !== null && typeof current === 'object') {
            for (const key of Object.keys(current)) {
                pending.push(current[key]);
            }
            Object.freeze(current);
        }
    }
    return copy;
}
