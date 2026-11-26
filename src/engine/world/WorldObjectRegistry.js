/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Private shared participant identity index.
 * @module world/WorldObjectRegistry
 */

import { WorldObject } from './WorldObject.js';

/** Owns one world's stable identity index, independently of lifecycle and placement. */
export class WorldObjectRegistry {
    /** @type {Map<string, WorldObject>} Indexed participants. */
    #objects = new Map();

    /**
     * Establishes the registry from engine-created world objects.
     * @param {Iterable<WorldObject>} objects - Initial participants.
     * @throws {TypeError} If any object or identity is invalid or duplicated.
     */
    constructor(objects) {
        for (const object of objects) {
            if (!(object instanceof WorldObject) || this.#objects.has(object.id)) {
                throw new TypeError('Invalid or duplicate registry participant.');
            }
            this.#objects.set(object.id, object);
        }
        Object.freeze(this);
    }

    /**
     * Resolves an identity regardless of lifecycle.
     * @param {string} id - Stable participant identity.
     * @returns {WorldObject|undefined} Internal participant reference.
     */
    get(id) {
        return this.#objects.get(id);
    }

    /**
     * Enumerates participants by ascending ID, optionally filtered by category.
     * @param {string} [kind] - Participant category.
     * @returns {ReadonlyArray<WorldObject>} Detached ordered identity collection.
     */
    list(kind) {
        const ids = [...this.#objects.keys()].sort();
        return Object.freeze(ids.map((id) => this.#objects.get(id))
            .filter((object) => kind === undefined || object.kind === kind));
    }
}
