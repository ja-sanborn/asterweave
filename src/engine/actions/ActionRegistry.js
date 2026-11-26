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

import { WORLD_OPERATIONS } from '../world/worldOperations.js';
import { immutableCopy } from '../shared/immutableData.js';
import { isRecord } from '../shared/recordShape.js';
import { isSynchronousAssociation } from './executableAssociations.js';
import { isIdentifier } from '../shared/identifiers.js';
import { isStandardActionType } from './actionIdentifiers.js';
import { validateActionDefinition } from './validateActionDefinition.js';
import {
    ACTION_CODES as C, createActionCollector, addActionFinding, actionRegistryResult,
} from './actionDiagnostics.js';

/** @type {symbol} Internal construction capability, never returned. */
const CONSTRUCTION = Symbol('ActionRegistry construction');

/**
 * Checks detached mutation grants for setup and retained integrity verification.
 * @param {object} grants - Inspected grant record.
 * @returns {boolean} Validity.
 */
function validGrants(grants) {
    return !(!isRecord(grants) || Object.keys(grants).length !== 2
                || !Array.isArray(grants.namespaces) || !Array.isArray(grants.operations)
                || grants.namespaces.some((name) => !isIdentifier(name) || name === 'engine')
                || grants.operations.some((name) => !['grantControl', 'revokeControl',
                    'selectActor', 'clearSelection', ...WORLD_OPERATIONS].includes(name))
                || new Set(grants.namespaces).size !== grants.namespaces.length
                || new Set(grants.operations).size !== grants.operations.length);
}

/** Independent registry of trusted executable associations and immutable metadata. */
export class ActionRegistry {
    /** @type {Map<string, object>} Validated registrations. */
    #registrations = new Map();
    /** @type {symbol} Engine registration authority. */
    #registrationAuthority = Symbol('registration');
    /** @type {symbol} Independent engine mutation grant authority. */
    #grantAuthority = Symbol('mutation grants');
    /** @type {Map<string, object>} Engine-established executable grants. */
    #grants = new Map();
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
     * @returns {{registry: ActionRegistry, registrationAuthority: symbol, grantAuthority: symbol}} Trusted setup record.
     */
    static create() {
        const registry = new ActionRegistry(CONSTRUCTION);
        return Object.freeze({ registry, registrationAuthority: registry.#registrationAuthority,
            grantAuthority: registry.#grantAuthority });
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
     * Validates and atomically associates a definition with trusted executable functions.
     * Does not execute handlers or validators. Reflective failures propagate.
     * @param {unknown} authority - Registry-local registration capability.
     * @param {unknown} input - Candidate definition.
     * @param {unknown} handler - Trusted synchronous handler.
     * @param {unknown} [validator] - Optional trusted synchronous argument validator.
     * @returns {object} Immutable completed or rejected result.
     */
    register(authority, input, handler, validator) {
        return this.#modify((collector) => {
            const validation = validateActionDefinition(input);
            for (const finding of validation.diagnostics) {
                collector.add(finding);
            }
            if (validation.status === 'completed') {
                this.#checkRegistration(authority, validation.definition.type, collector);
            }
            if (!isSynchronousAssociation(handler)) {
                addActionFinding(collector, 'handler', C.INVALID_HANDLER, '',
                    'Expected a trusted synchronous handler function.');
            }
            if (validator !== undefined && !isSynchronousAssociation(validator)) {
                addActionFinding(collector, 'validator', C.INVALID_VALIDATOR, '',
                    'Expected a trusted synchronous validator function.');
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
            addActionFinding(collector, 'registry', C.REGISTRY_BUSY, '', 'Registry modification is already active.');
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
            addActionFinding(collector, 'registry', C.REGISTRY_BUSY, '', 'Registry modification is already active.');
            return actionRegistryResult(collector);
        }
        if (this.#finalized) {
            addActionFinding(collector, 'registry', C.REGISTRY_FINALIZED, '', 'Registry is finalized.');
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
     * Checks registry-local registration authority and duplicate identity for valid metadata.
     * @param {unknown} authority - Supplied capability.
     * @param {string} type - Validated action identifier.
     * @param {import('../diagnostics/DiagnosticCollector.js').DiagnosticCollector} collector - Findings.
     */
    #checkRegistration(authority, type, collector) {
        if (authority !== this.#registrationAuthority) {
            addActionFinding(collector, 'authority', C.INVALID_REGISTRATION_AUTHORITY, '',
                'Invalid registry-local registration authority.');
        }
        if (this.#registrations.has(type)) {
            addActionFinding(collector, 'definition', C.DUPLICATE_ACTION_TYPE, '/type',
                'Action identifier is already registered.');
        }
    }
    /**
     * Establishes immutable mutation grants separately from registration authority.
     * @param {symbol} authority - Independent engine setup grant capability.
     * @param {string} type - Already registered action type.
     * @param {object} input - Closed namespace and operation grants.
     * @throws {TypeError} For invalid authority, lifecycle or grants.
     */
    establishMutationGrants(authority, type, input) {
        if (authority !== this.#grantAuthority || this.#finalized || this.#modificationInProgress
            || !this.#registrations.has(type) || this.#grants.has(type)) {
            throw new TypeError('Invalid mutation grant setup.');
        }
        this.#modificationInProgress = true;
        try {
            const grants = immutableCopy(input);
            if (!validGrants(grants)) {
                throw new TypeError('Invalid mutation grants.');
            }
            this.#grants.set(type, grants);
        } finally {
            this.#modificationInProgress = false;
        }
    }

    /**
     * Reads established grants for a trusted executable association.
     * @param {string} type - Registered action type.
     * @returns {object} Immutable grants, defaulting to no mutation authority.
     */
    mutationGrants(type) {
        return this.#grants.get(type) ?? immutableCopy({ namespaces: [], operations: [] });
    }
    /**
     * Verifies bounded retained registry structure without invoking handlers.
     * @returns {boolean} Whether trusted setup invariants remain established.
     */
    verifyIntegrity() {
        if (!this.#finalized || this.#modificationInProgress) {
            return false;
        }
        if (typeof this.#registrationAuthority !== 'symbol' || typeof this.#grantAuthority !== 'symbol'
            || this.#registrationAuthority === this.#grantAuthority) {
            return false;
        }
        for (const [type, record] of this.#registrations) {
            if (!isStandardActionType(type) || record.definition.type !== type
                || validateActionDefinition(record.definition).status !== 'completed'
                || !Object.isFrozen(record) || !Object.isFrozen(record.definition)
                || !isSynchronousAssociation(record.handler)
                || (record.validator !== undefined && !isSynchronousAssociation(record.validator))) {
                return false;
            }
        }
        for (const [type, grants] of this.#grants) {
            if (!this.#registrations.has(type) || !validGrants(grants) || !Object.isFrozen(grants)
                || !Object.isFrozen(grants.namespaces) || !Object.isFrozen(grants.operations)) {
                return false;
            }
        }
        return true;
    }
}
