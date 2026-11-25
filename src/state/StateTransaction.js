/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Isolated action candidate and staged semantic outputs.
 * @module state/StateTransaction
 */

import { EffectiveStateReader } from './EffectiveStateReader.js';
import { isGamePropertyKey } from './validateProperties.js';
import { validateSemanticOutput, validateDetachedSemanticOutput } from './validateSemanticOutput.js';
import { isIdentifier, isQualifiedKey } from '../shared/identifiers.js';
import { addNonnegative } from '../shared/safeArithmetic.js';
import { validateEffectiveState, validateStateTransition } from './validateEffectiveState.js';

/** Owns one isolated candidate; never exposed to handlers. */
export class StateTransaction {
    /** @type {object|undefined} Candidate record. */
    #candidate;
    /** @type {symbol|undefined} Prepared publication token. */
    #prepared;
    /** @type {string} Private transaction lifecycle. */
    #status = 'active';
    /** @type {object[]} Ordered immutable semantic outputs. */
    #outputs = [];
    /** @type {object} Original committed effective view. */
    #committed;
    /** @type {string} Available game property namespace. */
    #namespace;

    /**
     * Clones mutable candidate containers from verified committed state.
     * @param {object} baseline - Immutable GameBaseline.
     * @param {object} committed - Current committed state record.
     * @param {object|undefined} initialPlayer - Original player record.
     */
    constructor(baseline, committed, initialPlayer) {
        const overrides = committed.overrides.clone();
        const player = committed.player?.clone();
        const reader = new EffectiveStateReader(baseline, overrides, player, initialPlayer);
        this.#candidate = Object.freeze({ overrides, player, reader });
        this.#committed = committed.reader.readEffectiveState();
        this.#namespace = baseline.game.namespace;
        Object.freeze(this);
    }

    /** @returns {boolean} Whether candidate is active. */
    get isActive() { return this.#status === 'active'; }

    /** @returns {boolean} Whether candidate is invalidated. */
    get isInvalidated() { return this.#status === 'invalidated'; }

    /** @throws {Error} If the transaction is no longer active. */
    #requireActive() {
        if (!this.isActive) {
            throw new Error('Transaction is unavailable.');
        }
    }

    /**
     * Executes an internal candidate operation; unexpected failures invalidate.
     * @param {Function} operation - Synchronous internal operation.
     * @returns {*} Operation value.
     */
    #perform(operation) {
        this.#requireActive();
        this.#prepared = undefined;
        try {
            const result = operation();
            this.#requireActive();
            return result;
        } catch (error) {
            this.invalidate();
            throw error;
        }
    }

