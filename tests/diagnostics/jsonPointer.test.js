/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview JSON Pointer token tests.
 * @module tests/diagnostics/jsonPointer
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { appendPointer } from '../../src/diagnostics/jsonPointer.js';

test('constructs exact source-relative pointers', () => {
    assert.equal(appendPointer('', 'world'), '/world');
    assert.equal(appendPointer('/world/actors', 0), '/world/actors/0');
    assert.equal(appendPointer('', ''), '/');
    assert.equal(appendPointer('', '~/~1'), '/~0~1~01');
});
