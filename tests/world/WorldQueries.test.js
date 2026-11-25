/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Structural query behavior, ordering and isolation.
 * @module tests/world/WorldQueries
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { WorldQueries } from '../../src/world/WorldQueries.js';

/**
 * Creates an effective participant record for a structurally valid test view.
 * @param {string} id - Identity.
 * @param {string} [parentId] - Parent.
 * @param {string} [relationship] - Placement.
 * @param {string} [lifecycle] - Lifecycle.
 * @returns {object} Effective record.
 */
function record(id, parentId, relationship = 'in', lifecycle = 'active') {
    return { id, properties: {
        'asterweave.lifecycle': lifecycle,
        'asterweave.isContainer': true,
        'asterweave.associations': [],
        ...(parentId === undefined ? {} : {
            'asterweave.containment': { parentId, relationship },
        }),
    } };
}

/** @returns {object} Fresh deliberately unordered effective records. */
function fixture() {
    return {
        locations: [record('room', 'house'), record('house', 'world')],
        actors: [record('driver', 'car')],
        entities: [
            record('note', 'bag'), record('car', 'room'), record('bag', 'driver', 'carried'),
            record('coat', 'driver', 'worn'), record('button', 'coat', 'partOf'),
            record('lamp', 'driver', 'held'), record('Battery', 'lamp', 'attached'),
            record('seat', 'car', 'on'), record('visitor', undefined, 'in', 'inactive'),
            record('broken', undefined, 'in', 'destroyed'),
        ],
    };
}

test('queries derive nested locations, occupied containers and strict ancestry', () => {
    const queries = new WorldQueries(fixture());
    assert.deepEqual(queries.directContents('car'), ['driver', 'seat']);
    assert.deepEqual(queries.ancestors('note'), ['bag', 'driver', 'car', 'room', 'house', 'world']);
    assert.deepEqual(queries.enclosingLocations('driver'), ['room', 'house']);
    assert.equal(queries.effectiveLocation('driver'), 'room');
    assert.equal(queries.effectiveLocation('room'), 'house');
    assert.equal(queries.effectiveLocation('house'), undefined);
    assert.equal(queries.isAncestor('car', 'note'), true);
    assert.equal(queries.isDescendant('note', 'car'), true);
    assert.equal(queries.isAncestor('car', 'car'), false);
    assert.equal(queries.isAncestor('note', 'car'), false);
    assert.deepEqual(queries.recursiveContents('driver'), ['Battery', 'bag', 'button', 'coat', 'lamp', 'note']);
});

test('actor branches are structural and include nested members without unrelated contents', () => {
    const state = fixture();
    state.entities.push(record('attached', 'driver', 'attached'));
    const queries = new WorldQueries(state);
    assert.deepEqual(queries.possessions('driver'), ['Battery', 'bag', 'button', 'coat', 'lamp', 'note']);
    assert.deepEqual(queries.equipment('driver'), ['button', 'coat']);
    assert.deepEqual(queries.heldItems('driver'), ['Battery', 'lamp']);
    assert.throws(() => queries.possessions('car'), TypeError);
});

test('root and nonactive identities remain distinguishable from unknown identities', () => {
    const queries = new WorldQueries(fixture());
    assert.equal(queries.lifecycle('world'), 'active');
    assert.equal(queries.parent('world'), undefined);
    assert.deepEqual(queries.directContents('world'), ['house']);
    assert.equal(queries.lifecycle('visitor'), 'inactive');
    assert.equal(queries.lifecycle('broken'), 'destroyed');
    assert.equal(queries.containment('visitor'), undefined);
    assert.deepEqual(queries.ancestors('broken'), []);
    assert.deepEqual(queries.recursiveContents('visitor'), []);
    assert.throws(() => queries.parent('missing'), TypeError);
    assert.throws(() => queries.isAncestor('missing', 'car'), TypeError);
});

test('query results are detached, immutable and independent of subsequent source changes', () => {
    const state = fixture();
    const before = new WorldQueries(state);
    const car = state.entities.find(({ id }) => id === 'car');
    car.properties['asterweave.containment'].parentId = 'house';
    const after = new WorldQueries(state);
    assert.equal(before.effectiveLocation('driver'), 'room');
    assert.equal(after.effectiveLocation('driver'), 'house');
    assert.ok(Object.isFrozen(before.directContents('car')));
    assert.ok(Object.isFrozen(before.containment('car')));
    assert.throws(() => { before.containment('car').parentId = 'world'; }, TypeError);
    assert.throws(() => before.recursiveContents('world').push('fake'), TypeError);
});

test('queries fail closed on cycles and invalid ancestry', () => {
    const state = fixture();
    state.locations[1].properties['asterweave.containment'].parentId = 'room';
    assert.throws(() => new WorldQueries(state), /Invalid effective world hierarchy/);
    const other = fixture();
    other.entities[1].properties['asterweave.containment'].parentId = 'visitor';
    assert.throws(() => new WorldQueries(other), /Invalid effective world hierarchy/);
});

test('deep valid hierarchy uses iterative traversal', () => {
    const entities = [];
    let parent = 'world';
    for (let index = 0; index < 12000; index++) {
        const id = 'node' + index;
        entities.push(record(id, parent));
        parent = id;
    }
    const queries = new WorldQueries({ locations: [], actors: [], entities });
    assert.equal(queries.ancestors(parent).length, 12000);
    assert.equal(queries.recursiveContents('world').length, 12000);
});
