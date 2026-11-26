/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Encapsulated normalized property differences.
 * @module state/PropertyOverrideStore
 */

import { addressLeaf, deleteAddress, visitAddressLeaves } from './typedAddressIndex.js';
import { areJsonValuesEqual } from '../shared/jsonEquality.js';
import { immutableCopy } from '../shared/immutableData.js';

/** Owns normalized differences; callers validate addresses, authority and baseline entries first. */
export class PropertyOverrideStore {
    /** @type {Map} Private typed address index. */
    #index = new Map();

    /** Creates an independent empty store. */
    constructor() {
        Object.freeze(this);
    }

    /**
     * Resolves a subject leaf, optionally creating its private index path.
     * @param {object} address - Validated nonplayer property address.
     * @param {boolean} create - Whether to create missing branches.
     * @returns {object|undefined} Private subject leaf.
     */
    #leaf(address, create) {
        if (address.scope === 'player') {
            throw new TypeError('Player records are not authored overrides.');
        }
        return addressLeaf(this.#index, address, create
            ? () => ({ address: immutableCopy(address), values: new Map(), removed: new Set() })
            : undefined);
    }

    /**
     * Removes empty subject and ancestor branches.
     * @param {object} address - Validated nonplayer property address.
     */
    #prune(address) {
        const leaf = this.#leaf(address, false);
        if (leaf === undefined || leaf.values.size > 0 || leaf.removed.size > 0) {
            return;
        }
        deleteAddress(this.#index, address);
    }

    /**
     * Reads a normalized difference; undefined means inherit baseline.
     * @param {object} address - Validated subject.
     * @param {string} key - Validated qualified property key.
     * @returns {object|undefined} Immutable presence entry or no difference.
     */
    getDifference(address, key) {
        const leaf = this.#leaf(address, false);
        if (leaf?.removed.has(key)) {
            return Object.freeze({ present: false });
        }
        if (leaf?.values.has(key)) {
            return Object.freeze({ present: true, value: leaf.values.get(key) });
        }
        return undefined;
    }

    /**
     * Stores an immutable value unless structurally equal to baseline.
     * @param {object} address - Validated subject.
     * @param {string} key - Validated qualified key.
     * @param {*} value - Validated JSON value.
     * @param {object} baselineEntry - Original presence entry.
     */
    set(address, key, value, baselineEntry) {
        const detached = immutableCopy(value);
        if (baselineEntry.present && areJsonValuesEqual(detached, baselineEntry.value)) {
            this.reset(address, key);
            return;
        }
        const leaf = this.#leaf(address, true);
        leaf.values.set(key, detached);
        leaf.removed.delete(key);
    }

    /**
     * Removes a value, recording absence only when baseline contains the key.
     * @param {object} address - Validated subject.
     * @param {string} key - Validated qualified key.
     * @param {object} baselineEntry - Original presence entry.
     */
    remove(address, key, baselineEntry) {
        if (!baselineEntry.present) {
            this.reset(address, key);
            return;
        }
        const leaf = this.#leaf(address, true);
        leaf.values.delete(key);
        leaf.removed.add(key);
    }

    /**
     * Restores inheritance by deleting either difference.
     * @param {object} address - Validated subject.
     * @param {string} key - Validated qualified key.
     */
    reset(address, key) {
        const leaf = this.#leaf(address, false);
        if (leaf !== undefined) {
            leaf.values.delete(key);
            leaf.removed.delete(key);
            this.#prune(address);
        }
    }

    /**
     * Visits private leaves in typed code-unit path order.
     * @param {Function} visit - Internal leaf callback.
     */
    #visitLeaves(visit) {
        visitAddressLeaves(this.#index, visit);
    }

    /**
     * Clones collections without sharing mutable indexes or leaf containers.
     * @returns {PropertyOverrideStore} Independent candidate store.
     */
    clone() {
        const copy = new PropertyOverrideStore();
        this.#visitLeaves((leaf) => {
            const target = copy.#leaf(leaf.address, true);
            target.values = new Map(leaf.values);
            target.removed = new Set(leaf.removed);
        });
        return copy;
    }

    /**
     * Enumerates detached normalized records in typed identity order.
     * @returns {ReadonlyArray<object>} Immutable differences.
     */
    listOverrides() {
        const records = [];
        this.#visitLeaves(({ address, values, removed }) => {
            const record = { ...address };
            if (values.size > 0) {
                record.values = Object.fromEntries([...values.keys()].sort()
                    .map((key) => [key, values.get(key)]));
            }
            if (removed.size > 0) {
                record.removed = [...removed].sort();
            }
            records.push(record);
        });
        return immutableCopy(records);
    }
    /**
     * Enumerates changed keys for a validated subject.
     * @param {object} address - Subject.
     * @returns {string[]} Detached ordered keys.
     */
    listKeys(address) {
        const leaf = this.#leaf(address, false);
        return leaf === undefined ? [] : [...leaf.values.keys(), ...leaf.removed].sort();
    }

    /**
     * Enumerates immutable subject addresses by scope.
     * @param {string} scope - Subject scope.
     * @returns {ReadonlyArray<object>} Ordered addresses.
     */
    listAddresses(scope) {
        const addresses = [];
        this.#visitLeaves(({ address }) => {
            if (address.scope === scope) {
                addresses.push(address);
            }
        });
        return Object.freeze(addresses);
    }
}
