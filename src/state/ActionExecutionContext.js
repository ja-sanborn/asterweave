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
     * Establishes dedicated operation authority.
     * @param {string} operation - Protected operation name.
     * @returns {object} Authorized transaction.
     */
    #operationAuthority(operation) {
        const transaction = this.#active();
        if (!this.#grants.operations.includes(operation)) {
            transaction.invalidate();
            throw new TypeError('Unauthorized protected operation.');
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
        return this.#operationAuthority(operation).playerOperation(operation, playerId, actorId);
    }

    /**
     * @param {object} address - Subject.
     * @param {string} key - Key.
     * @returns {object} Presence.
     */
    getProperty(address, key) { return this.#active().getProperty(address, key); }

    /**
     * @param {object} address - Subject.
     * @param {string} key - Key.
     * @returns {boolean} Presence.
     */
    hasProperty(address, key) { return this.#active().hasProperty(address, key); }

    /**
     * @param {object} address - Subject.
     * @param {string} key - Key.
     * @param {*} value - Value.
     */
    setProperty(address, key, value) {
        this.#propertyAuthority(key).stagePropertySet(address, key, value);
    }

    /**
     * @param {object} address - Subject.
     * @param {string} key - Key.
     */
    removeProperty(address, key) { this.#propertyAuthority(key).stagePropertyRemoval(address, key); }

    /**
     * @param {object} address - Subject.
     * @param {string} key - Key.
     */
    resetProperty(address, key) { this.#propertyAuthority(key).stagePropertyReset(address, key); }

    /**
     * @param {string} playerId - Player.
     * @param {string} actorId - Actor.
     * @returns {boolean} Eligibility.
     */
    grantControl(playerId, actorId) { return this.#playerOperation('grantControl', playerId, actorId); }

    /**
     * @param {string} playerId - Player.
     * @param {string} actorId - Actor.
     * @returns {boolean} Eligibility.
     */
    revokeControl(playerId, actorId) { return this.#playerOperation('revokeControl', playerId, actorId); }

    /**
     * @param {string} playerId - Player.
     * @param {string} actorId - Actor.
     * @returns {boolean} Eligibility.
     */
    selectActor(playerId, actorId) { return this.#playerOperation('selectActor', playerId, actorId); }

    /**
     * @param {string} playerId - Player.
     * @returns {boolean} Eligibility.
     */
    clearSelection(playerId) { return this.#playerOperation('clearSelection', playerId); }

    /**
     * Relocates a physical participant.
     * @param {string} id - Subject.
     * @param {string} targetId - Parent or target.
     * @param {string} relationship - Relationship.
     * @returns {object} Semantic operation result.
     */
    relocate(id, targetId, relationship) {
        return this.#operationAuthority('relocate')
            .worldOperation('relocate', id, targetId, relationship);
    }

    /**
     * Establishes a directed physical association.
     * @param {string} id - Subject.
     * @param {string} targetId - Parent or target.
     * @param {string} relationship - Relationship.
     * @returns {object} Semantic operation result.
     */
    establishAssociation(id, targetId, relationship) {
        return this.#operationAuthority('establishAssociation')
            .worldOperation('establishAssociation', id, targetId, relationship);
    }

    /**
     * Removes a directed physical association.
     * @param {string} id - Subject.
     * @param {string} targetId - Parent or target.
     * @param {string} relationship - Relationship.
     * @returns {object} Semantic operation result.
     */
    removeAssociation(id, targetId, relationship) {
        return this.#operationAuthority('removeAssociation')
            .worldOperation('removeAssociation', id, targetId, relationship);
    }

    /**
     * Sets a restricted physical property.
     * @param {string} id - Participant identity.
     * @param {string} name - Unqualified physical property name.
     * @param {*} value - Proposed value.
     * @returns {object} Semantic operation result.
     */
    setPhysicalProperty(id, name, value) {
        return this.#operationAuthority('modifyPhysicalProperties')
            .physicalPropertyOperation('set', id, name, value);
    }

    /**
     * Removes a restricted physical property.
     * @param {string} id - Participant identity.
     * @param {string} name - Unqualified physical property name.
     * @returns {object} Semantic operation result.
     */
    removePhysicalProperty(id, name) {
        return this.#operationAuthority('modifyPhysicalProperties')
            .physicalPropertyOperation('remove', id, name);
    }

    /**
     * Resets a restricted physical property.
     * @param {string} id - Participant identity.
     * @param {string} name - Unqualified physical property name.
     * @returns {object} Semantic operation result.
     */
    resetPhysicalProperty(id, name) {
        return this.#operationAuthority('modifyPhysicalProperties')
            .physicalPropertyOperation('reset', id, name);
    }

    /**
     * Activates a participant at explicit placement.
     * @param {string} id - Participant identity.
     * @param {string} parentId - Explicit parent.
     * @param {string} relationship - Placement relationship.
     * @returns {object} Semantic operation result.
     */
    activate(id, parentId, relationship) {
        return this.#operationAuthority('activate')
            .lifecycleOperation('activate', id, parentId, relationship);
    }

    /**
     * Deactivates an explicitly resolved participant.
     * @param {string} id - Participant identity.
     * @returns {object} Semantic operation result.
     */
    deactivate(id) {
        return this.#operationAuthority('deactivate')
            .lifecycleOperation('deactivate', id);
    }

    /**
     * Destroys one explicitly resolved participant.
     * @param {string} id - Participant identity.
     * @returns {object} Semantic operation result.
     */
    destroy(id) {
        return this.#operationAuthority('destroy')
            .lifecycleOperation('destroy', id);
    }

    /**
     * Destroys a participant and its active containment subtree.
     * @param {string} id - Participant identity.
     * @returns {object} Semantic operation result.
     */
    destroyRecursively(id) {
        return this.#operationAuthority('destroyRecursively')
            .lifecycleOperation('destroyRecursively', id);
    }

    /**
     * @param {object} output - Semantic output.
     */
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
