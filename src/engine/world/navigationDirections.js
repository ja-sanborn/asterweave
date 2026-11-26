/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Canonical standard direction vocabulary.
 * @module world/navigationDirections
 */

/** @type {ReadonlyArray<string>} Standard semantic direction identifiers. */
export const STANDARD_DIRECTIONS = Object.freeze([
    'north', 'south', 'east', 'west', 'northeast', 'northwest',
    'southeast', 'southwest', 'up', 'down', 'in', 'out',
]);

/**
 * Checks exact canonical direction membership.
 * @param {unknown} value - Candidate direction.
 * @returns {boolean} Whether the direction is supported.
 */
export function isStandardDirection(value) {
    return STANDARD_DIRECTIONS.includes(value);
}
