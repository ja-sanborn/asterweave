/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview On-demand effective property resolution.
 * @module state/EffectiveStateReader
 */

import { PARTICIPANT_CATEGORIES } from '../world/worldVocabulary.js';
import { WORLD_ID } from '../world/worldRelationships.js';
import { validatePropertyAddress } from './propertyAddress.js';
import { addressLeaf, visitAddressLeaves } from './typedAddressIndex.js';
import { resolvePropertySubject } from './resolvePropertySubject.js';
import { immutableCopy } from '../shared/immutableData.js';

/**
 * Reads an own property without conflating absence and null.
 * @param {object} properties - Immutable map.
 * @param {string} key - Property key.
 * @returns {object} Immutable presence entry.
 */
function entry(properties, key) {
    return Object.freeze(Object.hasOwn(properties, key)
        ? { present: true, value: properties[key] } : { present: false });
}

/** Resolves one committed or candidate view without caching effective state. */
export class EffectiveStateReader {
    /** @type {object} Immutable baseline. */
    #baseline;
    /** @type {object} View-owned differences. */
    #overrides;
    /** @type {object|undefined} Current player. */
    #player;
    /** @type {object|undefined} Original immutable player record. */
    #initialPlayer;

    /**
     * Binds one isolated view.
     * @param {object} baseline - GameBaseline.
     * @param {object} overrides - PropertyOverrideStore.
     * @param {object} [player] - Player.
     * @param {object} [initialPlayer] - Original player record.
     */
    constructor(baseline, overrides, player, initialPlayer = player?.record) {
        this.#baseline = baseline;
        this.#overrides = overrides;
        this.#player = player;
        this.#initialPlayer = initialPlayer;
        Object.freeze(this);
    }

    /** @returns {object} Immutable World identity record. */
    get world() {
        return this.#baseline.world;
    }

    /** @returns {ReadonlyArray<object>} Current player records. */
    get players() {
        return Object.freeze(this.#player === undefined ? [] : [this.#player.record]);
    }

    /**
     * Resolves participant category through the baseline index.
     * @param {string} id - Participant ID.
     * @returns {string|undefined} Category.
     */
    participantKind(id) {
        return this.#baseline.participantKind(id);
    }

    /**
     * Resolves participant identity through the baseline index.
     * @param {string} id - Participant ID.
     * @returns {object|undefined} Baseline record.
     */
    participant(id) {
        return this.#baseline.participant(id);
    }

    /**
     * Validates a typed subject before reading.
     * @param {object} input - Address.
     * @returns {object} Validated detached address.
     * @throws {TypeError} For invalid or unknown subjects.
     */
    #requireAddress(input) {
        const address = validatePropertyAddress(input);
        if (address === undefined || resolvePropertySubject(this, address) === undefined) {
            throw new TypeError('Invalid property subject.');
        }
        return address;
    }

    /**
     * Resolves original properties.
     * @param {object} address - Validated existing address.
     * @returns {object} Original properties.
     */
    #initialProperties(address) {
        if (address.scope === 'player') {
            return this.#initialPlayer?.properties ?? {};
        }
        if (address.scope === 'relationship') {
            return this.#baseline.relationship(address)?.properties ?? {};
        }
        return (address.scope === 'world' ? this.#baseline.world
            : this.#baseline.participant(address.id)).properties;
    }

    /**
     * Resolves effective value for a validated address.
     * @param {object} address - Subject.
     * @param {string} key - Property key.
     * @param {object} initial - Original properties.
     * @returns {object} Immutable presence entry.
     */
    #read(address, key, initial) {
        return address.scope === 'player' ? entry(this.#player.record.properties, key)
            : this.#overrides.getDifference(address, key) ?? entry(initial, key);
    }

    /**
     * Reads original property presence.
     * @param {object} input - Address.
     * @param {string} key - Property key.
     * @returns {object} Immutable presence entry.
     */
    getInitialProperty(input, key) {
        return entry(this.#initialProperties(this.#requireAddress(input)), key);
    }

    /**
     * Reads effective property presence.
     * @param {object} input - Address.
     * @param {string} key - Property key.
     * @returns {object} Immutable presence entry.
     */
    getProperty(input, key) {
        const address = this.#requireAddress(input);
        return this.#read(address, key, this.#initialProperties(address));
    }

    /**
     * Checks property presence.
     * @param {object} address - Subject.
     * @param {string} key - Property key.
     * @returns {boolean} Presence.
     */
    hasProperty(address, key) {
        return this.getProperty(address, key).present;
    }

    /**
     * Resolves complete effective properties in key order.
     * @param {object} input - Address.
     * @returns {object} Immutable map.
     */
    getProperties(input) {
        const address = this.#requireAddress(input);
        if (address.scope === 'player') {
            return this.#player.record.properties;
        }
        const initial = this.#initialProperties(address);
        const keys = new Set([...Object.keys(initial), ...this.#overrides.listKeys(address)]);
        const entries = [];
        for (const key of [...keys].sort()) {
            const result = this.#read(address, key, initial);
            if (result.present) {
                entries.push([key, result.value]);
            }
        }
        return Object.freeze(Object.fromEntries(entries));
    }

    /**
     * Reads world or participant properties by ID.
     * @param {string} id - World or physical participant ID.
     * @returns {object|undefined} Effective properties.
     */
    readWorldProperties(id) {
        if (id === WORLD_ID) {
            return this.getProperties({ scope: 'world' });
        }
        const scope = this.participantKind(id);
        return scope === undefined ? undefined : this.getProperties({ scope, id });
    }

    /**
     * Enumerates the union of original and dynamic directed pairs.
     * @returns {ReadonlyArray<object>} Immutable nonempty relationships.
     */
    listRelationships() {
        const index = new Map();
        for (const address of [
            ...this.#baseline.relationships.map(({ from, to }) => ({ scope: 'relationship', from, to })),
            ...this.#overrides.listAddresses('relationship'),
        ]) {
            addressLeaf(index, address, () => address);
        }
        const records = [];
        visitAddressLeaves(index, (address) => {
            const properties = this.getProperties(address);
            if (Object.keys(properties).length > 0) {
                records.push({ from: address.from, to: address.to, properties });
            }
        });
        return immutableCopy(records);
    }

    /**
     * Builds read-only effective records for validators and snapshots.
     * @returns {object} Effective view.
     */
    readEffectiveState() {
        return Object.freeze({
            game: this.#baseline.game,
            world: Object.freeze({ properties: this.getProperties({ scope: 'world' }) }),
            ...Object.fromEntries(PARTICIPANT_CATEGORIES.map(({ kind, collection }) => [
                collection, Object.freeze(this.#baseline[collection].map((record) => Object.freeze({
                    ...record, properties: this.getProperties({ scope: kind, id: record.id }),
                }))),
            ])),
            players: this.players,
            relationships: this.listRelationships(),
        });
    }
}
