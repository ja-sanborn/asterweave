/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview General authored physical participant identity.
 * @module world/Entity
 */

import { WorldObject } from './WorldObject.js';

/** General physical entity; capabilities are effective properties, not subclasses. */
export class Entity extends WorldObject {
    /**
     * Binds an entity to its effective state reader.
     * @param {string} id - Stable entity identity.
     * @param {Function} readProperties - Effective property reader.
     */
    constructor(id, readProperties) {
        super(id, readProperties);
        Object.freeze(this);
    }

    /** @returns {string} Participant category. */
    get kind() {
        return 'entity';
    }
}
