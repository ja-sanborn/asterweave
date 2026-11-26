/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Authored validation stage contracts.
 * @module tests/engine/definition/GameDefinitionValidator
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameDefinitionValidator } from '../../../src/engine/definition/GameDefinitionValidator.js';
import { STANDARD_DIRECTIONS } from '../../../src/engine/world/navigationDirections.js';

/**
 * Loads an independent fixture.
 * @param {string} [name='minimal-foundation'] - Fixture base name.
 * @returns {object} Parsed canonical definition.
 */
function fixture(name = 'minimal-foundation') {
    return JSON.parse(readFileSync(new URL('../../fixtures/games/' + name + '.json', import.meta.url), 'utf8'));
}

/**
 * Runs the authored prerequisite stage.
 * @param {*} input - Definition data.
 * @returns {object} Internal stage result.
 */
function validate(input) {
    return new GameDefinitionValidator().validateAuthored(input);
}

test('accepts all current fixtures and detaches accepted data', () => {
    for (const name of ['minimal-foundation', 'containment-foundation', 'state-foundation']) {
        const input = fixture(name);
        const result = validate(input);
        assert.deepEqual(result.diagnostics, []);
        assert.deepEqual(result.definition, input);
        assert.notEqual(result.definition.world.locations[0], input.world.locations[0]);
    }
});

test('rejects unsafe data before authored shape interpretation', () => {
    const input = fixture();
    let called = false;
    Object.defineProperty(input.game, 'title', {
        enumerable: true,
        get() {
            called = true;
            return 'Unsafe';
        },
    });
    const result = validate(input);
    assert.equal(called, false);
    assert.equal(result.definition, undefined);
    assert.deepEqual(result.diagnostics.map(({ code, path, source }) => ({ code, path, source })), [
        { code: 'INVALID_DATA', path: '/game/title', source: 'definition' },
    ]);
});

test('rejects old formats without interpreting incompatible shape', () => {
    for (const formatVersion of ['1.0.0', '2.0.0', '3.0.0', '3.1.0', '3.2.0', '4.1.0']) {
        const result = validate({ formatVersion });
        assert.equal(result.definition, undefined);
        assert.deepEqual(result.diagnostics.map((item) => item.code), ['UNSUPPORTED_FORMAT_VERSION']);
    }
});

test('reports independent required, invalid and unknown fields in schema order', () => {
    const input = fixture();
    delete input.game.id;
    input.game.title = ' ';
    input.game.extra = true;
    input.world.entities = null;
    const result = validate(input);
    assert.deepEqual(result.diagnostics.map(({ code, path }) => ({ code, path })), [
        { code: 'REQUIRED_FIELD', path: '/game/id' },
        { code: 'INVALID_VALUE', path: '/game/title' },
        { code: 'UNKNOWN_FIELD', path: '/game/extra' },
        { code: 'INVALID_TYPE', path: '/world/entities' },
    ]);
});

test('accepts every standard direction and preserves directed exits', () => {
    const input = fixture();
    const location = input.world.locations[0];
    location.exits = STANDARD_DIRECTIONS.map((direction) => ({
        direction, destinationId: location.id,
    }));
    const result = validate(input);
    assert.deepEqual(result.diagnostics, []);
    assert.equal(result.definition.world.locations[0].exits.length, 12);
    assert.deepEqual(result.definition.world.locations[2].exits, []);
    assert.ok(Object.isFrozen(STANDARD_DIRECTIONS));
});

test('rejects aliases, case variants and unregistered custom directions', () => {
    for (const direction of ['n', 'North', 'north ', 'portal']) {
        const input = fixture();
        input.world.locations[0].exits[0].direction = direction;
        assert.equal(validate(input).diagnostics[0].path, '/world/locations/0/exits/0/direction');
    }
});

test('reports duplicate direction and missing destination independently', () => {
    const input = fixture();
    input.world.locations[0].exits.push({ direction: 'east', destinationId: 'missing' });
    assert.deepEqual(validate(input).diagnostics.map((item) => item.code), [
        'DUPLICATE_DIRECTION', 'UNKNOWN_REFERENCE',
    ]);
});

