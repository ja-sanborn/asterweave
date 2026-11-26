/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Public facade and operation boundary contracts.
 * @module tests/engine/public/Asterweave
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as api from '../../../src/engine/Asterweave.js';
import { ActionRegistry } from '../../../src/engine/actions/ActionRegistry.js';

const { Asterweave } = api;

/** @returns {object} Fresh canonical definition. */
function fixture() {
    return JSON.parse(readFileSync(
        new URL('../../fixtures/games/minimal-foundation.json', import.meta.url), 'utf8',
    ));
}

test('public module exposes only the named facade and requires controlled construction', () => {
    assert.deepEqual(Object.keys(api), ['Asterweave']);
    assert.deepEqual(Reflect.ownKeys(Asterweave).sort(), [
        'initializeGame', 'length', 'name', 'prototype', 'validateGame',
    ]);
    assert.throws(() => new Asterweave(), TypeError);
    assert.throws(() => new Asterweave(Symbol(), {}), TypeError);
    const result = Asterweave.initializeGame(fixture());
    assert.ok(result.isCompleted);
    assert.ok(result.game instanceof Asterweave);
    assert.deepEqual(Object.getOwnPropertyNames(result.game), []);
    assert.deepEqual(Object.getOwnPropertyNames(Asterweave.prototype).sort(), [
        'constructor', 'dispatchAction', 'gameId', 'gameVersion', 'getStateSnapshot', 'reset', 'turn',
    ]);
    assert.throws(() => {
        result.game.turn = 1;
    }, TypeError);
});

test('validation completes without publishing a game and initialization always validates', () => {
    const definition = fixture();
    const valid = Asterweave.validateGame(definition);
    assert.ok(valid.isSuccess);
    assert.equal(valid.game, undefined);
    assert.deepEqual(valid.toJSON(), { status: 'completed', diagnostics: [] });
    delete definition.game.title;
    const rejected = Asterweave.initializeGame(definition);
    assert.ok(rejected.isRejected);
    assert.equal(rejected.game, undefined);
    assert.deepEqual(rejected.diagnostics, Asterweave.validateGame(definition).diagnostics);
});

test('malformed definitions are rejected rather than treated as execution failures', () => {
    for (const value of [null, undefined, 'json', 1, {}, [], { formatVersion: '3.1.0' }]) {
        const validation = Asterweave.validateGame(value);
        const initialization = Asterweave.initializeGame(value);
        assert.ok(validation.isRejected);
        assert.ok(initialization.isRejected);
        assert.equal(initialization.game, undefined);
        assert.equal(validation.error, undefined);
    }
});

test('aggregates independent options diagnostics after identical definition findings', () => {
    const definition = fixture();
    delete definition.game.title;
    const result = Asterweave.initializeGame(definition, {
        player: { id: 'Bad ID', controlledActors: ['missing'] },
        extra: true,
    });
    const findings = result.diagnostics;
    assert.ok(result.isRejected);
    assert.deepEqual(findings.filter((entry) => entry.source === 'definition'),
        Asterweave.validateGame(definition).diagnostics);
    assert.deepEqual(findings.map((entry) => entry.source), ['definition', 'options', 'options']);
    assert.equal(result.game, undefined);
    assert.ok(Object.isFrozen(findings));
});

test('unexpected reflective failures translate to safe operation errors without raw details', () => {
    for (const thrown of [new Error('private information'), 'secret', null]) {
        const input = new Proxy({}, {
            getPrototypeOf() {
                throw thrown;
            },
        });
        const validation = Asterweave.validateGame(input);
        const initialization = Asterweave.initializeGame(input);
        assert.ok(validation.isError);
        assert.ok(initialization.isError);
        assert.deepEqual(validation.toJSON(), {
            status: 'error', diagnostics: [], error: { code: 'VALIDATION_FAILED' },
        });
        assert.deepEqual(initialization.error, { code: 'INITIALIZATION_FAILED' });
        assert.equal(initialization.game, undefined);
        assert.deepEqual(initialization.diagnostics, []);
        assert.throws(() => JSON.stringify(initialization), TypeError);
    }
});

test('unsafe configuration reflection also fails closed', () => {
    const options = new Proxy({}, {
        ownKeys() {
            throw new Error('private options');
        },
    });
    const result = Asterweave.initializeGame(fixture(), options);
    assert.ok(result.isError);
    assert.equal(result.game, undefined);
    assert.deepEqual(result.error, { code: 'INITIALIZATION_FAILED' });
});

