/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Semantic output validation and audience identity resolution.
 * @module state/validateSemanticOutput
 */

import { immutableCopy } from '../shared/immutableData.js';
import { outputAudienceIds } from '../shared/semanticOutput.js';
import { resolveEndpoint } from './resolvePropertySubject.js';

/**
 * Detaches a semantic output and validates its closed audience and actor identities.
 * @param {unknown} input - Handler-supplied output.
 * @param {object} view - Candidate identity view.
 * @returns {object} Immutable validated output.
 * @throws {TypeError} For invalid output.
 */
export function validateSemanticOutput(input, view) {
    const output = immutableCopy(input);
    validateDetachedSemanticOutput(output, view);
    return output;
}

/**
 * Rechecks an engine-owned, recursively immutable semantic output.
 * @param {object} output - Previously detached output.
 * @param {object} view - Candidate identity view.
 * @throws {TypeError} For invalid output or audience.
 */
export function validateDetachedSemanticOutput(output, view) {
    const ids = outputAudienceIds(output);
    if (ids.some((id) => resolveEndpoint(view, { scope: 'actor', id }) === undefined)) {
        throw new TypeError('Invalid output audience identity.');
    }
}
