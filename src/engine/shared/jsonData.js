/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Descriptor-based validation and isolated copying of JSON data.
 * @module shared/jsonData
 */

import { appendPointer } from '../diagnostics/jsonPointer.js';

/** @type {number} Operational allowance for additional shared-subtree value visits. */
const SHARED_EXPANSION_ALLOWANCE = 65536;

/**
 * Inspects and detaches JSON-compatible data without calling ordinary getters.
 * Object keys are visited in code-unit order and arrays in index order.
 * Shared acyclic references are copied independently within a bounded expansion allowance.
 * Cycles and disproportionate shared-subtree expansion are rejected.
 * Reflective failures propagate for operation-boundary translation.
 * @param {unknown} input - Untrusted parsed data.
 * @returns {{value: *, issues: Array<{path: string, message: string}>}}
 *     Detached value (undefined on any finding), and ordered findings.
 */
export function inspectJsonData(input) {
    const issues = [];
    const root = { value: undefined };
    const ancestors = new Set();
    const seen = new WeakSet();
    let remainingExpansion = SHARED_EXPANSION_ALLOWANCE;
    const pending = [{ input, target: root, key: 'value', path: '' }];

    while (pending.length > 0) {
        const task = pending.pop();
        if (Object.hasOwn(task, 'leave')) {
            ancestors.delete(task.leave);
            continue;
        }
        const value = task.input;
        if (value === null || typeof value === 'string' || typeof value === 'boolean'
            || (typeof value === 'number' && Number.isFinite(value))) {
            defineValue(task.target, task.key, value);
            continue;
        }
        if (typeof value !== 'object') {
            issues.push({ path: task.path, message: 'Expected JSON-compatible data.' });
            continue;
        }
        if (ancestors.has(value)) {
            issues.push({ path: task.path, message: 'Cyclic data is not permitted.' });
            continue;
        }
        const repeated = task.repeated === true || seen.has(value);
        if (repeated && !task.repeated && --remainingExpansion < 0) {
            issues.push({ path: task.path, message: 'Shared data expansion exceeds inspection allowance.' });
            break;
        }
        seen.add(value);
        const array = Array.isArray(value);
        const prototype = Object.getPrototypeOf(value);
        if ((array && prototype !== Array.prototype)
            || (!array && prototype !== Object.prototype && prototype !== null)) {
            issues.push({ path: task.path, message: 'Expected a plain data object or array.' });
            continue;
        }
        const descriptors = Object.getOwnPropertyDescriptors(value);
        const keys = Reflect.ownKeys(descriptors);
        if (keys.some((key) => typeof key === 'symbol')) {
            issues.push({ path: task.path, message: 'Symbol keys are not permitted.' });
            continue;
        }
        let orderedKeys;
        if (array) {
            const length = descriptors.length.value;
            orderedKeys = keys.filter((key) => key !== 'length');
            // Dense arrays must have exactly length own canonical index keys.
            // Inspect actual keys rather than iterating a potentially huge sparse length.
            if (orderedKeys.length !== length || orderedKeys.some((key) => {
                const index = Number(key);
                return !Number.isInteger(index) || index < 0 || index >= length
                    || String(index) !== key;
            })) {
                issues.push({ path: task.path, message: 'Expected a dense array without extra keys.' });
                continue;
            }
            orderedKeys.sort((left, right) => Number(left) - Number(right));
        } else {
            orderedKeys = keys.sort();
        }
        // Charge additional visits before allocating or scheduling a repeated subtree.
        if (repeated) {
            remainingExpansion -= orderedKeys.length;
            if (remainingExpansion < 0) {
                issues.push({ path: task.path, message: 'Shared data expansion exceeds inspection allowance.' });
                break;
            }
        }
        const copy = array ? [] : {};
        defineValue(task.target, task.key, copy);
        ancestors.add(value);
        pending.push({ leave: value });
        for (let index = orderedKeys.length - 1; index >= 0; index--) {
            const key = orderedKeys[index];
            const descriptor = descriptors[key];
            const path = appendPointer(task.path, key);
            pending.push({
                input: Object.hasOwn(descriptor, 'value') && descriptor.enumerable
                    ? descriptor.value : undefined,
                target: copy,
                key,
                path,
                repeated,
            });
        }
    }
    return { value: issues.length === 0 ? root.value : undefined, issues };
}

/**
 * Defines an own data property without invoking inherited setters.
 * @param {object} target - Engine-owned destination.
 * @param {string} key - Data key, potentially including __proto__.
 * @param {*} value - Detached value.
 * @returns {void}
 */
function defineValue(target, key, value) {
    Object.defineProperty(target, key, {
        value,
        enumerable: true,
        writable: true,
        configurable: true,
    });
}
