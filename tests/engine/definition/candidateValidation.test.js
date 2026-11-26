/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Effective candidate validation and isolation tests.
 * @module tests/engine/definition/candidateValidation
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameDefinitionValidator } from '../../../src/engine/definition/GameDefinitionValidator.js';

/**
 * Loads a fresh canonical fixture.
 * @param {string} [name='containment-foundation'] - Fixture name.
 * @returns {object} Authored definition.
 */
function fixture(name = 'containment-foundation') {
    return JSON.parse(readFileSync(new URL('../../fixtures/games/' + name + '.json', import.meta.url), 'utf8'));
}

/**
 * Finds an authored participant.
 * @param {object} definition - Authored definition.
 * @param {string} id - Participant identity.
 * @returns {object} Participant record.
 */
function participant(definition, id) {
    const { locations, actors, entities } = definition.world;
    return [...locations, ...actors, ...entities].find((entry) => entry.id === id);
}

/**
 * Executes the complete definition pipeline.
 * @param {object} definition - Authored data.
 * @returns {object} Validation candidate or findings.
 */
function validate(definition) {
    return new GameDefinitionValidator().validate(definition);
}

/**
 * Requires rejection with the expected diagnostic.
 * @param {object} definition - Authored definition.
 * @param {string} code - Expected finding code.
 * @param {string} [path] - Optional exact pointer.
 */
function rejects(definition, code, path) {
    const result = validate(definition);
    assert.equal(result.candidate, undefined);
    assert.ok(result.diagnostics.some((entry) =>
        entry.code === code && (path === undefined || entry.path === path)), JSON.stringify(result.diagnostics));
}

test('maps every current fixture to valid detached effective state', () => {
    for (const name of ['minimal-foundation', 'containment-foundation', 'state-foundation']) {
        const input = fixture(name);
        const before = structuredClone(input);
        const result = validate(input);
        assert.deepEqual(result.diagnostics, []);
        assert.deepEqual(input, before);
        assert.equal(result.candidate.world.properties['asterweave.turn'], 0);
        assert.equal(result.candidate.world.properties['asterweave.id'], 'world');
        assert.equal(result.candidate.locations[0].properties['asterweave.isContainer'], true);
        assert.equal(result.candidate.actors[0].properties['asterweave.isContainer'], false);
        assert.deepEqual(result.candidate.players, []);
        assert.deepEqual(result.candidate, validate(input).candidate);
        result.candidate.locations[0].properties['asterweave.name'] = 'Changed';
        assert.deepEqual(input, before);
    }
});

test('preserves inactive and destroyed identities without placement', () => {
    const { candidate } = validate(fixture());
    for (const [id, lifecycle] of [['visitor', 'inactive'], ['brokenBottle', 'destroyed']]) {
        const entry = candidate.entities.find((record) => record.id === id);
        assert.equal(entry.properties['asterweave.lifecycle'], lifecycle);
        assert.equal(Object.hasOwn(entry.properties, 'asterweave.containment'), false);
        assert.deepEqual(entry.properties['asterweave.associations'], []);
    }
});

test('rejects absent active placement and nonactive placement', () => {
    const input = fixture();
    delete participant(input, 'key').initialContainment;
    participant(input, 'visitor').initialContainment = { parentId: 'world', relationship: 'in' };
    const result = validate(input);
    assert.equal(result.candidate, undefined);
    assert.deepEqual(result.diagnostics.filter((item) => item.code === 'INVALID_LIFECYCLE')
        .map((item) => item.path), [
        '/world/entities/0/initialContainment',
        '/world/entities/8/initialContainment',
    ]);
});

test('requires an active location and actor', () => {
    const input = fixture('minimal-foundation');
    for (const entry of [...input.world.locations, ...input.world.actors]) {
        entry.initialLifecycle = 'inactive';
        delete entry.initialContainment;
    }
    rejects(input, 'INVALID_LIFECYCLE', '/world/locations');
    rejects(input, 'INVALID_LIFECYCLE', '/world/actors');
});

test('rejects invalid root relation, noncontainer and nonactor parent', () => {
    for (const [parentId, relationship] of [
        ['world', 'on'], ['rug', 'in'], ['safe', 'worn'],
    ]) {
        const input = fixture();
        participant(input, 'key').initialContainment = { parentId, relationship };
        rejects(input, 'INVALID_CONTAINMENT', '/world/entities/0/initialContainment');
    }
});

test('rejects self containment and multilevel cycles', () => {
    const input = fixture();
    participant(input, 'house').initialContainment.parentId = 'bedroom';
    rejects(input, 'CONTAINMENT_CYCLE');
    const self = fixture();
    participant(self, 'safe').initialContainment.parentId = 'safe';
    rejects(self, 'CONTAINMENT_CYCLE', '/world/entities/1/initialContainment');
});

test('rejects active descendants of inactive parents', () => {
    const input = fixture();
    participant(input, 'key').initialContainment.parentId = 'visitor';
    rejects(input, 'INVALID_CONTAINMENT');
});

test('accepts reciprocal spatial associations but rejects duplicate and invalid endpoints', () => {
    const input = fixture();
    participant(input, 'rug').initialAssociations = [{ targetId: 'hiddenKey', relationship: 'near' }];
    assert.deepEqual(validate(input).diagnostics, []);
    const key = participant(input, 'hiddenKey');
    key.initialAssociations.push({ targetId: 'rug', relationship: 'under' });
    rejects(input, 'INVALID_ASSOCIATION', '/world/entities/4/initialAssociations/1');
    for (const targetId of ['hiddenKey', 'world', 'visitor', 'car']) {
        key.initialAssociations = [{ targetId, relationship: 'near' }];
        rejects(input, 'INVALID_ASSOCIATION');
    }
});

