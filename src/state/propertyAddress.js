/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Closed property addresses and typed identity comparison.
 * @module state/propertyAddress
 */

import { isIdentifier } from '../shared/identifiers.js';
import { inspectJsonData } from '../shared/jsonData.js';
import { freezeDetachedJsonData } from '../shared/immutableData.js';
import { isRecord } from '../shared/recordShape.js';
import { PARTICIPANT_KINDS } from '../world/worldVocabulary.js';
import { WORLD_ID } from '../world/worldRelationships.js';

/**
 * Checks a previously inspected endpoint.
 * @param {*} value - Inspected data.
 * @returns {boolean} Whether the endpoint is valid.
 */
function isEndpoint(value) {
    if (!isRecord(value) || !Object.hasOwn(value, 'scope')) {
        return false;
    }
    if (value.scope === 'world') {
        return Object.keys(value).length === 1;
    }
    return Object.keys(value).length === 2 && Object.hasOwn(value, 'id')
        && isIdentifier(value.id) && (value.scope === 'player'
            || (PARTICIPANT_KINDS.includes(value.scope) && value.id !== WORLD_ID));
}

/**
 * Inspects and detaches a closed property address.
 * @param {unknown} input - Address data.
 * @returns {object|undefined} Immutable address or undefined on invalid input.
 */
export function validatePropertyAddress(input) {
    const { value, issues } = inspectJsonData(input);
    if (issues.length > 0 || !isRecord(value)) {
        return undefined;
    }
    if (value.scope === 'relationship') {
        if (Object.keys(value).length !== 3 || !Object.hasOwn(value, 'from')
            || !Object.hasOwn(value, 'to') || !isEndpoint(value.from) || !isEndpoint(value.to)) {
            return undefined;
        }
    } else if (!isEndpoint(value)) {
        return undefined;
    }
    return freezeDetachedJsonData(value);
}

/**
 * Compares validated typed endpoints.
 * @param {object} left - First endpoint.
 * @param {object} right - Second endpoint.
 * @returns {boolean} Identity equality.
 */
export function areEndpointsEqual(left, right) {
    return left.scope === right.scope && left.id === right.id;
}

/**
 * Compares validated addresses, retaining relationship direction.
 * @param {object} left - First address.
 * @param {object} right - Second address.
 * @returns {boolean} Identity equality.
 */
export function arePropertyAddressesEqual(left, right) {
    if (left.scope === 'relationship' && right.scope === 'relationship') {
        return areEndpointsEqual(left.from, right.from) && areEndpointsEqual(left.to, right.to);
    }
    return left.scope !== 'relationship' && right.scope !== 'relationship'
        && areEndpointsEqual(left, right);
}

/**
 * Returns index path components without encoding composite identities.
 * @param {object} address - Validated address.
 * @returns {string[]} Typed path components.
 */
export function addressPath(address) {
    if (address.scope === 'relationship') {
        return [address.scope, address.from.scope, address.from.id ?? '',
            address.to.scope, address.to.id ?? ''];
    }
    return [address.scope, address.id ?? ''];
}
