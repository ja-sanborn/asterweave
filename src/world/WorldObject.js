/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Common world participant identity and effective property reads.
 * @module world/WorldObject
 */

import { readEffectiveProperty } from './readEffectiveProperty.js';
import { WORLD_ID } from './worldRelationships.js';
import { isIdentifier } from '../shared/identifiers.js';

/** Base of the physical participant categories; does not own gameplay state. */
export class WorldObject {
    /** @type {string} Stable identity. */
    #id;
    /** @type {Function} Effective property-map reader. */
    #readProperties;

    /**
     * Binds a participant to its authoritative state reader.
     * @param {string} id - Participant identity.
     * @param {Function} readProperties - Function from ID to effective property map.
     * @throws {TypeError} On invalid internal construction.
     */
    constructor(id, readProperties) {
        if (new.target === WorldObject || !isIdentifier(id) || id === WORLD_ID
            || typeof readProperties !== 'function') {
            throw new TypeError('Invalid world participant construction.');
        }
        this.#id = id;
        this.#readProperties = readProperties;
    }

    /** @returns {string} Stable participant identity. */
    get id() {
        return this.#id;
    }

    /** @returns {string} Current lifecycle state. */
    get lifecycle() {
        return this.getProperty('asterweave.lifecycle');
    }

    /** @returns {boolean} Whether the participant is active. */
    get isActive() {
        return this.lifecycle === 'active';
    }

    /** @returns {string} Current authored or effective name. */
    get name() {
        return this.getProperty('asterweave.name');
    }

    /**
     * Reads one effective value without exposing writable state.
     * @param {string} key - Qualified property key.
     * @returns {*} Detached immutable value, or undefined for absence.
     */
    getProperty(key) {
        return readEffectiveProperty(this.#readProperties(this.#id), key);
    }
}
