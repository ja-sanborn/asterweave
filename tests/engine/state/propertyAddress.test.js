/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Typed address validation and equality tests.
 * @module tests/engine/state/propertyAddress.test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePropertyAddress, arePropertyAddressesEqual } from '../../../src/engine/state/propertyAddress.js';

test('closed addresses preserve typed identity and direction', () => {
    const from = { scope: 'actor', id: 'hero' };
    const to = { scope: 'player', id: 'hero' };
    const forward = validatePropertyAddress({ scope: 'relationship', from, to });
    const reverse = validatePropertyAddress({ scope: 'relationship', from: to, to: from });
    assert.equal(arePropertyAddressesEqual(forward, reverse), false);
    assert.equal(Object.isFrozen(forward.from), true);
    assert.equal(validatePropertyAddress({ scope: 'world', id: 'world' }), undefined);
    assert.equal(validatePropertyAddress({ scope: 'actor', id: 'world' }), undefined);
    assert.ok(validatePropertyAddress({ scope: 'player', id: 'world' }));
});

test('address inspection does not invoke accessors', () => {
    const input = { get scope() { assert.fail('getter invoked'); } };
    assert.equal(validatePropertyAddress(input), undefined);
});
