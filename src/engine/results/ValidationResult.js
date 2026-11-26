/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Read-only standalone validation outcomes.
 * @module results/ValidationResult
 */

import { OperationResult } from './OperationResult.js';
import { prepareDiagnostics } from './resultData.js';
import { copyJsonData } from '../shared/immutableData.js';

/** @type {symbol} Internal factory construction capability. */
const CONSTRUCTION = Symbol('ValidationResult');

/** Specialized result for standalone canonical definition validation. */
export class ValidationResult extends OperationResult {
    /** @type {ReadonlyArray<object>} Detached findings. */
    #diagnostics;
    /** @type {object|undefined} Safe execution failure record. */
    #error;

    /**
     * Constructs a result through its internal factories.
     * @param {symbol} token - Private construction capability.
     * @param {string} status - Operation status.
     * @param {Array<object>} diagnostics - Applicable findings.
     * @throws {TypeError} On invalid construction or payload.
     */
    constructor(token, status, diagnostics) {
        super(status);
        if (token !== CONSTRUCTION) {
            throw new TypeError('Use the internal result factories.');
        }
        this.#diagnostics = prepareDiagnostics(status, diagnostics, false);
        this.#error = status === 'error'
            ? Object.freeze({ code: 'VALIDATION_FAILED' }) : undefined;
        Object.freeze(this);
    }

    /** @returns {ValidationResult} Completed validation result. */
    static completed() {
        return new ValidationResult(CONSTRUCTION, 'completed', []);
    }

    /**
     * Creates a rejected validation result.
     * @param {Array<object>} diagnostics - Nonempty definition findings.
     * @returns {ValidationResult} Rejection.
     * @throws {TypeError} On invalid findings.
     */
    static rejected(diagnostics) {
        return new ValidationResult(CONSTRUCTION, 'rejected', diagnostics);
    }

    /** @returns {ValidationResult} Safe unexpected execution failure. */
    static failed() {
        return new ValidationResult(CONSTRUCTION, 'error', []);
    }

    /** @returns {ReadonlyArray<object>} Immutable findings. */
    get diagnostics() {
        return this.#diagnostics;
    }

    /** @returns {object|undefined} Safe error only on execution failure. */
    get error() {
        return this.#error;
    }

    /**
     * Serializes only the documented operation envelope.
     * @returns {object} Detached mutable JSON-compatible record.
     */
    toJSON() {
        const record = { status: this.status, diagnostics: copyJsonData(this.#diagnostics) };
        if (this.isError) {
            record.error = copyJsonData(this.#error);
        }
        return record;
    }
}
