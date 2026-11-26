/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared player control membership constraints.
 * @module state/validateControlMembership
 */

/**
 * Determines actor eligibility independently of representation.
 * @param {object|undefined} properties - Known actor's effective properties.
 * @returns {boolean} Whether actor may be controlled.
 */
export function isControllableActor(properties) {
    return properties?.['engine.lifecycle'] === 'active';
}

/**
 * Checks explicit selection membership.
 * @param {Iterable<string>} controlled - Controlled identities.
 * @param {string|undefined} selected - Explicit selection.
 * @returns {boolean} Whether selection is absent or controlled.
 */
export function isSelectionValid(controlled, selected) {
    return selected === undefined || new Set(controlled).has(selected);
}

/**
 * Checks structurally valid ordered control and selection.
 * @param {string[]} controlled - Ordered actor identities.
 * @param {string|undefined} selected - Optional selection.
 * @param {Function} resolveActor - Actor property lookup.
 * @returns {boolean} Membership validity.
 */
export function validateControlMembership(controlled, selected, resolveActor) {
    return new Set(controlled).size === controlled.length
        && controlled.every((id) => isControllableActor(resolveActor(id)))
        && isSelectionValid(controlled, selected);
}
