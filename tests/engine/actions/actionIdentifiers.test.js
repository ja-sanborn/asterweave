/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Canonical action identity and catalog consistency.
 * @module tests/engine/actions/actionIdentifiers
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    STANDARD_ACTION_TYPES,
    isStandardActionType,
} from '../../../src/engine/actions/actionIdentifiers.js';

test('recognizes exactly the documented standard catalog identifiers', () => {
    const catalog = readFileSync(new URL('../../../docs/engine/contracts/STANDARD_ACTIONS.md', import.meta.url), 'utf8');
    const names = [...catalog.matchAll(/^\| ([a-z][A-Za-z0-9]*) \|[^\n]*\| \d+ \| \d+ \|[^\n]*\|$/gm)]
        .map((match) => match[1]);
    assert.deepEqual([...STANDARD_ACTION_TYPES].sort(), [...names].sort());
    assert.ok(Object.isFrozen(STANDARD_ACTION_TYPES));
    assert.equal(new Set(names).size, names.length);
    for (const name of names) {
        assert.equal(isStandardActionType(name), true, name);
    }
});

test('rejects all qualified identifiers, including formerly supported game and extension names', () => {
    for (const type of ['combat.attack', 'combat2.attackNow', 'game.ringBell', 'gameTools.action',
        'constructor.toString', 'combat.constructor', 'asterweave.move']) {
        assert.equal(isStandardActionType(type), false);
    }
});

test('rejects malformed or unsupported identifiers without coercion', () => {
    for (const type of [
        '', 'Move', 'move ', 'move\n', 'teleport', 'constructor', 'toString',
        'combat', 'combat..attack', 'combat.melee.attack', '.attack', 'combat.',
        'Combat.attack', 'combat.Attack', 'combat.attack-now', 'combat.attack_now',
        'combat.attack\n', 'combat.é', 'asterweave.execute', '__proto__.attack',
        null, undefined, 1, {}, ['move'], Symbol('move'),
    ]) {
        assert.equal(isStandardActionType(type), false);
    }
});
