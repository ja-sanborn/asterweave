/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Foundation property scope identities.
 * @module state/propertyScopes
 */

/** @type {ReadonlyArray<string>} Supported property scopes. */
export const PROPERTY_SCOPES = Object.freeze([
    'world', 'location', 'entity', 'actor', 'player', 'relationship',
]);
