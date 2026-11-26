/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Effective spatial association invariants.
 * @module world/validateAssociations
 */

import { validAssociationEndpoints, sharesAssociationFrame } from './associationFrame.js';
import { WORLD_CODES as C } from './worldDiagnostics.js';

/**
 * Checks directed spatial associations against valid active containment.
 * @param {Map} participants - Effective participant index.
 * @param {object} hierarchy - Derived containment indexes.
 * @param {Function} report - Domain finding callback.
 * @returns {void}
 */
export function validateAssociations(participants, hierarchy, report) {
    const resolve = (id) => participants.get(id);
    for (const [id, { properties }] of participants) {
        if (properties['engine.lifecycle'] !== 'active') {
            continue;
        }
        const seen = new Set();
        for (const [index, association] of properties['engine.associations'].entries()) {
            const { targetId, relationship } = association;
            const identity = JSON.stringify([targetId, relationship]);
            let message;
            if (seen.has(identity)) {
                message = 'Duplicate spatial association.';
            } else if (!validAssociationEndpoints(resolve, id, targetId)) {
                message = 'Association requires a distinct active participant.';
            } else if (!hierarchy.invalid.has(id) && !hierarchy.invalid.has(targetId)
                && !sharesAssociationFrame(resolve, id, targetId)) {
                message = 'Association endpoints must share an immediate parent.';
            }
            seen.add(identity);
            if (message !== undefined) {
                report(C.INVALID_ASSOCIATION, id, 'associations', message, index);
            }
        }
    }
}
