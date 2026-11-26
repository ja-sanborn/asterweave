/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared checked physical load calculations.
 * @module world/physicalLoads
 */

import { addNonnegative } from '../shared/safeArithmetic.js';
import { WORLD_ID } from './worldRelationships.js';

/**
 * Calculates loads for valid rooted branches using iterative postorder traversal.
 * @param {Map} participants - Effective participant index with validated measurements.
 * @param {object} hierarchy - Validated containment indexes.
 * @returns {Map} Temporary checked aggregates by active participant ID.
 */
export function calculatePhysicalLoads(participants, hierarchy) {
    // Traverse valid rooted branches even when a separate branch is invalid.
    // A rejected edge cannot contribute to a valid rooted aggregate. Missing
    // scores on valid children remain independent findings even if another edge fails.
    const totals = new Map();
    const pending = [];
    for (const id of hierarchy.children.get(WORLD_ID) ?? []) {
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
            size = combine(size, measurement(childProperties['engine.size']));
            weight = combine(weight, totals.get(child));
        }
        totals.set(id, {
            ...combine(weight, measurement(properties['engine.weight'])),
            contentsWeight: weight,
            contentsSize: size,
        });
    }
    return totals;
}

/**
 * Creates an aggregate from one optional intrinsic score.
 * @param {number|undefined} value - Intrinsic score.
 * @returns {object} Checked aggregate.
 */
export function measurement(value) {
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
 * Converts an internal aggregate to a detached exact-load result.
 * @param {object} aggregate - Checked aggregate.
 * @returns {object} Exact value when known and representable; independent flags otherwise.
 */
export function describeLoad(aggregate) {
    return Object.freeze({
        unknown: aggregate.unknown,
        overflow: aggregate.overflow,
        ...(!aggregate.unknown && !aggregate.overflow ? { value: aggregate.sum } : {}),
    });
}
