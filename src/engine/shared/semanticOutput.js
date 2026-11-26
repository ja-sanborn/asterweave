/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared semantic output shape and audience validation.
 * @module shared/semanticOutput
 */

import { isRecord } from './recordShape.js';
import { isIdentifier } from './identifiers.js';

/**
 * Validates an inspected output and returns its explicit audience identities.
 * @param {object} output - Detached inspected output.
 * @returns {string[]} Explicit actor identities.
 * @throws {TypeError} On invalid shape.
 */
export function outputAudienceIds(output) {
    if (!isRecord(output) || Object.keys(output).length !== 3
        || typeof output.type !== 'string' || output.type.length === 0
        || !isRecord(output.data) || !isRecord(output.audience)) {
        throw new TypeError('Invalid semantic output.');
    }
    const audience = output.audience;
    const keys = Object.keys(audience);
    let ids;
    if (audience.scope === 'all' && keys.length === 1) {
        ids = [];
    } else if (audience.scope === 'actor' && keys.length === 2) {
        ids = [audience.actorId];
    } else if (audience.scope === 'actors' && keys.length === 2
        && Array.isArray(audience.actorIds) && audience.actorIds.length > 0) {
        ids = audience.actorIds;
    } else {
        throw new TypeError('Invalid output audience.');
    }
    if (new Set(ids).size !== ids.length || !ids.every(isIdentifier)) {
        throw new TypeError('Invalid output audience identity.');
    }
    return ids;
}
