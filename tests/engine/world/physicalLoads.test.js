/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared physical loads and capacity validation behavior.
 * @module tests/engine/world/physicalLoads
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { WorldQueries } from '../../../src/engine/world/WorldQueries.js';
import { validateWorldState } from '../../../src/engine/world/validateWorldState.js';
import { WORLD_CODES } from '../../../src/engine/world/worldDiagnostics.js';

/**
 * Builds a structurally valid physical record.
 * @param {string} id - Identity.
 * @param {string} parentId - Parent identity.
 * @param {object} measurements - Qualified physical properties without prefix.
 * @param {string} [relationship] - Containment relationship.
 * @returns {object} Effective record.
 */
function record(id, parentId, measurements, relationship = 'in') {
    return { id, properties: {
        'engine.lifecycle': 'active',
        'engine.containment': { parentId, relationship },
        'engine.associations': [],
        'engine.isContainer': true,
        ...Object.fromEntries(Object.entries(measurements).map(([key, value]) => [
            'asterweave.' + key, value,
        ])),
    } };
}

/** @returns {object} Fresh occupied hierarchy with independent measurement scales. */
function fixture() {
    return {
        locations: [record('room', 'world', {})],
        actors: [record('hero', 'room', { weight: 9, size: 8 })],
        entities: [
            record('bag', 'hero', { size: 3, weight: 2 }, 'carried'),
            record('book', 'bag', { size: 5, weight: 4 }),
            record('lamp', 'hero', { size: 2, weight: 3 }, 'held'),
        ],
    };
}

/**
 * Collects domain findings without changing candidate records.
 * @param {object} state - Effective state.
 * @returns {object[]} Findings.
 */
function findings(state) {
    const result = [];
    validateWorldState(state, (code, id, property) => result.push({ code, id, property }));
    return result;
}

test('loads count direct size and all descendant weight exactly once', () => {
    const state = fixture();
    const queries = new WorldQueries(state);
    assert.deepEqual(queries.physicalLoad('hero'), {
        size: { value: 5, unknown: false, overflow: false },
        weight: { value: 9, unknown: false, overflow: false },
    });
    assert.equal(queries.physicalLoad('bag').size.value, 5);
    assert.equal(queries.physicalLoad('room').weight.value, 18);
    assert.equal(queries.physicalLoad('book').weight.value, 0);
    assert.equal(queries.physicalLoad('world'), undefined);
    assert.ok(Object.isFrozen(queries.physicalLoad('hero').weight));
    state.entities[1].properties['engine.weight'] = 6;
    assert.equal(queries.physicalLoad('hero').weight.value, 9);
    assert.equal(new WorldQueries(state).physicalLoad('hero').weight.value, 11);
});

test('finite limits are inclusive and individual weight excludes nested contents', () => {
    const state = fixture();
    const hero = state.actors[0].properties;
    Object.assign(hero, {
        'engine.maxItemSize': 3, 'engine.maxItemWeight': 3,
        'engine.sizeCapacity': 5, 'engine.weightCapacity': 9,
    });
    assert.deepEqual(findings(state), []);
    state.entities[1].properties['engine.weight'] = 5;
    assert.deepEqual(findings(state), [
        { code: WORLD_CODES.CAPACITY_EXCEEDED, id: 'hero', property: 'weightCapacity' },
    ]);
});

test('unknown loads are not zero and absent limits do not restrict them', () => {
    const state = fixture();
    delete state.entities[1].properties['engine.weight'];
    const hero = state.actors[0].properties;
    assert.deepEqual(new WorldQueries(state).physicalLoad('hero').weight, {
        unknown: true, overflow: false,
    });
    assert.deepEqual(findings(state), []);
    hero['engine.weightCapacity'] = 100;
    assert.deepEqual(findings(state), [
        { code: WORLD_CODES.UNKNOWN_MEASUREMENT, id: 'hero', property: 'weightCapacity' },
    ]);
    hero['engine.weightCapacity'] = 0;
    assert.deepEqual(findings(state), [
        { code: WORLD_CODES.CAPACITY_EXCEEDED, id: 'hero', property: 'weightCapacity' },
    ]);
});

test('safe integer boundaries distinguish exact maximum and overflow', () => {
    const state = fixture();
    const hero = state.actors[0].properties;
    state.entities[1].properties['engine.weight'] = Number.MAX_SAFE_INTEGER - 5;
    hero['engine.weightCapacity'] = Number.MAX_SAFE_INTEGER;
    assert.equal(new WorldQueries(state).physicalLoad('hero').weight.value, Number.MAX_SAFE_INTEGER);
    assert.deepEqual(findings(state), []);
    state.entities[1].properties['engine.weight']++;
    assert.deepEqual(new WorldQueries(state).physicalLoad('hero').weight, {
        unknown: false, overflow: true,
    });
    assert.deepEqual(findings(state), [
        { code: WORLD_CODES.CAPACITY_EXCEEDED, id: 'hero', property: 'weightCapacity' },
    ]);
    delete hero['engine.weightCapacity'];
    assert.deepEqual(findings(state), []);
});

test('movement within a shared ancestor does not double count weight', () => {
    const state = fixture();
    state.entities[1].properties['engine.containment'] = {
        parentId: 'hero', relationship: 'carried',
    };
    const queries = new WorldQueries(state);
    assert.equal(queries.physicalLoad('hero').weight.value, 9);
    assert.equal(queries.physicalLoad('hero').size.value, 10);
    assert.equal(queries.physicalLoad('bag').weight.value, 0);
});

test('empty capacity permits zero load and nonactive participants have no load', () => {
    const state = fixture();
    state.entities[1].properties['engine.weightCapacity'] = 0;
    assert.deepEqual(findings(state), []);
    const lamp = state.entities[2].properties;
    lamp['engine.lifecycle'] = 'inactive';
    delete lamp['engine.containment'];
    assert.equal(new WorldQueries(state).physicalLoad('lamp'), undefined);
});

test('capacity diagnostics preserve independent rooted findings on invalid branches', () => {
    const state = fixture();
    state.entities[0].properties['engine.containment'] = {
        parentId: 'book', relationship: 'in',
    };
    state.actors[0].properties['engine.weightCapacity'] = 2;
    const result = findings(state);
    assert.ok(result.some(({ code }) => code === WORLD_CODES.CONTAINMENT_CYCLE));
    assert.ok(result.some(({ code, id }) =>
        code === WORLD_CODES.CAPACITY_EXCEEDED && id === 'hero'));
});

test('unknown and overflow flags coexist without exposing an inexact numeric value', () => {
    const state = fixture();
    state.entities[0].properties['engine.weight'] = Number.MAX_SAFE_INTEGER;
    delete state.entities[1].properties['engine.weight'];
    assert.deepEqual(new WorldQueries(state).physicalLoad('hero').weight, {
        unknown: true, overflow: true,
    });
    assert.deepEqual(findings(state), []);
    state.actors[0].properties['engine.weightCapacity'] = Number.MAX_SAFE_INTEGER;
    assert.deepEqual(findings(state), [
        { code: WORLD_CODES.CAPACITY_EXCEEDED, id: 'hero', property: 'weightCapacity' },
    ]);
});
