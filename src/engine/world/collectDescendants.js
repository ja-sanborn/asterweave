/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Shared iterative containment subtree traversal.
 * @module world/collectDescendants
 */

/**
 * Collects disjoint subtree roots and descendants in deterministic ID order.
 * @param {Map} children - Validated child index.
 * @param {Iterable<string>} roots - Disjoint subtree roots.
 * @returns {ReadonlyArray<string>} Detached ordered identities.
 */
export function collectDescendants(children, roots) {
    const pending = [...roots];
    const result = [];
    while (pending.length > 0) {
        const id = pending.pop();
        result.push(id);
        for (const child of children.get(id) ?? []) {
            pending.push(child);
        }
    }
    return Object.freeze(result.sort());
}
