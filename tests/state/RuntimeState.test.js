/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Independent runtime initialization and authoritative state tests.
 * @module tests/state/RuntimeState
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameDefinitionValidator } from '../../src/definition/GameDefinitionValidator.js';
import { validatePlayerConfiguration } from '../../src/state/validatePlayerConfiguration.js';
import { RuntimeState } from '../../src/state/RuntimeState.js';
import { WorldObject } from '../../src/world/WorldObject.js';

/** @returns {object} Fresh canonical definition. */
function fixture() {
    return JSON.parse(readFileSync(
        new URL('../fixtures/games/state-foundation.json', import.meta.url), 'utf8',
    ));
}

/**
 * Creates initial state through validated internal prerequisites.
 * @param {object} [options] - Initialization options.
 * @returns {RuntimeState} Independent initialized state.
 */
function initialize(options) {
    const candidate = new GameDefinitionValidator().validate(fixture()).candidate;
    const configuration = validatePlayerConfiguration(options, candidate).options;
    return new RuntimeState(candidate, configuration);
}

test('initial runtime has zero turn, empty differences and no implicit player', () => {
    const state = initialize();
    assert.equal(state.turn, 0);
    assert.equal(state.world.getProperty('asterweave.turn'), state.turn);
    assert.equal(state.player, undefined);
    assert.deepEqual(state.overrides, []);
    assert.ok(Object.isFrozen(state.overrides));
    assert.deepEqual(state.readEffectiveState().players, []);
    assert.deepEqual(state.initialOptions, {});
});

test('player is separate from physical participants and stores complete properties', () => {
    const state = initialize({ player: {
        id: 'guide', controlledActors: ['guide', 'adventurer'], selectedActor: 'guide',
        initialProperties: { 'stateFoundation.note': null },
    } });
    assert.ok(Object.isFrozen(state.player));
    assert.equal(state.player.grantControl, undefined);
    assert.equal(state.player.setProperty, undefined);
    assert.equal(state.player instanceof WorldObject, false);
    assert.notEqual(state.player, state.world.resolve('guide'));
    assert.equal(state.player.id, 'guide');
    assert.equal(state.controllingPlayerId('adventurer'), 'guide');
    assert.equal(state.controllingPlayerId('missing'), undefined);
    assert.equal(state.player.properties['asterweave.selectedActor'], 'guide');
    assert.deepEqual(state.player.properties, {
        'asterweave.id': 'guide',
        'asterweave.controlledActors': ['guide', 'adventurer'],
        'asterweave.selectedActor': 'guide',
        'stateFoundation.note': null,
    });
    assert.deepEqual(state.overrides, []);
    assert.equal(state.readEffectiveState().players[0], state.player);
});

test('selection remains absent even with one controlled actor', () => {
    const state = initialize({ player: { id: 'playerOne', controlledActors: ['guide'] } });
    assert.equal(state.player.properties['asterweave.selectedActor'], undefined);
    assert.equal(Object.hasOwn(state.player.properties, 'asterweave.selectedActor'), false);
});

test('runtime isolates original configuration and current player state', () => {
    const options = { player: { id: 'playerOne', controlledActors: ['guide'],
        initialProperties: { 'stateFoundation.notes': ['one'] } } };
    const state = initialize(options);
    options.player.controlledActors.push('adventurer');
    options.player.initialProperties['stateFoundation.notes'].push('two');
    assert.deepEqual(state.player.properties['asterweave.controlledActors'], ['guide']);
    assert.deepEqual(state.initialOptions.player.initialProperties['stateFoundation.notes'], ['one']);
    assert.ok(Object.isFrozen(state.player.properties));
    assert.ok(Object.isFrozen(state.initialOptions.player.controlledActors));
    assert.notEqual(state.initialOptions, state.initialOptions);
    assert.throws(() => {
        state.player.properties['asterweave.controlledActors'].push('adventurer');
    }, TypeError);
});

test('runtime reads baseline values through authoritative domain collaborators', () => {
    const state = initialize();
    const actor = state.world.resolve('guide');
    assert.equal(actor.name, 'Guide');
    assert.equal(actor.getProperty('asterweave.containment').parentId, 'cellar');
    const properties = state.readWorldProperties('brassLantern');
    assert.equal(properties['stateFoundation.fuel'], 100);
    assert.equal(state.readWorldProperties('missing'), undefined);
    assert.ok(Object.isFrozen(properties));
    assert.equal(state.world.resolve('entrance').getExit('east').destinationId, 'cellar');
});

test('equivalent independent runtimes share no owned records or identity objects', () => {
    const options = { player: { id: 'playerOne', controlledActors: [] } };
    const first = initialize(options);
    const second = initialize(options);
    assert.deepEqual(first.readEffectiveState(), second.readEffectiveState());
    assert.notEqual(first.world, second.world);
    assert.notEqual(first.player, second.player);
    assert.notEqual(first.overrides, second.overrides);
    assert.notEqual(first.readWorldProperties('world'), second.readWorldProperties('world'));
    assert.notEqual(first.world.resolve('guide'), second.world.resolve('guide'));
});
