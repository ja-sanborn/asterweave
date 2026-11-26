/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Game initialization result contracts.
 * @module tests/engine/results/InitializationResult
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { InitializationResult } from '../../../src/engine/results/InitializationResult.js';

/**
 * Creates an applicable diagnostic.
 * @param {string} source - Input argument.
 * @returns {object} Fresh finding.
 */
function finding(source) {
    return {
        source,
        code: 'INVALID_VALUE',
        severity: 'error',
        path: '',
        message: 'Invalid input.',
    };
}

test('completed initialization retains a controlled usable game reference', () => {
    const game = { turn: 0 };
    const result = InitializationResult.completed(game);
    assert.ok(result.isCompleted);
    assert.equal(result.game, game);
    assert.equal(result.error, undefined);
    assert.deepEqual(result.diagnostics, []);
    assert.ok(Object.isFrozen(result));
    assert.equal(Object.isFrozen(game), false);
    assert.throws(() => {
        result.game = {};
    }, TypeError);
});

test('rejection orders both sources and never publishes a game', () => {
    const options = finding('options');
    const definition = finding('definition');
    const result = InitializationResult.rejected([options, definition, options]);
    assert.ok(result.isRejected);
    assert.equal(result.game, undefined);
    assert.equal(result.error, undefined);
    assert.deepEqual(result.diagnostics, [definition, options]);
    assert.ok(Object.isFrozen(result.diagnostics));
    assert.ok(Object.isFrozen(result.diagnostics[0]));
    definition.message = 'changed';
    assert.equal(result.diagnostics[0].message, 'Invalid input.');
});

test('execution failure exposes safe error without game or diagnostics', () => {
    const result = InitializationResult.failed(new Error('secret'));
    assert.ok(result.isError);
    assert.equal(result.game, undefined);
    assert.deepEqual(result.diagnostics, []);
    assert.deepEqual(result.error, { code: 'INITIALIZATION_FAILED' });
    assert.ok(Object.isFrozen(result.error));
});

test('every initialization status explicitly rejects serialization', () => {
    const results = [
        InitializationResult.completed({}),
        InitializationResult.rejected([finding('definition')]),
        InitializationResult.failed(),
    ];
    for (const result of results) {
        assert.throws(() => result.toJSON(), TypeError);
        assert.throws(() => JSON.stringify(result), TypeError);
    }
});

test('factory construction rejects absent game and invalid diagnostic payloads', () => {
    assert.throws(() => new InitializationResult(Symbol(), 'completed', [], {}), TypeError);
    assert.throws(() => InitializationResult.completed(), TypeError);
    assert.throws(() => InitializationResult.completed(null), TypeError);
    assert.throws(() => InitializationResult.completed(1), TypeError);
    assert.throws(() => InitializationResult.rejected([]), TypeError);
    assert.throws(() => InitializationResult.rejected([finding('save')]), TypeError);
});
