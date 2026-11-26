/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Detached reads of authoritative world property maps.
 * @module world/readEffectiveProperty
 */

import { immutableCopy } from '../shared/immutableData.js';

/**
 * Reads an own property from an authoritative effective map.
 * @param {object} properties - Engine-owned effective properties.
 * @param {string} key - Qualified property key.
 * @returns {*} Detached immutable value or undefined for absence.
 */
export function readEffectiveProperty(properties, key) {
    return Object.hasOwn(properties, key) ? immutableCopy(properties[key]) : undefined;
}
