/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Registry isolation and reentrant modification protection.
 * @module tests/engine/actions/actionRegistrySecurity
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { ActionRegistry } from '../../../src/engine/actions/ActionRegistry.js';

/**
 * Creates valid test metadata.
 * @param {string} type - Action identifier.
 * @returns {object} Candidate definition.
 */
function definition(type) {
    return { type, enabled: true, turnCostSuccess: 0, turnCostFail: 0, arguments: {} };
}

/** No-op trusted test handler. */
function handler() {}

test('blocks reentrant registration, namespace claims and finalization during inspection', () => {
    const { registry, engineOwner } = ActionRegistry.create();
    const nested = [];
    const proxy = new Proxy(definition('look'), {
        ownKeys(target) {
            nested.push(registry.claimNamespace('combat'));
            nested.push(registry.register(engineOwner, definition('wait'), handler));
            nested.push(registry.finalize());
            assert.equal(registry.has('look'), false);
            assert.equal(registry.size, 0);
            return Reflect.ownKeys(target);
        },
    });
    assert.equal(registry.register(engineOwner, proxy, handler).status, 'completed');
    assert.equal(nested.length, 3);
    for (const result of nested) {
        assert.equal(result.status, 'rejected');
        assert.equal(result.diagnostics[0].code, 'REGISTRY_BUSY');
    }
    assert.equal(registry.isFinalized, false);
    assert.equal(registry.has('wait'), false);
    assert.equal(registry.claimNamespace('combat').status, 'completed');
});

test('releases modification guard after reflective exceptions and rejected registrations', () => {
    const { registry, engineOwner } = ActionRegistry.create();
    const error = new Error('inspection failure');
    const proxy = new Proxy({}, { ownKeys() { throw error; } });
    assert.throws(() => registry.register(engineOwner, proxy, handler), (caught) => caught === error);
    assert.equal(registry.size, 0);
    assert.equal(registry.register(engineOwner, {}, handler).status, 'rejected');
    assert.equal(registry.register(engineOwner, definition('look'), handler).status, 'completed');
    assert.equal(registry.finalize().status, 'completed');
});

test('treats prototype-related identifiers as exact data and does not invoke getters', () => {
    const { registry, engineOwner } = ActionRegistry.create();
    const owner = registry.claimNamespace('constructor').owner;
    assert.equal(registry.register(owner, definition('constructor.toString'), handler).status, 'completed');
    assert.equal(registry.has('constructor.toString'), true);
    const input = definition('look');
    let invoked = false;
    Object.defineProperty(input, 'enabled', { enumerable: true, get() { invoked = true; return true; } });
    assert.equal(registry.register(engineOwner, input, handler).status, 'rejected');
    assert.equal(invoked, false);
    assert.equal(registry.size, 1);
    assert.equal(registry.resolve('toString'), undefined);
});

test('does not share metadata or capabilities across registries', () => {
    const first = ActionRegistry.create();
    const second = ActionRegistry.create();
    const input = definition('look');
    first.registry.register(first.engineOwner, input, handler);
    second.registry.register(second.engineOwner, input, handler);
    assert.deepEqual(first.registry.getDefinition('look'), second.registry.getDefinition('look'));
    assert.notEqual(first.registry.getDefinition('look'), second.registry.getDefinition('look'));
    first.registry.finalize();
    assert.equal(second.registry.isFinalized, false);
    assert.equal(second.registry.register(second.engineOwner, definition('wait'), handler).status, 'completed');
    assert.equal(first.registry.has('wait'), false);
});
