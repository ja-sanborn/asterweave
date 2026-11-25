/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared action argument type and reference predicates.
 * @module actions/argumentConstraints
 */

import { isIdentifier } from '../shared/identifiers.js';
import { WORLD_ID } from '../world/worldRelationships.js';

/** @type {ReadonlyArray<string>} Supported argument types. */
export const ARGUMENT_TYPES = Object.freeze([
    'string', 'number', 'integer', 'boolean', 'object', 'array', 'null',
]);

/** @type {ReadonlyArray<string>} Supported reference categories. */
export const REFERENCE_KINDS = Object.freeze([
    'location', 'actor', 'entity', 'participant', 'world', 'player',
]);

/**
 * Checks a detached JSON record.
 * @param {unknown} value - Inspected data.
 * @returns {boolean} Whether the value is a record.
 */
export function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Checks a value against a declared type without coercion.
 * @param {unknown} value - Inspected data.
 * @param {string} type - Declared type.
 * @returns {boolean} Whether the value matches.
 */
export function matchesArgumentType(value, type) {
    switch (type) {
        case 'integer': return Number.isSafeInteger(value);
        case 'number': return typeof value === 'number' && Number.isFinite(value);
        case 'object': return isRecord(value);
        case 'array': return Array.isArray(value);
        case 'null': return value === null;
        case 'string':
        case 'boolean': return typeof value === type;
        default: return false;
    }
}

/**
 * Checks reference syntax, not existence, category membership or authority.
 * @param {unknown} value - Candidate reference.
 * @param {string} kind - Supported reference kind.
 * @returns {boolean} Whether reference syntax is permitted.
 */
export function matchesReferenceSyntax(value, kind) {
    if (!REFERENCE_KINDS.includes(kind) || !isIdentifier(value)) {
        return false;
    }
    if (kind === 'world') {
        return value === WORLD_ID;
    }
    return kind === 'player' || value !== WORLD_ID;
}
