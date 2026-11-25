/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Foundation movement metadata and test-only registry demonstration.
 * @module tests/actions/standardDefinitions
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { ActionRegistry } from '../../src/actions/ActionRegistry.js';
import { MOVE_DEFINITION } from '../../src/actions/standardDefinitions.js';
import { validateActionDefinition } from '../../src/actions/validateActionDefinition.js';
import { validateActionArguments } from '../../src/actions/validateActionArguments.js';
import { STANDARD_DIRECTIONS } from '../../src/world/navigationDirections.js';

test('defines Foundation movement metadata using the authoritative direction vocabulary', () => {
    assert.deepEqual(MOVE_DEFINITION, {
        type: 'move',
        enabled: true,
        turnCostSuccess: 1,
        turnCostFail: 0,
        arguments: {
            direction: { type: 'string', required: true, allowedValues: STANDARD_DIRECTIONS },
        },
    });
    assert.equal(MOVE_DEFINITION.arguments.direction.allowedValues, STANDARD_DIRECTIONS);
    assert.deepEqual(STANDARD_DIRECTIONS, [
        'north', 'south', 'east', 'west', 'northeast', 'northwest',
        'southeast', 'southwest', 'up', 'down', 'in', 'out',
    ]);
    assert.ok(Object.isFrozen(MOVE_DEFINITION));
    assert.ok(Object.isFrozen(MOVE_DEFINITION.arguments));
    assert.ok(Object.isFrozen(MOVE_DEFINITION.arguments.direction));
    assert.ok(Object.isFrozen(MOVE_DEFINITION.arguments.direction.allowedValues));
    assert.equal(validateActionDefinition(MOVE_DEFINITION).status, 'completed');
});

test('registers and resolves move with a test-only handler without executing it', () => {
    const { registry, engineOwner } = ActionRegistry.create();
    let calls = 0;
    /** Counts unexpected invocations; no navigation or gameplay behavior. */
    function testHandler() {
        calls++;
    }
    assert.equal(registry.has('move'), false);
    assert.equal(registry.register(engineOwner, MOVE_DEFINITION, testHandler).status, 'completed');
    assert.equal(registry.finalize().status, 'completed');
    const record = registry.resolve('move');
    assert.equal(record.handler, testHandler);
    assert.equal(record.validator, undefined);
    assert.deepEqual(record.definition, MOVE_DEFINITION);
    assert.notEqual(record.definition, MOVE_DEFINITION);
    assert.notEqual(record.definition.arguments.direction.allowedValues, STANDARD_DIRECTIONS);
    assert.deepEqual(registry.listDefinitions(), [record.definition]);
    for (const direction of STANDARD_DIRECTIONS) {
        const result = validateActionArguments(record.definition, { direction }, record.validator);
        assert.equal(result.status, 'completed');
        assert.deepEqual(result.args, { direction });
    }
    assert.equal(calls, 0);
});

test('rejects aliases, missing directions, wrong types and caller-selected destinations', () => {
    const { registry, engineOwner } = ActionRegistry.create();
    registry.register(engineOwner, MOVE_DEFINITION, () => {});
    registry.finalize();
    const { definition } = registry.resolve('move');
    for (const args of [
        {}, null, [], { direction: null }, { direction: 1 }, { direction: ['north'] },
        { direction: 'n' }, { direction: 'ne' }, { direction: 'u' },
        { direction: 'North' }, { direction: ' north' }, { direction: 'north\n' },
        { direction: 'north-east' }, { direction: 'inside' }, { direction: 'forward' },
        { direction: 'east', destinationId: 'hallway' },
        { direction: 'east', turnCostSuccess: 0 },
    ]) {
        assert.equal(validateActionArguments(definition, args).status, 'rejected');
    }
});

test('keeps movement registrations isolated and requires engine ownership', () => {
    const first = ActionRegistry.create();
    const second = ActionRegistry.create();
    const extensionOwner = first.registry.claimNamespace('navigation').owner;
    for (const owner of [extensionOwner, first.gameOwner, second.engineOwner]) {
        const result = first.registry.register(owner, MOVE_DEFINITION, () => {});
        assert.equal(result.status, 'rejected');
        assert.equal(result.diagnostics[0].code, 'INVALID_REGISTRATION_OWNER');
    }
    assert.equal(first.registry.register(first.engineOwner, MOVE_DEFINITION, () => {}).status, 'completed');
    assert.equal(second.registry.has('move'), false);
    assert.equal(second.registry.register(second.engineOwner, MOVE_DEFINITION, () => {}).status, 'completed');
    assert.notEqual(first.registry.getDefinition('move'), second.registry.getDefinition('move'));
});
