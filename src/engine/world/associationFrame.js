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
 * @param {Function} resolve - Participant lookup.
 * @param {string} id - Subject.
 * @param {string} targetId - Target.
 * @returns {boolean} Endpoint validity.
 */
export function validAssociationEndpoints(resolve, id, targetId) {
    return id !== targetId
        && resolve(id)?.properties['engine.lifecycle'] === 'active'
        && resolve(targetId)?.properties['engine.lifecycle'] === 'active';
}

/**
 * Checks shared immediate placement frame using effective containment.
 * @param {Function} resolve - Participant lookup.
 * @param {string} id - Subject.
 * @param {string} targetId - Target.
 * @returns {boolean} Shared frame.
 */
export function sharesAssociationFrame(resolve, id, targetId) {
    const parent = resolve(id)?.properties['engine.containment']?.parentId;
    return parent !== undefined
        && parent === resolve(targetId)?.properties['engine.containment']?.parentId;
}
