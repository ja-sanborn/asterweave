/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview End-to-end initialization and effective snapshot contract.
 * @module tests/engine/integration/initialization
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Asterweave } from '../../../src/engine/Asterweave.js';

/**
 * Loads an independent authored fixture.
 * @param {string} [name='state-foundation'] - Fixture name.
 * @returns {object} Parsed definition.
 */
function fixture(name = 'state-foundation') {
    return JSON.parse(readFileSync(new URL('../../fixtures/games/' + name + '.json', import.meta.url), 'utf8'));
}

/**
 * Initializes a game and asserts success.
 * @param {object} definition - Authored definition.
 * @param {object} [options] - Configuration.
 * @returns {Asterweave} Initialized game.
 */
function initialize(definition, options) {
    const result = Asterweave.initializeGame(definition, options);
    assert.ok(result.isCompleted, JSON.stringify(result.diagnostics));
    return result.game;
}

test('all current game fixtures initialize and expose metadata and exact snapshot root', () => {
    for (const name of ['minimal-foundation', 'containment-foundation', 'state-foundation']) {
        const definition = fixture(name);
        const game = initialize(definition);
        const snapshot = game.getStateSnapshot();
        assert.equal(game.gameId, definition.game.id);
        assert.equal(game.gameVersion, definition.game.version);
        assert.equal(game.turn, 0);
        assert.deepEqual(Object.keys(snapshot).sort(), [
            'actors', 'entities', 'game', 'locations', 'players', 'relationships', 'world',
        ]);
        assert.deepEqual(snapshot.game, { ...definition.game, formatVersion: '4.0.0' });
        assert.deepEqual(Object.keys(snapshot.world), ['properties']);
        assert.equal(snapshot.world.properties['engine.turn'], 0);
        assert.deepEqual(snapshot.players, []);
        for (const record of snapshot.locations) {
            assert.deepEqual(Object.keys(record).sort(), ['exits', 'id', 'properties']);
        }
        for (const record of [...snapshot.actors, ...snapshot.entities]) {
            assert.deepEqual(Object.keys(record).sort(), ['id', 'properties']);
            assert.equal(record.properties['engine.id'], record.id);
        }
        assert.deepEqual(JSON.parse(JSON.stringify(snapshot)), snapshot);
    }
});

test('snapshot preserves authored exits and omitted values without derived duplicates', () => {
    const definition = fixture();
    const snapshot = initialize(definition).getStateSnapshot();
    const lantern = snapshot.entities.find((record) => record.id === 'brassLantern');
    assert.equal(lantern.properties['engine.description'], undefined);
    assert.equal(Object.hasOwn(lantern.properties, 'engine.description'), false);
    assert.equal(lantern.properties['engine.isContainer'], false);
    assert.equal(snapshot.world.properties['engine.turn'], 0);
    assert.deepEqual(snapshot.locations.find((entry) => entry.id === 'entrance').exits,
        definition.world.locations[0].exits);
    assert.equal(Object.hasOwn(snapshot, 'overrides'), false);
    assert.equal(Object.hasOwn(lantern, 'location'), false);
    assert.equal(Object.hasOwn(snapshot.actors[0], 'inventory'), false);
});

test('all six scopes are present with player controls and empty relationships', () => {
    const definition = fixture();
    const game = initialize(definition, { player: {
        id: 'playerOne', controlledActors: ['guide', 'adventurer'], selectedActor: 'guide',
    } });
    const snapshot = game.getStateSnapshot();
    assert.deepEqual(snapshot.players, [{
        id: 'playerOne', properties: {
            'engine.id': 'playerOne',
            'engine.controlledActors': ['guide', 'adventurer'],
            'engine.selectedActor': 'guide',
        },
    }]);
    assert.deepEqual(snapshot.relationships, []);
    assert.equal(snapshot.entities.length, 3);
});

test('snapshot ordering is deterministic across participant input ordering', () => {
    const definition = fixture();

    const equivalent = structuredClone(definition);
    for (const collection of ['locations', 'actors', 'entities']) {
        equivalent.world[collection].reverse();
    }
    const first = initialize(definition).getStateSnapshot();
    const second = initialize(equivalent).getStateSnapshot();
    assert.deepEqual(first, second);
    assert.equal(JSON.stringify(first), JSON.stringify(second));
    assert.deepEqual(first.relationships, []);
    for (const collection of ['locations', 'actors', 'entities']) {
        const ids = first[collection].map((entry) => entry.id);
        assert.deepEqual(ids, [...ids].sort());
        for (const entry of first[collection]) {
            const keys = Object.keys(entry.properties);
            assert.deepEqual(keys, [...keys].sort());
        }
    }
});

test('snapshots and independently initialized games share no mutable caller or snapshot data', () => {
    const definition = fixture();
    const options = { player: { id: 'playerOne', controlledActors: ['guide'] } };
    const before = structuredClone(definition);
    const first = initialize(definition, options);
    const second = initialize(definition, options);
    assert.deepEqual(definition, before);
    const a = first.getStateSnapshot();
    const b = first.getStateSnapshot();
    assert.deepEqual(a, b);
    assert.deepEqual(a, second.getStateSnapshot());
    assert.notEqual(a, b);
    assert.notEqual(a.entities[1].properties, b.entities[1].properties);
    const pending = [a];
    while (pending.length !== 0) {
        const value = pending.pop();
        if (value !== null && typeof value === 'object') {
            assert.ok(Object.isFrozen(value));
            pending.push(...Object.values(value));
        }
    }
    definition.game.title = 'Changed';
    options.player.controlledActors.push('adventurer');
    assert.deepEqual(first.getStateSnapshot(), a);
    assert.deepEqual(second.getStateSnapshot(), a);
    assert.throws(() => {
        a.players[0].properties['engine.controlledActors'].push('adventurer');
    }, TypeError);
});

test('inactive and destroyed identities remain visible without containment', () => {
    const snapshot = initialize(fixture('containment-foundation')).getStateSnapshot();
    for (const [id, lifecycle] of [['visitor', 'inactive'], ['brokenBottle', 'destroyed']]) {
        const entry = snapshot.entities.find((record) => record.id === id);
        assert.equal(entry.properties['engine.lifecycle'], lifecycle);
        assert.equal(Object.hasOwn(entry.properties, 'engine.containment'), false);
        assert.deepEqual(entry.properties['engine.associations'], []);
    }
});

test('invalid domain invariants reject initialization with matching validation diagnostics', () => {
    const definition = fixture('containment-foundation');
    definition.world.locations[0].initialContainment.parentId = 'bedroom';
    const validation = Asterweave.validateGame(definition);
    const initialized = Asterweave.initializeGame(definition);
    assert.ok(validation.isRejected);
    assert.ok(initialized.isRejected);
    assert.deepEqual(initialized.diagnostics, validation.diagnostics);
    assert.equal(initialized.game, undefined);
});

test('explicit and default authored values produce equivalent effective state', () => {
    const definition = fixture('minimal-foundation');
    const equivalent = structuredClone(definition);
    for (const collection of ['locations', 'actors', 'entities']) {
        for (const entry of equivalent.world[collection]) {
            entry.initialLifecycle = 'active';
            entry.initialAssociations = [];
            entry.physical = { isContainer: collection === 'locations' };
        }
    }
    assert.deepEqual(initialize(definition).getStateSnapshot(),
        initialize(equivalent).getStateSnapshot());
});
