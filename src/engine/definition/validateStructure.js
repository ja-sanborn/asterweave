/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Canonical closed object shapes and scalar validation.
 * @module definition/validateStructure
 */

import { isRecord, unknownFields } from '../shared/recordShape.js';
import { INTRINSIC_MEASUREMENTS, MEASUREMENT_LIMITS } from '../world/physicalMeasurements.js';
import { PARTICIPANT_KINDS } from '../world/worldVocabulary.js';
import { appendPointer } from '../diagnostics/jsonPointer.js';
import { isGameId, isIdentifier, isVersion } from '../shared/identifiers.js';
import { isNonnegativeSafeInteger, isPositiveSafeInteger } from '../shared/safeArithmetic.js';
import { isStandardDirection } from '../world/navigationDirections.js';
import {
    ASSOCIATION_RELATIONSHIPS,
    CONTAINMENT_RELATIONSHIPS,
    LIFECYCLE_STATES,
} from '../world/worldRelationships.js';
import { DEFINITION_FORMAT } from './definitionFormat.js';
import { DEFINITION_CODES as C, reportDefinition } from './definitionDiagnostics.js';

/**
 * Validates canonical shape after successful data inspection.
 * @param {*} definition - Detached JSON-compatible data.
 * @param {object} collector - Operation-local collector.
 * @returns {boolean} Whether the structural stage succeeded.
 */
export function validateStructure(definition, collector) {
    const start = collector.size;
    const report = (code, path, message) => reportDefinition(collector, code, path, message);
    if (!isRecord(definition)) {
        report(C.INVALID_TYPE, '', 'Expected a definition object.');
        return false;
    }
    if (!Object.hasOwn(definition, 'formatVersion')) {
        report(C.REQUIRED_FIELD, '/formatVersion', 'Required field is absent.');
        return false;
    }
    const version = definition.formatVersion;
    if (typeof version !== 'string') {
        report(C.INVALID_TYPE, '/formatVersion', 'Expected a string.');
        return false;
    }
    if (!isVersion(version)) {
        report(C.INVALID_VALUE, '/formatVersion', 'Invalid version syntax.');
        return false;
    }
    if (version !== DEFINITION_FORMAT) {
        report(C.UNSUPPORTED_FORMAT_VERSION, '/formatVersion', 'Unsupported definition format.');
        return false;
    }
    record(definition, '', [
        ['formatVersion', string],
        ['game', game],
        ['world', world],
    ], report);
    return collector.size === start;
}

/**
 * Checks a closed object in declared field order.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Array} fields - Field, validator and optional flag tuples.
 * @param {Function} report - Reporter.
 * @returns {void}
 */
function record(value, path, fields, report) {
    if (!isRecord(value)) {
        report(C.INVALID_TYPE, path, 'Expected an object.');
        return;
    }
    const allowed = fields.map(([key]) => key);
    for (const [key, validate, optional] of fields) {
        const child = appendPointer(path, key);
        if (!Object.hasOwn(value, key)) {
            if (!optional) {
                report(C.REQUIRED_FIELD, child, 'Required field is absent.');
            }
        } else {
            validate(value[key], child, report);
        }
    }
    for (const key of unknownFields(value, allowed)) {
        report(C.UNKNOWN_FIELD, appendPointer(path, key), 'Unsupported field.');
    }
}

/**
 * Checks a string.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 * @returns {boolean} Whether the type is valid.
 */
function string(value, path, report) {
    if (typeof value !== 'string') {
        report(C.INVALID_TYPE, path, 'Expected a string.');
        return false;
    }
    return true;
}

/**
 * Checks a string with a domain predicate.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 * @param {Function} predicate - Scalar predicate.
 * @returns {void}
 */
function stringValue(value, path, report, predicate) {
    if (string(value, path, report) && !predicate(value)) {
        report(C.INVALID_VALUE, path, 'Invalid string value.');
    }
}

/**
 * Checks an identifier.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 */
function identifier(value, path, report) {
    stringValue(value, path, report, isIdentifier);
}

/**
 * Checks a required display string.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 */
function nonblank(value, path, report) {
    stringValue(value, path, report, (text) => text.trim().length > 0);
}

/**
 * Checks ordered array elements.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 * @param {Function} validate - Element validator.
 * @param {number} [minimum=0] - Minimum cardinality.
 */
function array(value, path, report, validate, minimum = 0) {
    if (!Array.isArray(value)) {
        report(C.INVALID_TYPE, path, 'Expected an array.');
        return;
    }
    if (value.length < minimum) {
        report(C.INVALID_VALUE, path, 'Insufficient array entries.');
    }
    value.forEach((entry, index) => validate(entry, appendPointer(path, index), report));
}

/**
 * Checks property-map shape; ownership is a later invariant.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 */
function propertyMap(value, path, report) {
    if (!isRecord(value)) {
        report(C.INVALID_TYPE, path, 'Expected a property map.');
    }
}

