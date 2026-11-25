/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Transaction isolation and capability tests.
 * @module tests/state/StateTransaction
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameDefinitionValidator } from '../../src/definition/GameDefinitionValidator.js';
import { RuntimeState } from '../../src/state/RuntimeState.js';
import { ActionExecutionContext } from '../../src/state/ActionExecutionContext.js';

test('candidate reads and expired authority remain isolated', () => {
    const definition = JSON.parse(readFileSync(new URL('../fixtures/games/state-foundation.json',
        import.meta.url), 'utf8'));
    const state = new RuntimeState(new GameDefinitionValidator().validate(definition).candidate, {});
    const lease = state.acquireOperation();
    const transaction = state.beginTransaction(lease);
    const control = ActionExecutionContext.create(transaction,
        Object.freeze({ namespaces: ['stateFoundation'], operations: [] }));
    const address = { scope: 'entity', id: 'brassLantern' };
    control.context.setProperty(address, 'stateFoundation.fuel', 75);
    assert.equal(control.context.getProperty(address, 'stateFoundation.fuel').value, 75);
    assert.equal(state.readWorldProperties('brassLantern')['stateFoundation.fuel'], 100);
    control.expire();
    assert.throws(() => control.context.getProperty(address, 'stateFoundation.fuel'));
    assert.equal(control.violated(), true);
    control.release();
    state.releaseOperation(lease);
    assert.equal(state.readWorldProperties('brassLantern')['stateFoundation.fuel'], 100);
});

test('publication requires current lease, owned transaction and current preparation token', () => {
    const definition = JSON.parse(readFileSync(new URL('../fixtures/games/state-foundation.json',
        import.meta.url), 'utf8'));
    const state = new RuntimeState(new GameDefinitionValidator().validate(definition).candidate, {});
    const other = new RuntimeState(new GameDefinitionValidator().validate(definition).candidate, {});
    const lease = state.acquireOperation();
    const otherLease = other.acquireOperation();
    const transaction = state.beginTransaction(lease);
    const foreign = other.beginTransaction(otherLease);
    const stale = transaction.prepare();
    transaction.advanceTurns(1);
    assert.throws(() => state.commitTransaction(lease, transaction, stale));
    const prepared = transaction.prepare();
    assert.throws(() => state.commitTransaction(Symbol(), transaction, prepared));
    assert.throws(() => state.commitTransaction(lease, foreign, prepared));
    assert.equal(state.turn, 0);
    state.commitTransaction(lease, transaction, prepared);
    assert.equal(state.turn, 1);
    assert.throws(() => state.commitTransaction(lease, transaction, prepared));
    assert.throws(() => transaction.advanceTurns(1));
    state.releaseOperation(lease);
    other.releaseOperation(otherLease);
    assert.throws(() => foreign.prepare());
    assert.equal(other.turn, 0);
});

test('invalidated candidate cannot prepare or publish even when exception is caught', () => {
    const definition = JSON.parse(readFileSync(new URL('../fixtures/games/state-foundation.json',
        import.meta.url), 'utf8'));
    const state = new RuntimeState(new GameDefinitionValidator().validate(definition).candidate, {});
    const lease = state.acquireOperation();
    const transaction = state.beginTransaction(lease);
    assert.throws(() => transaction.stagePropertySet({ scope: 'world' }, 'asterweave.turn', 5));
    assert.equal(transaction.isInvalidated, true);
    assert.throws(() => transaction.prepare());
    state.releaseOperation(lease);
    assert.equal(state.turn, 0);
});
