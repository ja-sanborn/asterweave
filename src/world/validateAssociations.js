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

import { WORLD_CODES as C } from './worldDiagnostics.js';

/**
 * Checks directed spatial associations against valid active containment.
 * @param {Map} participants - Effective participant index.
 * @param {object} hierarchy - Derived containment indexes.
 * @param {Function} report - Domain finding callback.
 * @returns {void}
 */
export function validateAssociations(participants, hierarchy, report) {
    for (const [id, { properties }] of participants) {
        if (properties['asterweave.lifecycle'] !== 'active') {
            continue;
        }
        const seen = new Set();
        for (const [index, association] of properties['asterweave.associations'].entries()) {
            const { targetId, relationship } = association;
            const identity = JSON.stringify([targetId, relationship]);
            const target = participants.get(targetId);
            let message;
            if (seen.has(identity)) {
                message = 'Duplicate spatial association.';
            } else if (id === targetId || target === undefined
                || target.properties['asterweave.lifecycle'] !== 'active') {
                message = 'Association requires a distinct active participant.';
            } else if (!hierarchy.invalid.has(id) && !hierarchy.invalid.has(targetId)
                && hierarchy.parents.get(id) !== hierarchy.parents.get(targetId)) {
                message = 'Association endpoints must share an immediate parent.';
            }
            seen.add(identity);
            if (message !== undefined) {
                report(C.INVALID_ASSOCIATION, id, 'associations', message, index);
            }
        }
    }
}
