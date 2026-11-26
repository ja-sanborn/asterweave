/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Action-capable world participant identity.
 * @module world/Actor
 */

import { WorldObject } from './WorldObject.js';

/** Physical actor; player control is managed separately. */
export class Actor extends WorldObject {
    /**
     * Binds an actor to its effective state reader.
     * @param {string} id - Stable actor identity.
     * @param {Function} readProperties - Effective property reader.
     */
    constructor(id, readProperties) {
        super(id, readProperties);
        Object.freeze(this);
    }

    /** @returns {string} Participant category. */
    get kind() {
        return 'actor';
    }
}
