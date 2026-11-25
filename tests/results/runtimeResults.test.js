/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Gameplay and administrative result contracts.
 * @module tests/results/runtimeResults
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { ActionResult } from '../../src/results/ActionResult.js';
import { ResetResult } from '../../src/results/ResetResult.js';

test('completed gameplay failure is successful operation and immutable detached data', () => {
    const outputs = [{ type: 'attempt.failed', audience: { scope: 'all' }, data: { value: [1] } }];
    const result = ActionResult.completed({ actorId: 'hero', outcome: 'failure',
        turnsAdvanced: 2, outputs });
    outputs[0].data.value.push(2);
    assert.ok(result.isSuccess && result.isCompleted);
    assert.equal(result.isFailure, false);
    assert.equal(result.isRejected, false);
    assert.equal(result.isError, false);
    assert.deepEqual(result.outputs[0].data.value, [1]);
    assert.throws(() => result.outputs[0].data.value.push(3), TypeError);
    assert.deepEqual(JSON.parse(JSON.stringify(result)), result.toJSON());
    assert.notEqual(result.toJSON(), result.toJSON());
});

test('action rejection and execution error never contain committed turns or outputs', () => {
    const rejected = ActionResult.rejected({ error: { code: 'ACTION_UNAVAILABLE' } });
    const error = ActionResult.error({ error: { code: 'EXECUTION_FAILED' } });
    for (const result of [rejected, error]) {
        assert.equal(result.turnsAdvanced, 0);
        assert.deepEqual(result.outputs, []);
        assert.equal(result.outcome, undefined);
        assert.ok(result.isFailure);
    }
    assert.throws(() => ActionResult.rejected({ error: { code: 'EXECUTION_FAILED' } }), TypeError);
});

test('reset results have closed code-only errors and inherited status predicates', () => {
    assert.deepEqual(ResetResult.completed().toJSON(), { status: 'completed' });
    const rejected = ResetResult.rejected({ code: 'RESET_UNAVAILABLE' });
    const error = ResetResult.error({ code: 'RESET_FAILED' });
    assert.ok(rejected.isRejected && rejected.isFailure);
    assert.ok(error.isError && error.isFailure);
    assert.deepEqual(error.toJSON(), { status: 'error', error: { code: 'RESET_FAILED' } });
    assert.throws(() => ResetResult.error({ code: 'RESET_FAILED', message: 'private' }), TypeError);
});

test('completed result rejects malformed output audiences independently of staging', () => {
    for (const audience of [{ scope: 'all', extra: true },
        { scope: 'actor', actorId: '' }, { scope: 'actors', actorIds: ['hero', 'hero'] }]) {
        assert.throws(() => ActionResult.completed({ actorId: 'hero', outcome: 'success',
            turnsAdvanced: 0, outputs: [{ type: 'test.output', audience, data: {} }] }), TypeError);
    }
});

test('action errors permit detached explicit details but reject undeclared fields', () => {
    const details = { reason: 'blocked', values: [null, 1] };
    const result = ActionResult.rejected({ error: { code: 'ACTION_UNAVAILABLE', details } });
    details.values.push(2);
    assert.deepEqual(result.error.details.values, [null, 1]);
    assert.ok(Object.isFrozen(result.error.details.values));
    assert.throws(() => ActionResult.error({ error: { code: 'EXECUTION_FAILED', stack: 'private' } }), TypeError);
    assert.throws(() => ActionResult.rejected({ error: { code: 'ACTION_UNAVAILABLE', message: 'private' } }), TypeError);
});
