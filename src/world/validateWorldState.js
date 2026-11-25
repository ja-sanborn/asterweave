/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared effective physical-domain invariant sequencing.
 * @module world/validateWorldState
 */

import { validateLifecycle } from './validateLifecycle.js';
import { validateInitialViability } from './validateInitialViability.js';
import { validateContainment } from './validateContainment.js';
import { validateAssociations } from './validateAssociations.js';
import { validateCapacity } from './validateCapacity.js';
import { indexParticipants } from './indexParticipants.js';

/**
 * Checks structurally valid effective physical records.
 * @param {object} state - Effective records.
 * @param {Function} report - Domain finding callback.
 * @param {boolean} initial - Whether initialization viability is required.
 */
export function validateWorldState(state, report, initial = false) {
    const participants = indexParticipants(state);
    const invalid = validateLifecycle(participants, report);
    if (initial) {
        validateInitialViability(participants, report);
    }
    const hierarchy = validateContainment(participants, invalid, report);
    validateAssociations(participants, hierarchy, report);
    validateCapacity(participants, hierarchy, report);
}
