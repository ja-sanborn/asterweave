/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Safe closed action envelope validation.
 * @module actions/validateActionEnvelope
 */

import { inspectJsonData } from '../shared/jsonData.js';
import { freezeDetachedJsonData } from '../shared/immutableData.js';
import { isRecord } from '../shared/recordShape.js';
import { isStandardActionType } from './actionIdentifiers.js';

/**
 * Inspects and detaches action data before runtime resolution.
 * @param {unknown} input - Submitted action.
 * @returns {object|undefined} Immutable valid envelope or absence.
 */
export function validateActionEnvelope(input) {
    const { value, issues } = inspectJsonData(input);
    if (issues.length > 0 || !isRecord(value)
        || Object.keys(value).some((key) => !['type', 'actorId', 'args', 'requestId'].includes(key))
        || !['type', 'actorId', 'args'].every((key) => Object.hasOwn(value, key))
        || typeof value.actorId !== 'string' || value.actorId.length === 0
        || !isStandardActionType(value.type) || !isRecord(value.args)
        || (Object.hasOwn(value, 'requestId')
            && (typeof value.requestId !== 'string' || value.requestId.length === 0))) {
        return undefined;
    }
    return freezeDetachedJsonData(value);
}
