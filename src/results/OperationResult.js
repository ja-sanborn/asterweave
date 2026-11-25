/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Common operation status semantics.
 * @module results/OperationResult
 */

/** Common internal base for fallible operation results. */
export class OperationResult {
    /** @type {string} Authoritative operation status. */
    #status;

    /**
     * Establishes a valid operation status for a specialized result.
     * @param {string} status - Completed, rejected or error.
     * @throws {TypeError} If instantiated directly or status is invalid.
     */
    constructor(status) {
        if (new.target === OperationResult
            || !['completed', 'rejected', 'error'].includes(status)) {
            throw new TypeError('Invalid operation result construction.');
        }
        this.#status = status;
    }

    /** @returns {string} Authoritative status. */
    get status() {
        return this.#status;
    }

    /** @returns {boolean} Whether the operation completed. */
    get isCompleted() {
        return this.#status === 'completed';
    }

    /** @returns {boolean} Whether the operation was rejected. */
    get isRejected() {
        return this.#status === 'rejected';
    }

    /** @returns {boolean} Whether an execution error occurred. */
    get isError() {
        return this.#status === 'error';
    }

    /** @returns {boolean} Operation completion, not gameplay success. */
    get isSuccess() {
        return this.isCompleted;
    }

    /** @returns {boolean} Whether the operation did not complete. */
    get isFailure() {
        return !this.isCompleted;
    }
}
