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
                    ...world.initialProperties,
                    'asterweave.id': 'world',
                    'asterweave.name': 'World',
                    'asterweave.lifecycle': 'active',
                    'asterweave.turn': 0,
                },
            },
            locations: world.locations.map((record) => mapParticipant(record, 'location')),
            actors: world.actors.map((record) => mapParticipant(record, 'actor')),
            entities: world.entities.map((record) => mapParticipant(record, 'entity')),
            players: [],
            relationships: (world.initialRelationships ?? []).map((record) => ({
                from: record.from,
                to: record.to,
                properties: record.initialProperties,
            })),
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
        ...record.initialProperties,
        'asterweave.id': record.id,
        'asterweave.name': record.name,
        'asterweave.lifecycle': record.initialLifecycle ?? 'active',
        'asterweave.associations': record.initialAssociations ?? [],
        'asterweave.isContainer': record.physical?.isContainer ?? (kind === 'location'),
    };
    if (Object.hasOwn(record, 'description')) {
        properties['asterweave.description'] = record.description;
    }
    if (Object.hasOwn(record, 'initialContainment')) {
        properties['asterweave.containment'] = record.initialContainment;
    }
    for (const key of ['size', 'weight', 'maxItemSize', 'maxItemWeight', 'sizeCapacity', 'weightCapacity']) {
        if (record.physical !== undefined && Object.hasOwn(record.physical, key)) {
            properties['asterweave.' + key] = record.physical[key];
        }
    }
    return kind === 'location'
        ? { id: record.id, properties, exits: record.exits }
        : { id: record.id, properties };
}
