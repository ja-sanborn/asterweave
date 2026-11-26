/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Effective individual and cumulative capacity invariants.
 * @module world/validateCapacity
 */

import { calculatePhysicalLoads, measurement } from './physicalLoads.js';
import { INDIVIDUAL_LIMITS, CUMULATIVE_LIMITS } from './physicalMeasurements.js';
import { WORLD_CODES as C } from './worldDiagnostics.js';

/**
 * Validates finite capacity limits on an acyclic effective hierarchy.
 * @param {Map} participants - Effective participant index.
 * @param {object} hierarchy - Derived containment indexes.
 * @param {Function} report - Domain finding callback.
 * @returns {void}
 */
export function validateCapacity(participants, hierarchy, report) {
    const totals = calculatePhysicalLoads(participants, hierarchy);
    for (const [id, { properties }] of participants) {
        if (properties['engine.lifecycle'] !== 'active' || !totals.has(id)) {
            continue;
        }
        const children = hierarchy.children.get(id) ?? [];
        for (const { limit, score } of INDIVIDUAL_LIMITS) {
            const maximum = properties['engine.' + limit];
            if (maximum === undefined) {
                continue;
            }
            for (const child of children) {
                const value = participants.get(child).properties['engine.' + score];
                checkLimit(id, limit, maximum, measurement(value), true, report);
            }
        }
        const total = totals.get(id);
        for (const { limit, score } of CUMULATIVE_LIMITS) {
            const load = score === 'size' ? total.contentsSize : total.contentsWeight;
            const maximum = properties['engine.' + limit];
            if (maximum !== undefined) {
                checkLimit(id, limit, maximum, load, children.length > 0, report);
            }
        }
    }
}

/**
 * Checks a finite inclusive limit.
 * @param {string} id - Parent identity.
 * @param {string} property - Limit name.
 * @param {number} maximum - Finite limit.
 * @param {object} load - Aggregate score.
 * @param {boolean} occupied - Whether a child exists.
 * @param {Function} report - Domain finding callback.
 */
function checkLimit(id, property, maximum, load, occupied, report) {
    if ((maximum === 0 && occupied) || load.overflow || load.sum > maximum) {
        report(C.CAPACITY_EXCEEDED, id, property, 'Physical capacity exceeded.');
    } else if (load.unknown) {
        report(C.UNKNOWN_MEASUREMENT, id, property, 'Required physical measurement is absent.');
    }
}
