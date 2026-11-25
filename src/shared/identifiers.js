/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Exact canonical identifier and version grammar.
 * @module shared/identifiers
 */

/** @type {RegExp} Full ASCII segment grammar. */
const SEGMENT = /^[a-z][A-Za-z0-9]*(?![\s\S])/;
/** @type {RegExp} Full three-component decimal version grammar. */
const VERSION = /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?![\s\S])/;

/**
 * Checks the machine-name grammar, without coercion.
 * @param {unknown} value - Candidate segment.
 * @returns {boolean} Whether the entire segment is valid.
 */
export function isIdentifier(value) {
    return typeof value === 'string' && SEGMENT.test(value);
}

/**
 * Checks a dotted game identifier of at least two segments.
 * @param {unknown} value - Candidate game ID.
 * @returns {boolean} Whether the grammar is valid.
 */
export function isGameId(value) {
    if (typeof value !== 'string') {
        return false;
    }
    const parts = value.split('.');
    return parts.length >= 2 && parts.every(isIdentifier);
}

/**
 * Checks a qualified property name, independently of ownership.
 * @param {unknown} value - Candidate key.
 * @returns {boolean} Whether exactly two valid segments are present.
 */
export function isQualifiedKey(value) {
    if (typeof value !== 'string') {
        return false;
    }
    const parts = value.split('.');
    return parts.length === 2 && parts.every(isIdentifier);
}

/**
 * Checks version syntax without converting components to numbers.
 * @param {unknown} value - Candidate version.
 * @returns {boolean} Whether all three components are canonical.
 */
export function isVersion(value) {
    return typeof value === 'string' && VERSION.test(value);
}
