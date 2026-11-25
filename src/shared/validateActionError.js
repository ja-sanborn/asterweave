/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Closed action error records shared by execution and results.
 * @module shared/validateActionError
 */

import { isRecord } from './recordShape.js';

/**
 * Checks an already inspected error record. Details are trusted, explicitly
 * selected semantic JSON data; callers must not include private state.
 * @param {object} error - Detached error record.
 * @param {ReadonlyArray<string>} codes - Allowed operation-specific codes.
 * @returns {boolean} Whether the record satisfies the error contract.
 */
export function validateActionError(error, codes) {
    return isRecord(error) && Object.hasOwn(error, 'code')
        && codes.includes(error.code)
        && Object.keys(error).every((key) => key === 'code' || key === 'details');
}