test('checks inclusive individual limits and direct size versus recursive weight', () => {
    const input = fixture();
    const driver = participant(input, 'driver');
    driver.physical.maxItemWeight = 2;
    driver.physical.sizeCapacity = 3;
    driver.physical.weightCapacity = 4;
    assert.deepEqual(validate(input).diagnostics, []);
    driver.physical.weightCapacity = 3;
    rejects(input, 'CAPACITY_EXCEEDED', '/world/actors/1/physical/weightCapacity');
    driver.physical.weightCapacity = 4;
    driver.physical.maxItemWeight = 1;
    rejects(input, 'CAPACITY_EXCEEDED', '/world/actors/1/physical/maxItemWeight');
});

test('rejects missing required scores and occupied zero limits', () => {
    const input = fixture();
    delete participant(input, 'notebook').physical.weight;
    rejects(input, 'UNKNOWN_MEASUREMENT', '/world/actors/1/physical/weightCapacity');
    participant(input, 'backpack').physical.weightCapacity = 0;
    rejects(input, 'CAPACITY_EXCEEDED', '/world/entities/6/physical/weightCapacity');
});

test('rejects finite aggregate overflow without rounding', () => {
    const input = fixture('minimal-foundation');
    const room = participant(input, 'entrance');
    room.physical = { sizeCapacity: Number.MAX_SAFE_INTEGER };
    participant(input, 'player').physical = { size: Number.MAX_SAFE_INTEGER };
    participant(input, 'brassLantern').physical = { size: 1 };
    rejects(input, 'CAPACITY_EXCEEDED', '/world/locations/0/physical/sizeCapacity');
    delete room.physical.sizeCapacity;
    assert.deepEqual(validate(input).diagnostics, []);
});

test('rejects reserved, foreign and malformed property keys without losing null values', () => {
    const input = fixture('state-foundation');
    input.world.initialProperties['stateFoundation.nullValue'] = null;
    assert.equal(validate(input).candidate.world.properties['stateFoundation.nullValue'], null);
    input.world.initialProperties['asterweave.turn'] = 90;
    input.world.initialProperties['foreign.value'] = true;
    input.world.initialProperties['bad~/key'] = false;
    const result = validate(input);
    assert.deepEqual(result.diagnostics.map((item) => item.path), [
        '/world/initialProperties/asterweave.turn',
        '/world/initialProperties/bad~0~1key',
        '/world/initialProperties/foreign.value',
    ]);
});

test('permits reverse and self directed relationships but rejects duplicate ordered pairs', () => {
    const input = fixture('state-foundation');
    const [first] = input.world.initialRelationships;
    input.world.initialRelationships.push({
        from: first.to, to: first.from, initialProperties: { 'stateFoundation.trust': null },
    }, {
        from: first.from, to: first.from, initialProperties: { 'stateFoundation.trust': 0 },
    });
    assert.deepEqual(validate(input).diagnostics, []);
    input.world.initialRelationships.push(structuredClone(first));
    rejects(input, 'INVALID_VALUE', '/world/initialRelationships/3');
});

test('rejects explicitly empty authored associations on nonactive participants', () => {
    const input = fixture();
    participant(input, 'visitor').initialAssociations = [];
    rejects(input, 'INVALID_LIFECYCLE', '/world/entities/8/initialAssociations');
});

test('reserved authored properties cannot contaminate effective structural validation', () => {
    const input = fixture();
    participant(input, 'key').initialProperties = { 'asterweave.weightCapacity': 'invalid' };
    participant(input, 'visitor').initialProperties = { 'asterweave.containment': null };
    const result = validate(input);
    assert.equal(result.candidate, undefined);
    assert.deepEqual(result.diagnostics.map((entry) => entry.code), ['INVALID_VALUE', 'INVALID_VALUE']);
});

test('independent rooted capacity violations survive an unrelated containment cycle', () => {
    const input = fixture();
    participant(input, 'house').initialContainment.parentId = 'bedroom';
    participant(input, 'driver').physical.weightCapacity = 1;
    rejects(input, 'CONTAINMENT_CYCLE');
    rejects(input, 'CAPACITY_EXCEEDED', '/world/actors/1/physical/weightCapacity');
});

test('reports missing measurements in valid branches despite unrelated containment errors', () => {
    const input = fixture();
    participant(input, 'house').initialContainment.parentId = 'bedroom';
    delete participant(input, 'notebook').physical.weight;
    const result = validate(input);
    assert.equal(result.candidate, undefined);
    assert.ok(result.diagnostics.some((entry) => entry.code === 'CONTAINMENT_CYCLE'));
    assert.ok(result.diagnostics.some((entry) => entry.code === 'UNKNOWN_MEASUREMENT'
        && entry.path === '/world/actors/1/physical/weightCapacity'));
});

test('reports missing measurements on a valid child despite an invalid sibling edge', () => {
    const input = fixture();
    participant(input, 'key').initialContainment = { parentId: 'world', relationship: 'on' };
    delete participant(input, 'notebook').physical.weight;
    const result = validate(input);
    assert.equal(result.candidate, undefined);
    assert.ok(result.diagnostics.some((entry) => entry.code === 'INVALID_CONTAINMENT'));
    assert.ok(result.diagnostics.some((entry) => entry.code === 'UNKNOWN_MEASUREMENT'
        && entry.path === '/world/actors/1/physical/weightCapacity'));
});
