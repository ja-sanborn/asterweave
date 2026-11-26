/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Authored identity collection and uniqueness.
 * @module definition/validateIdentity
 */

import { DEFINITION_CODES as C, reportDefinition } from './definitionDiagnostics.js';
import { PARTICIPANT_CATEGORIES } from '../world/worldVocabulary.js';
import { WORLD_ID } from '../world/worldRelationships.js';

/**
 * Enumerates structurally validated participants in authored order.
 * @param {object} world - Detached canonical world.
 * @returns {Iterable<object>} Participant, category and source pointer records.
 */
export function* participants(world) {
    for (const { collection, kind } of PARTICIPANT_CATEGORIES) {
        for (const [index, participant] of world[collection].entries()) {
            yield {
                participant,
                kind,
                path: '/world/' + collection + '/' + index,
            };
        }
    }
}

/**
 * Collects stable identities and reports duplicates without resolving ambiguity.
 * @param {object} definition - Structurally validated definition.
 * @param {object} collector - Diagnostic collector.
 * @returns {{identities: Map, ambiguous: Set}} Reference lookup and ambiguous IDs.
 */
export function validateIdentity(definition, collector) {
    const identities = new Map([[WORLD_ID, { kind: 'world' }]]);
    const ambiguous = new Set();
    if (definition.game.namespace === 'asterweave') {
        reportDefinition(collector, C.INVALID_VALUE, '/game/namespace', 'Reserved engine namespace.');
    }
    for (const entry of participants(definition.world)) {
        const id = entry.participant.id;
        if (id === WORLD_ID) {
            reportDefinition(collector, C.INVALID_VALUE, entry.path + '/id', 'Reserved World identity.');
            continue;
        }
        if (identities.has(id)) {
            ambiguous.add(id);
            reportDefinition(collector, C.DUPLICATE_ID, entry.path + '/id', 'Duplicate participant identity.');
        } else {
            identities.set(id, entry);
        }
    }
    return { identities, ambiguous };
}
