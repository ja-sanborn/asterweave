/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Internal action execution, authority and rollback tests.
 * @module tests/engine/core/ActionDispatcher
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameDefinitionValidator } from '../../../src/engine/definition/GameDefinitionValidator.js';
import { RuntimeState } from '../../../src/engine/state/RuntimeState.js';
import { ActionRegistry } from '../../../src/engine/actions/ActionRegistry.js';
import { ActionDispatcher } from '../../../src/engine/core/ActionDispatcher.js';

/**
 * Creates a trusted test-only runtime.
 * @param {Function} handler - Test handler.
 * @param {boolean} [grant] - Whether to grant ordinary mutation authority.
 * @param {object} [settings] - Trusted test metadata and player configuration.
 * @returns {object} Test collaborators.
 */
function setup(handler, grant = true, settings = {}) {
    const definition = JSON.parse(readFileSync(new URL('../../fixtures/games/state-foundation.json',
        import.meta.url), 'utf8'));
    if (settings.inactiveGuide) {
        definition.world.actors[1].initialLifecycle = 'inactive';
        delete definition.world.actors[1].initialContainment;
    }
    const state = new RuntimeState(new GameDefinitionValidator().validate(definition).candidate,
        settings.options ?? { player: { id: 'player', controlledActors: ['adventurer'] } });
    const { registry, registrationAuthority, grantAuthority } = ActionRegistry.create();
    assert.equal(registry.register(registrationAuthority, { type: 'interact', enabled: true,
        turnCostSuccess: 1, turnCostFail: 2, arguments: {}, ...settings.metadata }, handler).status, 'completed');
    if (grant) {
        registry.establishMutationGrants(grantAuthority, 'interact',
            { namespaces: ['stateFoundation'], operations: [] });
    }
    registry.finalize();
    const authority = Symbol('test trusted authority');
    const dispatcher = new ActionDispatcher(state, registry, authority);
    const action = { actorId: 'adventurer', type: 'interact', args: {} };
    return { state, dispatcher, action, authority };
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
                assert.throws(() => context.getProperty({ scope: 'world' }, 'engine.turn'));
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
            assert.throws(() => previous.getProperty({ scope: 'world' }, 'engine.turn'));
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

test('trusted submission is independent of player presence and rejects incorrect authority', () => {
    let calls = 0;
    const { state, dispatcher, action, authority } = setup(() => {
        calls++;
        return { status: 'completed', outcome: 'success' };
    }, true, { options: {} });
    const before = state.readEffectiveState();
    assert.equal(dispatcher.dispatchPlayerAction(action).error.code, 'ACTION_FORBIDDEN');
    assert.equal(dispatcher.dispatchTrustedAction(action, Symbol('wrong')).error.code, 'ACTION_FORBIDDEN');
    assert.deepEqual(state.readEffectiveState(), before);
    assert.equal(calls, 0);
    assert.equal(dispatcher.dispatchTrustedAction(action, authority).status, 'completed');
    assert.equal(calls, 1);
});

test('earliest failed dispatch stage determines rejection and safe correlation', () => {
    const { state, dispatcher, action } = setup(() => assert.fail('handler must not run'), true,
        { inactiveGuide: true, metadata: { enabled: false } });
    const before = state.readEffectiveState();
    for (const [input, code, echo] of [
        [null, 'INVALID_ACTION', undefined],
        [{ ...action, actorId: 'missing', type: 'wait' }, 'ACTOR_NOT_FOUND', undefined],
        [{ ...action, actorId: 'guide', type: 'wait' }, 'ACTION_UNAVAILABLE', undefined],
        [{ ...action, type: 'wait' }, 'UNKNOWN_ACTION_TYPE', 'adventurer'],
        [{ ...action, args: { unexpected: true } }, 'ACTION_UNAVAILABLE', 'adventurer'],
    ]) {
        const result = dispatcher.dispatchPlayerAction(input);
        assert.equal(result.error.code, code);
        assert.equal(result.actorId, echo);
        assert.deepEqual(state.readEffectiveState(), before);
    }
});

test('declared runtime reference categories are checked before handler invocation', () => {
    let calls = 0;
    const { dispatcher, action } = setup(() => {
        calls++;
        return { status: 'completed', outcome: 'success' };
    }, true, { metadata: { arguments: {
        targetId: { type: 'string', required: true, referenceKind: 'entity' },
    } } });
    for (const targetId of ['missing', 'guide', 'world']) {
        assert.equal(dispatcher.dispatchPlayerAction({ ...action, args: { targetId } }).error.code,
            'INVALID_ARGUMENTS');
    }
    assert.equal(calls, 0);
    assert.equal(dispatcher.dispatchPlayerAction({ ...action, args: { targetId: 'brassLantern' } }).status,
        'completed');
    assert.equal(calls, 1);
});

test('zero cost commits changes and checked maximum turn overflow rolls back', () => {
    const handler = (submitted, context) => {
        const address = { scope: 'entity', id: 'brassLantern' };
        const fuel = context.getProperty(address, 'stateFoundation.fuel').value;
        context.setProperty(address, 'stateFoundation.fuel', fuel - 1);
        return { status: 'completed', outcome: 'success' };
    };
    for (const cost of [0, Number.MAX_SAFE_INTEGER]) {
        const { state, dispatcher, action } = setup(handler, true, { metadata: { turnCostSuccess: cost } });
        assert.equal(dispatcher.dispatchPlayerAction(action).turnsAdvanced, cost);
        assert.equal(state.turn, cost);
        assert.equal(state.world.resolve('brassLantern').getProperty('stateFoundation.fuel'), 99);
        const before = state.readEffectiveState();
        const next = dispatcher.dispatchPlayerAction(action);
        if (cost === 0) {
            assert.equal(next.status, 'completed');
            assert.equal(state.world.resolve('brassLantern').getProperty('stateFoundation.fuel'), 98);
        } else {
            assert.equal(next.error.code, 'EXECUTION_FAILED');
            assert.equal(next.turnsAdvanced, 0);
            assert.deepEqual(state.readEffectiveState(), before);
        }
    }
});

test('handler rejection preserves safe explicit details and malformed errors roll back', () => {
    for (const error of [
        { code: 'ACTION_UNAVAILABLE', details: { reason: 'blocked' } },
        { code: 'ACTION_UNAVAILABLE', stack: 'private' },
    ]) {
        const { state, dispatcher, action } = setup((submitted, context) => {
            context.setProperty({ scope: 'world' }, 'stateFoundation.powerRestored', true);
            return { status: 'rejected', error };
        });
        const before = state.readEffectiveState();
        const result = dispatcher.dispatchPlayerAction(action);
        assert.deepEqual(state.readEffectiveState(), before);
        assert.deepEqual(result.error, Object.hasOwn(error, 'details') ? error : { code: 'EXECUTION_FAILED' });
    }
});
