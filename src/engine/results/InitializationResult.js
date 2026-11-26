/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Read-only game initialization outcomes.
 * @module results/InitializationResult
 */

import { OperationResult } from './OperationResult.js';
import { prepareDiagnostics } from './resultData.js';

/** @type {symbol} Internal factory construction capability. */
const CONSTRUCTION = Symbol('InitializationResult');

/** Specialized result for initialization, retaining a controlled game reference. */
export class InitializationResult extends OperationResult {
    /** @type {ReadonlyArray<object>} Detached findings. */
    #diagnostics;
    /** @type {object|undefined} Safe execution failure record. */
    #error;
    /** @type {object|undefined} Initialized operational reference. */
    #game;

    /**
     * Constructs an initialization result through internal factories only.
     * @param {symbol} token - Private construction capability.
     * @param {string} status - Operation status.
     * @param {Array<object>} diagnostics - Applicable findings.
     * @param {object|undefined} game - Game produced by the trusted initializer.
     * @throws {TypeError} On invalid construction or payload.
     */
    constructor(token, status, diagnostics, game) {
        super(status);
        if (token !== CONSTRUCTION || (status === 'completed'
            ? game === null || typeof game !== 'object' : game !== undefined)) {
            throw new TypeError('Invalid initialization result construction.');
        }
        this.#diagnostics = prepareDiagnostics(status, diagnostics, true);
        this.#error = status === 'error'
            ? Object.freeze({ code: 'INITIALIZATION_FAILED' }) : undefined;
        this.#game = game;
        Object.freeze(this);
    }

    /**
     * Creates a completed result from the trusted initialization boundary.
     * @param {object} game - Fully initialized game; caller guarantees its identity.
     * @returns {InitializationResult} Completion with operational reference.
     * @throws {TypeError} If the reference is missing or invalid.
     */
    static completed(game) {
        return new InitializationResult(CONSTRUCTION, 'completed', [], game);
    }

    /**
     * Creates a rejected initialization result.
     * @param {Array<object>} diagnostics - Nonempty definition/options findings.
     * @returns {InitializationResult} Rejection.
     * @throws {TypeError} On invalid findings.
     */
    static rejected(diagnostics) {
        return new InitializationResult(CONSTRUCTION, 'rejected', diagnostics, undefined);
    }

    /** @returns {InitializationResult} Safe unexpected execution failure. */
    static failed() {
        return new InitializationResult(CONSTRUCTION, 'error', [], undefined);
    }

    /** @returns {ReadonlyArray<object>} Immutable findings. */
    get diagnostics() {
        return this.#diagnostics;
    }

    /** @returns {object|undefined} Safe error only on execution failure. */
    get error() {
        return this.#error;
    }

    /** @returns {object|undefined} Controlled game reference only on completion. */
    get game() {
        return this.#game;
    }

    /**
     * Explicitly prohibits serialization for every initialization status.
     * @throws {TypeError} Always; initialization results are not save data.
     */
    toJSON() {
        throw new TypeError('Initialization results cannot be serialized.');
    }
}
