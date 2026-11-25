/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Qualified game property ownership and directed identity invariants.
 * @module state/validateProperties
 */

import { addressLeaf } from './typedAddressIndex.js';
import { isQualifiedKey } from '../shared/identifiers.js';
import { PROPERTY_CODES as C } from './propertyDiagnostics.js';

/**
 * Checks authored game-owned keys without interpreting nested JSON values.
 * @param {object} properties - Safe property map.
 * @param {string} namespace - Game-owned namespace.
 * @param {Function} report - Callback (code, key, message).
 */
export function validateGameProperties(properties, namespace, report) {
    for (const key of Object.keys(properties).sort()) {
        if (!isQualifiedKey(key) || !key.startsWith(namespace + '.')
            || namespace === 'asterweave') {
            report(C.INVALID_VALUE, key, 'Property key must belong to the game namespace.');
        }
    }
}

/**
 * Checks directed relationship pair uniqueness.
 * @param {Array<object>} relationships - Effective relationship records.
 * @param {Function} report - Callback (code, index, message).
 */
export function validateRelationshipPairs(relationships, report) {
    const seen = new Map();
    for (const [index, { from, to }] of relationships.entries()) {
        const address = { scope: 'relationship', from, to };
        if (addressLeaf(seen, address) !== undefined) {
            report(C.INVALID_VALUE, index, 'Duplicate directed relationship pair.');
        }
        addressLeaf(seen, address, () => true);
    }
}
