/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Authoritative engine action identifiers.
 * @module actions/actionIdentifiers
 */

/** @type {ReadonlyArray<string>} Recognized standard catalog names, not registrations. */
export const STANDARD_ACTION_TYPES = Object.freeze([
    'move', 'enter', 'exit', 'climb', 'jump', 'swim',
    'cross', 'follow', 'board', 'disembark', 'look', 'examine',
    'search', 'find', 'read', 'listen', 'smell', 'touch',
    'taste', 'count', 'inventory', 'take', 'drop', 'put',
    'give', 'wear', 'remove', 'throw', 'open', 'close',
    'lock', 'unlock', 'activate', 'deactivate', 'push', 'pull',
    'turn', 'raise', 'lower', 'wind', 'plug', 'unplug',
    'use', 'cut', 'break', 'dig', 'tie', 'untie',
    'fill', 'empty', 'pour', 'shake', 'rub', 'squeeze',
    'clean', 'burn', 'extinguish', 'inflate', 'deflate', 'spray',
    'eat', 'drink', 'sit', 'stand', 'lieDown', 'sleep',
    'wake', 'rest', 'wait', 'talk', 'ask', 'tell',
    'answer', 'say', 'shout', 'greet', 'signal', 'command',
    'knock', 'choose', 'continue', 'interact',
]);

/**
 * Checks whether an unqualified identifier belongs to the engine catalog.
 * Recognition does not imply implementation or availability.
 * @param {unknown} type - Candidate action type.
 * @returns {boolean} Whether the standard identifier is recognized.
 */
export function isStandardActionType(type) {
    return STANDARD_ACTION_TYPES.includes(type);
}
