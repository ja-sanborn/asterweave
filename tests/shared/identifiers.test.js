/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Canonical identifier grammar tests.
 * @module tests/shared/identifiers
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { isIdentifier, isGameId, isQualifiedKey, isVersion } from '../../src/shared/identifiers.js';

test('accepts exact ASCII identifiers and rejects invalid boundaries', () => {
    for (const value of ['a', 'actor1', 'actorName', 'xABC']) {
        assert.equal(isIdentifier(value), true);
    }
    for (const value of ['', 'Actor', '1a', 'a-b', 'a_b', 'a\n', 'a ', 'é', null, 1]) {
        assert.equal(isIdentifier(value), false);
    }
});

test('distinguishes game IDs and qualified property keys', () => {
    assert.ok(isGameId('org.example.game'));
    assert.ok(isGameId('org.game'));
    assert.equal(isGameId('game'), false);
    assert.equal(isGameId('org..game'), false);
    assert.ok(isQualifiedKey('game.someProperty'));
    assert.equal(isQualifiedKey('game.a.b'), false);
    assert.equal(isQualifiedKey('game.'), false);
});

test('checks version grammar without numeric conversion or suffix acceptance', () => {
    for (const value of ['3.2.0', '0.0.0', '99999999999999999999999.2.3']) {
        assert.ok(isVersion(value));
    }
    for (const value of ['03.2.0', '3.2', '3.2.0\n', 'v3.2.0', '3.2.0-beta', '3.2.0 ']) {
        assert.equal(isVersion(value), false);
    }
});
