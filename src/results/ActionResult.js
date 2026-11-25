/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Immutable gameplay operation results.
 * @module results/ActionResult
 */

import { outputAudienceIds } from '../shared/semanticOutput.js';
import { OperationResult } from './OperationResult.js';
import { validateActionError } from '../shared/validateActionError.js';
import { immutableCopy } from '../shared/immutableData.js';
import { isRecord } from '../shared/recordShape.js';
import { isNonnegativeSafeInteger } from '../shared/safeArithmetic.js';
import { ACTION_REJECTION_CODES } from '../shared/operationCodes.js';

/** @type {symbol} Private result construction capability. */
const CONSTRUCTION = Symbol('ActionResult');

/** Immutable operation-specific action result. */
export class ActionResult extends OperationResult {
    /** @type {object} Detached serialized result envelope. */
    #data;

    /**
     * Constructs a result using trusted internal factories.
     * @param {symbol} token - Construction capability.
     * @param {string} status - Operation status.
     * @param {object} payload - Validated internal payload.
     */
    constructor(token, status, payload) {
        super(status);
        if (token !== CONSTRUCTION) {
            throw new TypeError('Use internal ActionResult factories.');
        }
        const data = immutableCopy(payload);
        const allowed = status === 'completed'
            ? ['actorId', 'requestId', 'outcome', 'turnsAdvanced', 'outputs']
            : ['actorId', 'requestId', 'error'];
        if (!isRecord(data) || Object.keys(data).some((key) => !allowed.includes(key))) {
            throw new TypeError('Invalid action result payload.');
        }
        for (const key of ['actorId', 'requestId']) {
            if (Object.hasOwn(data, key) && (typeof data[key] !== 'string' || data[key].length === 0)) {
                throw new TypeError('Invalid result correlation.');
            }
        }
        if (status === 'completed') {
            if (!Object.hasOwn(data, 'actorId') || !['success', 'failure'].includes(data.outcome)
                || !isNonnegativeSafeInteger(data.turnsAdvanced) || !Array.isArray(data.outputs)) {
                throw new TypeError('Invalid completed action result.');
            }
            for (const output of data.outputs) {
                outputAudienceIds(output);
            }
        } else {
            const codes = status === 'error' ? ['EXECUTION_FAILED'] : ACTION_REJECTION_CODES;
            if (!validateActionError(data.error, codes)) {
                throw new TypeError('Invalid action error record.');
            }
        }
        this.#data = Object.freeze(status === 'completed' ? { status, ...data }
            : { status, ...data, turnsAdvanced: 0, outputs: Object.freeze([]) });
        Object.freeze(this);
    }

    /**
     * Creates a completed result from validated candidate and outcome data.
     * @param {object} payload - Completion data.
     * @returns {ActionResult} Completed result.
     */
    static completed(payload) {
        return new ActionResult(CONSTRUCTION, 'completed', payload);
    }

    /**
     * Creates a rejected result.
     * @param {object} payload - Safe rejection data.
     * @returns {ActionResult} Rejection.
     */
    static rejected(payload) {
        return new ActionResult(CONSTRUCTION, 'rejected', payload);
    }

    /**
     * Creates an execution error result.
     * @param {object} payload - Safe failure data.
     * @returns {ActionResult} Execution error.
     */
    static error(payload) {
        return new ActionResult(CONSTRUCTION, 'error', payload);
    }

    /** @returns {string|undefined} Completed gameplay outcome. */
    get outcome() { return this.#data.outcome; }

    /** @returns {string|undefined} Safe acting actor identity. */
    get actorId() { return this.#data.actorId; }

    /** @returns {string|undefined} Safe request correlation. */
    get requestId() { return this.#data.requestId; }

    /** @returns {number} Committed turn delta. */
    get turnsAdvanced() { return this.#data.turnsAdvanced; }

    /** @returns {ReadonlyArray<object>} Ordered immutable outputs. */
    get outputs() { return this.#data.outputs; }

    /** @returns {object|undefined} Safe rejection or error record. */
    get error() { return this.#data.error; }

    /** @returns {object} Detached immutable serialized envelope. */
    toJSON() { return immutableCopy(this.#data); }
}
