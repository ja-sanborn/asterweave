/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Safe validation and isolation of action definitions.
 * @module actions/validateActionDefinition
 */

import { DiagnosticCollector } from '../diagnostics/DiagnosticCollector.js';
import { isRecord, missingFields, unknownFields } from '../shared/recordShape.js';
import { ACTION_CODES as C, addActionFinding } from './actionDiagnostics.js';
import { appendPointer } from '../diagnostics/jsonPointer.js';
import { inspectJsonData } from '../shared/jsonData.js';
import { freezeDetachedJsonData } from '../shared/immutableData.js';
import { isIdentifier } from '../shared/identifiers.js';
import { isNonnegativeSafeInteger } from '../shared/safeArithmetic.js';
import { classifyActionType } from './actionIdentifiers.js';
import {
    ARGUMENT_TYPES, REFERENCE_KINDS, matchesArgumentType, matchesReferenceSyntax,
} from './argumentConstraints.js';

/** @type {ReadonlyArray<string>} Required definition fields in validation order. */
const DEFINITION_FIELDS = Object.freeze(['type', 'enabled', 'turnCostSuccess', 'turnCostFail', 'arguments']);
/** @type {ReadonlyArray<string>} Permitted specification attributes. */
const SPEC_FIELDS = Object.freeze(['type', 'required', 'allowedValues', 'referenceKind']);

/**
 * Validates detached metadata without executing caller accessors or modifying input.
 * Reflective exceptions propagate. Successful results contain immutable metadata.
 * @param {unknown} input - Candidate action definition.
 * @returns {object} Immutable internal result with definition only on completion.
 */
export function validateActionDefinition(input) {
    const collector = new DiagnosticCollector(['definition']);
    const { value, issues } = inspectJsonData(input);
    for (const issue of issues) {
        addActionFinding(collector, 'definition', C.INVALID_DATA, issue.path, issue.message);
    }
    if (issues.length === 0) {
        validateDefinition(value, collector);
    }
    const diagnostics = collector.snapshot();
    if (diagnostics.length > 0) {
        return Object.freeze({ status: 'rejected', diagnostics });
    }
    return Object.freeze({ status: 'completed', diagnostics, definition: freezeDetachedJsonData(value) });
}

/**
 * Checks required and unknown fields in deterministic order.
 * @param {object} value - Inspected record.
 * @param {string} path - Record pointer.
 * @param {ReadonlyArray<string>} required - Required fields.
 * @param {ReadonlyArray<string>} allowed - Allowed fields.
 * @param {DiagnosticCollector} collector - Findings.
 */
function checkFields(value, path, required, allowed, collector) {
    for (const key of missingFields(value, required)) {
        addActionFinding(collector, 'definition', C.REQUIRED_FIELD, appendPointer(path, key),
            'Required field is missing.');
    }
    for (const key of unknownFields(value, allowed)) {
        addActionFinding(collector, 'definition', C.UNKNOWN_FIELD, appendPointer(path, key), 'Unknown field.');
    }
}

/**
 * Validates definition metadata and independent argument specifications.
 * @param {unknown} value - Inspected input.
 * @param {DiagnosticCollector} collector - Findings.
 */
function validateDefinition(value, collector) {
    if (!isRecord(value)) {
        addActionFinding(collector, 'definition', C.INVALID_TYPE, '', 'Expected an action definition record.');
        return;
    }
    checkFields(value, '', DEFINITION_FIELDS, DEFINITION_FIELDS, collector);
    if (Object.hasOwn(value, 'type') && !classifyActionType(value.type)) {
        addActionFinding(collector, 'definition', C.INVALID_ACTION_IDENTIFIER, '/type',
            'Expected a supported action identifier.');
    }
    if (Object.hasOwn(value, 'enabled') && typeof value.enabled !== 'boolean') {
        addActionFinding(collector, 'definition', C.INVALID_TYPE, '/enabled', 'Expected a Boolean.');
    }
    for (const key of ['turnCostSuccess', 'turnCostFail']) {
        if (Object.hasOwn(value, key) && !isNonnegativeSafeInteger(value[key])) {
            addActionFinding(collector, 'definition', C.INVALID_TURN_COST, appendPointer('', key),
                'Expected a nonnegative safe integer.');
        }
    }
    if (!Object.hasOwn(value, 'arguments')) {
        return;
    }
    if (!isRecord(value.arguments)) {
        addActionFinding(collector, 'definition', C.INVALID_TYPE, '/arguments',
            'Expected an argument specification record.');
        return;
    }
    for (const key of Object.keys(value.arguments).sort()) {
        const path = appendPointer('/arguments', key);
        if (!isIdentifier(key)) {
            addActionFinding(collector, 'definition', C.INVALID_ARGUMENT_SPECIFICATION, path, 'Invalid argument name.');
            continue;
        }
        validateSpecification(value.arguments[key], path, collector);
    }
}

