/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared typed subject resolution.
 * @module state/resolvePropertySubject
 */

import { PARTICIPANT_CATEGORIES } from '../world/worldVocabulary.js';

/**
 * Resolves a typed endpoint against an effective or baseline record view.
 * @param {object} state - Read-only record view.
 * @param {object} endpoint - Validated endpoint.
 * @returns {object|undefined} Matching record.
 */
export function resolveEndpoint(state, endpoint) {
    if (endpoint.scope === 'world') {
        return state.world;
    }
    if (endpoint.scope !== 'player' && typeof state.participantKind === 'function') {
        return state.participantKind(endpoint.id) === endpoint.scope
            ? state.participant(endpoint.id) : undefined;
    }
    const collection = endpoint.scope === 'player' ? 'players'
        : PARTICIPANT_CATEGORIES.find(({ kind }) => kind === endpoint.scope)?.collection;
    return collection === undefined ? undefined
        : state[collection].find(({ id }) => id === endpoint.id);
}

/**
 * Resolves a property subject, including valid empty directed relationships.
 * @param {object} state - Read-only record view.
 * @param {object} address - Validated address.
 * @returns {object|undefined} Subject or undefined if an identity does not exist.
 */
export function resolvePropertySubject(state, address) {
    if (address.scope !== 'relationship') {
        return resolveEndpoint(state, address);
    }
    if (resolveEndpoint(state, address.from) === undefined
        || resolveEndpoint(state, address.to) === undefined) {
        return undefined;
    }
    return { from: address.from, to: address.to };
}
