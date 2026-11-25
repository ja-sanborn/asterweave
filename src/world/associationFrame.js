/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared spatial association endpoint and frame constraints.
 * @module world/associationFrame
 */

/**
 * Checks distinct active physical endpoints without requiring a spatial frame.
 * @param {Map} participants - Effective participant index.
 * @param {string} id - Subject.
 * @param {string} targetId - Target.
 * @returns {boolean} Endpoint validity.
 */
export function validAssociationEndpoints(participants, id, targetId) {
    return id !== targetId
        && participants.get(id)?.properties['asterweave.lifecycle'] === 'active'
        && participants.get(targetId)?.properties['asterweave.lifecycle'] === 'active';
}

/**
 * Checks shared immediate placement frame using effective containment.
 * @param {Map} participants - Effective participant index.
 * @param {string} id - Subject.
 * @param {string} targetId - Target.
 * @returns {boolean} Shared frame.
 */
export function sharesAssociationFrame(participants, id, targetId) {
    const parent = participants.get(id)?.properties['asterweave.containment']?.parentId;
    return parent !== undefined
        && parent === participants.get(targetId)?.properties['asterweave.containment']?.parentId;
}
