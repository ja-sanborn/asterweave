/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared typed address index operations.
 * @module state/typedAddressIndex
 */

import { addressPath } from './propertyAddress.js';

/**
 * Resolves an indexed value, optionally creating it.
 * @param {Map} index - Private index.
 * @param {object} address - Validated address.
 * @param {Function} [create] - Internal leaf factory.
 * @returns {*|undefined} Indexed value.
 */
export function addressLeaf(index, address, create) {
    const path = addressPath(address);
    let branch = index;
    for (let position = 0; position < path.length; position++) {
        const key = path[position];
        if (!branch.has(key)) {
            if (create === undefined) {
                return undefined;
            }
            branch.set(key, position === path.length - 1 ? create() : new Map());
        }
        if (position === path.length - 1) {
            return branch.get(key);
        }
        branch = branch.get(key);
    }
    return undefined;
}

/**
 * Removes a leaf and prunes empty ancestors.
 * @param {Map} index - Private index.
 * @param {object} address - Validated address.
 */
export function deleteAddress(index, address) {
    const parents = [];
    let branch = index;
    for (const key of addressPath(address)) {
        if (!branch.has(key)) {
            return;
        }
        parents.push([branch, key]);
        branch = branch.get(key);
    }
    for (let position = parents.length - 1; position >= 0; position--) {
        const [parent, key] = parents[position];
        parent.delete(key);
        if (parent.size > 0) {
            break;
        }
    }
}

/**
 * Visits private index leaves in deterministic typed path order.
 * @param {Map} index - Private index.
 * @param {Function} visit - Internal visitor.
 */
export function visitAddressLeaves(index, visit) {
    const pending = [index];
    while (pending.length > 0) {
        const current = pending.pop();
        if (current instanceof Map) {
            for (const key of [...current.keys()].sort().reverse()) {
                pending.push(current.get(key));
            }
        } else {
            visit(current);
        }
    }
}
