/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Trusted synchronous executable association checks.
 * @module actions/executableAssociations
 */

/** @type {ReadonlyArray<object>} Native unsupported function category prototypes. */
const UNSUPPORTED_PROTOTYPES = Object.freeze([
    Object.getPrototypeOf(async function () {}),
    Object.getPrototypeOf(function* () {}),
    Object.getPrototypeOf(async function* () {}),
]);

/**
 * Rejects identifiable asynchronous and generator functions without invoking them.
 * This same-realm prototype check is not proof of synchronous behavior; trusted
 * functions must also obey their return contracts. Reflective failures propagate.
 * @param {unknown} value - Candidate trusted executable association.
 * @returns {boolean} Whether the association passes the structural check.
 */
export function isSynchronousAssociation(value) {
    if (typeof value !== 'function') {
        return false;
    }
    const visited = new Set();
    let prototype = Object.getPrototypeOf(value);
    while (prototype !== null) {
        if (UNSUPPORTED_PROTOTYPES.includes(prototype) || visited.has(prototype)) {
            return false;
        }
        visited.add(prototype);
        prototype = Object.getPrototypeOf(prototype);
    }
    return true;
}
