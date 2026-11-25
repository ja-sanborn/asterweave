/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Internal action operation findings and registry results.
 * @module actions/actionDiagnostics
 */

import { DiagnosticCollector } from '../diagnostics/DiagnosticCollector.js';

/** @type {Readonly<object>} Stable action-domain diagnostic codes. */
export const ACTION_CODES = Object.freeze({
    DUPLICATE_ACTION_TYPE: 'DUPLICATE_ACTION_TYPE',
    INVALID_ACTION_IDENTIFIER: 'INVALID_ACTION_IDENTIFIER',
    INVALID_ARGUMENT_SPECIFICATION: 'INVALID_ARGUMENT_SPECIFICATION',
    INVALID_DATA: 'INVALID_DATA',
    INVALID_HANDLER: 'INVALID_HANDLER',
    INVALID_NAMESPACE: 'INVALID_NAMESPACE',
    INVALID_REGISTRATION_OWNER: 'INVALID_REGISTRATION_OWNER',
    INVALID_TURN_COST: 'INVALID_TURN_COST',
    INVALID_TYPE: 'INVALID_TYPE',
    INVALID_VALIDATOR: 'INVALID_VALIDATOR',
    INVALID_VALUE: 'INVALID_VALUE',
    NAMESPACE_CONFLICT: 'NAMESPACE_CONFLICT',
    REGISTRY_BUSY: 'REGISTRY_BUSY',
    REGISTRY_FINALIZED: 'REGISTRY_FINALIZED',
    REQUIRED_FIELD: 'REQUIRED_FIELD',
    RESERVED_NAMESPACE: 'RESERVED_NAMESPACE',
    UNKNOWN_FIELD: 'UNKNOWN_FIELD',
});

/**
 * Creates an operation-local collector in registry validation stage order.
 * @returns {DiagnosticCollector} Independent diagnostic collector.
 */
export function createActionCollector() {
    return new DiagnosticCollector(['registry', 'namespace', 'definition', 'owner', 'handler', 'validator']);
}

/**
 * Adds a structured action-domain finding.
 * @param {DiagnosticCollector} collector - Operation collector.
 * @param {string} source - Input or lifecycle source.
 * @param {string} code - Domain-owned diagnostic code.
 * @param {string} path - Source-relative pointer.
 * @param {string} message - Safe explanation.
 */
export function addActionFinding(collector, source, code, path, message) {
    collector.add({ source, code, severity: 'error', path, message });
}

/**
 * Returns the operation's immutable result, optionally with an issued capability.
 * @param {DiagnosticCollector} collector - Operation findings.
 * @param {symbol} [owner] - Newly issued namespace capability on success only.
 * @returns {object} Completed or rejected internal result.
 */
export function actionRegistryResult(collector, owner) {
    const diagnostics = collector.snapshot();
    if (diagnostics.length > 0) {
        return Object.freeze({ status: 'rejected', diagnostics });
    }
    const result = { status: 'completed', diagnostics };
    if (owner !== undefined) {
        result.owner = owner;
    }
    return Object.freeze(result);
}
