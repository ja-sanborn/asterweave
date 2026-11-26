/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared effective participant indexing.
 * @module world/indexParticipants
 */

import { PARTICIPANT_CATEGORIES } from './worldVocabulary.js';

/**
 * Indexes structurally valid effective physical records in schema order.
 * @param {object} state - Effective state records.
 * @returns {Map} Temporary participant index.
 */
export function indexParticipants(state) {
    const participants = new Map();
    for (const { collection, kind } of PARTICIPANT_CATEGORIES) {
        for (const { id, properties } of state[collection]) {
            if (participants.has(id)) {
                throw new TypeError('Duplicate effective participant identity.');
            }
            participants.set(id, { kind, properties });
        }
    }
    return participants;
}
