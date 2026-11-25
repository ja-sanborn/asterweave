/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Runtime existence and category checks for declared references.
 * @module state/resolveActionReferences
 */

/**
 * Verifies previously validated reference strings against runtime identities.
 * @param {object} state - Runtime identity collaborator.
 * @param {object} definition - Validated action metadata.
 * @param {object} args - Validated arguments.
 * @returns {boolean} Whether all declared references resolve.
 */
export function resolveActionReferences(state, definition, args) {
    for (const key of Object.keys(definition.arguments).sort()) {
        const { referenceKind } = definition.arguments[key];
        if (referenceKind === undefined || !Object.hasOwn(args, key)) {
            continue;
        }
        const id = args[key];
        if (referenceKind === 'world') {
            if (id !== 'world') {
                return false;
            }
        } else if (referenceKind === 'player') {
            if (state.player?.id !== id) {
                return false;
            }
        } else {
            const kind = state.participantKind(id);
            if (kind === undefined || (referenceKind !== 'participant' && kind !== referenceKind)) {
                return false;
            }
        }
    }
    return true;
}
