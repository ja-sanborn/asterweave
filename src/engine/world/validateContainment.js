/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Effective containment and ancestry validation.
 * @module world/validateContainment
 */

import { WORLD_ID } from './worldRelationships.js';
import { WORLD_CODES as C } from './worldDiagnostics.js';

/**
 * Checks active containment edges and detects cycles iteratively.
 * @param {Map} participants - Effective participant index.
 * @param {Set<string>} invalidLifecycle - Invalid placement prerequisites.
 * @param {Function} report - Domain finding callback.
 * @returns {{parents: Map, children: Map, invalid: Set}} Derived hierarchy indexes.
 */
export function validateContainment(participants, invalidLifecycle, report) {
    const parents = new Map();
    const children = new Map();
    const invalid = new Set(invalidLifecycle);
    for (const [id, { properties }] of participants) {
        if (properties['engine.lifecycle'] !== 'active' || invalid.has(id)) {
            continue;
        }
        const { parentId, relationship } = properties['engine.containment'];
        const parent = participants.get(parentId);
        let message;
        if (parentId === id) {
            report(C.CONTAINMENT_CYCLE, id, 'containment', 'Participant contains itself.');
            invalid.add(id);
            continue;
        }
        if (parentId === WORLD_ID) {
            if (relationship !== 'in') {
                message = 'World accepts only the in relationship.';
            }
        } else if (parent === undefined || parent.properties['engine.lifecycle'] !== 'active') {
            message = 'Containment requires an active parent.';
        } else if (relationship === 'in' && !parent.properties['engine.isContainer']) {
            message = 'Parent is not a container.';
        } else if (['carried', 'held', 'worn'].includes(relationship) && parent.kind !== 'actor') {
            message = 'Relationship requires an actor parent.';
        }
        if (message !== undefined) {
            invalid.add(id);
            report(C.INVALID_CONTAINMENT, id, 'containment', message);
            continue;
        }
        parents.set(id, parentId);
        if (!children.has(parentId)) {
            children.set(parentId, []);
        }
        children.get(parentId).push(id);
    }

    const resolved = new Set([WORLD_ID]);
    for (const id of parents.keys()) {
        const chain = new Set();
        let current = id;
        while (!resolved.has(current) && !invalid.has(current)) {
            if (chain.has(current)) {
                report(C.CONTAINMENT_CYCLE, current, 'containment', 'Containment cycle detected.');
                invalid.add(current);
                break;
            }
            chain.add(current);
            current = parents.get(current);
            if (current === undefined) {
                break;
            }
        }
        if (resolved.has(current)) {
            for (const member of chain) {
                resolved.add(member);
            }
        } else {
            for (const member of chain) {
                invalid.add(member);
            }
        }
    }
    return { parents, children, invalid };
}
