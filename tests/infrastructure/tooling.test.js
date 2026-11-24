/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { joinWords } from '../fixtures/sample-module.js';

test('native test runner imports and exercises an ES module', () => {
    assert.equal(joinWords('Stories', 'woven'), 'Stories woven');
});