test('validates physical safe integer ranges without imposing five-point limits', () => {
    const input = fixture();
    input.world.entities[0].physical = {
        size: Number.MAX_SAFE_INTEGER, weight: 99, maxItemSize: 0, weightCapacity: 50,
    };
    assert.deepEqual(validate(input).diagnostics, []);
    for (const size of [0, -1, 1.2, Number.MAX_SAFE_INTEGER + 1, '9']) {
        input.world.entities[0].physical.size = size;
        assert.equal(validate(input).diagnostics[0].path, '/world/entities/0/physical/size');
    }
});

test('rejects removed authored relationship and property fields', () => {
    const input = fixture();
    input.world.initialRelationships = [];
    input.world.initialProperties = {};
    input.world.locations[0].initialProperties = {};
    input.world.actors[0].initialProperties = {};
    input.world.entities[0].initialProperties = {};
    assert.deepEqual(validate(input).diagnostics.map(({ code, path }) => ({ code, path })), [
        { code: 'UNKNOWN_FIELD', path: '/world/locations/0/initialProperties' },
        { code: 'UNKNOWN_FIELD', path: '/world/actors/0/initialProperties' },
        { code: 'UNKNOWN_FIELD', path: '/world/entities/0/initialProperties' },
        { code: 'UNKNOWN_FIELD', path: '/world/initialProperties' },
        { code: 'UNKNOWN_FIELD', path: '/world/initialRelationships' },
    ]);
});

test('rejects removed game namespace and independently rejects reserved participant identity', () => {
    const input = fixture();
    input.game.namespace = 'engine';
    assert.deepEqual(validate(input).diagnostics.map(({ code, path }) => ({ code, path })), [
        { code: 'UNKNOWN_FIELD', path: '/game/namespace' },
    ]);
    delete input.game.namespace;
    input.world.entities[0].id = 'world';
    assert.deepEqual(validate(input).diagnostics.map((item) => item.path), ['/world/entities/0/id']);
});

test('detects shared IDs and suppresses ambiguous reference resolution', () => {
    const input = fixture();
    input.world.entities[0].id = 'hallway';
    input.world.locations[0].exits[0].destinationId = 'hallway';
    input.world.entities[1].initialContainment.parentId = 'missing';
    const result = validate(input);
    assert.deepEqual(result.diagnostics.map((item) => item.code), [
        'DUPLICATE_ID', 'UNKNOWN_REFERENCE',
    ]);
    assert.equal(result.diagnostics[0].path, '/world/entities/0/id');
});

test('rejects wrong-kind and unknown references in all authored record categories', () => {
    const input = fixture();
    input.world.locations[0].exits[0].destinationId = 'world';
    input.world.actors[0].initialContainment.parentId = 'missing';
    input.world.entities[0].initialAssociations = [{ targetId: 'missing', relationship: 'near' }];
    assert.deepEqual(validate(input).diagnostics.map((item) => item.code), [
        'INVALID_REFERENCE_KIND', 'UNKNOWN_REFERENCE', 'UNKNOWN_REFERENCE',
    ]);
});

test('preserves deterministic diagnostics across equivalent object member ordering', () => {
    const input = fixture();
    input.game.z = 1;
    input.game.a = 2;
    const equivalent = fixture();
    equivalent.game.a = 2;
    equivalent.game.z = 1;
    assert.deepEqual(validate(input).diagnostics, validate(equivalent).diagnostics);
    assert.deepEqual(validate(input).diagnostics.map((item) => item.path), ['/game/a', '/game/z']);
});

test('rejects unsupported future component configuration without interpreting it', () => {
    const input = fixture();
    input.game.requiredCapabilities = [];
    input.world.entities[0].mechanical = {};
    input.world.dateTime = {};
    input.gameplay = {};
    input.interaction = {};
    input.presentation = {};
    input.modules = {};
    const result = validate(input);
    assert.equal(result.definition, undefined);
    assert.deepEqual(result.diagnostics.map(({ code, path }) => ({ code, path })), [
        { code: 'UNKNOWN_FIELD', path: '/game/requiredCapabilities' },
        { code: 'UNKNOWN_FIELD', path: '/world/entities/0/mechanical' },
        { code: 'UNKNOWN_FIELD', path: '/world/dateTime' },
        { code: 'UNKNOWN_FIELD', path: '/gameplay' },
        { code: 'UNKNOWN_FIELD', path: '/interaction' },
        { code: 'UNKNOWN_FIELD', path: '/modules' },
        { code: 'UNKNOWN_FIELD', path: '/presentation' },
    ]);
});
