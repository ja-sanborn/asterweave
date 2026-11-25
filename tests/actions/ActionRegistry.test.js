/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Registry authority, registration and lifecycle behavior.
 * @module tests/actions/ActionRegistry
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { ActionRegistry } from '../../src/actions/ActionRegistry.js';
import { validateActionArguments } from '../../src/actions/validateActionArguments.js';

/**
 * Creates a fresh test definition, not a production gameplay capability.
 * @param {string} type - Action identifier.
 * @returns {object} Candidate metadata.
 */
function definition(type) {
    return { type, enabled: true, turnCostSuccess: 1, turnCostFail: 0, arguments: {} };
}

/** Test handler must not run during registration or lookup. */
function handler() {
    throw new Error('Handler must not execute here.');
}

/**
 * Extracts diagnostic codes from an internal result.
 * @param {object} result - Registry result.
 * @returns {string[]} Ordered diagnostic codes.
 */
function codes(result) {
    assert.equal(result.status, 'rejected');
    return result.diagnostics.map((finding) => finding.code);
}

test('creates independent registries and restricts construction', () => {
    assert.throws(() => new ActionRegistry(), TypeError);
    const first = ActionRegistry.create();
    const second = ActionRegistry.create();
    assert.notEqual(first.registry, second.registry);
    assert.notEqual(first.engineOwner, second.engineOwner);
    assert.notEqual(first.gameOwner, second.gameOwner);
    assert.equal(first.registry.size, 0);
    assert.equal(first.registry.isFinalized, false);
    assert.ok(Object.isFrozen(first));
});

test('registers all classifications and resolves trusted associations without execution', () => {
    const { registry, engineOwner, gameOwner } = ActionRegistry.create();
    const claim = registry.claimNamespace('combat');
    assert.equal(claim.status, 'completed');
    assert.equal(typeof claim.owner, 'symbol');
    assert.ok(Object.isFrozen(claim));
    const validator = () => [];
    assert.equal(registry.register(engineOwner, definition('look'), handler).status, 'completed');
    assert.equal(registry.register(gameOwner, definition('game.bell'), handler).status, 'completed');
    assert.equal(registry.register(claim.owner, definition('combat.attack'), handler, validator).status, 'completed');
    assert.equal(registry.register(claim.owner, definition('combat.defend'), handler).status, 'completed');
    assert.equal(registry.size, 4);
    const record = registry.resolve('combat.attack');
    assert.equal(record.handler, handler);
    assert.equal(record.validator, validator);
    assert.equal(registry.getDefinition('combat.attack'), record.definition);
    assert.ok(Object.isFrozen(record));
    assert.equal(validateActionArguments(record.definition, {}, record.validator).status, 'completed');
});

test('rejects invalid, reserved and conflicting namespace claims', () => {
    const { registry } = ActionRegistry.create();
    for (const name of ['', 'Combat', 'combat.attack', 'combat\n', null, {}, '__proto__']) {
        assert.deepEqual(codes(registry.claimNamespace(name)), ['INVALID_NAMESPACE']);
    }
    for (const name of ['game', 'asterweave']) {
        assert.deepEqual(codes(registry.claimNamespace(name)), ['RESERVED_NAMESPACE']);
    }
    assert.equal(registry.claimNamespace('combat').status, 'completed');
    const duplicate = registry.claimNamespace('combat');
    assert.deepEqual(codes(duplicate), ['NAMESPACE_CONFLICT']);
    assert.equal(Object.hasOwn(duplicate, 'owner'), false);
    assert.equal(registry.claimNamespace('combatTools').status, 'completed');
});

test('enforces exact namespace and registry-local ownership capabilities', () => {
    const first = ActionRegistry.create();
    const second = ActionRegistry.create();
    const { registry, engineOwner, gameOwner } = first;
    const combat = registry.claimNamespace('combat').owner;
    const magic = registry.claimNamespace('magic').owner;
    const foreign = second.registry.claimNamespace('combat').owner;
    for (const [owner, type] of [
        [gameOwner, 'look'], [engineOwner, 'game.bell'], [combat, 'magic.cast'],
        [magic, 'combat.attack'], [foreign, 'combat.attack'], [Symbol('combat'), 'combat.attack'],
        [Symbol.for('combat'), 'combat.attack'], [undefined, 'unclaimed.action'],
        [engineOwner, 'unclaimed.action'], [second.engineOwner, 'look'],
        [second.gameOwner, 'game.bell'], ['combat', 'combat.attack'],
    ]) {
        assert.deepEqual(codes(registry.register(owner, definition(type), handler)), ['INVALID_REGISTRATION_OWNER']);
    }
    assert.equal(registry.size, 0);
    assert.equal(registry.register(combat, definition('combat.attack'), handler).status, 'completed');
    assert.equal(second.registry.has('combat.attack'), false);
});

