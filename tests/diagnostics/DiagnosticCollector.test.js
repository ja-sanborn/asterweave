/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Ordered diagnostic ownership and invariants.
 * @module tests/diagnostics/DiagnosticCollector
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { DiagnosticCollector } from '../../src/diagnostics/DiagnosticCollector.js';

/**
 * Creates a fresh representative finding.
 * @param {string} source - Input argument.
 * @param {string} path - Source-relative pointer.
 * @returns {object} Finding.
 */
function finding(source, path) {
    return { source, code: 'INVALID_DATA', severity: 'error', path, message: 'Invalid data.' };
}

test('orders definition findings before options and preserves insertion order', () => {
    const collector = new DiagnosticCollector();
    collector.add(finding('options', '/player'));
    collector.add(finding('definition', '/z'));
    collector.add(finding('definition', '/a'));
    collector.add(finding('definition', '/z'));
    assert.equal(collector.size, 3);
    assert.deepEqual(collector.snapshot().map((entry) => entry.path), ['/z', '/a', '/player']);
});

test('snapshots are detached, immutable and independent of subsequent findings', () => {
    const collector = new DiagnosticCollector();
    const original = finding('definition', '');
    collector.add(original);
    original.message = 'changed';
    const snapshot = collector.snapshot();
    collector.add(finding('options', ''));
    assert.equal(snapshot.length, 1);
    assert.equal(snapshot[0].message, 'Invalid data.');
    assert.ok(Object.isFrozen(snapshot));
    assert.ok(Object.isFrozen(snapshot[0]));
    assert.notEqual(snapshot[0], collector.snapshot()[0]);
    assert.deepEqual(new DiagnosticCollector().snapshot(), []);
});

test('rejects invalid internal diagnostic fields', () => {
    const collector = new DiagnosticCollector();
    for (const changes of [
        { source: 'save' },
        { code: 'invalid' },
        { severity: 'warning' },
        { path: 'invalid' },
        { path: '/~2' },
        { message: ' ' },
    ]) {
        assert.throws(() => collector.add({ ...finding('definition', ''), ...changes }), TypeError);
    }
    assert.equal(collector.size, 0);
});
