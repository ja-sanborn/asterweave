/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Isolated operation-local world property proposals.
 * @module world/WorldChangePlan
 */

import { indexParticipants } from './indexParticipants.js';
import { PARTICIPANT_CATEGORIES } from './worldVocabulary.js';
import { validateWorldState } from './validateWorldState.js';
import { areJsonValuesEqual } from '../shared/jsonEquality.js';
import { immutableCopy } from '../shared/immutableData.js';

/** Temporary world-domain proposal; never mutates the source effective view. */
export class WorldChangePlan {
    /** @type {object} Original effective records. */
    #state;
    /** @type {Map} Proposed participant property maps. */
    #participants;
    /** @type {Map} Changed keys per participant. */
    #changes = new Map();

    /** @param {object} state - Structurally valid effective records. */
    constructor(state) {
        this.#state = state;
        this.#participants = indexParticipants(state);
        validateWorldState(state, () => { throw new Error('Invalid starting world state.'); });
        Object.freeze(this);
    }

    /**
     * Resolves an effective participant for operation-local inspection.
     * @param {string} id - Participant identity.
     * @returns {object|undefined} Current proposed participant.
     */
    participant(id) { return this.#participants.get(id); }

    /** @returns {Map} Internal temporary participant index for domain helpers only. */
    get participants() { return this.#participants; }

    /**
     * Proposes one protected property value, or removal by undefined.
     * @param {string} id - Known participant identity.
     * @param {string} key - Engine-owned property key.
     * @param {*} value - Validated value or absence.
     */
    set(id, key, value) {
        const record = this.#participants.get(id);
        if (areJsonValuesEqual(record.properties[key], value)) {
            return;
        }
        const properties = { ...record.properties };
        if (value === undefined) {
            delete properties[key];
        } else {
            properties[key] = immutableCopy(value);
        }
        this.#participants.set(id, { kind: record.kind, properties });
        if (!this.#changes.has(id)) {
            this.#changes.set(id, new Set());
        }
        this.#changes.get(id).add(key);
    }

    /**
     * Validates the proposed world using shared domain rules.
     * @returns {string|undefined} First domain rejection code or absence.
     */
    validate() {
        const state = Object.fromEntries(PARTICIPANT_CATEGORIES.map(({ collection }) => [
            collection, this.#state[collection].map((record) => ({
                ...record, properties: this.#participants.get(record.id).properties,
            })),
        ]));
        let reason;
        validateWorldState(state, (code) => { reason ??= code; });
        return reason;
    }

    /**
     * Completes preflight with a semantic result and no writes on rejection.
     * @param {string} [reason] - Operation-specific rejection before invariant validation.
     * @returns {object} Internal result and write plan.
     */
    finish(reason) {
        const failure = reason ?? this.validate();
        if (failure !== undefined) {
            return Object.freeze({
                result: Object.freeze({ status: 'rejected', reason: failure }),
                changes: Object.freeze([]),
            });
        }
        const changes = this.changes();
        return Object.freeze({
            result: Object.freeze({ status: 'completed', changed: changes.length > 0 }),
            changes,
        });
    }

    /** @returns {ReadonlyArray<object>} Detached internal write plan. */
    changes() {
        const changes = [];
        for (const id of [...this.#changes.keys()].sort()) {
            const { kind, properties } = this.#participants.get(id);
            for (const key of [...this.#changes.get(id)].sort()) {
                const value = properties[key];
                changes.push({ address: { scope: kind, id }, key,
                    ...(value === undefined ? {} : { value }) });
            }
        }
        return immutableCopy(changes);
    }
}
