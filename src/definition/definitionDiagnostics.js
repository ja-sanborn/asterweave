/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Definition-owned diagnostic codes and reporting.
 * @module definition/definitionDiagnostics
 */

/** @type {Readonly<object>} Definition validation diagnostic codes. */
export const DEFINITION_CODES = Object.freeze({
    INVALID_DATA: 'INVALID_DATA',
    INVALID_TYPE: 'INVALID_TYPE',
    REQUIRED_FIELD: 'REQUIRED_FIELD',
    UNKNOWN_FIELD: 'UNKNOWN_FIELD',
    UNSUPPORTED_FORMAT_VERSION: 'UNSUPPORTED_FORMAT_VERSION',
    INVALID_VALUE: 'INVALID_VALUE',
    DUPLICATE_ID: 'DUPLICATE_ID',
    DUPLICATE_DIRECTION: 'DUPLICATE_DIRECTION',
    UNKNOWN_REFERENCE: 'UNKNOWN_REFERENCE',
    INVALID_REFERENCE_KIND: 'INVALID_REFERENCE_KIND',
});

/**
 * Records a safe definition finding.
 * @param {object} collector - Operation-local diagnostic collector.
 * @param {string} code - Domain code.
 * @param {string} path - Authored pointer.
 * @param {string} message - Safe explanation.
 * @returns {void}
 */
export function reportDefinition(collector, code, path, message) {
    collector.add({ source: 'definition', code, severity: 'error', path, message });
}
