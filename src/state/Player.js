/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Separate runtime player identity and complete player properties.
 * @module state/Player
 */

import { immutableCopy } from '../shared/immutableData.js';
import { isIdentifier } from '../shared/identifiers.js';

/** Nonphysical player, owning complete current player properties. */
export class Player {
    /** @type {object} Complete immutable initial player record. */
    #record;

    /**
     * Creates a player from already validated explicit configuration.
     * @param {object} configuration - Detached validated player options.
     * @throws {TypeError} If internal construction prerequisites are invalid.
     */
    constructor(configuration) {
        if (!isIdentifier(configuration.id) || !Array.isArray(configuration.controlledActors)) {
            throw new TypeError('Invalid player construction.');
        }
        const properties = {
            ...configuration.initialProperties,
            'asterweave.id': configuration.id,
            'asterweave.controlledActors': configuration.controlledActors,
        };
        if (Object.hasOwn(configuration, 'selectedActor')) {
            properties['asterweave.selectedActor'] = configuration.selectedActor;
        }
        this.#record = immutableCopy({ id: configuration.id, properties });
        Object.freeze(this);
    }

    /** @returns {string} Player identity in its separate scope. */
    get id() {
        return this.#record.id;
    }

    /** @returns {object} Immutable complete player record for internal state reads. */
    get record() {
        return this.#record;
    }

    /** @returns {ReadonlyArray<string>} Ordered controlled actor identities. */
    get controlledActors() {
        return this.#record.properties['asterweave.controlledActors'];
    }

    /** @returns {string|undefined} Explicit selection or absence. */
    get selectedActor() {
        return this.#record.properties['asterweave.selectedActor'];
    }

    /**
     * Checks whether an actor is controlled by this player.
     * @param {string} id - Actor identity.
     * @returns {boolean} Whether the identity is controlled.
     */
    controls(id) {
        return this.controlledActors.includes(id);
    }
}