/**
 * Checks game metadata.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 */
function game(value, path, report) {
    record(value, path, [
        ['id', (entry, pointer, add) => stringValue(entry, pointer, add, isGameId)],
        ['namespace', identifier],
        ['version', (entry, pointer, add) => stringValue(entry, pointer, add, isVersion)],
        ['title', nonblank],
    ], report);
}

/**
 * Checks the authored world.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 */
function world(value, path, report) {
    record(value, path, [
        ['locations', (entry, pointer, add) => array(entry, pointer, add, location, 1)],
        ['actors', (entry, pointer, add) => array(entry, pointer, add, participant, 1)],
        ['entities', (entry, pointer, add) => array(entry, pointer, add, participant)],
        ['initialProperties', propertyMap, true],
        ['initialRelationships', (entry, pointer, add) => array(entry, pointer, add, relationship), true],
    ], report);
}

/** @returns {Array} Ordered common participant field descriptors. */
function participantFields() {
    return [
        ['id', identifier],
        ['name', nonblank],
        ['description', string, true],
        ['initialContainment', containment, true],
        ['initialLifecycle', (value, path, report) => stringValue(value, path, report,
            (state) => LIFECYCLE_STATES.includes(state)), true],
        ['initialAssociations', (value, path, report) => array(value, path, report, association), true],
        ['physical', physical, true],
        ['initialProperties', propertyMap, true],
    ];
}

/**
 * Checks an actor or entity.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 */
function participant(value, path, report) {
    record(value, path, participantFields(), report);
}

/**
 * Checks a location.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 */
function location(value, path, report) {
    record(value, path, [
        ...participantFields(),
        ['exits', (entry, pointer, add) => array(entry, pointer, add, exit)],
    ], report);
}

/**
 * Checks containment record shape.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 */
function containment(value, path, report) {
    record(value, path, [
        ['parentId', identifier],
        ['relationship', (entry, pointer, add) => stringValue(entry, pointer, add,
            (relation) => CONTAINMENT_RELATIONSHIPS.includes(relation))],
    ], report);
}

/**
 * Checks an association record.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 */
function association(value, path, report) {
    record(value, path, [
        ['targetId', identifier],
        ['relationship', (entry, pointer, add) => stringValue(entry, pointer, add,
            (relation) => ASSOCIATION_RELATIONSHIPS.includes(relation))],
    ], report);
}

/**
 * Checks an exit record.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 */
function exit(value, path, report) {
    record(value, path, [
        ['direction', (entry, pointer, add) => stringValue(entry, pointer, add, isStandardDirection)],
        ['destinationId', identifier],
    ], report);
}

/**
 * Checks a physical numeric field without coercion.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 * @param {Function} predicate - Range predicate.
 */
function measurement(value, path, report, predicate) {
    if (typeof value !== 'number') {
        report(C.INVALID_TYPE, path, 'Expected a number.');
    } else if (!predicate(value)) {
        report(C.INVALID_VALUE, path, 'Invalid physical measurement.');
    }
}

/**
 * Checks physical property shape and scalar ranges.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 */
function physical(value, path, report) {
    record(value, path, [
        ['isContainer', (entry, pointer, add) => {
            if (typeof entry !== 'boolean') {
                add(C.INVALID_TYPE, pointer, 'Expected a Boolean.');
            }
        }, true],
        ...INTRINSIC_MEASUREMENTS.map((key) => [
            key, (entry, pointer, add) => measurement(entry, pointer, add, isPositiveSafeInteger), true,
        ]),
        ...MEASUREMENT_LIMITS.map((key) => [
            key, (entry, pointer, add) => measurement(entry, pointer, add, isNonnegativeSafeInteger), true,
        ]),
    ], report);
}

/**
 * Checks a typed authored relationship endpoint.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 */
function endpoint(value, path, report) {
    const scope = isRecord(value) && Object.hasOwn(value, 'scope') ? value.scope : undefined;
    const participantScope = PARTICIPANT_KINDS.includes(scope);
    record(value, path, [
        ['scope', (entry, pointer, add) => stringValue(entry, pointer, add,
            (kind) => (kind === 'world' || PARTICIPANT_KINDS.includes(kind)))],
        ...(scope === 'world' ? [] : [['id', identifier, !participantScope]]),
    ], report);
}

/**
 * Checks a directed relationship property record.
 * @param {*} value - Candidate.
 * @param {string} path - Pointer.
 * @param {Function} report - Reporter.
 */
function relationship(value, path, report) {
    record(value, path, [
        ['from', endpoint],
        ['to', endpoint],
        ['initialProperties', (entry, pointer, add) => {
            propertyMap(entry, pointer, add);
            if (isRecord(entry) && Object.keys(entry).length === 0) {
                add(C.INVALID_VALUE, pointer, 'Relationship properties must not be empty.');
            }
        }],
    ], report);
}
