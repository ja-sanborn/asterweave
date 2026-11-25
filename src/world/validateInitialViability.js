/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Initialization-only active participant requirements.
 * @module world/validateInitialViability
 */

import { WORLD_CODES as C } from './worldDiagnostics.js';

/**
 * Checks active location and actor requirements for initial state only.
 * @param {Map} participants - Effective participant index.
 * @param {Function} report - Domain finding callback.
 */
export function validateInitialViability(participants, report) {
    const activeKinds = new Set();
    for (const { kind, properties } of participants.values()) {
        if (properties['asterweave.lifecycle'] === 'active') {
            activeKinds.add(kind);
        }
    }
    for (const kind of ['location', 'actor']) {
        if (!activeKinds.has(kind)) {
            report(C.INVALID_LIFECYCLE, undefined, kind, 'At least one active participant is required.');
        }
    }
}
