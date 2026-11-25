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

import { isControllableActor } from './validateControlMembership.js';
import { immutableCopy } from '../shared/immutableData.js';
import { isQualifiedKey, isIdentifier } from '../shared/identifiers.js';

/** Nonphysical player, owning complete current player properties. */
export class Player {
    /** @type {object} Complete immutable current player record. */
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
    /**
     * Replaces the complete player record with detached immutable data.
     * @param {object} properties - Validated replacement properties.
     */
    #replace(properties) {
        this.#record = immutableCopy({ id: this.id, properties });
    }

    /**
     * Adds control of a known active actor.
     * @param {string} id - Actor ID.
     * @param {Function} resolveActor - Resolves current actor properties.
     * @returns {boolean} Whether the operation is permitted.
     */
    grantControl(id, resolveActor) {
        if (!isControllableActor(resolveActor(id))) {
            return false;
        }
        if (!this.controls(id)) {
            this.#replace({ ...this.#record.properties,
                'asterweave.controlledActors': [...this.controlledActors, id] });
        }
        return true;
    }

    /**
     * Revokes control and affected selection atomically.
     * @param {string} id - Actor ID.
     * @param {Function} resolveActor - Resolves known actor properties.
     * @returns {boolean} Whether the actor exists.
     */
    revokeControl(id, resolveActor) {
        if (resolveActor(id) === undefined) {
            return false;
        }
        if (this.controls(id)) {
            const properties = { ...this.#record.properties,
                'asterweave.controlledActors': this.controlledActors.filter((actor) => actor !== id) };
            if (this.selectedActor === id) {
                delete properties['asterweave.selectedActor'];
            }
            this.#replace(properties);
        }
        return true;
    }

    /**
     * Selects a known active controlled actor.
     * @param {string} id - Actor ID.
     * @param {Function} resolveActor - Resolves current actor properties.
     * @returns {boolean} Whether selection is permitted.
     */
    selectActor(id, resolveActor) {
        if (!this.controls(id) || !isControllableActor(resolveActor(id))) {
            return false;
        }
        if (this.selectedActor !== id) {
            this.#replace({ ...this.#record.properties, 'asterweave.selectedActor': id });
        }
        return true;
    }

    /** Clears selection without inferring a replacement. */
    clearSelection() {
        if (this.selectedActor !== undefined) {
            const properties = { ...this.#record.properties };
            delete properties['asterweave.selectedActor'];
            this.#replace(properties);
        }
    }

    /**
     * Checks that a key is an ordinary property; caller establishes namespace authority.
     * @param {string} key - Qualified key.
     * @throws {TypeError} For protected or invalid keys.
     */
    #requireOrdinary(key) {
        if (!isQualifiedKey(key) || key.startsWith('asterweave.')) {
            throw new TypeError('Invalid ordinary player property.');
        }
    }

    /**
     * Sets an ordinary property.
     * @param {string} key - Qualified key.
     * @param {*} value - JSON value.
     */
    setProperty(key, value) {
        this.#requireOrdinary(key);
        this.#replace({ ...this.#record.properties, [key]: value });
    }

    /**
     * Removes an ordinary property.
     * @param {string} key - Qualified key.
     */
    removeProperty(key) {
        this.#requireOrdinary(key);
        if (!Object.hasOwn(this.#record.properties, key)) {
            return;
        }
        const properties = { ...this.#record.properties };
        delete properties[key];
        this.#replace(properties);
    }

    /**
     * Restores the original property value or absence.
     * @param {string} key - Qualified key.
     * @param {object} initial - Original presence entry.
     */
    resetProperty(key, initial) {
        if (initial.present) {
            this.setProperty(key, initial.value);
        } else {
            this.removeProperty(key);
        }
    }

    /** @returns {Player} Independent candidate player. */
    clone() {
        const copy = new Player({ id: this.id, controlledActors: [] });
        copy.#record = this.#record;
        return copy;
    }
}
