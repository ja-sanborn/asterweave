/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Exact action identity and namespace classification.
 * @module actions/actionIdentifiers
 */

import { isIdentifier } from '../shared/identifiers.js';

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

/**
 * Checks whether a namespace is reserved from extension claims.
 * @param {unknown} namespace - Candidate namespace.
 * @returns {boolean} Whether the namespace is reserved.
 */
export function isReservedActionNamespace(namespace) {
    return namespace === 'game' || namespace === 'asterweave';
}

/**
 * Classifies an exact action identifier independently of registration ownership.
 * Unrecognized standard names and reserved engine-qualified names are unsupported.
 * @param {unknown} type - Candidate action type.
 * @returns {{classification: string, namespace: string|null}|undefined} Immutable identity or no match.
 */
export function classifyActionType(type) {
    if (typeof type !== 'string') {
        return undefined;
    }
    const segments = type.split('.');
    if (segments.length === 1 && isStandardActionType(type)) {
        return Object.freeze({ classification: 'standard', namespace: null });
    }
    if (segments.length !== 2 || !segments.every(isIdentifier)) {
        return undefined;
    }
    const [namespace] = segments;
    if (namespace === 'asterweave') {
        return undefined;
    }
    const classification = namespace === 'game' ? 'game' : 'extension';
    return Object.freeze({ classification, namespace });
}
