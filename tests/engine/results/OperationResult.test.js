/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared operation status predicates.
 * @module tests/engine/results/OperationResult
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { OperationResult } from '../../../src/engine/results/OperationResult.js';

/** Test-only specialized result for the common status contract. */
class SampleResult extends OperationResult {}

test('base result rejects direct construction and unsupported statuses', () => {
    assert.throws(() => new OperationResult('completed'), TypeError);
    for (const status of ['success', 'failure', '', null, undefined, 1]) {
        assert.throws(() => new SampleResult(status), TypeError);
    }
});

test('operation predicates derive exclusively from status', () => {
    for (const status of ['completed', 'rejected', 'error']) {
        const result = new SampleResult(status);
        assert.equal(result.status, status);
        assert.equal(result.isCompleted, status === 'completed');
        assert.equal(result.isRejected, status === 'rejected');
        assert.equal(result.isError, status === 'error');
        assert.equal(result.isSuccess, status === 'completed');
        assert.equal(result.isFailure, status !== 'completed');
        assert.throws(() => {
            result.status = 'error';
        }, TypeError);
    }
});
