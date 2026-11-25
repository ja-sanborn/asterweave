/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Runtime-local registration, authority and immutable action resolution.
 * @module actions/ActionRegistry
 */

import { isIdentifier } from '../shared/identifiers.js';
import { classifyActionType, isReservedActionNamespace } from './actionIdentifiers.js';
import { validateActionDefinition } from './validateActionDefinition.js';
import { createActionCollector, addActionFinding, actionRegistryResult } from './actionDiagnostics.js';

/** @type {symbol} Internal construction capability, never returned. */
const CONSTRUCTION = Symbol('ActionRegistry construction');

/** Independent registry of trusted executable associations and immutable metadata. */
export class ActionRegistry {
    /** @type {Map<string, object>} Validated registrations. */
    #registrations = new Map();
    /** @type {Map<string, symbol>} Claimed extension namespace capabilities. */
    #namespaceOwners = new Map();
    /** @type {symbol} Standard registration authority. */
    #engineOwner = Symbol('engine');
    /** @type {symbol} Game registration authority. */
    #gameOwner = Symbol('game');
    /** @type {boolean} Whether setup has permanently ended. */
    #finalized = false;
    /** @type {boolean} Whether a modification is active. */
    #modificationInProgress = false;

    /**
     * Constructs an independent registry through the internal factory only.
     * @param {symbol} authority - Internal construction capability.
     * @throws {TypeError} On unauthorized construction.
     */
    constructor(authority) {
        if (authority !== CONSTRUCTION) {
            throw new TypeError('Use ActionRegistry.create for internal construction.');
        }
        Object.freeze(this);
    }

    /**
     * Creates a registry and transfers setup capabilities to trusted orchestration.
     * These capabilities are never returned by lookup or exposed through the public facade.
     * @returns {{registry: ActionRegistry, engineOwner: symbol, gameOwner: symbol}} Trusted setup record.
     */
    static create() {
        const registry = new ActionRegistry(CONSTRUCTION);
        return Object.freeze({ registry, engineOwner: registry.#engineOwner, gameOwner: registry.#gameOwner });
    }

    /** @returns {number} Current registration count. */
    get size() {
        return this.#registrations.size;
    }

    /** @returns {boolean} Whether registration has permanently ended. */
    get isFinalized() {
        return this.#finalized;
    }

    /**
     * Claims an exact extension namespace during trusted setup.
     * @param {unknown} namespace - Candidate namespace.
     * @returns {object} Immutable result with owner only on successful claim.
     */
    claimNamespace(namespace) {
        return this.#modify((collector) => {
            if (!isIdentifier(namespace)) {
                addActionFinding(collector, 'namespace', 'INVALID_NAMESPACE', '', 'Invalid action namespace.');
            } else if (isReservedActionNamespace(namespace)) {
                addActionFinding(collector, 'namespace', 'RESERVED_NAMESPACE', '', 'Action namespace is reserved.');
            } else if (this.#namespaceOwners.has(namespace)) {
                addActionFinding(collector, 'namespace', 'NAMESPACE_CONFLICT', '', 'Action namespace is already owned.');
            }
            if (collector.size > 0) {
                return actionRegistryResult(collector);
            }
            const owner = Symbol(namespace);
            const result = actionRegistryResult(collector, owner);
            this.#namespaceOwners.set(namespace, owner);
            return result;
        });
    }

