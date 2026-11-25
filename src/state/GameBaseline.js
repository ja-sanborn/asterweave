/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Immutable ownership of normalized authored baseline.
 * @module state/GameBaseline
 */

import { immutableCopy } from '../shared/immutableData.js';

/** Owns the immutable authored effective state of one validated game. */
export class GameBaseline {
    /** @type {object} Detached normalized authored state. */
    #data;
    /** @type {Map<string, object>} Index of immutable participant records. */
    #participants;

    /**
     * Isolates a validated candidate. The caller must complete validation first.
     * @param {object} candidate - Validated normalized definition candidate.
     * @throws {TypeError} If the candidate contains runtime players or invalid data.
     */
    constructor(candidate) {
        if (!Array.isArray(candidate.players) || candidate.players.length !== 0) {
            throw new TypeError('Authored baseline cannot contain runtime players.');
        }
        this.#data = immutableCopy(candidate);
        this.#participants = new Map();
        for (const collection of ['locations', 'actors', 'entities']) {
            for (const record of this.#data[collection]) {
                this.#participants.set(record.id, record);
            }
        }
        Object.freeze(this);
    }

    /** @returns {object} Immutable game metadata. */
    get game() {
        return this.#data.game;
    }

    /** @returns {object} Immutable World record. */
    get world() {
        return this.#data.world;
    }

    /** @returns {ReadonlyArray<object>} Immutable authored locations. */
    get locations() {
        return this.#data.locations;
    }

    /** @returns {ReadonlyArray<object>} Immutable authored actors. */
    get actors() {
        return this.#data.actors;
    }

    /** @returns {ReadonlyArray<object>} Immutable authored entities. */
    get entities() {
        return this.#data.entities;
    }

    /** @returns {ReadonlyArray<object>} Immutable authored relationship records. */
    get relationships() {
        return this.#data.relationships;
    }

    /**
     * Reads a participant baseline record by identity.
     * @param {string} id - Shared participant identity.
     * @returns {object|undefined} Immutable baseline record.
     */
    participant(id) {
        return this.#participants.get(id);
    }
}
