/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Immutable baseline ownership tests.
 * @module tests/engine/state/GameBaseline
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameDefinitionValidator } from '../../../src/engine/definition/GameDefinitionValidator.js';
import { GameBaseline } from '../../../src/engine/state/GameBaseline.js';

/** @returns {object} Fresh validated effective candidate. */
function candidate() {
    const definition = JSON.parse(readFileSync(
        new URL('../../fixtures/games/state-foundation.json', import.meta.url), 'utf8',
    ));
    return new GameDefinitionValidator().validate(definition).candidate;
}

test('baseline owns detached immutable normalized state', () => {
    const input = candidate();
    const baseline = new GameBaseline(input);
    input.game.title = 'Changed';
    input.world.properties['engine.turn'] = 10;
    assert.equal(baseline.game.title, 'State Foundation');
    assert.equal(baseline.world.properties['engine.turn'], 0);
    assert.ok(Object.isFrozen(baseline.game));
    assert.ok(Object.isFrozen(baseline.world.properties));
    assert.ok(Object.isFrozen(baseline.locations));
    assert.ok(Object.isFrozen(baseline.locations[0].exits[0]));
    assert.ok(Object.isFrozen(baseline.relationships[0].from));
    const lantern = baseline.participant('brassLantern');
    assert.ok(Object.isFrozen(lantern.properties['stateFoundation.details'].colors));
    assert.throws(() => {
        lantern.properties['stateFoundation.details'].colors.push('silver');
    }, TypeError);
    assert.equal(baseline.participant('missing'), undefined);
});

test('independent baselines do not share owned records', () => {
    const input = candidate();
    const left = new GameBaseline(input);
    const right = new GameBaseline(input);
    assert.deepEqual(left.entities, right.entities);
    assert.notEqual(left.entities, right.entities);
    assert.notEqual(left.participant('apple'), right.participant('apple'));
    assert.notEqual(left.relationships[0].properties, right.relationships[0].properties);
});

test('baseline excludes runtime player records', () => {
    const input = candidate();
    input.players.push({ id: 'playerOne', properties: {} });
    assert.throws(() => new GameBaseline(input), TypeError);
});
