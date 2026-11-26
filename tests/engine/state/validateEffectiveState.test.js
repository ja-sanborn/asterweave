/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Effective structure, invariant and forward transition tests.
 * @module tests/engine/state/validateEffectiveState
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameDefinitionValidator } from '../../../src/engine/definition/GameDefinitionValidator.js';
import { validateEffectiveState, validateStateTransition } from '../../../src/engine/state/validateEffectiveState.js';
import { RuntimeState } from '../../../src/engine/state/RuntimeState.js';
import { copyJsonData } from '../../../src/engine/shared/immutableData.js';

/** @returns {object} Fresh mutable effective candidate. */
function candidate() {
    const definition = JSON.parse(readFileSync(new URL('../../fixtures/games/state-foundation.json',
        import.meta.url), 'utf8'));
    const state = new RuntimeState(new GameDefinitionValidator().validate(definition).candidate,
        { player: { id: 'player', controlledActors: ['adventurer'] } });
    return copyJsonData(state.readEffectiveState());
}

test('effective candidate validation rejects malformed protected values and domain violations', () => {
    assert.equal(validateEffectiveState(candidate(), true), true);
    for (const mutate of [
        (s) => { s.world.properties['asterweave.turn'] = -1; },
        (s) => { s.entities[0].properties['asterweave.weight'] = 0; },
        (s) => { s.entities[0].properties['asterweave.containment'] = { parentId: 'missing', relationship: 'in' }; },
        (s) => { s.players[0].properties['asterweave.controlledActors'] = ['guide', 'guide']; },
        (s) => { s.players[0].properties['asterweave.selectedActor'] = 'guide'; },
        (s) => { s.relationships[0].from.id = 'missing'; },
        (s) => { s.relationships.push(s.relationships[0]); },
        (s) => { s.locations[0].exits[0].destinationId = 'guide'; },
        (s) => { s.entities[0].properties['foreign.value'] = 1; },
    ]) {
        const state = candidate();
        mutate(state);
        assert.equal(validateEffectiveState(state), false);
    }
});

test('destroyed participants cannot resurrect during forward gameplay', () => {
    const before = candidate();
    const after = copyJsonData(before);
    before.entities[2].properties['asterweave.lifecycle'] = 'destroyed';
    delete before.entities[2].properties['asterweave.containment'];
    assert.equal(validateEffectiveState(before), true);
    assert.equal(validateEffectiveState(after), true);
    assert.equal(validateStateTransition(before, after), false);
    assert.equal(validateStateTransition(after, before), true);
});
