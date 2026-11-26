/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Registry authority, registration and lifecycle behavior.
 * @module tests/engine/actions/ActionRegistry
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { ActionRegistry } from '../../../src/engine/actions/ActionRegistry.js';
import { validateActionArguments } from '../../../src/engine/actions/validateActionArguments.js';

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
    assert.notEqual(first.registrationAuthority, second.registrationAuthority);
    assert.notEqual(first.grantAuthority, second.grantAuthority);
    assert.notEqual(first.registrationAuthority, first.grantAuthority);
    assert.deepEqual(Object.keys(first).sort(), ['grantAuthority', 'registrationAuthority', 'registry']);
    assert.equal(first.registry.size, 0);
    assert.equal(first.registry.isFinalized, false);
    assert.ok(Object.isFrozen(first));
});

test('registers catalog actions and resolves trusted associations without execution', () => {
    const { registry, registrationAuthority } = ActionRegistry.create();
    const validator = () => [];
    for (const type of ['look', 'interact', 'activate']) {
        assert.equal(registry.register(registrationAuthority, definition(type), handler).status, 'completed');
    }
    assert.equal(registry.register(registrationAuthority, definition('use'), handler, validator).status, 'completed');
    assert.equal(registry.size, 4);
    const record = registry.resolve('use');
    assert.equal(record.handler, handler);
    assert.equal(record.validator, validator);
    assert.equal(registry.getDefinition('use'), record.definition);
    assert.ok(Object.isFrozen(record));
    assert.equal(validateActionArguments(record.definition, {}, record.validator).status, 'completed');
});

test('rejects unsupported qualified action identities without namespace claims', () => {
    const { registry, registrationAuthority } = ActionRegistry.create();
    for (const type of ['game.bell', 'combat.attack', 'asterweave.move', 'constructor.toString']) {
        assert.deepEqual(codes(registry.register(registrationAuthority, definition(type), handler)),
            ['INVALID_ACTION_IDENTIFIER']);
    }
    assert.equal(registry.size, 0);
    assert.equal(registry.claimNamespace, undefined);
});

test('enforces registry-local registration capabilities independent of grant authority', () => {
    const first = ActionRegistry.create();
    const second = ActionRegistry.create();
    const { registry, registrationAuthority, grantAuthority } = first;
    for (const authority of [grantAuthority, second.registrationAuthority, second.grantAuthority,
        Symbol('registration'), Symbol.for('registration'), undefined, 'registration', null, {}]) {
        assert.deepEqual(codes(registry.register(authority, definition('look'), handler)),
            ['INVALID_REGISTRATION_AUTHORITY']);
    }
    assert.equal(registry.size, 0);
    assert.equal(registry.register(registrationAuthority, definition('look'), handler).status, 'completed');
    assert.equal(second.registry.has('look'), false);
    assert.deepEqual(codes(registry.register(grantAuthority, definition('look'), null, {})),
        ['DUPLICATE_ACTION_TYPE', 'INVALID_REGISTRATION_AUTHORITY', 'INVALID_HANDLER', 'INVALID_VALIDATOR']);
    assert.deepEqual(codes(registry.register(grantAuthority, definition('game.bell'), null)),
        ['INVALID_ACTION_IDENTIFIER', 'INVALID_HANDLER']);
});

test('rejects duplicate identities and preserves existing association', () => {
    const { registry, registrationAuthority } = ActionRegistry.create();
    assert.equal(registry.register(registrationAuthority, definition('look'), handler).status, 'completed');
    const before = registry.resolve('look');
    const replacement = { ...definition('look'), enabled: false };
    assert.deepEqual(codes(registry.register(registrationAuthority, replacement, () => {})), ['DUPLICATE_ACTION_TYPE']);
    assert.equal(registry.resolve('look'), before);
    assert.equal(registry.size, 1);
});

test('rejects invalid metadata and associations atomically', () => {
    const { registry, registrationAuthority } = ActionRegistry.create();
    const result = registry.register(registrationAuthority, { ...definition('look'), turnCostFail: -1 }, null, {});
    assert.deepEqual(codes(result), ['INVALID_TURN_COST', 'INVALID_HANDLER', 'INVALID_VALIDATOR']);
    assert.equal(registry.size, 0);
    assert.ok(Object.isFrozen(result));
    assert.ok(Object.isFrozen(result.diagnostics));
    assert.equal(registry.register(registrationAuthority, definition('look'), handler).status, 'completed');
});

