/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview World root and participant registry ownership.
 * @module world/World
 */

import { WorldObjectRegistry } from './WorldObjectRegistry.js';
import { Location } from './Location.js';
import { Actor } from './Actor.js';
import { Entity } from './Entity.js';
import { readEffectiveProperty } from './readEffectiveProperty.js';
import { WORLD_ID } from './worldRelationships.js';

/** Non-navigable World root, owning the physical participant identity registry. */
export class World {
    /** @type {WorldObjectRegistry} Private participant registry. */
    #registry;
    /** @type {Function} Effective World property reader. */
    #readProperties;

    /**
     * Creates internal world identities using explicit read-only state collaborators.
     * @param {object} identities - Collections of stable participant IDs.
     * @param {Function} readProperties - Effective property-map reader by world/participant ID.
     * @param {Function} readExits - Immutable authored exit reader by location ID.
     */
    constructor(identities, readProperties, readExits) {
        if (typeof readProperties !== 'function' || typeof readExits !== 'function') {
            throw new TypeError('Expected world state readers.');
        }
        this.#readProperties = readProperties;
        this.#registry = new WorldObjectRegistry([
            ...identities.locations.map((id) => new Location(id, readProperties, readExits)),
            ...identities.actors.map((id) => new Actor(id, readProperties)),
            ...identities.entities.map((id) => new Entity(id, readProperties)),
        ]);
        Object.freeze(this);
    }

    /** @returns {string} Implicit root identity. */
    get id() {
        return WORLD_ID;
    }

    /**
     * Reads an effective root property.
     * @param {string} key - Qualified property key.
     * @returns {*} Detached immutable value, or undefined for absence.
     */
    getProperty(key) {
        return readEffectiveProperty(this.#readProperties(WORLD_ID), key);
    }

    /**
     * Resolves World separately from participant identities.
     * @param {string} id - Root or participant identity.
     * @returns {object|undefined} Internal domain object or absence.
     */
    resolve(id) {
        return id === WORLD_ID ? this : this.#registry.get(id);
    }

    /**
     * Returns an ordered category view of registered participants.
     * @param {string} [kind] - Participant category.
     * @returns {ReadonlyArray<object>} Detached ordered collection.
     */
    participants(kind) {
        return this.#registry.list(kind);
    }
}
