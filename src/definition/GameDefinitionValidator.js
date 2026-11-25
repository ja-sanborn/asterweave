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
}
