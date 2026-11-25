/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared protection for unsupported synchronous return shapes.
 * @module shared/synchronousReturn
 */

/**
 * Rejects an invalid return and observes accidental native Promise rejection.
 * Does not invoke arbitrary thenables or await any value.
 * @param {unknown} value - Invalid return.
 * @param {string} message - Internal contract explanation.
 * @throws {TypeError} Always.
 */
export function rejectSynchronousReturn(value, message) {
    if (value !== null && typeof value === 'object') {
        try {
            Promise.prototype.then.call(value, undefined, () => undefined);
        } catch (cause) {
            throw new TypeError(message, { cause });
        }
    }
    throw new TypeError(message);
}
