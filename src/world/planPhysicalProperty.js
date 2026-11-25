/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Restricted physical property change planning.
 * @module world/planPhysicalProperty
 */

import { WorldChangePlan } from './WorldChangePlan.js';
import { PHYSICAL_MEASUREMENTS, isPhysicalMeasurementValue } from './physicalMeasurements.js';
import { WORLD_ID } from './worldRelationships.js';
import { WORLD_CODES } from './worldDiagnostics.js';
import { isIdentifier } from '../shared/identifiers.js';

/**
 * Validates the restricted physical property and mutation request.
 * @param {string} operation - Set, remove or reset.
 * @param {string} id - Participant identity.
 * @param {string} name - Unqualified physical property name.
 * @param {*} value - Proposed set value.
 * @throws {TypeError} For malformed or unsupported requests.
 */
export function requirePhysicalPropertyRequest(operation, id, name, value) {
    if (!isIdentifier(id) || !['set', 'remove', 'reset'].includes(operation)
        || !(name === 'isContainer' || PHYSICAL_MEASUREMENTS.includes(name))
        || (operation === 'remove' && name === 'isContainer')
        || (operation !== 'set' && value !== undefined)
        || (operation === 'set' && !(name === 'isContainer'
            ? typeof value === 'boolean' : isPhysicalMeasurementValue(name, value)))) {
        throw new TypeError('Invalid physical property operation.');
    }
}

/**
 * Prepares a physical property change against the current effective hierarchy.
 * @param {object} state - Effective records.
 * @param {string} id - Subject identity.
 * @param {string} name - Validated physical property name.
 * @param {*} value - Validated resolved value or absence.
 * @returns {object} Semantic result and validated changes.
 */
export function planPhysicalProperty(state, id, name, value) {
    const plan = new WorldChangePlan(state);
    if (id === WORLD_ID) {
        return plan.finish(WORLD_CODES.INVALID_CONTAINMENT);
    }
    if (!plan.participant(id)) {
        throw new TypeError('Unknown world operation identity.');
    }
    plan.set(id, 'asterweave.' + name, value);
    return plan.finish();
}
