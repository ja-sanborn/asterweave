/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Structural and specialized validation of submitted arguments.
 * @module actions/validateActionArguments
 */

import { DiagnosticCollector } from '../diagnostics/DiagnosticCollector.js';
import { addActionFinding } from './actionDiagnostics.js';
import { appendPointer } from '../diagnostics/jsonPointer.js';
import { inspectJsonData } from '../shared/jsonData.js';
import { freezeDetachedJsonData } from '../shared/immutableData.js';
import { isRecord, matchesArgumentType, matchesReferenceSyntax } from './argumentConstraints.js';

/**
 * Checks submitted arguments against previously validated immutable definition metadata.
 * The optional trusted validator receives only detached read-only arguments.
 * @param {object} definition - Previously validated action definition.
 * @param {unknown} input - Submitted argument data.
 * @param {Function} [validator] - Trusted synchronous specialized validator.
 * @returns {object} Immutable internal result; args is present only on completion.
 * @throws {TypeError} On invalid internal validator association or return contract.
 */
export function validateActionArguments(definition, input, validator) {
    if (validator !== undefined && typeof validator !== 'function') {
        throw new TypeError('Expected a trusted argument validator.');
    }
    const collector = new DiagnosticCollector(['args']);
    const { value, issues } = inspectJsonData(input);
    for (const issue of issues) {
        addActionFinding(collector, 'args', 'INVALID_DATA', issue.path, issue.message);
    }
    if (issues.length === 0) {
        validateStructure(definition.arguments, value, collector);
    }
    if (collector.size > 0) {
        return Object.freeze({ status: 'rejected', diagnostics: collector.snapshot() });
    }
    const args = freezeDetachedJsonData(value);
    if (validator !== undefined) {
        collectSpecializedFindings(validator(args), collector);
    }
    const diagnostics = collector.snapshot();
    if (diagnostics.length > 0) {
        return Object.freeze({ status: 'rejected', diagnostics });
    }
    return Object.freeze({ status: 'completed', diagnostics, args });
}

/**
 * Checks own argument fields in deterministic code-unit order.
 * @param {object} specifications - Validated argument specifications.
 * @param {unknown} args - Inspected argument data.
 * @param {DiagnosticCollector} collector - Findings.
 */
function validateStructure(specifications, args, collector) {
    if (!isRecord(args)) {
        addActionFinding(collector, 'args', 'INVALID_TYPE', '', 'Expected an argument record.');
        return;
    }
    for (const key of Object.keys(specifications).sort()) {
        const spec = specifications[key];
        const path = appendPointer('', key);
        if (!Object.hasOwn(args, key)) {
            if (spec.required) {
                addActionFinding(collector, 'args', 'REQUIRED_FIELD', path, 'Required argument is missing.');
            }
            continue;
        }
        const value = args[key];
        if (!matchesArgumentType(value, spec.type)) {
            addActionFinding(collector, 'args', 'INVALID_TYPE', path, 'Argument does not match its declared type.');
            continue;
        }
        if (Object.hasOwn(spec, 'referenceKind') && !matchesReferenceSyntax(value, spec.referenceKind)) {
            addActionFinding(collector, 'args', 'INVALID_VALUE', path, 'Invalid reference identifier.');
            continue;
        }
        if (Object.hasOwn(spec, 'allowedValues') && !spec.allowedValues.includes(value)) {
            addActionFinding(collector, 'args', 'INVALID_VALUE', path, 'Argument is not an allowed value.');
        }
    }
    for (const key of Object.keys(args).sort()) {
        if (!Object.hasOwn(specifications, key)) {
            addActionFinding(collector, 'args', 'UNKNOWN_FIELD', appendPointer('', key), 'Unknown argument.');
        }
    }
}

/**
 * Validates and copies a trusted validator's synchronous diagnostic array.
 * A malformed finding is an internal contract violation, not an argument rejection.
 * @param {unknown} findings - Validator return value.
 * @param {DiagnosticCollector} collector - Argument findings.
 * @throws {TypeError} On invalid finding data or fields.
 */
function collectSpecializedFindings(findings, collector) {
    const { value, issues } = inspectJsonData(findings);
    if (issues.length > 0 || !Array.isArray(value)) {
        throw new TypeError('Expected a synchronous argument diagnostic array.');
    }
    const fields = ['source', 'code', 'severity', 'path', 'message'];
    for (const finding of value) {
        if (!isRecord(finding) || Object.keys(finding).length !== fields.length
            || !fields.every((key) => Object.hasOwn(finding, key))) {
            throw new TypeError('Invalid specialized argument diagnostic.');
        }
        collector.add(finding);
    }
}
