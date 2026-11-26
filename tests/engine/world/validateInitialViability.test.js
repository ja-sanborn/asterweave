/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Initial viability versus ongoing lifecycle tests.
 * @module tests/engine/world/validateInitialViability
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLifecycle } from '../../../src/engine/world/validateLifecycle.js';
import { validateInitialViability } from '../../../src/engine/world/validateInitialViability.js';

test('ongoing lifecycle permits no active participants while initial viability does not', () => {
    const participants = new Map([['hero', { kind: 'actor', properties: {
        'asterweave.lifecycle': 'destroyed', 'asterweave.associations': [],
    } }]]);
    const findings = [];
    const report = (...args) => findings.push(args);
    assert.equal(validateLifecycle(participants, report).size, 0);
    assert.equal(findings.length, 0);
    validateInitialViability(participants, report);
    assert.equal(findings.length, 2);
});
