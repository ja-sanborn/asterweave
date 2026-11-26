/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview JSON Pointer path construction.
 * @module diagnostics/jsonPointer
 */

/**
 * Appends one unescaped reference token to a JSON Pointer.
 * @param {string} path - Existing pointer, including the empty root.
 * @param {string|number} token - Property name or array index.
 * @returns {string} Extended pointer with RFC 6901 escaping.
 */
export function appendPointer(path, token) {
    return path + '/' + String(token).replaceAll('~', '~0').replaceAll('/', '~1');
}
