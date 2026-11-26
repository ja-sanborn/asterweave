/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared physical participant categories and authored collection names.
 * @module world/worldVocabulary
 */

/** @type {ReadonlyArray<Readonly<{kind: string, collection: string}>>} Schema order. */
export const PARTICIPANT_CATEGORIES = Object.freeze([
    Object.freeze({ kind: 'location', collection: 'locations' }),
    Object.freeze({ kind: 'actor', collection: 'actors' }),
    Object.freeze({ kind: 'entity', collection: 'entities' }),
]);

/** @type {ReadonlyArray<string>} Physical participant kinds in schema order. */
export const PARTICIPANT_KINDS = Object.freeze(PARTICIPANT_CATEGORIES.map(({ kind }) => kind));
