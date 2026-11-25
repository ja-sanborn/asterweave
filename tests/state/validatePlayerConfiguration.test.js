/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Initialization configuration validation contracts.
 * @module tests/state/validatePlayerConfiguration
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameDefinitionValidator } from '../../src/definition/GameDefinitionValidator.js';
import { validatePlayerConfiguration } from '../../src/state/validatePlayerConfiguration.js';

/** @returns {object} Fresh validated definition candidate. */
function candidate() {
    const definition = JSON.parse(readFileSync(
        new URL('../fixtures/games/state-foundation.json', import.meta.url), 'utf8',
    ));
    return new GameDefinitionValidator().validate(definition).candidate;
}

test('accepts omission, empty options and explicit zero-control player', () => {
    const state = candidate();
    assert.deepEqual(validatePlayerConfiguration(undefined, state), {
        options: {}, diagnostics: [],
    });
    assert.deepEqual(validatePlayerConfiguration({}, state).diagnostics, []);
    const options = { player: { id: 'playerOne', controlledActors: [] } };
    assert.deepEqual(validatePlayerConfiguration(options, state).options, options);
});

test('accepts ordered active controls and explicit selection with separate player identity', () => {
    const options = { player: {
        id: 'guide',
        controlledActors: ['guide', 'adventurer'],
        selectedActor: 'adventurer',
        initialProperties: { 'stateFoundation.value': null },
    } };
    const result = validatePlayerConfiguration(options, candidate());
    assert.deepEqual(result.diagnostics, []);
    assert.deepEqual(result.options, options);
    assert.notEqual(result.options.player.controlledActors, options.player.controlledActors);
});

test('rejects nonrecord, unsafe and unknown options without calling getters', () => {
    const state = candidate();
    for (const value of [null, [], 1, 'options']) {
        assert.equal(validatePlayerConfiguration(value, state).diagnostics[0].code, 'INVALID_TYPE');
    }
    let called = false;
    const unsafe = Object.defineProperty({}, 'player', {
        enumerable: true,
        get() {
            called = true;
            return {};
        },
    });
    assert.equal(validatePlayerConfiguration(unsafe, state).diagnostics[0].code, 'INVALID_DATA');
    assert.equal(called, false);
    assert.equal(validatePlayerConfiguration({ extra: 1 }, state).diagnostics[0].path, '/extra');
});

test('rejects missing player fields and invalid identity grammar', () => {
    const state = candidate();
    const result = validatePlayerConfiguration({ player: {} }, state);
    assert.deepEqual(result.diagnostics.map((item) => item.path), [
        '/player/id', '/player/controlledActors',
    ]);
    assert.equal(validatePlayerConfiguration({
        player: { id: 'Bad ID', controlledActors: [] },
    }, state).diagnostics[0].path, '/player/id');
});

test('rejects duplicate controls, unknown references and wrong categories', () => {
    const result = validatePlayerConfiguration({
        player: { id: 'playerOne', controlledActors: ['guide', 'guide', 'missing', 'cellar'] },
    }, candidate());
    assert.equal(result.options, undefined);
    assert.deepEqual(result.diagnostics.map((item) => item.code), [
        'INVALID_VALUE', 'UNKNOWN_REFERENCE', 'INVALID_REFERENCE_KIND',
    ]);
    assert.deepEqual(result.diagnostics.map((item) => item.path), [
        '/player/controlledActors/1', '/player/controlledActors/2', '/player/controlledActors/3',
    ]);
});

test('rejects control of inactive and destroyed actors', () => {
    for (const lifecycle of ['inactive', 'destroyed']) {
        const state = candidate();
        state.actors[0].properties['asterweave.lifecycle'] = lifecycle;
        const result = validatePlayerConfiguration({
            player: { id: 'playerOne', controlledActors: [state.actors[0].id] },
        }, state);
        assert.equal(result.options, undefined);
        assert.equal(result.diagnostics[0].path, '/player/controlledActors/0');
    }
});

test('rejects selection outside the controlled list and preserves omission', () => {
    const state = candidate();
    const options = { player: { id: 'playerOne', controlledActors: ['guide'] } };
    assert.equal(Object.hasOwn(validatePlayerConfiguration(options, state).options.player,
        'selectedActor'), false);
    options.player.selectedActor = 'adventurer';
    assert.equal(validatePlayerConfiguration(options, state).diagnostics[0].path,
        '/player/selectedActor');
    options.player.controlledActors = [];
    assert.equal(validatePlayerConfiguration(options, state).diagnostics[0].path,
        '/player/selectedActor');
});

test('rejects reserved, foreign and malformed player property keys', () => {
    const result = validatePlayerConfiguration({
        player: { id: 'playerOne', controlledActors: [], initialProperties: {
            'asterweave.selectedActor': 'guide',
            'foreign.value': true,
            'bad~/key': null,
        } },
    }, candidate());
    assert.deepEqual(result.diagnostics.map((item) => item.path), [
        '/player/initialProperties/asterweave.selectedActor',
        '/player/initialProperties/bad~0~1key',
        '/player/initialProperties/foreign.value',
    ]);
});

test('checks independent options with invalid definition and suppresses unavailable references', () => {
    const result = validatePlayerConfiguration({
        player: { id: 'playerOne', controlledActors: ['unknown'],
            selectedActor: 'other', initialProperties: {
                'asterweave.id': 'bad', 'foreign.value': null,
            } },
    }, undefined);
    assert.deepEqual(result.diagnostics.map((item) => item.path), [
        '/player/selectedActor', '/player/initialProperties/asterweave.id',
    ]);
    assert.ok(result.diagnostics.every((item) => item.source === 'options'));
});
