/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Structural prerequisites for effective state validation.
 * @module state/validateEffectiveStructure
 */

import { isRecord } from '../shared/recordShape.js';
import { isIdentifier, isGameId, isVersion } from '../shared/identifiers.js';
import { inspectJsonData } from '../shared/jsonData.js';
import { PARTICIPANT_CATEGORIES } from '../world/worldVocabulary.js';
import { WORLD_ID } from '../world/worldRelationships.js';
import { WORLD_PROPERTY_NAMES, isWorldPropertyValue } from '../world/worldPropertyShape.js';
import { isStandardDirection } from '../world/navigationDirections.js';

/**
 * Checks a property map's supported domain property keys.
 * @param {*} properties - Inspected map.
 * @param {Array<string>} reserved - Allowed engine property keys without prefix.
 * @returns {boolean} Validity.
 */
function mapValid(properties, reserved) {
    return isRecord(properties) && Object.keys(properties).every((key) =>
        reserved.some((name) => key === 'engine.' + name));
}

/**
 * Checks complete candidate shapes before traversing domain edges.
 * @param {object} input - Effective records.
 * @returns {boolean} Whether structural prerequisites are satisfied.
 */
export function validateEffectiveStructure(input) {
    const { value: state, issues } = inspectJsonData(input);
    if (issues.length || !isRecord(state) || !isRecord(state.game)
        || Object.keys(state).length !== 7
        || Object.keys(state.game).length !== 4
        || !isGameId(state.game.id) || !isVersion(state.game.version)
        || !isVersion(state.game.formatVersion) || typeof state.game.title !== 'string'
        || state.game.title.trim().length === 0
        || !isRecord(state.world) || Object.keys(state.world).length !== 1) {
        return false;
    }
    const world = state.world.properties;
    if (!mapValid(world, ['id', 'name', 'lifecycle', 'turn'])
        || world['engine.id'] !== WORLD_ID || world['engine.name'] !== 'World'
        || world['engine.lifecycle'] !== 'active'
        || !Number.isSafeInteger(world['engine.turn']) || world['engine.turn'] < 0) {
        return false;
    }
    const ids = new Set([WORLD_ID]);
    for (const { collection, kind } of PARTICIPANT_CATEGORIES) {
        if (!Array.isArray(state[collection])) {
            return false;
        }
        for (const record of state[collection]) {
            if (!isRecord(record) || Object.keys(record).length !== (kind === 'location' ? 3 : 2)
                || !isIdentifier(record.id) || ids.has(record.id)) {
                return false;
            }
            ids.add(record.id);
            const p = record.properties;
            if (!mapValid(p, ['id', 'name', 'description', ...WORLD_PROPERTY_NAMES])
                || p['engine.id'] !== record.id || typeof p['engine.name'] !== 'string'
                || p['engine.name'].trim().length === 0
                || !WORLD_PROPERTY_NAMES.every((name) =>
                    isWorldPropertyValue(name, p['engine.' + name]))) {
                return false;
            }
            if (Object.hasOwn(p, 'engine.description')
                && typeof p['engine.description'] !== 'string') {
                return false;
            }
            if (kind === 'location' && (!Array.isArray(record.exits)
                || !record.exits.every((exit) => isRecord(exit) && Object.keys(exit).length === 2
                    && isStandardDirection(exit.direction) && isIdentifier(exit.destinationId)))) {
                return false;
            }
        }
    }
    if (!Array.isArray(state.players) || state.players.length > 1
        || !Array.isArray(state.relationships)) {
        return false;
    }
    for (const player of state.players) {
        if (!isRecord(player) || Object.keys(player).length !== 2 || !isIdentifier(player.id)
            || !mapValid(player.properties, ['id', 'controlledActors', 'selectedActor'])
            || player.properties['engine.id'] !== player.id
            || !Array.isArray(player.properties['engine.controlledActors'])
            || !player.properties['engine.controlledActors'].every(isIdentifier)
            || (Object.hasOwn(player.properties, 'engine.selectedActor')
                && !isIdentifier(player.properties['engine.selectedActor']))) {
            return false;
        }
    }
    return state.relationships.length === 0;
}
