/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Effective read and candidate isolation tests.
 * @module tests/engine/state/EffectiveStateReader
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { GameBaseline } from '../../../src/engine/state/GameBaseline.js';
import { Player } from '../../../src/engine/state/Player.js';
import { PropertyOverrideStore } from '../../../src/engine/state/PropertyOverrideStore.js';
import { EffectiveStateReader } from '../../../src/engine/state/EffectiveStateReader.js';

test('effective reads distinguish null, removal and isolated candidate values', () => {
    const baseline = new GameBaseline({
        game: {}, world: { properties: { 'game.value': 1 } },
        locations: [], actors: [{ id: 'hero', properties: {} }], entities: [],
        players: [], relationships: [],
    });
    const player = new Player({ id: 'hero', controlledActors: ['hero'] });
    const store = new PropertyOverrideStore();
    const committed = new EffectiveStateReader(baseline, store, player);
    const candidateStore = store.clone();
    const candidate = new EffectiveStateReader(baseline, candidateStore, player);
    const world = { scope: 'world' };
    const actor = { scope: 'actor', id: 'hero' };
    const playerAddress = { scope: 'player', id: 'hero' };
    const pair = { scope: 'relationship', from: actor, to: playerAddress };
    candidateStore.remove(world, 'game.value', candidate.getInitialProperty(world, 'game.value'));
    candidateStore.set(pair, 'game.note', null, candidate.getInitialProperty(pair, 'game.note'));
    assert.deepEqual(committed.getProperty(world, 'game.value'), { present: true, value: 1 });
    assert.deepEqual(candidate.getProperty(world, 'game.value'), { present: false });
    assert.deepEqual(candidate.getProperty(pair, 'game.note'), { present: true, value: null });
    assert.deepEqual(candidate.getProperties(world), {});
    assert.deepEqual(committed.listRelationships(), []);
    assert.deepEqual(candidate.listRelationships(), [
        { from: actor, to: playerAddress, properties: { 'game.note': null } },
    ]);
    assert.throws(() => candidate.getProperty({ scope: 'entity', id: 'hero' }, 'game.note'), TypeError);
    assert.equal(candidate.readEffectiveState().players[0], player.record);
    candidateStore.reset(pair, 'game.note');
    assert.deepEqual(candidate.listRelationships(), []);
});

test('world query views follow isolated effective placement overrides', () => {
    const properties = (parentId) => ({
        'engine.lifecycle': 'active',
        'engine.isContainer': true,
        'engine.associations': [],
        'engine.containment': { parentId, relationship: 'in' },
    });
    const baseline = new GameBaseline({
        game: {}, world: { properties: {} },
        locations: ['roomA', 'roomB'].map((id) => ({ id, properties: properties('world'), exits: [] })),
        actors: [{ id: 'hero', properties: properties('roomA') }], entities: [],
        players: [], relationships: [],
    });
    const store = new PropertyOverrideStore();
    const committed = new EffectiveStateReader(baseline, store);
    const candidateStore = store.clone();
    const candidate = new EffectiveStateReader(baseline, candidateStore);
    const address = { scope: 'actor', id: 'hero' };
    const key = 'engine.containment';
    const before = candidate.readWorldQueries();
    candidateStore.set(address, key, { parentId: 'roomB', relationship: 'in' },
        candidate.getInitialProperty(address, key));
    assert.equal(candidate.readWorldQueries().effectiveLocation('hero'), 'roomB');
    assert.equal(committed.readWorldQueries().effectiveLocation('hero'), 'roomA');
    assert.equal(before.effectiveLocation('hero'), 'roomA');
    candidateStore.reset(address, key);
    assert.equal(candidate.readWorldQueries().effectiveLocation('hero'), 'roomA');
});
