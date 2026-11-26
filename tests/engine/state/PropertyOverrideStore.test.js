/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Normalized override storage and isolation tests.
 * @module tests/engine/state/PropertyOverrideStore.test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PropertyOverrideStore } from '../../../src/engine/state/PropertyOverrideStore.js';

const absent = Object.freeze({ present: false });
const world = Object.freeze({ scope: 'world' });
const key = 'game.value';

test('normalization distinguishes null, baseline equality, removal and reset', () => {
    const store = new PropertyOverrideStore();
    const baseline = { present: true, value: { a: [1, null], b: 0 } };
    store.set(world, key, { b: -0, a: [1, null] }, baseline);
    assert.deepEqual(store.listOverrides(), []);
    store.remove(world, key, baseline);
    assert.deepEqual(store.getDifference(world, key), { present: false });
    store.set(world, key, null, baseline);
    assert.deepEqual(store.getDifference(world, key), { present: true, value: null });
    assert.deepEqual(store.listOverrides(), [{ scope: 'world', values: { [key]: null } }]);
    store.reset(world, key);
    assert.equal(store.getDifference(world, key), undefined);
    assert.deepEqual(store.listOverrides(), []);
    store.set(world, key, null, absent);
    store.remove(world, key, absent);
    assert.deepEqual(store.listOverrides(), []);
    store.remove(world, key, absent);
    assert.deepEqual(store.listOverrides(), []);
});

test('candidate clone and enumerated records are independently isolated', () => {
    const store = new PropertyOverrideStore();
    const input = { nested: [1] };
    store.set(world, key, input, absent);
    input.nested.push(2);
    const original = store.listOverrides();
    const clone = store.clone();
    clone.set(world, key, [3], absent);
    assert.deepEqual(store.getDifference(world, key).value, { nested: [1] });
    assert.deepEqual(clone.getDifference(world, key).value, [3]);
    assert.throws(() => original[0].values[key].nested.push(4), TypeError);
    clone.reset(world, key);
    assert.deepEqual(clone.listOverrides(), []);
    assert.deepEqual(store.listOverrides(), original);
});

test('typed directed endpoints and all authored override scopes remain independent', () => {
    const store = new PropertyOverrideStore();
    const actor = { scope: 'actor', id: 'hero' };
    const player = { scope: 'player', id: 'hero' };
    const forward = { scope: 'relationship', from: actor, to: player };
    const reverse = { scope: 'relationship', from: player, to: actor };
    const self = { scope: 'relationship', from: actor, to: actor };
    const addresses = [reverse, world, forward, self, actor,
        { scope: 'entity', id: 'lamp' }, { scope: 'location', id: 'room' }];
    addresses.forEach((address, index) => store.set(address, key, index, absent));
    assert.equal(store.getDifference(forward, key).value, 2);
    assert.equal(store.getDifference(reverse, key).value, 0);
    assert.equal(store.getDifference(self, key).value, 3);
    assert.deepEqual(store.listOverrides().map(({ scope }) => scope),
        ['actor', 'entity', 'location', 'relationship', 'relationship', 'relationship', 'world']);
    store.reset(forward, key);
    assert.equal(store.getDifference(reverse, key).value, 0);
    assert.equal(store.getDifference(self, key).value, 3);
    assert.throws(() => store.set(player, key, 1, absent), TypeError);
});
