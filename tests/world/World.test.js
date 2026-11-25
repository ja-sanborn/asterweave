/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview World root, participant identity and authoritative reads.
 * @module tests/world/World
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameDefinitionValidator } from '../../src/definition/GameDefinitionValidator.js';
import { GameBaseline } from '../../src/state/GameBaseline.js';
import { World } from '../../src/world/World.js';
import { WorldObject } from '../../src/world/WorldObject.js';
import { WorldObjectRegistry } from '../../src/world/WorldObjectRegistry.js';
import { Location } from '../../src/world/Location.js';
import { Actor } from '../../src/world/Actor.js';
import { Entity } from '../../src/world/Entity.js';

/** @returns {object} World with trusted baseline-backed state readers. */
function setup() {
    const definition = JSON.parse(readFileSync(
        new URL('../fixtures/games/containment-foundation.json', import.meta.url), 'utf8',
    ));
    const baseline = new GameBaseline(new GameDefinitionValidator().validate(definition).candidate);
    const identities = {
        locations: baseline.locations.map((entry) => entry.id),
        actors: baseline.actors.map((entry) => entry.id),
        entities: baseline.entities.map((entry) => entry.id),
    };
    const readProperties = (id) => id === 'world'
        ? baseline.world.properties : baseline.participant(id).properties;
    const readExits = (id) => baseline.participant(id).exits;
    return { world: new World(identities, readProperties, readExits), baseline };
}

test('World is a separate non-navigable root and resolves stable participant classes', () => {
    const { world } = setup();
    assert.equal(world.id, 'world');
    assert.equal(world.resolve('world'), world);
    assert.equal(world instanceof WorldObject, false);
    assert.equal(world.getExit, undefined);
    assert.equal(world.getProperty('asterweave.turn'), 0);
    assert.equal(world.getProperty('asterweave.containment'), undefined);
    assert.ok(world.resolve('bedroom') instanceof Location);
    assert.ok(world.resolve('driver') instanceof Actor);
    assert.ok(world.resolve('car') instanceof Entity);
    assert.equal(world.resolve('missing'), undefined);
    assert.equal(world.resolve('car'), world.resolve('car'));
});

test('registry retains inactive and destroyed identities and orders categories', () => {
    const { world } = setup();
    assert.equal(world.resolve('visitor').lifecycle, 'inactive');
    assert.equal(world.resolve('brokenBottle').lifecycle, 'destroyed');
    assert.equal(world.resolve('visitor').isActive, false);
    assert.equal(world.resolve('car').isActive, true);
    assert.equal(world.resolve('visitor').getProperty('asterweave.containment'), undefined);
    const entities = world.participants('entity');
    const ids = entities.map((entry) => entry.id);
    assert.deepEqual(ids, [...ids].sort());
    assert.ok(ids.includes('brokenBottle'));
    assert.ok(Object.isFrozen(entities));
    assert.equal(world.participants().includes(world), false);
    assert.deepEqual(world.participants('actor').map((entry) => entry.id), ['driver', 'player']);
});

test('domain objects read current state instead of retaining duplicate mutable values', () => {
    const properties = { 'asterweave.name': 'Before', 'asterweave.lifecycle': 'active' };
    const actor = new Actor('person', () => properties);
    assert.equal(actor.name, 'Before');
    properties['asterweave.name'] = 'After';
    properties['asterweave.lifecycle'] = 'inactive';
    assert.equal(actor.name, 'After');
    assert.equal(actor.isActive, false);
    assert.ok(Object.isFrozen(actor));
    assert.throws(() => {
        actor.id = 'replacement';
    }, TypeError);
});

test('domain property and authored exit reads cannot mutate authoritative data', () => {
    const properties = { 'game.value': { nested: [null] } };
    const exits = [{ direction: 'north', destinationId: 'room' }];
    const location = new Location('room', () => properties, () => exits);
    const value = location.getProperty('game.value');
    assert.ok(Object.isFrozen(value.nested));
    assert.notEqual(value, properties['game.value']);
    assert.equal(location.getProperty('game.missing'), undefined);
    const exit = location.getExit('north');
    assert.deepEqual(exit, exits[0]);
    assert.notEqual(exit, exits[0]);
    assert.ok(Object.isFrozen(exit));
    assert.equal(location.getExit('south'), undefined);
});

test('registry rejects duplicate identities and nonparticipants', () => {
    const actor = new Actor('same', () => ({}));
    const entity = new Entity('same', () => ({}));
    assert.throws(() => new WorldObjectRegistry([actor, entity]), TypeError);
    assert.throws(() => new WorldObjectRegistry([{}]), TypeError);
    assert.throws(() => new Actor('world', () => ({})), TypeError);
    assert.throws(() => new WorldObject('person', () => ({})), TypeError);
});

test('independent worlds have independent domain identities', () => {
    const left = setup().world;
    const right = setup().world;
    assert.notEqual(left, right);
    assert.notEqual(left.resolve('driver'), right.resolve('driver'));
    assert.equal(left.resolve('driver').name, right.resolve('driver').name);
});
