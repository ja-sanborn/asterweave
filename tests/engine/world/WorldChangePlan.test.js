/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview World proposal encapsulation and physical planner boundaries.
 * @module tests/engine/world/WorldChangePlan
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { planLifecycleOperation } from '../../../src/engine/world/planLifecycleOperation.js';
import { WorldChangePlan } from '../../../src/engine/world/WorldChangePlan.js';
import { planPhysicalProperty } from '../../../src/engine/world/planPhysicalProperty.js';
import { PLACEMENT_OPERATIONS, LIFECYCLE_OPERATIONS, WORLD_OPERATIONS } from '../../../src/engine/world/worldOperations.js';

/** @returns {object} Fresh effective records for a simple nested world. */
function fixture() {
    const record = (id, parentId) => ({ id, properties: {
        'engine.lifecycle': 'active',
        'engine.containment': { parentId, relationship: 'in' },
        'engine.associations': [],
        'engine.isContainer': true,
    } });
    return { locations: [record('room', 'world')], actors: [],
        entities: [record('box', 'room'), record('item', 'box')] };
}

test('world proposals expose immutable records and detached identity enumeration', () => {
    const state = fixture();
    const plan = new WorldChangePlan(state);
    assert.equal(plan.participants, undefined);
    assert.throws(() => plan.participantIds().push('fake'), TypeError);
    assert.throws(() => { plan.participant('box').properties['engine.containment'].parentId = 'world'; },
        TypeError);
    assert.deepEqual(plan.originalDescendants('room'), ['box', 'item']);
    plan.set('box', 'engine.containment', { parentId: 'world', relationship: 'in' });
    assert.throws(() => { plan.participant('box').properties['engine.lifecycle'] = 'destroyed'; },
        TypeError);
    assert.equal(state.entities[0].properties['engine.containment'].parentId, 'room');
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

test('proposal boundary rejects unsupported keys, unsafe shapes and terminal resurrection', () => {
    const plan = new WorldChangePlan(fixture());
    const accessor = { get parentId() { assert.fail('getter invoked'); }, relationship: 'in' };
    for (const [key, value] of [
        ['__proto__', { polluted: true }], ['constructor', {}], ['prototype', {}],
        ['game.flag', true], ['engine.turn', 2], ['engine.lifecycle', 'missing'],
        ['engine.isContainer', undefined], ['engine.weight', 0],
        ['engine.associations', [{ targetId: 'item', relationship: 'in' }]],
        ['engine.containment', accessor],
        ['engine.containment', { parentId: 'room', relationship: 'in', extra: true }],
    ]) {
        assert.throws(() => plan.set('box', key, value), TypeError);
    }
    assert.deepEqual(plan.changes(), []);
    assert.equal(Object.prototype.polluted, undefined);
    plan.set('item', 'engine.lifecycle', 'destroyed');
    plan.set('item', 'engine.containment', undefined);
    assert.throws(() => plan.set('item', 'engine.lifecycle', 'active'), TypeError);
    assert.equal(plan.finish().result.changed, true);
});

test('world proposals retain only structural data and detach source placement', () => {
    const state = fixture();
    state.entities[0].properties['game.large'] = { values: Array(10000).fill('data') };
    const plan = new WorldChangePlan(state);
    assert.equal(Object.hasOwn(plan.participant('box').properties, 'game.large'), false);
    state.entities[0].properties['engine.containment'].parentId = 'world';
    assert.equal(plan.participant('box').properties['engine.containment'].parentId, 'room');
    assert.deepEqual(plan.changes(), []);
});

test('deep recursive destruction plans iteratively and deterministically', () => {
    const state = fixture();
    const count = 12000;
    for (let index = 0; index < count; index++) {
        state.entities.push({ id: 'node' + index, properties: {
            'engine.lifecycle': 'active',
            'engine.containment': {
                parentId: index === 0 ? 'item' : 'node' + (index - 1), relationship: 'in',
            },
            'engine.associations': [], 'engine.isContainer': true,
        } });
    }
    const result = planLifecycleOperation(state, 'destroyRecursively', 'box');
    assert.equal(result.result.changed, true);
    assert.equal(result.changes.length, (count + 2) * 2);
    assert.deepEqual(result, planLifecycleOperation(state, 'destroyRecursively', 'box'));
    assert.equal(state.entities.at(-1).properties['engine.lifecycle'], 'active');
});
