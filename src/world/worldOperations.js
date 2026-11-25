/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Protected world operation vocabulary.
 * @module world/worldOperations
 */

/** @type {ReadonlyArray<string>} Relocation and association operations. */
export const PLACEMENT_OPERATIONS = Object.freeze([
    'relocate', 'establishAssociation', 'removeAssociation',
]);

/** @type {ReadonlyArray<string>} Lifecycle operations. */
export const LIFECYCLE_OPERATIONS = Object.freeze([
    'activate', 'deactivate', 'destroy', 'destroyRecursively',
]);

/** @type {ReadonlyArray<string>} Supported protected world operation grants. */
export const WORLD_OPERATIONS = Object.freeze([
    ...PLACEMENT_OPERATIONS, 'modifyPhysicalProperties', ...LIFECYCLE_OPERATIONS,
]);
