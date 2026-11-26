/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Mapping canonical authored data to isolated effective candidate state.
 * @module definition/GameDefinitionMapper
 */

import { WORLD_ID } from '../world/worldRelationships.js';
import { PHYSICAL_MEASUREMENTS } from '../world/physicalMeasurements.js';
import { PARTICIPANT_CATEGORIES } from '../world/worldVocabulary.js';
import { copyJsonData } from '../shared/immutableData.js';

/** Maps validated authored prerequisites without repairing or publishing state. */
export class GameDefinitionMapper {
    /**
     * Builds a detached candidate with documented engine defaults.
     * @param {object} definition - Structurally and referentially valid definition.
     * @returns {object} Effective candidate; not committed runtime state.
     */
    map(definition) {
        const data = copyJsonData(definition);
        const { world, game, formatVersion } = data;
        return {
            game: { ...game, formatVersion },
            world: {
                properties: {
                    'engine.id': WORLD_ID,
                    'engine.name': 'World',
                    'engine.lifecycle': 'active',
                    'engine.turn': 0,
                },
            },
            ...Object.fromEntries(PARTICIPANT_CATEGORIES.map(({ kind, collection }) => [
                collection, world[collection].map((record) => mapParticipant(record, kind)),
            ])),
            players: [],
            relationships: [],
        };
    }
}

/**
 * Translates one authored participant into its effective properties.
 * @param {object} record - Detached authored participant.
 * @param {string} kind - Participant category.
 * @returns {object} Effective participant record.
 */
function mapParticipant(record, kind) {
    const properties = {
        'engine.id': record.id,
        'engine.name': record.name,
        'engine.lifecycle': record.initialLifecycle ?? 'active',
        'engine.associations': record.initialAssociations ?? [],
        'engine.isContainer': record.physical?.isContainer ?? (kind === 'location'),
    };
    if (Object.hasOwn(record, 'description')) {
        properties['engine.description'] = record.description;
    }
    if (Object.hasOwn(record, 'initialContainment')) {
        properties['engine.containment'] = record.initialContainment;
    }
    for (const key of PHYSICAL_MEASUREMENTS) {
        if (record.physical !== undefined && Object.hasOwn(record.physical, key)) {
            properties['engine.' + key] = record.physical[key];
        }
    }
    return kind === 'location'
        ? { id: record.id, properties, exits: record.exits }
        : { id: record.id, properties };
}