/**
 * Validates a single argument specification and suppresses dependent findings.
 * @param {unknown} spec - Inspected specification.
 * @param {string} path - Specification pointer.
 * @param {DiagnosticCollector} collector - Findings.
 */
function validateSpecification(spec, path, collector) {
    if (!isRecord(spec)) {
        addActionFinding(collector, 'definition', C.INVALID_ARGUMENT_SPECIFICATION, path,
            'Expected a specification record.');
        return;
    }
    checkFields(spec, path, ['type', 'required'], SPEC_FIELDS, collector);
    const validType = Object.hasOwn(spec, 'type') && ARGUMENT_TYPES.includes(spec.type);
    if (Object.hasOwn(spec, 'type') && !validType) {
        addActionFinding(collector, 'definition', C.INVALID_ARGUMENT_SPECIFICATION, appendPointer(path, 'type'),
            'Unsupported argument type.');
    }
    if (Object.hasOwn(spec, 'required') && typeof spec.required !== 'boolean') {
        addActionFinding(collector, 'definition', C.INVALID_TYPE, appendPointer(path, 'required'),
            'Expected a Boolean.');
    }
    const hasReference = Object.hasOwn(spec, 'referenceKind');
    const validReference = hasReference && REFERENCE_KINDS.includes(spec.referenceKind)
        && spec.type === 'string' && validType;
    if (hasReference && (!REFERENCE_KINDS.includes(spec.referenceKind)
        || (validType && spec.type !== 'string'))) {
        addActionFinding(collector, 'definition', C.INVALID_ARGUMENT_SPECIFICATION, appendPointer(path,
            'referenceKind'),
            'Expected a supported reference kind for a string argument.');
    }
    if (Object.hasOwn(spec, 'allowedValues')) {
        validateAllowedValues(spec, path, validType, validReference, collector);
    }
}

/**
 * Validates an optional nonempty set of unique compatible scalar values.
 * @param {object} spec - Inspected specification.
 * @param {string} path - Specification pointer.
 * @param {boolean} validType - Whether the type prerequisite is valid.
 * @param {boolean} validReference - Whether reference syntax checks apply.
 * @param {DiagnosticCollector} collector - Findings.
 */
function validateAllowedValues(spec, path, validType, validReference, collector) {
    const values = spec.allowedValues;
    const valuesPath = appendPointer(path, 'allowedValues');
    if (!Array.isArray(values) || values.length === 0) {
        addActionFinding(collector, 'definition', C.INVALID_ARGUMENT_SPECIFICATION, valuesPath,
            'Expected a nonempty allowed-value array.');
        return;
    }
    if (validType && ['object', 'array'].includes(spec.type)) {
        addActionFinding(collector, 'definition', C.INVALID_ARGUMENT_SPECIFICATION, valuesPath,
            'Allowed values require a scalar type.');
        return;
    }
    const seen = new Set();
    for (const [index, value] of values.entries()) {
        const valuePath = appendPointer(valuesPath, index);
        if (value !== null && typeof value === 'object'
            || (validType && !matchesArgumentType(value, spec.type))
            || (validReference && !matchesReferenceSyntax(value, spec.referenceKind))) {
            addActionFinding(collector, 'definition', C.INVALID_ARGUMENT_SPECIFICATION, valuePath,
                'Incompatible allowed value.');
            continue;
        }
        if (seen.has(value)) {
            addActionFinding(collector, 'definition', C.INVALID_ARGUMENT_SPECIFICATION, valuePath,
                'Duplicate allowed value.');
        }
        seen.add(value);
    }
}
