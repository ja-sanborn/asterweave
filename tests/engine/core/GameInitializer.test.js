/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Runtime initialization and private action registry ownership.
 * @module tests/engine/core/GameInitializer
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameInitializer } from '../../../src/engine/core/GameInitializer.js';
import { ActionRegistry } from '../../../src/engine/actions/ActionRegistry.js';
import { MOVE_DEFINITION } from '../../../src/engine/actions/standardDefinitions.js';
import { Asterweave } from '../../../src/engine/Asterweave.js';

/** @returns {object} Fresh canonical game definition. */
function fixture() {
    return JSON.parse(readFileSync(
        new URL('../../fixtures/games/minimal-foundation.json', import.meta.url), 'utf8',
    ));
}

test('initialization creates independent finalized empty action registries', () => {
    const initializer = new GameInitializer();
    const definition = fixture();
    const first = initializer.initialize(definition);
    const second = initializer.initialize(definition);
    assert.deepEqual(first.diagnostics, []);
    assert.deepEqual(second.diagnostics, []);
    assert.notEqual(first.state, second.state);
    assert.notEqual(first.registry, second.registry);
    for (const result of [first, second]) {
        assert.ok(result.registry instanceof ActionRegistry);
        assert.equal(result.registry.isFinalized, true);
        assert.equal(result.registry.size, 0);
        assert.equal(result.registry.resolve('move'), undefined);
        assert.deepEqual(result.registry.listDefinitions(), []);
        assert.equal(result.registry.claimNamespace, undefined);
        assert.equal(result.registry.verifyIntegrity(), true);
        assert.equal(result.registry.register(Symbol(), MOVE_DEFINITION, () => {}).diagnostics[0].code,
            'REGISTRY_FINALIZED');
    }
});

test('invalid definitions and options publish neither state nor registry', () => {
    const initializer = new GameInitializer();
    const invalid = fixture();
    delete invalid.game.title;
    for (const [definition, options] of [[invalid, undefined], [fixture(), { extra: true }]]) {
        const result = initializer.initialize(definition, options);
        assert.ok(result.diagnostics.length > 0);
        assert.equal(result.state, undefined);
        assert.equal(result.registry, undefined);
    }
});

test('public initialization keeps registry and authority out of the facade and snapshots', () => {
    const first = Asterweave.initializeGame(fixture());
    const second = Asterweave.initializeGame(fixture());
    assert.ok(first.isCompleted);
    assert.ok(second.isCompleted);
    assert.notEqual(first.game, second.game);
    assert.deepEqual(Reflect.ownKeys(first.game), []);
    for (const key of ['registry', 'actionRegistry', 'registrationAuthority', 'grantAuthority', 'register', 'resolve']) {
        assert.equal(key in first.game, false);
    }
    const snapshot = first.game.getStateSnapshot();
    assert.deepEqual(snapshot, second.game.getStateSnapshot());
    const serialized = JSON.stringify(snapshot);
    for (const name of ['registry', 'actionRegistry', 'registrationAuthority', 'grantAuthority']) {
        assert.equal(serialized.includes('"' + name + '"'), false);
    }
    assert.equal(first.game.turn, 0);
});

test('initialization does not accept registry or registration configuration from callers', () => {
    for (const options of [{ registry: {} }, { actions: [] }, { registrationAuthority: 'engine' }, { grantAuthority: 'engine' }]) {
        const result = Asterweave.initializeGame(fixture(), options);
        assert.ok(result.isRejected);
        assert.equal(result.game, undefined);
    }
});