test('rejects duplicate identities and preserves existing association', () => {
    const { registry, engineOwner } = ActionRegistry.create();
    assert.equal(registry.register(engineOwner, definition('look'), handler).status, 'completed');
    const before = registry.resolve('look');
    const replacement = { ...definition('look'), enabled: false };
    assert.deepEqual(codes(registry.register(engineOwner, replacement, () => {})), ['DUPLICATE_ACTION_TYPE']);
    assert.equal(registry.resolve('look'), before);
    assert.equal(registry.size, 1);
});

test('rejects invalid metadata and associations atomically', () => {
    const { registry, engineOwner } = ActionRegistry.create();
    const result = registry.register(engineOwner, { ...definition('look'), turnCostFail: -1 }, null, {});
    assert.deepEqual(codes(result), ['INVALID_TURN_COST', 'INVALID_HANDLER', 'INVALID_VALIDATOR']);
    assert.equal(registry.size, 0);
    assert.ok(Object.isFrozen(result));
    assert.ok(Object.isFrozen(result.diagnostics));
    assert.equal(registry.register(engineOwner, definition('look'), handler).status, 'completed');
});

test('returns immutable definitions and sorted independent point-in-time enumeration', () => {
    const { registry, engineOwner, gameOwner } = ActionRegistry.create();
    const input = { ...definition('look'), enabled: false, arguments: {
        target: { type: 'string', required: false, allowedValues: ['room'] },
    } };
    registry.register(engineOwner, input, handler);
    const before = registry.listDefinitions();
    input.arguments.target.allowedValues.push('other');
    registry.register(gameOwner, definition('game.bell'), handler);
    registry.register(engineOwner, definition('lieDown'), handler);
    assert.deepEqual(before.map((item) => item.type), ['look']);
    assert.deepEqual(registry.listDefinitions().map((item) => item.type), ['game.bell', 'lieDown', 'look']);
    assert.deepEqual(registry.getDefinition('look').arguments.target.allowedValues, ['room']);
    assert.equal(registry.has('look'), true);
    assert.equal(registry.getDefinition('look').enabled, false);
    assert.throws(() => registry.resolve('look').definition.arguments.target.allowedValues.push('other'), TypeError);
    assert.throws(() => { registry.resolve('look').handler = () => {}; }, TypeError);
    assert.throws(() => before.push(input), TypeError);
    for (const type of ['Look', 'look ', 'unknown', null, {}, ['look']]) {
        assert.equal(registry.has(type), false);
        assert.equal(registry.resolve(type), undefined);
        assert.equal(registry.getDefinition(type), undefined);
    }
});

test('finalization is irreversible and idempotent without inspecting later input', () => {
    const { registry, engineOwner } = ActionRegistry.create();
    registry.register(engineOwner, definition('look'), handler);
    assert.equal(registry.finalize().status, 'completed');
    assert.equal(registry.finalize().status, 'completed');
    assert.equal(registry.isFinalized, true);
    const proxy = new Proxy({}, { ownKeys() { throw new Error('Must not inspect.'); } });
    assert.deepEqual(codes(registry.register(engineOwner, proxy, handler)), ['REGISTRY_FINALIZED']);
    assert.deepEqual(codes(registry.claimNamespace('combat')), ['REGISTRY_FINALIZED']);
    assert.equal(registry.has('look'), true);
    assert.equal(registry.size, 1);
});

test('rejects identifiable asynchronous and generator associations without executing them', () => {
    const { registry, engineOwner } = ActionRegistry.create();
    let calls = 0;
    const asyncHandler = async () => { calls++; };
    const generator = function* () { calls++; };
    const asyncGenerator = async function* () { calls++; };
    for (const unsupported of [asyncHandler, generator, asyncGenerator,
        asyncHandler.bind(null), generator.bind(null), asyncGenerator.bind(null),
    ]) {
        assert.deepEqual(codes(registry.register(engineOwner, definition('look'), unsupported)),
            ['INVALID_HANDLER']);
        assert.deepEqual(codes(registry.register(engineOwner, definition('look'), handler, unsupported)),
            ['INVALID_VALIDATOR']);
    }
    assert.equal(calls, 0);
    assert.equal(registry.size, 0);
    assert.equal(registry.register(engineOwner, definition('look'), handler.bind(null), () => []).status,
        'completed');
});

test('association reflection failure releases the registry modification guard', () => {
    const { registry, engineOwner } = ActionRegistry.create();
    const error = new Error('association reflection failed');
    const proxy = new Proxy(handler, { getPrototypeOf() { throw error; } });
    assert.throws(() => registry.register(engineOwner, definition('look'), proxy),
        (caught) => caught === error);
    assert.equal(registry.size, 0);
    assert.equal(registry.register(engineOwner, definition('look'), handler).status, 'completed');
});
