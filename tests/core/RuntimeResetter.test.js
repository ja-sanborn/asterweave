/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Administrative reset, retained registry and recovery tests.
 * @module tests/core/RuntimeResetter
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameDefinitionValidator } from '../../src/definition/GameDefinitionValidator.js';
import { RuntimeState } from '../../src/state/RuntimeState.js';
import { ActionRegistry } from '../../src/actions/ActionRegistry.js';
import { RuntimeResetter } from '../../src/core/RuntimeResetter.js';
import { ActionDispatcher } from '../../src/core/ActionDispatcher.js';

test('reset restores original state and preserves registry, snapshots and identity', () => {
    const definition = JSON.parse(readFileSync(new URL('../fixtures/games/state-foundation.json',
        import.meta.url), 'utf8'));
    const state = new RuntimeState(new GameDefinitionValidator().validate(definition).candidate,
        { player: { id: 'player', controlledActors: ['adventurer'], selectedActor: 'adventurer' } });
    const { registry, gameOwner, grantOwner } = ActionRegistry.create();
    const resetter = new RuntimeResetter(state, registry);
    registry.register(gameOwner, { type: 'game.test', enabled: true,
        turnCostSuccess: 1, turnCostFail: 0, arguments: {} }, (action, context) => {
        assert.equal(resetter.reset().error.code, 'RESET_UNAVAILABLE');
        context.setProperty({ scope: 'entity', id: 'brassLantern' }, 'stateFoundation.fuel', 10);
        context.revokeControl('player', 'adventurer');
        return { status: 'completed', outcome: 'success' };
    });
    registry.establishMutationGrants(grantOwner, 'game.test',
        { namespaces: ['stateFoundation'], operations: ['revokeControl'] });
    registry.finalize();
    const dispatcher = new ActionDispatcher(state, registry);
    const original = state.readEffectiveState();
    const identity = state.world.resolve('brassLantern');
    const result = dispatcher.dispatchPlayerAction({ actorId: 'adventurer', type: 'game.test', args: {} });
    assert.equal(result.status, 'completed');
    const changed = state.readEffectiveState();
    assert.equal(identity.getProperty('stateFoundation.fuel'), 10);
    assert.equal(state.player.selectedActor, undefined);
    assert.equal(resetter.reset().status, 'completed');
    assert.deepEqual(state.readEffectiveState(), original);
    assert.equal(state.world.resolve('brassLantern'), identity);
    assert.equal(identity.getProperty('stateFoundation.fuel'), 100);
    assert.equal(registry.size, 1);
    assert.equal(changed.world.properties['asterweave.turn'], 1);

    const lease = state.acquireOperation();
    state.markCompromised(lease);
    state.releaseOperation(lease);
    assert.throws(() => state.turn, /Runtime state is unavailable/);
    assert.throws(() => state.readEffectiveState(), /Runtime state is unavailable/);
    assert.equal(dispatcher.dispatchPlayerAction(null).error.code, 'EXECUTION_FAILED');
    assert.equal(resetter.reset().status, 'completed');
    assert.deepEqual(state.readEffectiveState(), original);
});
