/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Internal action execution, authority and rollback tests.
 * @module tests/core/ActionDispatcher
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameDefinitionValidator } from '../../src/definition/GameDefinitionValidator.js';
import { RuntimeState } from '../../src/state/RuntimeState.js';
import { ActionRegistry } from '../../src/actions/ActionRegistry.js';
import { ActionDispatcher } from '../../src/core/ActionDispatcher.js';

/**
 * Creates a trusted test-only runtime.
 * @param {Function} handler - Test handler.
 * @param {boolean} [grant] - Whether to grant ordinary mutation authority.
 * @returns {object} Test collaborators.
 */
function setup(handler, grant = true) {
    const definition = JSON.parse(readFileSync(new URL('../fixtures/games/state-foundation.json',
        import.meta.url), 'utf8'));
    const state = new RuntimeState(new GameDefinitionValidator().validate(definition).candidate,
        { player: { id: 'player', controlledActors: ['adventurer'] } });
    const { registry, gameOwner, grantOwner } = ActionRegistry.create();
    assert.equal(registry.register(gameOwner, { type: 'game.test', enabled: true,
        turnCostSuccess: 1, turnCostFail: 2, arguments: {} }, handler).status, 'completed');
    if (grant) {
        registry.establishMutationGrants(grantOwner, 'game.test',
            { namespaces: ['stateFoundation'], operations: [] });
    }
    registry.finalize();
    const dispatcher = new ActionDispatcher(state, registry);
    const action = { actorId: 'adventurer', type: 'game.test', args: {} };
    return { state, dispatcher, action };
}

test('completed failure commits intentional state, registered cost and ordered outputs', () => {
    const { state, dispatcher, action } = setup((submitted, context) => {
        context.setProperty({ scope: 'entity', id: 'brassLantern' }, 'stateFoundation.fuel', 70);
        context.emitOutput({ type: 'test.failure', audience: { scope: 'all' }, data: {} });
        return { status: 'completed', outcome: 'failure' };
    });
    const result = dispatcher.dispatchPlayerAction(action);
    assert.equal(result.status, 'completed');
    assert.equal(result.outcome, 'failure');
    assert.equal(result.turnsAdvanced, 2);
    assert.equal(state.turn, 2);
    assert.equal(state.world.resolve('brassLantern').getProperty('stateFoundation.fuel'), 70);
    assert.equal(result.outputs.length, 1);
});

test('rejection and caught unauthorized mutation preserve committed state', () => {
    for (const grant of [true, false]) {
        const { state, dispatcher, action } = setup((submitted, context) => {
            try {
                context.setProperty({ scope: 'entity', id: 'brassLantern' }, 'stateFoundation.fuel', 50);
            } catch (error) {
                return { status: 'completed', outcome: 'success' };
            }
            return { status: 'rejected', error: { code: 'ACTION_UNAVAILABLE' } };
        }, grant);
        const before = state.readEffectiveState();
        const result = dispatcher.dispatchPlayerAction(action);
        assert.equal(result.status, grant ? 'rejected' : 'error');
        assert.deepEqual(state.readEffectiveState(), before);
        assert.deepEqual(result.outputs, []);
        assert.equal(result.turnsAdvanced, 0);
    }
});

test('malformed outcomes and caught expired capability violations discard all staged changes', () => {
    for (const outcome of [
        () => ({ status: 'completed', outcome: 'success', extra: true }),
        () => ({ status: 'error', error: { code: 'EXECUTION_FAILED' } }),
        () => Promise.reject(new Error('private failure')),
        () => ({ then() { assert.fail('thenable must not be assimilated'); } }),
        (context) => new Proxy({ status: 'completed', outcome: 'success' }, {
            ownKeys(target) {
                assert.throws(() => context.getProperty({ scope: 'world' }, 'asterweave.turn'));
                return Reflect.ownKeys(target);
            },
        }),
    ]) {
        const { state, dispatcher, action } = setup((submitted, context) => {
            context.setProperty({ scope: 'entity', id: 'brassLantern' }, 'stateFoundation.fuel', 50);
            context.emitOutput({ type: 'test.output', audience: { scope: 'all' }, data: {} });
            return outcome(context);
        });
        const before = state.readEffectiveState();
        const result = dispatcher.dispatchPlayerAction(action);
        assert.equal(result.error?.code, 'EXECUTION_FAILED');
        assert.deepEqual(result.outputs, []);
        assert.equal(result.turnsAdvanced, 0);
        assert.deepEqual(state.readEffectiveState(), before);
        assert.equal(state.isOperational, true);
    }
});

test('late expired context cannot invalidate a later invocation', () => {
    let previous;
    const { state, dispatcher, action } = setup((submitted, context) => {
        if (previous !== undefined) {
            assert.throws(() => previous.getProperty({ scope: 'world' }, 'asterweave.turn'));
        }
        previous = context;
        return { status: 'completed', outcome: 'success' };
    });
    assert.equal(dispatcher.dispatchPlayerAction(action).status, 'completed');
    assert.equal(dispatcher.dispatchPlayerAction(action).status, 'completed');
    assert.equal(state.turn, 2);
});

test('caught malformed output invalidates even when handler reports success', () => {
    const { state, dispatcher, action } = setup((submitted, context) => {
        assert.throws(() => context.emitOutput({
            type: 'test.output', audience: { scope: 'actors', actorIds: ['adventurer', 'adventurer'] },
            data: {},
        }));
        return { status: 'completed', outcome: 'success' };
    });
    const before = state.readEffectiveState();
    assert.equal(dispatcher.dispatchPlayerAction(action).error.code, 'EXECUTION_FAILED');
    assert.deepEqual(state.readEffectiveState(), before);
});

test('duplicate valid outputs preserve emission order and detach payloads', () => {
    const { dispatcher, action } = setup((submitted, context) => {
        const data = { value: [1] };
        const output = { type: 'test.output', audience: { scope: 'actor', actorId: 'adventurer' }, data };
        context.emitOutput(output);
        context.emitOutput(output);
        data.value.push(2);
        context.emitOutput(output);
        return { status: 'completed', outcome: 'success' };
    });
    const result = dispatcher.dispatchPlayerAction(action);
    assert.equal(result.status, 'completed');
    assert.deepEqual(result.outputs.map(({ data }) => data.value), [[1], [1], [1, 2]]);
});
