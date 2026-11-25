/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Authorized world operation integration and rollback.
 * @module tests/core/worldOperations
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameDefinitionValidator } from '../../src/definition/GameDefinitionValidator.js';
import { RuntimeState } from '../../src/state/RuntimeState.js';
import { ActionRegistry } from '../../src/actions/ActionRegistry.js';
import { ActionDispatcher } from '../../src/core/ActionDispatcher.js';

/**
 * Creates independent trusted dispatch collaborators with explicit grants.
 * @param {Function} handler - Test handler.
 * @param {string[]} operations - Granted operations.
 * @returns {object} Test collaborators.
 */
function setup(handler, operations = ['relocate', 'establishAssociation', 'removeAssociation']) {
    const definition = JSON.parse(readFileSync(new URL('../fixtures/games/containment-foundation.json',
        import.meta.url), 'utf8'));
    const validation = new GameDefinitionValidator().validate(definition);
    const state = new RuntimeState(validation.candidate, {
        player: { id: 'human', controlledActors: ['player'] },
    });
    const { registry, gameOwner, grantOwner } = ActionRegistry.create();
    assert.equal(registry.register(gameOwner, { type: 'game.test', enabled: true,
        turnCostSuccess: 0, turnCostFail: 1, arguments: {} }, handler).status, 'completed');
    registry.establishMutationGrants(grantOwner, 'game.test', { namespaces: [], operations });
    registry.finalize();
    const dispatcher = new ActionDispatcher(state, registry, Symbol('trusted'));
    const action = { actorId: 'player', type: 'game.test', args: {} };
    return { state, run: () => dispatcher.dispatchPlayerAction(action) };
}

/** @returns {object} Completed test action outcome. */
function completed() { return { status: 'completed', outcome: 'success' }; }

test('authorized relocation preserves occupied subtree and stable identities', () => {
    const { state, run } = setup((action, context) => {
        assert.deepEqual(context.relocate('car', 'driveway', 'in'),
            { status: 'completed', changed: true });
        return completed();
    });
    const driver = state.world.resolve('driver');
    const car = state.world.resolve('car');
    assert.equal(run().status, 'completed');
    assert.equal(state.world.resolve('driver'), driver);
    assert.equal(state.world.resolve('car'), car);
    assert.equal(state.readWorldQueries().effectiveLocation('notebook'), 'driveway');
    assert.deepEqual(state.readWorldQueries().recursiveContents('car'),
        ['backpack', 'driver', 'notebook']);
    assert.deepEqual(state.player.properties['asterweave.controlledActors'], ['player']);
});

test('returning to baseline normalizes placement and same placement is a no-op', () => {
    const { state, run } = setup((action, context) => {
        assert.equal(context.relocate('money', 'player', 'carried').changed, true);
        assert.equal(context.relocate('money', 'safe', 'in').changed, true);
        assert.deepEqual(context.relocate('money', 'safe', 'in'),
            { status: 'completed', changed: false });
        return completed();
    });
    assert.equal(run().status, 'completed');
    assert.deepEqual(state.overrides, []);
});

test('relocation removes incoming and outgoing associations but preserves subtree frame', () => {
    const { state, run } = setup((action, context) => {
        assert.equal(context.establishAssociation('rug', 'hiddenKey', 'near').changed, true);
        assert.equal(context.relocate('bedroom', 'garage', 'in').changed, true);
        assert.equal(context.getProperty({ scope: 'entity', id: 'hiddenKey' },
            'asterweave.associations').value.length, 1);
        assert.equal(context.relocate('rug', 'garage', 'in').changed, true);
        assert.deepEqual(context.getProperty({ scope: 'entity', id: 'rug' },
            'asterweave.associations').value, []);
        return completed();
    });
    assert.equal(run().status, 'completed');
    assert.deepEqual(state.readWorldProperties('hiddenKey')['asterweave.associations'], []);
    assert.equal(state.readWorldQueries().parent('hiddenKey'), 'bedroom');
});

test('expected relocation rejections retain earlier successful changes without partial staging', () => {
    const { state, run } = setup((action, context) => {
        assert.equal(context.relocate('money', 'player', 'held').changed, true);
        for (const [id, target, relationship, reason] of [
            ['safe', 'player', 'carried', 'CAPACITY_EXCEEDED'],
            ['house', 'bedroom', 'in', 'CONTAINMENT_CYCLE'],
            ['money', 'table', 'in', 'INVALID_CONTAINMENT'],
            ['visitor', 'garage', 'in', 'INVALID_CONTAINMENT'],
            ['world', 'garage', 'in', 'INVALID_CONTAINMENT'],
        ]) {
            assert.deepEqual(context.relocate(id, target, relationship),
                { status: 'rejected', reason });
        }
        return completed();
    });
    assert.equal(run().status, 'completed');
    assert.equal(state.readWorldQueries().parent('money'), 'player');
    assert.equal(state.readWorldQueries().parent('safe'), 'bedroom');
    assert.equal(state.overrides.length, 1);
});

test('association operations are directed, idempotent and validate the shared frame', () => {
    const { state, run } = setup((action, context) => {
        assert.equal(context.establishAssociation('hiddenKey', 'rug', 'under').changed, false);
        assert.equal(context.establishAssociation('rug', 'hiddenKey', 'near').changed, true);
        assert.equal(context.removeAssociation('rug', 'hiddenKey', 'near').changed, true);
        assert.equal(context.removeAssociation('rug', 'hiddenKey', 'near').changed, false);
        for (const target of ['car', 'visitor', 'brokenBottle', 'world', 'rug']) {
            assert.equal(context.establishAssociation('rug', target, 'near').reason,
                'INVALID_ASSOCIATION');
        }
        return completed();
    });
    assert.equal(run().status, 'completed');
    assert.deepEqual(state.overrides, []);
});

test('relocation authority does not grant explicit association mutation', () => {
    const { state, run } = setup((action, context) => {
        context.relocate('rug', 'garage', 'in');
        assert.throws(() => context.removeAssociation('hiddenKey', 'rug', 'under'), TypeError);
        return completed();
    }, ['relocate']);
    const before = state.readEffectiveState();
    assert.equal(run().status, 'error');
    assert.deepEqual(state.readEffectiveState(), before);
});

test('relocation alone authorizes required automatic association cleanup', () => {
    const { state, run } = setup((action, context) => {
        context.relocate('rug', 'garage', 'in');
        return completed();
    }, ['relocate']);
    assert.equal(run().status, 'completed');
    assert.deepEqual(state.readWorldProperties('hiddenKey')['asterweave.associations'], []);
});

test('rejected actions discard relocation, association cleanup and outputs', () => {
    const { state, run } = setup((action, context) => {
        context.relocate('rug', 'garage', 'in');
        context.emitOutput({ type: 'test.moved', audience: { scope: 'all' }, data: {} });
        return { status: 'rejected', error: { code: 'ACTION_UNAVAILABLE' } };
    });
    const before = state.readEffectiveState();
    const result = run();
    assert.equal(result.status, 'rejected');
    assert.deepEqual(result.outputs, []);
    assert.deepEqual(state.readEffectiveState(), before);
});

test('malformed or unknown operation arguments invalidate even if caught', () => {
    for (const args of [['money', 'missing', 'in'], ['money', 'garage', 'bad']]) {
        const { state, run } = setup((action, context) => {
            context.relocate('money', 'player', 'held');
            assert.throws(() => context.relocate(...args), TypeError);
            return completed();
        });
        const before = state.readEffectiveState();
        assert.equal(run().status, 'error');
        assert.deepEqual(state.readEffectiveState(), before);
    }
});
