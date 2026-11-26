/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Standalone validation result contracts.
 * @module tests/engine/results/ValidationResult
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { ValidationResult } from '../../../src/engine/results/ValidationResult.js';

/** @returns {object} Fresh valid definition diagnostic. */
function finding() {
    return {
        source: 'definition',
        code: 'REQUIRED_FIELD',
        severity: 'error',
        path: '/game',
        message: 'Game is required.',
    };
}

test('completed validation has no diagnostics or execution error', () => {
    const result = ValidationResult.completed();
    assert.equal(result.status, 'completed');
    assert.ok(result.isSuccess);
    assert.deepEqual(result.diagnostics, []);
    assert.equal(result.error, undefined);
    assert.equal(result.valid, undefined);
    assert.deepEqual(JSON.parse(JSON.stringify(result)), {
        status: 'completed',
        diagnostics: [],
    });
});

test('rejection owns detached immutable findings and serializes a detached envelope', () => {
    const diagnostic = finding();
    const input = [diagnostic];
    const result = ValidationResult.rejected(input);
    assert.ok(result.isRejected);
    assert.ok(result.isFailure);
    assert.equal(result.error, undefined);
    assert.ok(Object.isFrozen(result));
    assert.ok(Object.isFrozen(result.diagnostics));
    assert.ok(Object.isFrozen(result.diagnostics[0]));
    diagnostic.message = 'changed';
    input.pop();
    assert.equal(result.diagnostics[0].message, 'Game is required.');
    const serialized = result.toJSON();
    assert.deepEqual(Object.keys(serialized).sort(), ['diagnostics', 'status']);
    serialized.diagnostics[0].message = 'different';
    assert.equal(result.diagnostics[0].message, 'Game is required.');
    assert.deepEqual(JSON.parse(JSON.stringify(result)), {
        status: 'rejected',
        diagnostics: [finding()],
    });
    assert.throws(() => {
        result.diagnostics = [];
    }, TypeError);
});

test('execution failure exposes only the safe operation-specific error', () => {
    const result = ValidationResult.failed(new Error('private stack'));
    assert.ok(result.isError);
    assert.deepEqual(result.diagnostics, []);
    assert.deepEqual(result.error, { code: 'VALIDATION_FAILED' });
    assert.ok(Object.isFrozen(result.error));
    assert.deepEqual(JSON.parse(JSON.stringify(result)), {
        status: 'error',
        diagnostics: [],
        error: { code: 'VALIDATION_FAILED' },
    });
    const serialized = result.toJSON();
    serialized.error.code = 'changed';
    assert.equal(result.error.code, 'VALIDATION_FAILED');
});

test('factory construction rejects inconsistent or malformed diagnostics', () => {
    assert.throws(() => new ValidationResult(Symbol(), 'completed', []), TypeError);
    assert.throws(() => ValidationResult.rejected([]), TypeError);
    assert.throws(() => ValidationResult.rejected(null), TypeError);
    assert.throws(() => ValidationResult.rejected([{ ...finding(), source: 'options' }]), TypeError);
    assert.throws(() => ValidationResult.rejected([{ ...finding(), severity: 'warning' }]), TypeError);
});
