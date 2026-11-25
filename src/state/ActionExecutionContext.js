/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Restricted synchronous action-handler capabilities.
 * @module state/ActionExecutionContext
 */

import { isQualifiedKey } from '../shared/identifiers.js';

/** Exposes narrow, expiring access to one isolated action candidate. */
export class ActionExecutionContext {
    /** @type {object|undefined} Active transaction, cleared at handler exit. */
    #transaction;
    /** @type {object} Detached immutable engine-established grants. */
    #grants;
    /** @type {Function|undefined} Invocation-local violation marker. */
    #onExpired;

    /**
     * Binds restricted capabilities to a single invocation.
     * @param {object} transaction - Active isolated candidate.
     * @param {object} grants - Validated immutable mutation authority.
     * @param {Function} onExpired - Marks detected expired use during inspection.
     */
    constructor(transaction, grants, onExpired) {
        this.#transaction = transaction;
        this.#grants = grants;
        this.#onExpired = onExpired;
        Object.freeze(this);
    }

    /** @returns {object} Active transaction or safe exception. */
    #active() {
        if (this.#transaction === undefined) {
            this.#onExpired?.();
            throw new Error('Action context has expired.');
        }
        return this.#transaction;
    }

    /**
     * Establishes granted property mutation authority.
     * @param {string} key - Qualified property key.
     * @returns {object} Authorized transaction.
     */
    #propertyAuthority(key) {
        const transaction = this.#active();
        if (!isQualifiedKey(key) || !this.#grants.namespaces.includes(key.split('.')[0])) {
            transaction.invalidate();
            throw new TypeError('Unauthorized property mutation.');
        }
        return transaction;
    }

    /**
     * Establishes dedicated player operation authority.
     * @param {string} operation - Protected operation name.
     * @param {string} playerId - Player identity.
     * @param {string} [actorId] - Actor identity.
     * @returns {boolean} Domain eligibility.
     */
    #playerOperation(operation, playerId, actorId) {
        const transaction = this.#active();
        if (!this.#grants.operations.includes(operation)) {
            transaction.invalidate();
            throw new TypeError('Unauthorized player operation.');
        }
        return transaction.playerOperation(operation, playerId, actorId);
    }

    /** @param {object} address - Subject. @param {string} key - Key. @returns {object} Presence. */
    getProperty(address, key) { return this.#active().getProperty(address, key); }

    /** @param {object} address - Subject. @param {string} key - Key. @returns {boolean} Presence. */
    hasProperty(address, key) { return this.#active().hasProperty(address, key); }

    /** @param {object} address - Subject. @param {string} key - Key. @param {*} value - Value. */
    setProperty(address, key, value) {
        this.#propertyAuthority(key).stagePropertySet(address, key, value);
    }

    /** @param {object} address - Subject. @param {string} key - Key. */
    removeProperty(address, key) { this.#propertyAuthority(key).stagePropertyRemoval(address, key); }

    /** @param {object} address - Subject. @param {string} key - Key. */
    resetProperty(address, key) { this.#propertyAuthority(key).stagePropertyReset(address, key); }

    /** @param {string} playerId - Player. @param {string} actorId - Actor. @returns {boolean} Eligibility. */
    grantControl(playerId, actorId) { return this.#playerOperation('grantControl', playerId, actorId); }

    /** @param {string} playerId - Player. @param {string} actorId - Actor. @returns {boolean} Eligibility. */
    revokeControl(playerId, actorId) { return this.#playerOperation('revokeControl', playerId, actorId); }

    /** @param {string} playerId - Player. @param {string} actorId - Actor. @returns {boolean} Eligibility. */
    selectActor(playerId, actorId) { return this.#playerOperation('selectActor', playerId, actorId); }

    /** @param {string} playerId - Player. @returns {boolean} Eligibility. */
    clearSelection(playerId) { return this.#playerOperation('clearSelection', playerId); }

    /** @param {object} output - Semantic output. */
    emitOutput(output) { this.#active().stageOutput(output); }

    /**
     * Creates an invocation capability and a separate trusted lifecycle controller.
     * @param {object} transaction - Candidate.
     * @param {object} grants - Validated immutable authority.
     * @returns {object} Context and orchestration-only controls.
     */
    static create(transaction, grants) {
        let violated = false;
        const context = new ActionExecutionContext(transaction, grants, () => { violated = true; });
        return Object.freeze({
            context,
            expire: () => { context.#transaction = undefined; },
            violated: () => violated,
            release: () => { context.#transaction = undefined; context.#onExpired = undefined; },
        });
    }
}
