/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Independent initial runtime ownership and authoritative effective reads.
 * @module state/RuntimeState
 */

import { GameBaseline } from './GameBaseline.js';
import { Player } from './Player.js';
import { WORLD_ID } from '../world/worldRelationships.js';
import { PARTICIPANT_CATEGORIES } from '../world/worldVocabulary.js';
import { World } from '../world/World.js';
import { immutableCopy } from '../shared/immutableData.js';

/** Owns one runtime's baseline, normalized differences and dynamic player state. */
export class RuntimeState {
    /** @type {GameBaseline} Immutable authored baseline. */
    #baseline;
    /** @type {ReadonlyArray<object>} Normalized initial overrides; empty at initialization. */
    #overrides = Object.freeze([]);
    /** @type {object} Detached original initialization configuration. */
    #initialOptions;
    /** @type {Player|undefined} Explicit runtime player. */
    #player;
    /** @type {World} World root and stable participant registry. */
    #world;

    /**
     * Constructs initial state only after definition and configuration validation.
     * @param {object} candidate - Fully validated authored candidate.
     * @param {object} options - Validated initialization configuration.
     */
    constructor(candidate, options) {
        this.#baseline = new GameBaseline(candidate);
        this.#initialOptions = immutableCopy(options);
        this.#player = Object.hasOwn(this.#initialOptions, 'player')
            ? new Player(this.#initialOptions.player) : undefined;
        const identities = Object.fromEntries(PARTICIPANT_CATEGORIES.map(({ collection }) => [
            collection, this.#baseline[collection].map((entry) => entry.id),
        ]));
        this.#world = new World(identities,
            (id) => this.readWorldProperties(id),
            (id) => this.#baseline.participant(id).exits);
        Object.freeze(this);
    }

    /** @returns {object} Immutable authored game metadata. */
    get game() {
        return this.#baseline.game;
    }

    /** @returns {World} Internal World domain root. */
    get world() {
        return this.#world;
    }

    /** @returns {Player|undefined} Internal player, if configured. */
    get player() {
        return this.#player;
    }

    /** @returns {number} Authoritative World turn property. */
    get turn() {
        return this.readWorldProperties(WORLD_ID)['asterweave.turn'];
    }

    /** @returns {object} Detached immutable original initialization configuration. */
    get initialOptions() {
        return immutableCopy(this.#initialOptions);
    }

    /** @returns {ReadonlyArray<object>} Initial normalized differences. */
    get overrides() {
        return this.#overrides;
    }

    /**
     * Reads authoritative effective world/participant properties.
     * Initialization has no overrides; later transaction work extends this read.
     * @param {string} id - World or participant identity.
     * @returns {object|undefined} Immutable effective property map.
     */
    readWorldProperties(id) {
        return id === WORLD_ID
            ? this.#baseline.world.properties : this.#baseline.participant(id)?.properties;
    }

    /**
     * Provides an internal read-only effective record view for snapshot construction.
     * @returns {object} Effective state records; not a public detached snapshot.
     */
    readEffectiveState() {
        return Object.freeze({
            game: this.#baseline.game,
            world: this.#baseline.world,
            locations: this.#baseline.locations,
            actors: this.#baseline.actors,
            entities: this.#baseline.entities,
            players: Object.freeze(this.#player === undefined ? [] : [this.#player.record]),
            relationships: this.#baseline.relationships,
        });
    }
}
