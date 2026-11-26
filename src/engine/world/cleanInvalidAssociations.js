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
    const resolve = (id) => plan.participant(id);
    for (const subject of plan.participantIds()) {
        const { properties } = resolve(subject);
        const associations = properties['engine.associations'];
        const retained = associations.filter(({ targetId }) =>
            validAssociationEndpoints(resolve, subject, targetId)
            && sharesAssociationFrame(resolve, subject, targetId));
        if (retained.length !== associations.length) {
            plan.set(subject, 'engine.associations', retained);
        }
    }
}
