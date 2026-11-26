/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Engine-owned standard action metadata, independent of executable handlers.
 * @module actions/standardDefinitions
 */

import { STANDARD_DIRECTIONS } from '../world/navigationDirections.js';

/** @type {object} Immutable Foundation movement metadata, not a registration. */
export const MOVE_DEFINITION = Object.freeze({
    type: 'move',
    enabled: true,
    turnCostSuccess: 1,
    turnCostFail: 0,
    arguments: Object.freeze({
        direction: Object.freeze({
            type: 'string',
            required: true,
            allowedValues: STANDARD_DIRECTIONS,
        }),
    }),
});
