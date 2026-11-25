/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Public Asterweave game facade and controlled initialization.
 * @module Asterweave
 */

import { GameDefinitionValidator } from './definition/GameDefinitionValidator.js';
import { GameInitializer } from './core/GameInitializer.js';
import { ValidationResult } from './results/ValidationResult.js';
import { InitializationResult } from './results/InitializationResult.js';
import { createStateSnapshot } from './state/createStateSnapshot.js';

/** @type {symbol} Private game construction capability. */
const CONSTRUCTION = Symbol('Asterweave');

/** Primary supported public facade for one independent initialized game. */
export class Asterweave {
    /** @type {import('./state/RuntimeState.js').RuntimeState} Owned runtime state. */
    #state;

    /**
     * Constructs a game only from the internal initialization factory.
     * @param {symbol} token - Private construction capability.
     * @param {import('./state/RuntimeState.js').RuntimeState} state - Validated runtime.
     * @throws {TypeError} If constructed outside the supported factory.
     */
    constructor(token, state) {
        if (token !== CONSTRUCTION) {
            throw new TypeError('Use Asterweave.initializeGame().');
        }
        this.#state = state;
        Object.freeze(this);
    }

    /**
     * Validates parsed canonical data without publishing a runtime.
     * @param {unknown} definition - Untrusted parsed game definition.
     * @returns {ValidationResult} Completed, rejected or safe execution error.
     */
    static validateGame(definition) {
        try {
            const { diagnostics } = new GameDefinitionValidator().validate(definition);
            return diagnostics.length === 0
                ? ValidationResult.completed() : ValidationResult.rejected(diagnostics);
        } catch (error) {
            // Unexpected internal failures never expose raw exception data.
            return ValidationResult.failed();
        }
    }

    /**
     * Validates and initializes one isolated game with optional explicit player configuration.
     * @param {unknown} definition - Untrusted parsed game definition.
     * @param {unknown} [options] - Closed optional initialization configuration.
     * @returns {InitializationResult} Complete game, rejection or safe execution error.
     */
    static initializeGame(definition, options) {
        try {
            const { state, diagnostics } = new GameInitializer().initialize(definition, options);
            if (diagnostics.length !== 0) {
                return InitializationResult.rejected(diagnostics);
            }
            return InitializationResult.completed(new Asterweave(CONSTRUCTION, state));
        } catch (error) {
            // Fail closed: a partial game is never published.
            return InitializationResult.failed();
        }
    }

    /** @returns {string} Authored stable game identity. */
    get gameId() {
        return this.#state.game.id;
    }

    /** @returns {string} Authored content version, not the engine or format version. */
    get gameVersion() {
        return this.#state.game.version;
    }

    /** @returns {number} Authoritative World turn counter. */
    get turn() {
        return this.#state.turn;
    }

    /**
     * Inspects effective state without exposing live engine data.
     * @returns {object} Detached recursively read-only JSON-compatible snapshot.
     */
    getStateSnapshot() {
        return createStateSnapshot(this.#state.readEffectiveState());
    }
}