    /**
     * Reads a candidate property.
     * @param {object} address - Subject address.
     * @param {string} key - Qualified key.
     * @returns {object} Immutable presence entry.
     */
    getProperty(address, key) {
        return this.#perform(() => {
            if (!isQualifiedKey(key)) {
                throw new TypeError('Invalid property key.');
            }
            return this.#candidate.reader.getProperty(address, key);
        });
    }

    /**
     * Derives structural queries from the latest isolated candidate.
     * @returns {object} Detached world query view.
     */
    readWorldQueries() {
        return this.#perform(() => this.#candidate.reader.readWorldQueries());
    }

    /**
     * Checks candidate presence.
     * @param {object} address - Subject.
     * @param {string} key - Qualified key.
     * @returns {boolean} Presence.
     */
    hasProperty(address, key) { return this.getProperty(address, key).present; }

    /**
     * Stages an ordinary property change after subject and namespace checks.
     * @param {string} operation - Set, remove or reset.
     * @param {object} input - Subject address.
     * @param {string} key - Qualified key.
     * @param {*} [value] - JSON value for set.
     */
    #stage(operation, input, key, value) {
        return this.#perform(() => {
            if (!isGamePropertyKey(key, this.#namespace)) {
                throw new TypeError('Invalid ordinary property mutation.');
            }
            const { reader, overrides, player } = this.#candidate;
            const address = reader.requireAddress(input);
            const initial = reader.getInitialPropertyForAddress(address, key);
            if (address.scope === 'player') {
                if (operation === 'set') {
                    player.setProperty(key, value);
                } else if (operation === 'remove') {
                    player.removeProperty(key);
                } else {
                    player.resetProperty(key, initial);
                }
            } else if (operation === 'set') {
                overrides.set(address, key, value, initial);
            } else if (operation === 'remove') {
                overrides.remove(address, key, initial);
            } else {
                overrides.reset(address, key);
            }
        });
    }

    /**
     * Stages an ordinary value.
     * @param {object} address - Subject.
     * @param {string} key - Qualified key.
     * @param {*} value - JSON value.
     */
    stagePropertySet(address, key, value) { this.#stage('set', address, key, value); }

    /**
     * Stages removal.
     * @param {object} address - Subject.
     * @param {string} key - Qualified key.
     */
    stagePropertyRemoval(address, key) { this.#stage('remove', address, key); }

    /**
     * Stages original value restoration.
     * @param {object} address - Subject.
     * @param {string} key - Qualified key.
     */
    stagePropertyReset(address, key) { this.#stage('reset', address, key); }

    /**
     * Delegates a protected control/selection operation to the candidate Player.
     * @param {string} operation - Supported operation name.
     * @param {string} playerId - Existing player identity.
     * @param {string} [actorId] - Actor identity.
     * @returns {boolean} Whether gameplay prerequisites permit the operation.
     */
    playerOperation(operation, playerId, actorId) {
        return this.#perform(() => {
            const { reader, player } = this.#candidate;
            if (!isIdentifier(playerId) || player?.id !== playerId) {
                throw new TypeError('Invalid player identity.');
            }
            if (operation === 'clearSelection') {
                player.clearSelection();
                return true;
            }
            if (!['grantControl', 'revokeControl', 'selectActor'].includes(operation)
                || !isIdentifier(actorId) || reader.participantKind(actorId) !== 'actor') {
                throw new TypeError('Invalid actor operation.');
            }
            return player[operation](actorId, (id) => reader.readWorldProperties(id));
        });
    }

    /**
     * Advances the protected authoritative turn using checked arithmetic.
     * @param {number} cost - Registered outcome cost selected by dispatcher.
     */
    advanceTurns(cost) {
        this.#perform(() => {
            const address = { scope: 'world' };
            const key = 'asterweave.turn';
            const { reader, overrides } = this.#candidate;
            const next = addNonnegative(reader.getProperty(address, key).value, cost);
            if (next === undefined) {
                throw new RangeError('Turn overflow.');
            }
            overrides.set(address, key, next, reader.getInitialProperty(address, key));
        });
    }

    /**
     * Validates and stages one semantic output.
     * @param {object} output - Handler output.
     */
    stageOutput(output) {
        this.#perform(() => {
            this.#outputs.push(validateSemanticOutput(output, this.#candidate.reader));
        });
    }

    /** @returns {ReadonlyArray<object>} Ordered detached immutable output references. */
    get outputs() {
        this.#requireActive();
        return Object.freeze([...this.#outputs]);
    }

    /** Invalidates the candidate irreversibly. */
    invalidate() {
        if (this.isActive) {
            this.#prepared = undefined;
            this.#status = 'invalidated';
        }
    }

    /**
     * Validates complete candidate and forward transition before publication.
     * @returns {symbol} Opaque prepared publication token.
     */
    prepare() {
        return this.#perform(() => {
            const view = this.#candidate.reader.readEffectiveState();
            if (!validateEffectiveState(view) || !validateStateTransition(this.#committed, view)) {
                throw new Error('Invalid candidate state.');
            }
            for (const output of this.#outputs) {
                validateDetachedSemanticOutput(output, this.#candidate.reader);
            }
            this.#prepared = Symbol('prepared transaction');
            return this.#prepared;
        });
    }

    /**
     * Transfers ownership after preparation; called only by RuntimeState.
     * @param {symbol} token - Prepared publication token.
     * @returns {object} Candidate for publication.
     */
    take(token) {
        this.#requireActive();
        if (typeof token !== 'symbol' || token !== this.#prepared) {
            throw new TypeError('Invalid candidate publication.');
        }
        const candidate = this.#candidate;
        this.#prepared = undefined;
        this.#status = 'committed';
        this.#candidate = undefined;
        this.#committed = undefined;
        this.#outputs = [];
        return candidate;
    }

    /** Releases any unpublished candidate and resources. */
    discard() {
        if (this.#status === 'committed' || this.#status === 'discarded') {
            return;
        }
        this.#prepared = undefined;
        this.#status = 'discarded';
        this.#candidate = undefined;
        this.#committed = undefined;
        this.#outputs = [];
    }
}
