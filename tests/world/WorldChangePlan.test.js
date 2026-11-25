/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview World proposal encapsulation and physical planner boundaries.
 * @module tests/world/WorldChangePlan
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { WorldChangePlan } from '../../src/world/WorldChangePlan.js';
import { planPhysicalProperty } from '../../src/world/planPhysicalProperty.js';
import { PLACEMENT_OPERATIONS, LIFECYCLE_OPERATIONS, WORLD_OPERATIONS } from '../../src/world/worldOperations.js';

/** @returns {object} Fresh effective records for a simple nested world. */
function fixture() {
    const record = (id, parentId) => ({ id, properties: {
        'asterweave.lifecycle': 'active',
        'asterweave.containment': { parentId, relationship: 'in' },
        'asterweave.associations': [],
        'asterweave.isContainer': true,
    } });
    return { locations: [record('room', 'world')], actors: [],
        entities: [record('box', 'room'), record('item', 'box')] };
}

test('world proposals expose immutable records and detached identity enumeration', () => {
    const state = fixture();
    const plan = new WorldChangePlan(state);
    assert.equal(plan.participants, undefined);
    assert.throws(() => plan.participantIds().push('fake'), TypeError);
    assert.throws(() => { plan.participant('box').properties['asterweave.containment'].parentId = 'world'; },
        TypeError);
    assert.deepEqual(plan.originalDescendants('room'), ['box', 'item']);
    plan.set('box', 'asterweave.containment', { parentId: 'world', relationship: 'in' });
    assert.throws(() => { plan.participant('box').properties['asterweave.lifecycle'] = 'destroyed'; },
        TypeError);
    assert.equal(state.entities[0].properties['asterweave.containment'].parentId, 'room');
    assert.deepEqual(plan.originalDescendants('room'), ['box', 'item']);
    assert.equal(plan.finish().result.changed, true);
});

test('physical planner rejects malformed requests and invalid baseline values directly', () => {
    const state = fixture();
    const unused = () => assert.fail('baseline must not be read');
    for (const args of [
        ['set', 'box', 'lifecycle', 'destroyed'], ['set', 'box', 'weight', 0],
        ['remove', 'box', 'isContainer', undefined], ['set', 'box', 'size', null],
    ]) {
        assert.throws(() => planPhysicalProperty(state, ...args, unused), TypeError);
    }
    assert.throws(() => planPhysicalProperty(state, 'reset', 'box', 'isContainer', undefined,
        () => undefined), TypeError);
    assert.throws(() => planPhysicalProperty(state, 'reset', 'box', 'weight', undefined,
        () => -1), TypeError);
    assert.equal(planPhysicalProperty(state, 'reset', 'box', 'weight', undefined,
        () => undefined).result.changed, false);
});

test('protected operation groups are immutable, disjoint and included in grants', () => {
    assert.ok(Object.isFrozen(PLACEMENT_OPERATIONS));
    assert.ok(Object.isFrozen(LIFECYCLE_OPERATIONS));
    assert.equal(new Set(WORLD_OPERATIONS).size, WORLD_OPERATIONS.length);
    assert.deepEqual(WORLD_OPERATIONS, [...PLACEMENT_OPERATIONS,
        'modifyPhysicalProperties', ...LIFECYCLE_OPERATIONS]);
});
