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
import { LIFECYCLE_STATES, CONTAINMENT_RELATIONSHIPS, ASSOCIATION_RELATIONSHIPS,
    WORLD_ID } from '../world/worldRelationships.js';
import { INTRINSIC_MEASUREMENTS, MEASUREMENT_LIMITS, isPhysicalMeasurementValue } from '../world/physicalMeasurements.js';
import { isStandardDirection } from '../world/navigationDirections.js';
import { isGamePropertyKey } from './validateProperties.js';
import { validatePropertyAddress } from './propertyAddress.js';

/**
 * Checks a closed two-field physical edge.
 * @param {*} edge - Inspected edge.
 * @param {string} target - ID field.
 * @param {Array<string>} vocabulary - Relationship kinds.
 * @returns {boolean} Validity.
 */
function edgeValid(edge, target, vocabulary) {
    return isRecord(edge) && Object.keys(edge).length === 2
        && Object.hasOwn(edge, target) && isIdentifier(edge[target])
        && Object.hasOwn(edge, 'relationship') && vocabulary.includes(edge.relationship);
}

/**
 * Checks a property map's qualified keys and namespace ownership.
 * @param {*} properties - Inspected map.
 * @param {string} namespace - Game namespace.
 * @param {Array<string>} reserved - Allowed engine property keys without prefix.
 * @returns {boolean} Validity.
 */
function mapValid(properties, namespace, reserved) {
    return isRecord(properties) && Object.keys(properties).every((key) =>
        isGamePropertyKey(key, namespace)
            || reserved.some((name) => key === 'asterweave.' + name));
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
        || Object.keys(state.game).length !== 5
        || !isGameId(state.game.id) || !isVersion(state.game.version)
        || !isVersion(state.game.formatVersion) || typeof state.game.title !== 'string'
        || state.game.title.trim().length === 0
        || !isIdentifier(state.game.namespace) || state.game.namespace === 'asterweave'
        || !isRecord(state.world) || Object.keys(state.world).length !== 1) {
        return false;
    }
    const namespace = state.game.namespace;
    const world = state.world.properties;
    if (!mapValid(world, namespace, ['id', 'name', 'lifecycle', 'turn'])
        || world['asterweave.id'] !== WORLD_ID || world['asterweave.name'] !== 'World'
        || world['asterweave.lifecycle'] !== 'active'
        || !Number.isSafeInteger(world['asterweave.turn']) || world['asterweave.turn'] < 0) {
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
            if (!mapValid(p, namespace, ['id', 'name', 'description', 'lifecycle', 'containment',
                'associations', 'isContainer', ...INTRINSIC_MEASUREMENTS, ...MEASUREMENT_LIMITS])
                || p['asterweave.id'] !== record.id || typeof p['asterweave.name'] !== 'string'
                || p['asterweave.name'].trim().length === 0
                || !LIFECYCLE_STATES.includes(p['asterweave.lifecycle'])
                || typeof p['asterweave.isContainer'] !== 'boolean'
                || !Array.isArray(p['asterweave.associations'])
                || !p['asterweave.associations'].every((edge) =>
                    edgeValid(edge, 'targetId', ASSOCIATION_RELATIONSHIPS))) {
                return false;
            }
            if (Object.hasOwn(p, 'asterweave.description')
                && typeof p['asterweave.description'] !== 'string') {
                return false;
            }
            if (Object.hasOwn(p, 'asterweave.containment')
                && !edgeValid(p['asterweave.containment'], 'parentId', CONTAINMENT_RELATIONSHIPS)) {
                return false;
            }
            for (const key of [...INTRINSIC_MEASUREMENTS, ...MEASUREMENT_LIMITS]) {
                const value = p['asterweave.' + key];
                if (value !== undefined && !isPhysicalMeasurementValue(key, value)) {
                    return false;
                }
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
            || !mapValid(player.properties, namespace, ['id', 'controlledActors', 'selectedActor'])
            || player.properties['asterweave.id'] !== player.id
            || !Array.isArray(player.properties['asterweave.controlledActors'])
            || !player.properties['asterweave.controlledActors'].every(isIdentifier)
            || (Object.hasOwn(player.properties, 'asterweave.selectedActor')
                && !isIdentifier(player.properties['asterweave.selectedActor']))) {
            return false;
        }
    }
    return state.relationships.every((record) => isRecord(record) && Object.keys(record).length === 3
        && validatePropertyAddress({ scope: 'relationship', from: record.from, to: record.to }) !== undefined
        && mapValid(record.properties, namespace, []) && Object.keys(record.properties).length > 0);
}
