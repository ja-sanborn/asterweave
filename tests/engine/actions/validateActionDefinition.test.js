/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Action definition validation and isolation.
 * @module tests/engine/actions/validateActionDefinition
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { validateActionDefinition } from '../../../src/engine/actions/validateActionDefinition.js';

/**
 * Creates fresh valid metadata.
 * @returns {object} Candidate definition.
 */
function definition() {
    return {
        type: 'move',
        enabled: true,
        turnCostSuccess: 1,
        turnCostFail: 0,
        arguments: { direction: { type: 'string', required: true, allowedValues: ['east', 'west'] } },
    };
}

test('returns detached immutable valid definitions including explicit zero and false', () => {
    const input = definition();
    input.enabled = false;
    input.turnCostSuccess = Number.MAX_SAFE_INTEGER;
    input.turnCostFail = -0;
    const result = validateActionDefinition(input);
    assert.equal(result.status, 'completed');
    assert.deepEqual(result.diagnostics, []);
    assert.deepEqual(result.definition, input);
    input.arguments.direction.allowedValues.push('up');
    assert.deepEqual(result.definition.arguments.direction.allowedValues, ['east', 'west']);
    assert.throws(() => result.definition.arguments.direction.allowedValues.push('down'), TypeError);
    assert.throws(() => { result.definition.enabled = true; }, TypeError);
});

test('rejects all missing fields and independent metadata violations deterministically', () => {
    const missing = validateActionDefinition({});
    assert.deepEqual(missing.diagnostics.map(({ path }) => path),
        ['/type', '/enabled', '/turnCostSuccess', '/turnCostFail', '/arguments']);
    const input = { ...definition(), type: 'teleport', enabled: 1, turnCostSuccess: -1, extra: true };
    const result = validateActionDefinition(input);
    assert.equal(result.status, 'rejected');
    assert.equal(Object.hasOwn(result, 'definition'), false);
    assert.deepEqual(result.diagnostics.map(({ code, path }) => [code, path]), [
        ['UNKNOWN_FIELD', '/extra'],
        ['INVALID_ACTION_IDENTIFIER', '/type'],
        ['INVALID_TYPE', '/enabled'],
        ['INVALID_TURN_COST', '/turnCostSuccess'],
    ]);
});

test('rejects invalid costs without coercion and unsafe JSON numbers', () => {
    for (const cost of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1, '1', true, null, NaN, Infinity, undefined]) {
        for (const key of ['turnCostSuccess', 'turnCostFail']) {
            const result = validateActionDefinition({ ...definition(), [key]: cost });
            assert.equal(result.status, 'rejected');
            assert.equal(result.diagnostics[0].path, '/' + key);
        }
    }
});

test('accepts all supported argument types and reference categories', () => {
    const args = {};
    for (const type of ['string', 'number', 'integer', 'boolean', 'object', 'array', 'null']) {
        args[type] = { type, required: false };
    }
    for (const referenceKind of ['location', 'actor', 'entity', 'participant', 'world', 'player']) {
        args[referenceKind] = { type: 'string', required: true, referenceKind };
    }
    assert.equal(validateActionDefinition({ ...definition(), arguments: args }).status, 'completed');
    assert.equal(validateActionDefinition({ ...definition(), arguments: {} }).status, 'completed');
});

test('rejects malformed and contradictory argument specifications', () => {
    for (const spec of [
        null, [], {}, { type: 'string' }, { type: 'unknown', required: true },
        { type: 'number', required: 'true' }, { type: 'string', required: true, default: 'east' },
        { type: 'string', required: true, allowedValues: [] },
        { type: 'string', required: true, allowedValues: ['east', 'east'] },
        { type: 'string', required: true, allowedValues: [1] },
        { type: 'object', required: true, allowedValues: [{}] },
        { type: 'array', required: true, allowedValues: [[]] },
        { type: 'integer', required: true, allowedValues: [1.5] },
        { type: 'number', required: true, allowedValues: [0, -0] },
        { type: 'number', required: true, referenceKind: 'actor' },
        { type: 'string', required: true, referenceKind: 'topic' },
        { type: 'string', required: true, referenceKind: 'entity', allowedValues: ['world'] },
        { type: 'string', required: true, referenceKind: 'world', allowedValues: ['room'] },
    ]) {
        assert.equal(validateActionDefinition({ ...definition(), arguments: { target: spec } }).status,
            'rejected', JSON.stringify(spec));
    }
});

test('uses escaped pointers and suppresses dependent invalid-name findings', () => {
    const result = validateActionDefinition({ ...definition(), arguments: { 'bad/~': null } });
    assert.deepEqual(result.diagnostics.map(({ path }) => path), ['/arguments/bad~1~0']);
});

test('rejects unsafe data without invoking getters and propagates reflection exceptions', () => {
    const input = definition();
    let called = false;
    Object.defineProperty(input, 'enabled', { enumerable: true, get() { called = true; return true; } });
    assert.equal(validateActionDefinition(input).status, 'rejected');
    assert.equal(called, false);
    const cyclic = definition();
    cyclic.arguments.cycle = cyclic;
    assert.equal(validateActionDefinition(cyclic).status, 'rejected');
    assert.equal(validateActionDefinition({ ...definition(), handler() {} }).status, 'rejected');
    const error = new Error('inspection failure');
    const proxy = new Proxy(definition(), { ownKeys() { throw error; } });
    assert.throws(() => validateActionDefinition(proxy), (caught) => caught === error);
});

test('uses own data fields for prototype-related valid argument names', () => {
    const args = JSON.parse('{"constructor":{"type":"string","required":true}}');
    const result = validateActionDefinition({ ...definition(), arguments: args });
    assert.equal(result.status, 'completed');
    assert.equal(result.definition.arguments.constructor.type, 'string');
    assert.equal(Object.getPrototypeOf(result.definition.arguments), Object.prototype);
    assert.equal(validateActionDefinition({ ...definition(), arguments: JSON.parse('{"__proto__":{}}') }).status,
        'rejected');
});
