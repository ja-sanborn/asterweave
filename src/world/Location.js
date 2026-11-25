/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Navigable world participant and authored exits.
 * @module world/Location
 */

import { WorldObject } from './WorldObject.js';
import { immutableCopy } from '../shared/immutableData.js';

/** Location with immutable authored navigation data. */
export class Location extends WorldObject {
    /** @type {Function} Authored exit reader. */
    #readExits;

    /**
     * Binds a location to state and navigation readers.
     * @param {string} id - Stable location identity.
     * @param {Function} readProperties - Effective property reader.
     * @param {Function} readExits - Authored exit reader by ID.
     */
    constructor(id, readProperties, readExits) {
        super(id, readProperties);
        if (typeof readExits !== 'function') {
            throw new TypeError('Expected an authored exit reader.');
        }
        this.#readExits = readExits;
        Object.freeze(this);
    }

    /** @returns {string} Participant category. */
    get kind() {
        return 'location';
    }

    /**
     * Looks up an authored exit without performing movement.
     * @param {string} direction - Exact canonical direction.
     * @returns {object|undefined} Detached exit record, or absence.
     */
    getExit(direction) {
        const exit = this.#readExits(this.id).find((record) => record.direction === direction);
        return exit === undefined ? undefined : immutableCopy(exit);
    }
}
