/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Canonical action identity and catalog consistency.
 * @module tests/actions/actionIdentifiers
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    STANDARD_ACTION_TYPES,
    classifyActionType,
    isReservedActionNamespace,
    isStandardActionType,
} from '../../src/actions/actionIdentifiers.js';

test('recognizes exactly the documented standard catalog identifiers', () => {
    const catalog = readFileSync(new URL('../../docs/contracts/STANDARD_ACTIONS.md', import.meta.url), 'utf8');
    const names = [...catalog.matchAll(/^\| ([a-z][A-Za-z0-9]*) \|[^\n]*\| \d+ \| \d+ \|[^\n]*\|$/gm)]
        .map((match) => match[1]);
    assert.deepEqual([...STANDARD_ACTION_TYPES].sort(), [...names].sort());
    assert.ok(Object.isFrozen(STANDARD_ACTION_TYPES));
    assert.equal(new Set(names).size, names.length);
    for (const name of names) {
        assert.equal(isStandardActionType(name), true, name);
        assert.deepEqual(classifyActionType(name), { classification: 'standard', namespace: null });
    }
});

test('classifies exact extension and game identifiers without claiming ownership', () => {
    for (const [type, classification, namespace] of [
        ['combat.attack', 'extension', 'combat'],
        ['combat2.attackNow', 'extension', 'combat2'],
        ['game.ringBell', 'game', 'game'],
        ['gameTools.action', 'extension', 'gameTools'],
        ['constructor.toString', 'extension', 'constructor'],
        ['combat.constructor', 'extension', 'combat'],
    ]) {
        const identity = classifyActionType(type);
        assert.deepEqual(identity, { classification, namespace });
        assert.ok(Object.isFrozen(identity));
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
        assert.equal(classifyActionType(type), undefined);
        assert.equal(isStandardActionType(type), false);
    }
});

test('reserves only exact engine and game action namespace names', () => {
    assert.equal(isReservedActionNamespace('game'), true);
    assert.equal(isReservedActionNamespace('asterweave'), true);
    for (const namespace of ['gameTools', 'asterweaveTools', 'combat', 'Game', null, {}]) {
        assert.equal(isReservedActionNamespace(namespace), false);
    }
});
