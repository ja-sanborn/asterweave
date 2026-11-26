/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Canonical world relationship vocabulary.
 * @module world/worldRelationships
 */

/** @type {ReadonlyArray<string>} Physical containment relationships. */
export const CONTAINMENT_RELATIONSHIPS = Object.freeze([
    'in', 'on', 'carried', 'held', 'worn', 'attached', 'partOf',
]);

/** @type {ReadonlyArray<string>} Non-containing spatial relationships. */
export const ASSOCIATION_RELATIONSHIPS = Object.freeze([
    'under', 'behind', 'beside', 'near',
]);

/** @type {ReadonlyArray<string>} Participant lifecycle states. */
export const LIFECYCLE_STATES = Object.freeze(['active', 'inactive', 'destroyed']);

/** @type {string} Reserved implicit World identity. */
export const WORLD_ID = 'world';