test('public validation never invokes ordinary getters', () => {
    const definition = fixture();
    let called = false;
    Object.defineProperty(definition.game, 'title', {
        enumerable: true,
        get() {
            called = true;
            return 'Unsafe';
        },
    });
    assert.ok(Asterweave.validateGame(definition).isRejected);
    assert.ok(Asterweave.initializeGame(definition).isRejected);
    assert.equal(called, false);
});

test('public dispatch enforces explicit actor control and retains empty production registry', () => {
    const action = { type: 'move', actorId: 'player', args: { direction: 'east' } };
    const noPlayer = Asterweave.initializeGame(fixture()).game;
    assert.equal(noPlayer.dispatchAction(action).error.code, 'ACTION_FORBIDDEN');
    const game = Asterweave.initializeGame(fixture(), {
        player: { id: 'playerOne', controlledActors: ['player'] },
    }).game;
    assert.equal(game.dispatchAction(action).error.code, 'UNKNOWN_ACTION_TYPE');
    assert.equal(game.dispatchAction(null).error.code, 'INVALID_ACTION');
    for (const type of ['game.ringBell', 'combat.attack', 'asterweave.move', 'teleport']) {
        assert.equal(game.dispatchAction({ ...action, type }).error.code, 'INVALID_ACTION');
        assert.equal(noPlayer.dispatchAction({ ...action, type }).error.code, 'INVALID_ACTION');
    }
    assert.equal(game.turn, 0);
    const before = game.getStateSnapshot();
    assert.deepEqual(game.reset().toJSON(), { status: 'completed' });
    assert.deepEqual(game.getStateSnapshot(), before);
    assert.ok(Object.isFrozen(game));
});

test('public facade blocks compromised reads and dispatch until validated reset recovers', (t) => {
    const definition = fixture();
    const game = Asterweave.initializeGame(definition, {
        player: { id: 'playerOne', controlledActors: ['player'] },
    }).game;
    const before = game.getStateSnapshot();
    const action = { type: 'move', actorId: 'player', args: { direction: 'east' } };
    const earlier = game.dispatchAction(action);

    // Inject a retained-registry verification failure using a native test mock.
    // No production access to private state or testing hook is required.
    const fault = t.mock.method(ActionRegistry.prototype, 'verifyIntegrity', () => {
        throw new Error('private registry failure');
    });
    try {
        assert.deepEqual(game.reset().toJSON(), {
            status: 'error', error: { code: 'RESET_FAILED' },
        });
        for (const read of [() => game.turn, () => game.getStateSnapshot()]) {
            assert.throws(read, { name: 'Error', message: 'Runtime state is unavailable.' });
        }
        assert.equal(game.gameId, definition.game.id);
        assert.equal(game.gameVersion, definition.game.version);
        let inspected = false;
        const input = new Proxy({}, {
            getPrototypeOf() { inspected = true; throw new Error('unexpected inspection'); },
        });
        assert.deepEqual(game.dispatchAction(input).toJSON(), {
            status: 'error', error: { code: 'EXECUTION_FAILED' },
            turnsAdvanced: 0, outputs: [],
        });
        assert.equal(inspected, false);
        assert.equal(game.reset().error.code, 'RESET_FAILED');
        assert.throws(() => game.getStateSnapshot(), { message: 'Runtime state is unavailable.' });
    } finally {
        fault.mock.restore();
    }

    assert.ok(game.reset().isCompleted);
    assert.equal(game.turn, 0);
    assert.deepEqual(game.getStateSnapshot(), before);
    assert.equal(game.dispatchAction(action).error.code, 'UNKNOWN_ACTION_TYPE');
    assert.equal(earlier.error.code, 'UNKNOWN_ACTION_TYPE');
    assert.equal(before.world.properties['engine.turn'], 0);
});

test('shared data amplification rejects safely at both public definition boundaries', () => {
    let graph = { value: 1 };
    for (let depth = 0; depth < 40; depth++) {
        graph = { left: graph, right: graph };
    }
    const definition = fixture();
    definition.extra = graph;
    const validation = Asterweave.validateGame(definition);
    const initialization = Asterweave.initializeGame(definition);
    assert.ok(validation.isRejected);
    assert.ok(initialization.isRejected);
    assert.equal(initialization.game, undefined);
    assert.deepEqual(initialization.diagnostics, validation.diagnostics);
    assert.equal(validation.diagnostics[0].code, 'INVALID_DATA');
    assert.match(validation.diagnostics[0].message, /Shared data expansion/);
});
