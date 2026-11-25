/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Deterministic detached effective state snapshots.
 * @module state/createStateSnapshot
 */

import { immutableCopy } from '../shared/immutableData.js';

/**
 * Builds a detached recursively immutable snapshot of authoritative effective state.
 * @param {object} state - Internal effective record view.
 * @returns {object} Ordered JSON-compatible state snapshot.
 */
export function createStateSnapshot(state) {
    const snapshot = {
        game: state.game,
        world: state.world,
        locations: sortedParticipants(state.locations),
        actors: sortedParticipants(state.actors),
        entities: sortedParticipants(state.entities),
        players: sortedParticipants(state.players),
        relationships: state.relationships.filter((entry) => Object.keys(entry.properties).length !== 0)
            .sort(compareRelationships),
    };
    return immutableCopy(snapshot);
}

/**
 * Compares strings by ECMAScript code-unit ordering, not locale.
 * @param {string} left - First string.
 * @param {string} right - Second string.
 * @returns {number} Ordering comparison.
 */
function compare(left, right) {
    return left < right ? -1 : left > right ? 1 : 0;
}

/**
 * Creates an ordered copy of a participant collection.
 * @param {ReadonlyArray<object>} records - Effective records.
 * @returns {Array<object>} Ordered references for subsequent detached copying.
 */
function sortedParticipants(records) {
    return [...records].sort((left, right) => compare(left.id, right.id));
}

/**
 * Compares directed relationship identities in documented endpoint order.
 * @param {object} left - First relationship.
 * @param {object} right - Second relationship.
 * @returns {number} Ordering comparison.
 */
function compareRelationships(left, right) {
    return compare(left.from.scope, right.from.scope)
        || compare(left.from.id ?? '', right.from.id ?? '')
        || compare(left.to.scope, right.to.scope)
        || compare(left.to.id ?? '', right.to.id ?? '');
}
