/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Closed initialization configuration and player control validation.
 * @module state/validatePlayerConfiguration
 */

import { isRecord, missingFields, unknownFields } from '../shared/recordShape.js';
import { WORLD_ID } from '../world/worldRelationships.js';
import { inspectJsonData } from '../shared/jsonData.js';
import { isIdentifier, isQualifiedKey } from '../shared/identifiers.js';
import { appendPointer } from '../diagnostics/jsonPointer.js';
import { DiagnosticCollector } from '../diagnostics/DiagnosticCollector.js';
import { isControllableActor, isSelectionValid } from './validateControlMembership.js';
import { validateGameProperties } from './validateProperties.js';

/** @type {Readonly<object>} Initialization configuration diagnostic codes. */
const C = Object.freeze({
    INVALID_DATA: 'INVALID_DATA',
    INVALID_TYPE: 'INVALID_TYPE',
    INVALID_VALUE: 'INVALID_VALUE',
    REQUIRED_FIELD: 'REQUIRED_FIELD',
    UNKNOWN_FIELD: 'UNKNOWN_FIELD',
    UNKNOWN_REFERENCE: 'UNKNOWN_REFERENCE',
    INVALID_REFERENCE_KIND: 'INVALID_REFERENCE_KIND',
});

/**
 * Validates optional configuration independently of authored prerequisites where possible.
 * @param {unknown} input - Optional initialization options.
 * @param {object|undefined} candidate - Validated effective definition candidate, if available.
 * @returns {{options: object|undefined, diagnostics: ReadonlyArray<object>}}
 *     Detached accepted configuration or ordered findings.
 */
export function validatePlayerConfiguration(input, candidate) {
    const collector = new DiagnosticCollector();
    const report = (code, path, message) => {
        collector.add({ source: 'options', code, severity: 'error', path, message });
    };
    const inspected = inspectJsonData(input === undefined ? {} : input);
    for (const issue of inspected.issues) {
        report(C.INVALID_DATA, issue.path, issue.message);
    }
    if (collector.size === 0) {
        const options = inspected.value;
        if (checkRecord(options, '', ['player'], [], report) && Object.hasOwn(options, 'player')) {
            checkPlayer(options.player, candidate, report);
        }
    }
    return {
        options: collector.size === 0 ? inspected.value : undefined,
        diagnostics: collector.snapshot(),
    };
}

/**
 * Checks a closed record and its required keys.
 * @param {*} value - Candidate record.
 * @param {string} path - Source pointer.
 * @param {Array<string>} allowed - Supported keys.
 * @param {Array<string>} required - Required keys in contract order.
 * @param {Function} report - Finding reporter.
 * @returns {boolean} Whether the record shape permits field inspection.
 */
function checkRecord(value, path, allowed, required, report) {
    if (!isRecord(value)) {
        report(C.INVALID_TYPE, path, 'Expected an object.');
        return false;
    }
    for (const key of missingFields(value, required)) {
        report(C.REQUIRED_FIELD, appendPointer(path, key), 'Required field is absent.');
    }
    for (const key of unknownFields(value, allowed)) {
        report(C.UNKNOWN_FIELD, appendPointer(path, key), 'Unsupported field.');
    }
    return true;
}

/**
 * Checks player identity, control, selection and authored property ownership.
 * @param {*} player - Candidate configuration.
 * @param {object|undefined} candidate - Valid effective definition, if available.
 * @param {Function} report - Finding reporter.
 */
function checkPlayer(player, candidate, report) {
    const fields = ['id', 'controlledActors', 'selectedActor', 'initialProperties'];
    if (!checkRecord(player, '/player', fields, ['id', 'controlledActors'], report)) {
        return;
    }
    if (Object.hasOwn(player, 'id')) {
        checkIdentifier(player.id, '/player/id', report);
    }
    let controlled;
    if (Object.hasOwn(player, 'controlledActors')) {
        controlled = checkControlledActors(player.controlledActors, candidate, report);
    }
    if (Object.hasOwn(player, 'selectedActor')
        && checkIdentifier(player.selectedActor, '/player/selectedActor', report)
        && controlled !== undefined && !isSelectionValid(controlled, player.selectedActor)) {
        report(C.INVALID_VALUE, '/player/selectedActor', 'Selected actor must be controlled.');
    }
    if (Object.hasOwn(player, 'initialProperties')) {
        const properties = player.initialProperties;
        if (!isRecord(properties)) {
            report(C.INVALID_TYPE, '/player/initialProperties', 'Expected a property map.');
        } else if (candidate !== undefined) {
            validateGameProperties(properties, candidate.game.namespace, (code, key, message) => {
                report(code, appendPointer('/player/initialProperties', key), message);
            });
        } else {
            // Grammar and the reserved namespace can be checked without a valid definition.
            for (const key of Object.keys(properties).sort()) {
                if (!isQualifiedKey(key) || key.startsWith('engine.')) {
                    report(C.INVALID_VALUE, appendPointer('/player/initialProperties', key),
                        'Invalid or reserved property key.');
                }
            }
        }
    }
}

/**
 * Checks an identity without coercion.
 * @param {*} value - Candidate ID.
 * @param {string} path - Source pointer.
 * @param {Function} report - Finding reporter.
 * @returns {boolean} Whether the identifier grammar is valid.
 */
function checkIdentifier(value, path, report) {
    if (typeof value !== 'string') {
        report(C.INVALID_TYPE, path, 'Expected a string.');
        return false;
    }
    if (!isIdentifier(value)) {
        report(C.INVALID_VALUE, path, 'Invalid identifier.');
        return false;
    }
    return true;
}

/**
 * Checks the ordered distinct control list and available actor references.
 * @param {*} value - Candidate control list.
 * @param {object|undefined} candidate - Valid definition candidate.
 * @param {Function} report - Finding reporter.
 * @returns {Set<string>|undefined} Valid list membership, if structurally valid.
 */
function checkControlledActors(value, candidate, report) {
    const path = '/player/controlledActors';
    if (!Array.isArray(value)) {
        report(C.INVALID_TYPE, path, 'Expected an array.');
        return undefined;
    }
    const controlled = new Set();
    const actors = candidate === undefined
        ? undefined : new Map(candidate.actors.map((actor) => [actor.id, actor]));
    const otherIds = candidate === undefined ? undefined : new Set([
        WORLD_ID,
        ...candidate.locations.map((record) => record.id),
        ...candidate.entities.map((record) => record.id),
    ]);
    let valid = true;
    for (const [index, id] of value.entries()) {
        const pointer = appendPointer(path, index);
        if (!checkIdentifier(id, pointer, report)) {
            valid = false;
            continue;
        }
        if (controlled.has(id)) {
            report(C.INVALID_VALUE, pointer, 'Duplicate controlled actor.');
            valid = false;
            continue;
        }
        controlled.add(id);
        if (actors !== undefined) {
            const actor = actors.get(id);
            if (actor === undefined) {
                report(otherIds.has(id) ? C.INVALID_REFERENCE_KIND : C.UNKNOWN_REFERENCE,
                    pointer, 'Controlled identity must refer to an actor.');
            } else if (!isControllableActor(actor.properties)) {
                report(C.INVALID_VALUE, pointer, 'Controlled actor must be active.');
            }
        }
    }
    return valid ? controlled : undefined;
}