    /**
     * Validates and atomically associates a definition with trusted executable functions.
     * Does not execute handlers or validators. Reflective failures propagate.
     * @param {unknown} owner - Registry-local registration capability.
     * @param {unknown} input - Candidate definition.
     * @param {unknown} handler - Trusted synchronous handler.
     * @param {unknown} [validator] - Optional trusted synchronous argument validator.
     * @returns {object} Immutable completed or rejected result.
     */
    register(owner, input, handler, validator) {
        return this.#modify((collector) => {
            const validation = validateActionDefinition(input);
            for (const finding of validation.diagnostics) {
                collector.add(finding);
            }
            if (validation.status === 'completed') {
                this.#checkOwnership(owner, validation.definition.type, collector);
            }
            if (typeof handler !== 'function') {
                addActionFinding(collector, 'handler', 'INVALID_HANDLER', '', 'Expected a trusted handler function.');
            }
            if (validator !== undefined && typeof validator !== 'function') {
                addActionFinding(collector, 'validator', 'INVALID_VALIDATOR', '',
                    'Expected a trusted validator function.');
            }
            const result = actionRegistryResult(collector);
            if (result.status === 'completed') {
                const definition = validation.definition;
                const record = Object.freeze({ definition, handler, validator });
                this.#registrations.set(definition.type, record);
            }
            return result;
        });
    }

    /**
     * Checks exact registration membership, including disabled definitions.
     * @param {unknown} type - Action identifier.
     * @returns {boolean} Whether registered.
     */
    has(type) {
        return this.#registrations.has(type);
    }

    /**
     * Returns registered immutable metadata.
     * @param {unknown} type - Action identifier.
     * @returns {object|undefined} Definition or absence.
     */
    getDefinition(type) {
        return this.#registrations.get(type)?.definition;
    }

    /**
     * Resolves a protected association without executing it.
     * @param {unknown} type - Action identifier.
     * @returns {object|undefined} Frozen association or absence.
     */
    resolve(type) {
        return this.#registrations.get(type);
    }

    /**
     * Enumerates immutable metadata in exact code-unit order.
     * @returns {ReadonlyArray<object>} Frozen point-in-time enumeration.
     */
    listDefinitions() {
        const types = Array.from(this.#registrations.keys()).sort();
        return Object.freeze(types.map((type) => this.#registrations.get(type).definition));
    }

    /**
     * Irreversibly closes setup; repeated finalization is idempotent.
     * @returns {object} Immutable operation result.
     */
    finalize() {
        const collector = createActionCollector();
        if (this.#modificationInProgress) {
            addActionFinding(collector, 'registry', 'REGISTRY_BUSY', '', 'Registry modification is already active.');
            return actionRegistryResult(collector);
        }
        const result = actionRegistryResult(collector);
        this.#finalized = true;
        return result;
    }

    /**
     * Protects modification operations before inspecting any caller data.
     * @param {Function} operation - Internal synchronous modification.
     * @returns {object} Operation result.
     */
    #modify(operation) {
        const collector = createActionCollector();
        if (this.#modificationInProgress) {
            addActionFinding(collector, 'registry', 'REGISTRY_BUSY', '', 'Registry modification is already active.');
            return actionRegistryResult(collector);
        }
        if (this.#finalized) {
            addActionFinding(collector, 'registry', 'REGISTRY_FINALIZED', '', 'Registry is finalized.');
            return actionRegistryResult(collector);
        }
        this.#modificationInProgress = true;
        try {
            return operation(collector);
        } finally {
            this.#modificationInProgress = false;
        }
    }

    /**
     * Checks registry-local authority and duplicate identity for valid metadata.
     * @param {unknown} owner - Supplied capability.
     * @param {string} type - Validated action identifier.
     * @param {import('../diagnostics/DiagnosticCollector.js').DiagnosticCollector} collector - Findings.
     */
    #checkOwnership(owner, type, collector) {
        const identity = classifyActionType(type);
        let expected;
        if (identity.classification === 'standard') {
            expected = this.#engineOwner;
        } else if (identity.classification === 'game') {
            expected = this.#gameOwner;
        } else {
            expected = this.#namespaceOwners.get(identity.namespace);
        }
        if (typeof owner !== 'symbol' || expected === undefined || owner !== expected) {
            addActionFinding(collector, 'owner', 'INVALID_REGISTRATION_OWNER', '',
                'Registration authority does not own this action identity.');
        }
        if (this.#registrations.has(type)) {
            addActionFinding(collector, 'definition', 'DUPLICATE_ACTION_TYPE', '/type',
                'Action identifier is already registered.');
        }
    }
}
