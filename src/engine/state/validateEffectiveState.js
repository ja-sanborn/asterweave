/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared effective-state invariants and forward transition checks.
 * @module state/validateEffectiveState
 */

import { validateEffectiveStructure } from './validateEffectiveStructure.js';
import { validateWorldState } from '../world/validateWorldState.js';
import { validateControlMembership } from './validateControlMembership.js';
import { PARTICIPANT_CATEGORIES } from '../world/worldVocabulary.js';
import { areJsonValuesEqual } from '../shared/jsonEquality.js';

/**
 * Verifies complete effective state, independent of authored JSON.
 * Requires an engine-owned, stable effective view; not an external data boundary.
 * @param {object} state - Engine-owned effective candidate.
 * @param {boolean} [initial] - Apply initialization viability.
 * @returns {boolean} Validity.
 */
export function validateEffectiveState(state, initial = false) {
    if (!validateEffectiveStructure(state)) {
        return false;
    }
    let valid = true;
    const reject = () => { valid = false; };
    validateWorldState(state, reject, initial);
    const locations = new Set(state.locations.map(({ id }) => id));
    for (const { exits } of state.locations) {
        const directions = new Set();
        for (const exit of exits) {
            if (!locations.has(exit.destinationId) || directions.has(exit.direction)) {
                valid = false;
            }
            directions.add(exit.direction);
        }
    }
    const actors = new Map(state.actors.map(({ id, properties }) => [id, properties]));
    for (const { properties } of state.players) {
        const controlled = properties['engine.controlledActors'];
        if (!validateControlMembership(controlled, properties['engine.selectedActor'],
            (id) => actors.get(id))) {
            valid = false;
        }
    }
    return valid;
}

/**
 * Checks stable identities and irreversible destruction on forward gameplay.
 * @param {object} committed - Verified committed view.
 * @param {object} candidate - Validated candidate view.
 * @returns {boolean} Validity.
 */
export function validateStateTransition(committed, candidate) {
    if (!areJsonValuesEqual(committed.game, candidate.game)
        || candidate.world.properties['engine.turn'] < committed.world.properties['engine.turn']
        || !areJsonValuesEqual(committed.players.map(({ id }) => id), candidate.players.map(({ id }) => id))) {
        return false;
    }
    for (const { collection } of PARTICIPANT_CATEGORIES) {
        const next = new Map(candidate[collection].map((record) => [record.id, record]));
        if (next.size !== committed[collection].length) {
            return false;
        }
        for (const record of committed[collection]) {
            const replacement = next.get(record.id);
            if (!replacement || (record.properties['engine.lifecycle'] === 'destroyed'
                && replacement.properties['engine.lifecycle'] !== 'destroyed')
                || !areJsonValuesEqual(record.exits, replacement.exits)) {
                return false;
            }
        }
    }
    return true;
}
