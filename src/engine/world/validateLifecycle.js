/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Effective participant lifecycle invariants.
 * @module world/validateLifecycle
 */

import { WORLD_CODES as C } from './worldDiagnostics.js';

/**
 * Checks placement and association presence against effective lifecycle.
 * @param {Map} participants - ID to effective participant and kind.
 * @param {Function} report - Domain finding callback (code, id, property, message).
 * @returns {Set<string>} IDs whose lifecycle placement prerequisites are invalid.
 */
export function validateLifecycle(participants, report) {
    const invalid = new Set();
    for (const [id, { properties }] of participants) {
        const active = properties['engine.lifecycle'] === 'active';
        const placed = Object.hasOwn(properties, 'engine.containment');
        if (active !== placed) {
            invalid.add(id);
            report(C.INVALID_LIFECYCLE, id, 'containment', active
                ? 'Active participant requires containment.'
                : 'Nonactive participant must not have containment.');
        }
        if (!active && properties['engine.associations'].length > 0) {
            report(C.INVALID_LIFECYCLE, id, 'associations',
                'Nonactive participant must not have associations.');
        }
    }
    return invalid;
}
