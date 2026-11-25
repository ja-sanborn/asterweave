/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Administrative reset and bounded runtime recovery.
 * @module core/RuntimeResetter
 */

import { ResetResult } from '../results/ResetResult.js';

/** Reconstructs and publishes original initialized state independently of gameplay. */
export class RuntimeResetter {
    /** @type {object} Stable runtime state. */
    #state;
    /** @type {object} Retained finalized registry. */
    #registry;

    /**
     * Binds administrative orchestration to the runtime and registry.
     * @param {object} state - RuntimeState.
     * @param {object} registry - ActionRegistry.
     */
    constructor(state, registry) {
        this.#state = state;
        this.#registry = registry;
        Object.freeze(this);
    }

    /** @returns {ResetResult} Administrative operation result. */
    reset() {
        const lease = this.#state.acquireOperation();
        if (lease === undefined) {
            return ResetResult.rejected({ code: 'RESET_UNAVAILABLE' });
        }
        let verifyingRegistry = true;
        let publishing = false;
        try {
            if (!this.#registry.verifyIntegrity()) {
                throw new Error('Retained registry could not be verified.');
            }
            verifyingRegistry = false;
            this.#state.prepareReset(lease);
            const result = ResetResult.completed();
            publishing = true;
            this.#state.commitReset(lease);
            publishing = false;
            return result;
        } catch (error) {
            if (verifyingRegistry || publishing) {
                this.#state.markCompromised(lease);
            }
            return ResetResult.error({ code: 'RESET_FAILED' });
        } finally {
            this.#state.releaseOperation(lease);
        }
    }
}
