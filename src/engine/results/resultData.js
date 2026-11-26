/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared validation and initialization result payload invariants.
 * @module results/resultData
 */

import { DiagnosticCollector } from '../diagnostics/DiagnosticCollector.js';

/**
 * Validates and isolates a result's diagnostic payload.
 * @param {string} status - Operation status.
 * @param {Array<object>} diagnostics - Internal diagnostic records.
 * @param {boolean} allowOptions - Whether configuration findings are allowed.
 * @returns {ReadonlyArray<object>} Detached immutable findings.
 * @throws {TypeError} On inconsistent or malformed internal payloads.
 */
export function prepareDiagnostics(status, diagnostics, allowOptions) {
    if (!Array.isArray(diagnostics)
        || (status === 'rejected' ? diagnostics.length === 0 : diagnostics.length !== 0)) {
        throw new TypeError('Invalid diagnostic payload for result status.');
    }
    const collector = new DiagnosticCollector();
    for (const diagnostic of diagnostics) {
        if (!allowOptions && diagnostic.source !== 'definition') {
            throw new TypeError('Standalone validation requires definition diagnostics.');
        }
        collector.add(diagnostic);
    }
    return collector.snapshot();
}
