/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Immutable administrative reset results.
 * @module results/ResetResult
 */

import { OperationResult } from './OperationResult.js';
import { immutableCopy } from '../shared/immutableData.js';
import { isRecord } from '../shared/recordShape.js';

/** @type {symbol} Private construction capability. */
const CONSTRUCTION = Symbol('ResetResult');

/** Administrative operation result without gameplay fields. */
export class ResetResult extends OperationResult {
    /** @type {object|undefined} Closed safe error record. */
    #error;

    /**
     * Constructs a controlled reset result.
     * @param {symbol} token - Construction capability.
     * @param {string} status - Operation status.
     * @param {object|undefined} error - Safe error record.
     */
    constructor(token, status, error) {
        super(status);
        if (token !== CONSTRUCTION) {
            throw new TypeError('Use internal ResetResult factories.');
        }
        const expected = status === 'rejected' ? 'RESET_UNAVAILABLE' : 'RESET_FAILED';
        if (status === 'completed') {
            if (error !== undefined) {
                throw new TypeError('Completed reset has no error.');
            }
        } else {
            const data = immutableCopy(error);
            if (!isRecord(data) || Object.keys(data).length !== 1 || data.code !== expected) {
                throw new TypeError('Invalid reset error record.');
            }
            this.#error = data;
        }
        Object.freeze(this);
    }

    /** @returns {ResetResult} Successful administrative completion. */
    static completed() {
        return new ResetResult(CONSTRUCTION, 'completed');
    }

    /**
     * Creates a reset rejection.
     * @param {object} error - Safe rejection code.
     * @returns {ResetResult} Rejection.
     */
    static rejected(error) {
        return new ResetResult(CONSTRUCTION, 'rejected', error);
    }

    /**
     * Creates an execution failure.
     * @param {object} error - Safe failure code.
     * @returns {ResetResult} Execution error.
     */
    static error(error) {
        return new ResetResult(CONSTRUCTION, 'error', error);
    }

    /** @returns {object|undefined} Immutable error only when applicable. */
    get error() { return this.#error; }

    /** @returns {object} Detached serialized record. */
    toJSON() {
        return immutableCopy(this.isCompleted ? { status: this.status }
            : { status: this.status, error: this.#error });
    }
}
