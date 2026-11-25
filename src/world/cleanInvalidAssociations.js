/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared cleanup of invalidated physical association frames.
 * @module world/cleanInvalidAssociations
 */

import { validAssociationEndpoints, sharesAssociationFrame } from './associationFrame.js';

/**
 * Removes directed associations invalidated by proposed structural changes.
 * @param {object} plan - Temporary world change proposal.
 */
export function cleanInvalidAssociations(plan) {
    for (const [subject, { properties }] of plan.participants) {
        const associations = properties['asterweave.associations'];
        const retained = associations.filter(({ targetId }) =>
            validAssociationEndpoints(plan.participants, subject, targetId)
            && sharesAssociationFrame(plan.participants, subject, targetId));
        if (retained.length !== associations.length) {
            plan.set(subject, 'asterweave.associations', retained);
        }
    }
}
