/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Ordered canonical definition validation orchestration.
 * @module definition/GameDefinitionValidator
 */

import { validateEffectiveStructure } from '../state/validateEffectiveStructure.js';
import { GameDefinitionMapper } from './GameDefinitionMapper.js';
import { participants } from './validateIdentity.js';
import { WORLD_CODES } from '../world/worldDiagnostics.js';
import { validateWorldState } from '../world/validateWorldState.js';
import { inspectJsonData } from '../shared/jsonData.js';
import { DiagnosticCollector } from '../diagnostics/DiagnosticCollector.js';
import { validateStructure } from './validateStructure.js';
import { validateIdentity } from './validateIdentity.js';
import { validateReferences } from './validateReferences.js';
import { DEFINITION_CODES as C, reportDefinition } from './definitionDiagnostics.js';

/** Coordinates safe inspection and authored validation prerequisites. */
export class GameDefinitionValidator {
    /**
     * Validates authored prerequisites and isolates accepted definition data.
     * Effective candidate invariants are a subsequent pipeline stage.
     * @param {unknown} input - Parsed definition data.
     * @returns {{definition: object|undefined, diagnostics: ReadonlyArray<object>}}
     *     Detached definition only when prerequisites succeed.
     */
    validateAuthored(input) {
        const collector = new DiagnosticCollector();
        const inspected = inspectJsonData(input);
        for (const issue of inspected.issues) {
            reportDefinition(collector, C.INVALID_DATA, issue.path, issue.message);
        }
        if (collector.size === 0 && validateStructure(inspected.value, collector)) {
            const index = validateIdentity(inspected.value, collector);
            validateReferences(inspected.value, index, collector);
        }
        return {
            definition: collector.size === 0 ? inspected.value : undefined,
            diagnostics: collector.snapshot(),
        };
    }

    /**
     * Validates authored prerequisites and effective candidate invariants.
     * @param {unknown} input - Parsed canonical definition.
     * @returns {{candidate: object|undefined, diagnostics: ReadonlyArray<object>}}
     *     Isolated candidate only when all definition checks succeed.
     */
    validate(input) {
        const authored = this.validateAuthored(input);
        if (authored.definition === undefined) {
            return { candidate: undefined, diagnostics: authored.diagnostics };
        }
        const definition = authored.definition;
        const collector = new DiagnosticCollector();
        const candidate = new GameDefinitionMapper().map(definition);
        const sources = new Map();
        for (const { participant, path } of participants(definition.world)) {
            sources.set(participant.id, path);
            if (participant.initialLifecycle !== undefined && participant.initialLifecycle !== 'active'
                && Object.hasOwn(participant, 'initialAssociations')
                && participant.initialAssociations.length === 0) {
                reportDefinition(collector, WORLD_CODES.INVALID_LIFECYCLE, path + '/initialAssociations',
                    'Nonactive participant must omit initial associations.');
            }
        }
        const report = (code, id, property, message, index) => {
            const path = domainPointer(sources, id, property, index);
            reportDefinition(collector, code, path, message);
        };
        validateWorldState(candidate, report, true);

        // Authored findings retain their existing precedence. A structurally invalid
        // mapped candidate with no authored findings is an internal mapping defect.
        if (collector.size === 0 && !validateEffectiveStructure(candidate)) {
            throw new Error('Invalid normalized definition candidate.');
        }
        return {
            candidate: collector.size === 0 ? candidate : undefined,
            diagnostics: collector.snapshot(),
        };
    }
}

/**
 * Maps effective-domain findings back to authored source pointers.
 * @param {Map} sources - Participant ID to pointer correspondence.
 * @param {string|undefined} id - Participant identity.
 * @param {string} property - Effective property or required category.
 * @param {number|undefined} index - Optional association index.
 * @returns {string} Authored pointer.
 */
function domainPointer(sources, id, property, index) {
    if (id === undefined) {
        return '/world/' + property + 's';
    }
    const root = sources.get(id);
    if (property === 'containment') {
        return root + '/initialContainment';
    }
    if (property === 'associations') {
        return root + '/initialAssociations' + (index === undefined ? '' : '/' + index);
    }
    return root + '/physical/' + property;
}
