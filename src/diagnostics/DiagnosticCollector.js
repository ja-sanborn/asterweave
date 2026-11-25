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
    /** @type {Array<object>} Definition findings. */
    #definition = [];
    /** @type {Array<object>} Options findings. */
    #options = [];
    /** @type {Set<string>} Exact diagnostic identities. */
    #seen = new Set();

    /**
     * Adds a structured error finding, without retaining caller-owned data.
     * @param {{source: string, code: string, severity: string,
     *     path: string, message: string}} diagnostic - Internal finding.
     * @returns {void}
     * @throws {TypeError} If the internal diagnostic contract is violated.
     */
    add(diagnostic) {
        const { source, code, severity, path, message } = diagnostic;
        if (!['definition', 'options'].includes(source)
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
        const records = source === 'definition' ? this.#definition : this.#options;
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
     * Returns an immutable detached point-in-time snapshot, definition first.
     * @returns {ReadonlyArray<object>} Ordered diagnostic findings.
     */
    snapshot() {
        return immutableCopy([...this.#definition, ...this.#options]);
    }
}
