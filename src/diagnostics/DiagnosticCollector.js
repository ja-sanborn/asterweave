/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Per-operation ordered diagnostic aggregation.
 * @module diagnostics/DiagnosticCollector
 */

import { immutableCopy } from '../shared/immutableData.js';

/**
 * Collects independent findings in caller-provided stage order within each source.
 * Each instance owns its findings and suppresses identical duplicates.
 */
export class DiagnosticCollector {
    /** @type {Map<string, Array<object>>} Findings in configured source order. */
    #records = new Map();
    /** @type {Set<string>} Exact diagnostic identities. */
    #seen = new Set();

    /**
     * Establishes the permitted sources and their diagnostic ordering.
     * @param {string[]} [sources=['definition', 'options']] - Ordered unique source names.
     * @throws {TypeError} If the internal source configuration is invalid.
     */
    constructor(sources = ['definition', 'options']) {
        if (!Array.isArray(sources) || sources.length === 0) {
            throw new TypeError('Invalid diagnostic sources.');
        }
        for (const source of sources) {
            if (typeof source !== 'string' || !/^[a-z][A-Za-z0-9]*(?![\s\S])/.test(source)
                || this.#records.has(source)) {
                throw new TypeError('Invalid diagnostic sources.');
            }
            this.#records.set(source, []);
        }
    }

    /**
     * Adds a structured error finding, without retaining caller-owned data.
     * @param {{source: string, code: string, severity: string,
     *     path: string, message: string}} diagnostic - Internal finding.
     * @returns {void}
     * @throws {TypeError} If the internal diagnostic contract is violated.
     */
    add(diagnostic) {
        const { source, code, severity, path, message } = diagnostic;
        if (!this.#records.has(source)
            || typeof code !== 'string' || !/^[A-Z][A-Z0-9_]*(?![\s\S])/.test(code)
            || severity !== 'error' || typeof path !== 'string'
            || (path !== '' && !path.startsWith('/')) || /~(?![01])/.test(path)
            || typeof message !== 'string' || message.trim().length === 0) {
            throw new TypeError('Invalid internal diagnostic.');
        }
        const identity = JSON.stringify([source, code, severity, path, message]);
        if (this.#seen.has(identity)) {
            return;
        }
        this.#seen.add(identity);
        const records = this.#records.get(source);
        records.push(Object.freeze({ source, code, severity, path, message }));
    }

    /**
     * Reports the number of distinct findings.
     * @returns {number} Current finding count.
     */
    get size() {
        return this.#seen.size;
    }

    /**
     * Returns an immutable detached point-in-time snapshot in configured source order.
     * @returns {ReadonlyArray<object>} Ordered diagnostic findings.
     */
    snapshot() {
        return immutableCopy(Array.from(this.#records.values()).flat());
    }
}
