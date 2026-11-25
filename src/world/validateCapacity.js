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

import { addNonnegative } from '../shared/safeArithmetic.js';
import { WORLD_CODES as C } from './worldDiagnostics.js';

/**
 * Validates finite capacity limits on an acyclic effective hierarchy.
 * @param {Map} participants - Effective participant index.
 * @param {object} hierarchy - Derived containment indexes.
 * @param {Function} report - Domain finding callback.
 * @returns {void}
 */
export function validateCapacity(participants, hierarchy, report) {
    // Traverse valid rooted branches even when a separate branch is invalid.
    // Missing or invalid edges make affected aggregates incomplete.
    const incomplete = hierarchy.invalid.size > 0;
    const totals = new Map();
    const pending = [];
    for (const id of hierarchy.children.get('world') ?? []) {
        pending.push([id, false]);
    }
    while (pending.length > 0) {
        const [id, visited] = pending.pop();
        const children = hierarchy.children.get(id) ?? [];
        if (!visited) {
            pending.push([id, true]);
            for (const child of children) {
                pending.push([child, false]);
            }
            continue;
        }
        const properties = participants.get(id).properties;
        let weight = { sum: 0, unknown: false, overflow: false };
        let size = { sum: 0, unknown: false, overflow: false };
        for (const child of children) {
            const childProperties = participants.get(child).properties;
            size = combine(size, measurement(childProperties['asterweave.size']));
            weight = combine(weight, totals.get(child));
        }
        totals.set(id, combine(weight, measurement(properties['asterweave.weight'])));
        // Report in authored order in a separate pass.
        totals.get(id).contentsWeight = weight;
        totals.get(id).contentsSize = size;
    }
    for (const [id, { properties }] of participants) {
        if (properties['asterweave.lifecycle'] !== 'active' || !totals.has(id)) {
            continue;
        }
        const children = hierarchy.children.get(id) ?? [];
        for (const [limit, score] of [['maxItemSize', 'size'], ['maxItemWeight', 'weight']]) {
            const maximum = properties['asterweave.' + limit];
            if (maximum === undefined) {
                continue;
            }
            for (const child of children) {
                const value = participants.get(child).properties['asterweave.' + score];
                checkLimit(id, limit, maximum, measurement(value), true, report);
            }
        }
        const total = totals.get(id);
        for (const [limit, load] of [
            ['sizeCapacity', total.contentsSize],
            ['weightCapacity', total.contentsWeight],
        ]) {
            const maximum = properties['asterweave.' + limit];
            if (maximum !== undefined && (!incomplete || load.overflow || load.sum > maximum
                || (maximum === 0 && children.length > 0))) {
                checkLimit(id, limit, maximum, load, children.length > 0, report);
            }
        }
    }
}

/**
 * Creates an aggregate from one optional intrinsic score.
 * @param {number|undefined} value - Intrinsic score.
 * @returns {object} Checked aggregate.
 */
function measurement(value) {
    return { sum: value ?? 0, unknown: value === undefined, overflow: false };
}

/**
 * Combines independent aggregate scores without unsafe arithmetic.
 * @param {object} left - First aggregate.
 * @param {object} right - Second aggregate.
 * @returns {object} Combined aggregate.
 */
function combine(left, right) {
    const sum = addNonnegative(left.sum, right.sum);
    return {
        sum: sum ?? Number.MAX_SAFE_INTEGER,
        unknown: left.unknown || right.unknown,
        overflow: left.overflow || right.overflow || sum === undefined,
    };
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
