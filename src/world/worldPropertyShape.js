/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared structural world property vocabulary and value predicates.
 * @module world/worldPropertyShape
 */

import { isIdentifier } from '../shared/identifiers.js';
import { isRecord } from '../shared/recordShape.js';
import { LIFECYCLE_STATES, CONTAINMENT_RELATIONSHIPS, ASSOCIATION_RELATIONSHIPS } from './worldRelationships.js';
import { PHYSICAL_MEASUREMENTS, isPhysicalMeasurementValue } from './physicalMeasurements.js';

/** @type {ReadonlyArray<string>} Unqualified mutable structural world property names. */
export const WORLD_PROPERTY_NAMES = Object.freeze([
    'lifecycle', 'containment', 'associations', 'isContainer', ...PHYSICAL_MEASUREMENTS,
]);

/**
 * Checks an already inspected closed physical edge.
 * @param {*} edge - Inspected data.
 * @param {string} target - Target field.
 * @param {ReadonlyArray<string>} vocabulary - Relationship vocabulary.
 * @returns {boolean} Validity.
 */
function edgeValid(edge, target, vocabulary) {
    return isRecord(edge) && Object.keys(edge).length === 2
        && Object.hasOwn(edge, target) && isIdentifier(edge[target])
        && Object.hasOwn(edge, 'relationship') && vocabulary.includes(edge.relationship);
}

/**
 * Checks a structural value or permitted absence after safe data inspection.
 * @param {string} name - Unqualified structural name.
 * @param {*} value - Inspected value or absence.
 * @returns {boolean} Validity.
 */
export function isWorldPropertyValue(name, value) {
    switch (name) {
        case 'lifecycle':
            return LIFECYCLE_STATES.includes(value);
        case 'containment':
            return value === undefined || edgeValid(value, 'parentId', CONTAINMENT_RELATIONSHIPS);
        case 'associations':
            return Array.isArray(value) && value.every((edge) =>
                edgeValid(edge, 'targetId', ASSOCIATION_RELATIONSHIPS));
        case 'isContainer':
            return typeof value === 'boolean';
        default:
            return PHYSICAL_MEASUREMENTS.includes(name)
                && (value === undefined || isPhysicalMeasurementValue(name, value));
    }
}
