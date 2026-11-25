/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Player-domain operation tests.
 * @module tests/state/playerOperations
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { Player } from '../../src/state/Player.js';

test('player control and selection remain ordered, explicit and isolated', () => {
    const original = new Player({ id: 'player', controlledActors: ['hero'], selectedActor: 'hero' });
    const candidate = original.clone();
    const resolve = (id) => ['hero', 'guide'].includes(id)
        ? { 'asterweave.lifecycle': 'active' } : undefined;
    assert.equal(candidate.grantControl('guide', resolve), true);
    assert.equal(candidate.grantControl('guide', resolve), true);
    assert.equal(candidate.grantControl('missing', resolve), false);
    assert.deepEqual(candidate.controlledActors, ['hero', 'guide']);
    assert.equal(candidate.revokeControl('hero', resolve), true);
    assert.equal(candidate.selectedActor, undefined);
    assert.equal(candidate.selectActor('guide', resolve), true);
    candidate.clearSelection();
    assert.equal(candidate.selectedActor, undefined);
    assert.deepEqual(original.controlledActors, ['hero']);
    assert.equal(original.selectedActor, 'hero');
});

test('ordinary player values reset independently of protected control', () => {
    const player = new Player({ id: 'player', controlledActors: [] });
    player.setProperty('game.note', null);
    assert.equal(player.record.properties['game.note'], null);
    player.resetProperty('game.note', { present: false });
    assert.equal(Object.hasOwn(player.record.properties, 'game.note'), false);
    assert.throws(() => player.setProperty('asterweave.controlledActors', []), TypeError);
});

test('removing an absent ordinary property retains the immutable record', () => {
    const player = new Player({ id: 'player', controlledActors: [] });
    const before = player.record;
    player.removeProperty('game.missing');
    assert.equal(player.record, before);
});
