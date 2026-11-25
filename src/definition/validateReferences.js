/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Canonical reference and exit uniqueness validation.
 * @module definition/validateReferences
 */

import { participants } from './validateIdentity.js';
import { DEFINITION_CODES as C, reportDefinition } from './definitionDiagnostics.js';

/**
 * Resolves references against collected identities; skips ambiguous targets.
 * @param {object} definition - Structurally validated definition.
 * @param {{identities: Map, ambiguous: Set}} index - Identity collection.
 * @param {object} collector - Operation-local diagnostic collector.
 * @returns {void}
 */
export function validateReferences(definition, index, collector) {
    for (const { participant, kind, path } of participants(definition.world)) {
        if (participant.initialContainment !== undefined) {
            checkReference(participant.initialContainment.parentId, undefined,
                path + '/initialContainment/parentId', index, collector);
        }
        for (const [position, association] of (participant.initialAssociations ?? []).entries()) {
            checkReference(association.targetId, undefined,
                path + '/initialAssociations/' + position + '/targetId', index, collector);
        }
        if (kind === 'location') {
            const directions = new Set();
            for (const [position, exit] of participant.exits.entries()) {
                const exitPath = path + '/exits/' + position;
                if (directions.has(exit.direction)) {
                    reportDefinition(collector, C.DUPLICATE_DIRECTION, exitPath + '/direction',
                        'Duplicate direction at this location.');
                }
                directions.add(exit.direction);
                checkReference(exit.destinationId, 'location', exitPath + '/destinationId',
                    index, collector);
            }
        }
    }
    for (const [position, relationship] of (definition.world.initialRelationships ?? []).entries()) {
        for (const side of ['from', 'to']) {
            const endpoint = relationship[side];
            if (endpoint.scope !== 'world') {
                checkReference(endpoint.id, endpoint.scope,
                    '/world/initialRelationships/' + position + '/' + side + '/id', index, collector);
            }
        }
    }
}

/**
 * Reports a missing or wrong-category reference.
 * @param {string} id - Referenced participant.
 * @param {string|undefined} kind - Required category, if constrained.
 * @param {string} path - Reference pointer.
 * @param {object} index - Collected identity index.
 * @param {object} collector - Reporter.
 */
function checkReference(id, kind, path, index, collector) {
    if (index.ambiguous.has(id)) {
        return;
    }
    const target = index.identities.get(id);
    if (target === undefined) {
        reportDefinition(collector, C.UNKNOWN_REFERENCE, path, 'Referenced identity does not exist.');
    } else if (kind !== undefined && target.kind !== kind) {
        reportDefinition(collector, C.INVALID_REFERENCE_KIND, path, 'Referenced identity has wrong category.');
    }
}
