/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Stable action and administrative operation error codes.
 * @module shared/operationCodes
 */

/** @type {ReadonlyArray<string>} Established action rejection codes. */
export const ACTION_REJECTION_CODES = Object.freeze([
    'INVALID_ACTION', 'UNKNOWN_ACTION_TYPE', 'INVALID_ARGUMENTS',
    'ACTOR_NOT_FOUND', 'ACTION_UNAVAILABLE', 'ACTION_FORBIDDEN', 'EXIT_UNAVAILABLE',
]);
