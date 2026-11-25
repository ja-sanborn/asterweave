/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Synchronous closed handler outcome inspection.
 * @module actions/validateHandlerOutcome
 */

import { immutableCopy } from '../shared/immutableData.js';
import { isRecord } from '../shared/recordShape.js';
import { rejectSynchronousReturn } from '../shared/synchronousReturn.js';
import { ACTION_REJECTION_CODES } from '../shared/operationCodes.js';

/**
 * Validates a handler's outcome without assimilating arbitrary thenables.
 * @param {unknown} input - Handler return.
 * @returns {object} Detached accepted outcome.
 * @throws {TypeError} For malformed or asynchronous returns.
 */
export function validateHandlerOutcome(input) {
    let outcome;
    try {
        outcome = immutableCopy(input);
    } catch (error) {
        try {
            rejectSynchronousReturn(input, 'Invalid synchronous handler outcome.');
        } catch (failure) {
            throw new TypeError('Invalid synchronous handler outcome.', { cause: error });
        }
    }
    if (!isRecord(outcome) || Object.keys(outcome).length !== 2) {
        throw new TypeError('Invalid handler outcome.');
    }
    if (outcome.status === 'completed' && ['success', 'failure'].includes(outcome.outcome)) {
        return outcome;
    }
    if (outcome.status === 'rejected' && isRecord(outcome.error)
        && ACTION_REJECTION_CODES.includes(outcome.error.code)) {
        // Only the established safe code is promoted; no arbitrary handler detail is exposed.
        return Object.freeze({ status: 'rejected', error: Object.freeze({ code: outcome.error.code }) });
    }
    throw new TypeError('Invalid handler outcome.');
}
