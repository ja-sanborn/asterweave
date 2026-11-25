/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared synchronous authoritative action orchestration.
 * @module core/ActionDispatcher
 */

import { validateActionEnvelope } from '../actions/validateActionEnvelope.js';
import { validateActionArguments } from '../actions/validateActionArguments.js';
import { validateHandlerOutcome } from '../actions/validateHandlerOutcome.js';
import { resolveActionReferences } from '../state/resolveActionReferences.js';
import { ActionExecutionContext } from '../state/ActionExecutionContext.js';
import { ActionResult } from '../results/ActionResult.js';

/** Coordinates action execution without implementing gameplay rules. */
export class ActionDispatcher {
    /** @type {object} Stable runtime state. */
    #state;
    /** @type {object} Finalized action registry. */
    #registry;
    /** @type {symbol} Independent trusted submission capability. */
    #trustedAuthority;

    /**
     * Binds orchestration to one runtime and finalized registry.
     * @param {object} state - RuntimeState.
     * @param {object} registry - Finalized ActionRegistry.
     * @param {symbol} [authority] - Engine-established internal submission capability.
     */
    constructor(state, registry, authority = Symbol('trusted action submission')) {
        if (!registry.isFinalized || typeof authority !== 'symbol') {
            throw new TypeError('Invalid dispatcher construction.');
        }
        this.#state = state;
        this.#registry = registry;
        this.#trustedAuthority = authority;
        Object.freeze(this);
    }

    /**
     * Submits a player-controlled action.
     * @param {unknown} action - Submitted action.
     * @returns {ActionResult} Semantic result.
     */
    dispatchPlayerAction(action) {
        return this.#dispatch(action, false, undefined);
    }

    /**
     * Submits an independently authorized internal action.
     * @param {unknown} action - Submitted action.
     * @param {symbol} authority - Trusted capability.
     * @returns {ActionResult} Semantic result.
     */
    dispatchTrustedAction(action, authority) {
        return this.#dispatch(action, true, authority);
    }

    /**
     * Executes the common guarded action sequence.
     * @param {unknown} input - External or internal submitted data.
     * @param {boolean} trusted - Internal entry-point mode.
     * @param {symbol|undefined} authority - Internal submission capability.
     * @returns {ActionResult} Operation-specific result.
     */
    #dispatch(input, trusted, authority) {
        const lease = this.#state.acquireOperation();
        if (lease === undefined) {
            return ActionResult.rejected({ error: { code: 'ACTION_UNAVAILABLE' } });
        }
        const correlation = {};
        const reject = (code) => ActionResult.rejected({ ...correlation, error: { code } });
        const fail = () => ActionResult.error({ ...correlation, error: { code: 'EXECUTION_FAILED' } });
        let invocation;
        let publishing = false;
        try {
            if (!this.#state.isOperational) {
                return fail();
            }
            const action = validateActionEnvelope(input);
            if (action === undefined) {
                return reject('INVALID_ACTION');
            }
            if (Object.hasOwn(action, 'requestId')) {
                correlation.requestId = action.requestId;
            }
            if (this.#state.participantKind(action.actorId) !== 'actor') {
                return reject('ACTOR_NOT_FOUND');
            }
            if (this.#state.readWorldProperties(action.actorId)['asterweave.lifecycle'] !== 'active') {
                return reject('ACTION_UNAVAILABLE');
            }
            const authorized = trusted ? authority === this.#trustedAuthority
                : this.#state.player?.controls(action.actorId) === true;
            if (!authorized) {
                return reject('ACTION_FORBIDDEN');
            }
            correlation.actorId = action.actorId;
            const registration = this.#registry.resolve(action.type);
            if (registration === undefined) {
                return reject('UNKNOWN_ACTION_TYPE');
            }
            const { definition, handler, validator } = registration;
            if (!definition.enabled) {
                return reject('ACTION_UNAVAILABLE');
            }
            const validated = validateActionArguments(definition, action.args, validator);
            if (validated.status !== 'completed'
                || !resolveActionReferences(this.#state, definition, validated.args)) {
                return reject('INVALID_ARGUMENTS');
            }
            const transaction = this.#state.beginTransaction(lease);
            invocation = ActionExecutionContext.create(transaction, this.#registry.mutationGrants(action.type));
            let returned;
            try {
                returned = handler(Object.freeze({ ...action, args: validated.args }), invocation.context);
            } finally {
                invocation.expire();
            }
            const outcome = validateHandlerOutcome(returned);
            if (!transaction.isActive || invocation.violated()) {
                transaction.invalidate();
                return fail();
            }
            invocation.release();
            invocation = undefined;
            if (outcome.status === 'rejected') {
                return reject(outcome.error.code);
            }
            const cost = outcome.outcome === 'success' ? definition.turnCostSuccess : definition.turnCostFail;
            transaction.advanceTurns(cost);
            const prepared = transaction.prepare();
            const result = ActionResult.completed({ ...correlation, outcome: outcome.outcome,
                turnsAdvanced: cost, outputs: transaction.outputs });
            publishing = true;
            this.#state.commitTransaction(lease, transaction, prepared);
            publishing = false;
            return result;
        } catch (error) {
            if (publishing) {
                this.#state.markCompromised(lease);
            }
            return fail();
        } finally {
            invocation?.release();
            this.#state.releaseOperation(lease);
        }
    }
}