test('returns immutable definitions and sorted independent point-in-time enumeration', () => {
    const { registry, registrationAuthority } = ActionRegistry.create();
    const input = { ...definition('look'), enabled: false, arguments: {
        target: { type: 'string', required: false, allowedValues: ['room'] },
    } };
    registry.register(registrationAuthority, input, handler);
    const before = registry.listDefinitions();
    input.arguments.target.allowedValues.push('other');
    registry.register(registrationAuthority, definition('interact'), handler);
    registry.register(registrationAuthority, definition('lieDown'), handler);
    assert.deepEqual(before.map((item) => item.type), ['look']);
    assert.deepEqual(registry.listDefinitions().map((item) => item.type), ['interact', 'lieDown', 'look']);
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
    const { registry, registrationAuthority } = ActionRegistry.create();
    registry.register(registrationAuthority, definition('look'), handler);
    assert.equal(registry.finalize().status, 'completed');
    assert.equal(registry.finalize().status, 'completed');
    assert.equal(registry.isFinalized, true);
    const proxy = new Proxy({}, { ownKeys() { throw new Error('Must not inspect.'); } });
    assert.deepEqual(codes(registry.register(registrationAuthority, proxy, handler)), ['REGISTRY_FINALIZED']);
    assert.equal(registry.has('look'), true);
    assert.equal(registry.size, 1);
});

test('rejects identifiable asynchronous and generator associations without executing them', () => {
    const { registry, registrationAuthority } = ActionRegistry.create();
    let calls = 0;
    const asyncHandler = async () => { calls++; };
    const generator = function* () { calls++; };
    const asyncGenerator = async function* () { calls++; };
    for (const unsupported of [asyncHandler, generator, asyncGenerator,
        asyncHandler.bind(null), generator.bind(null), asyncGenerator.bind(null),
    ]) {
        assert.deepEqual(codes(registry.register(registrationAuthority, definition('look'), unsupported)),
            ['INVALID_HANDLER']);
        assert.deepEqual(codes(registry.register(registrationAuthority, definition('look'), handler, unsupported)),
            ['INVALID_VALIDATOR']);
    }
    assert.equal(calls, 0);
    assert.equal(registry.size, 0);
    assert.equal(registry.register(registrationAuthority, definition('look'), handler.bind(null), () => []).status,
        'completed');
});

test('association reflection failure releases the registry modification guard', () => {
    const { registry, registrationAuthority } = ActionRegistry.create();
    const error = new Error('association reflection failed');
    const proxy = new Proxy(handler, { getPrototypeOf() { throw error; } });
    assert.throws(() => registry.register(registrationAuthority, definition('look'), proxy),
        (caught) => caught === error);
    assert.equal(registry.size, 0);
    assert.equal(registry.register(registrationAuthority, definition('look'), handler).status, 'completed');
});

test('mutation grants are separate from registration authority and remain valid after finalization', () => {
    const { registry, registrationAuthority, grantAuthority } = ActionRegistry.create();
    registry.register(registrationAuthority, definition('interact'), handler);
    assert.deepEqual(registry.mutationGrants('interact'), { namespaces: [], operations: [] });
    const valid = { namespaces: ['zork'], operations: ['grantControl'] };
    assert.throws(() => registry.establishMutationGrants(registrationAuthority, 'interact', valid), TypeError);
    for (const invalid of [
        { namespaces: ['engine'], operations: [] },
        { namespaces: ['zork', 'zork'], operations: [] },
        { namespaces: [], operations: ['advanceTurns'] },
        { namespaces: [], operations: [], extra: true },
    ]) {
        assert.throws(() => registry.establishMutationGrants(grantAuthority, 'interact', invalid), TypeError);
    }
    registry.establishMutationGrants(grantAuthority, 'interact', valid);
    valid.namespaces.push('other');
    assert.deepEqual(registry.mutationGrants('interact').namespaces, ['zork']);
    registry.finalize();
    assert.equal(registry.verifyIntegrity(), true);
    assert.throws(() => registry.establishMutationGrants(grantAuthority, 'interact', valid), TypeError);
});
