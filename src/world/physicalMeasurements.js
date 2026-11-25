/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Authoritative intrinsic and capacity measurement vocabulary.
 * @module world/physicalMeasurements
 */

/** @type {ReadonlyArray<string>} Positive intrinsic measurement fields. */
export const INTRINSIC_MEASUREMENTS = Object.freeze(['size', 'weight']);

/** @type {ReadonlyArray<Readonly<{limit: string, score: string}>>} Individual limits. */
export const INDIVIDUAL_LIMITS = Object.freeze([
    Object.freeze({ limit: 'maxItemSize', score: 'size' }),
    Object.freeze({ limit: 'maxItemWeight', score: 'weight' }),
]);

/** @type {ReadonlyArray<Readonly<{limit: string, score: string}>>} Cumulative limits. */
export const CUMULATIVE_LIMITS = Object.freeze([
    Object.freeze({ limit: 'sizeCapacity', score: 'size' }),
    Object.freeze({ limit: 'weightCapacity', score: 'weight' }),
]);

/** @type {ReadonlyArray<string>} Nonnegative measurement limit fields. */
export const MEASUREMENT_LIMITS = Object.freeze([
    ...INDIVIDUAL_LIMITS.map(({ limit }) => limit),
    ...CUMULATIVE_LIMITS.map(({ limit }) => limit),
]);

/** @type {ReadonlyArray<string>} All authored numeric physical fields. */
export const PHYSICAL_MEASUREMENTS = Object.freeze([...INTRINSIC_MEASUREMENTS, ...MEASUREMENT_LIMITS]);
