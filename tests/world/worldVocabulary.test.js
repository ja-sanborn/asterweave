/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared world vocabulary and detached property read contracts.
 * @module tests/world/worldVocabulary
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { PARTICIPANT_CATEGORIES, PARTICIPANT_KINDS } from '../../src/world/worldVocabulary.js';
import {
    INTRINSIC_MEASUREMENTS, INDIVIDUAL_LIMITS, CUMULATIVE_LIMITS, PHYSICAL_MEASUREMENTS,
} from '../../src/world/physicalMeasurements.js';
import { readEffectiveProperty } from '../../src/world/readEffectiveProperty.js';

test('preserves immutable participant schema order and measurement vocabulary', () => {
    assert.deepEqual(PARTICIPANT_KINDS, ['location', 'actor', 'entity']);
    assert.deepEqual(PARTICIPANT_CATEGORIES.map(({ collection }) => collection),
        ['locations', 'actors', 'entities']);
    assert.deepEqual(PHYSICAL_MEASUREMENTS,
        ['size', 'weight', 'maxItemSize', 'maxItemWeight', 'sizeCapacity', 'weightCapacity']);
    for (const mapping of [PARTICIPANT_CATEGORIES, INDIVIDUAL_LIMITS, CUMULATIVE_LIMITS]) {
        assert.ok(Object.isFrozen(mapping));
        assert.ok(mapping.every(Object.isFrozen));
    }
    assert.ok(Object.isFrozen(INTRINSIC_MEASUREMENTS));
    assert.ok(Object.isFrozen(PHYSICAL_MEASUREMENTS));
});

test('effective property reads preserve absence, null and detached nested values', () => {
    const properties = { 'game.value': { items: [1] }, 'game.empty': null };
    assert.equal(readEffectiveProperty(properties, 'constructor'), undefined);
    assert.equal(readEffectiveProperty(properties, 'game.empty'), null);
    const value = readEffectiveProperty(properties, 'game.value');
    assert.notEqual(value, properties['game.value']);
    assert.ok(Object.isFrozen(value.items));
    properties['game.value'].items.push(2);
    assert.deepEqual(value.items, [1]);
});
