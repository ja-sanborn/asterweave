/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview World-owned invariant diagnostic codes.
 * @module world/worldDiagnostics
 */

/** @type {Readonly<object>} World invariant codes. */
export const WORLD_CODES = Object.freeze({
    INVALID_CONTAINMENT: 'INVALID_CONTAINMENT',
    CONTAINMENT_CYCLE: 'CONTAINMENT_CYCLE',
    INVALID_LIFECYCLE: 'INVALID_LIFECYCLE',
    INVALID_ASSOCIATION: 'INVALID_ASSOCIATION',
    CAPACITY_EXCEEDED: 'CAPACITY_EXCEEDED',
    UNKNOWN_MEASUREMENT: 'UNKNOWN_MEASUREMENT',
});
