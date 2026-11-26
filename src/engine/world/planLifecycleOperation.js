/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Explicit world lifecycle transition planning.
 * @module world/planLifecycleOperation
 */

import { WorldChangePlan } from './WorldChangePlan.js';
import { LIFECYCLE_OPERATIONS } from './worldOperations.js';
import { cleanInvalidAssociations } from './cleanInvalidAssociations.js';
import { CONTAINMENT_RELATIONSHIPS, WORLD_ID } from './worldRelationships.js';
import { WORLD_CODES as C } from './worldDiagnostics.js';
import { isIdentifier } from '../shared/identifiers.js';

/**
 * Plans an explicit lifecycle transition without modifying the candidate.
 * @param {object} state - Current effective records.
 * @param {string} operation - Protected lifecycle operation.
 * @param {string} id - Participant identity.
 * @param {string} [parentId] - Explicit activation parent.
 * @param {string} [relationship] - Explicit activation relationship.
 * @returns {object} Validated world proposal and semantic result.
 */
export function planLifecycleOperation(state, operation, id, parentId, relationship) {
    if (!LIFECYCLE_OPERATIONS.includes(operation)
        || !isIdentifier(id)
        || (operation === 'activate'
            ? !isIdentifier(parentId) || !CONTAINMENT_RELATIONSHIPS.includes(relationship)
            : parentId !== undefined || relationship !== undefined)) {
        throw new TypeError('Invalid lifecycle operation arguments.');
    }
    const plan = new WorldChangePlan(state);
    if ((id !== WORLD_ID && !plan.participant(id))
        || (operation === 'activate' && parentId !== WORLD_ID && !plan.participant(parentId))) {
        throw new TypeError('Unknown world operation identity.');
    }
    if (id === WORLD_ID) {
        return plan.finish(C.INVALID_LIFECYCLE);
    }
    const lifecycle = plan.participant(id).properties['engine.lifecycle'];
    if (operation === 'activate') {
        return activate(plan, id, lifecycle, parentId, relationship);
    }
    const next = operation === 'deactivate' ? 'inactive' : 'destroyed';
    if (lifecycle === next) {
        return plan.finish();
    }
    if (lifecycle === 'destroyed') {
        return plan.finish(C.INVALID_LIFECYCLE);
    }
    const descendants = plan.originalDescendants(id);
    if (descendants.length > 0 && operation !== 'destroyRecursively') {
        return plan.finish(C.INVALID_LIFECYCLE);
    }
    for (const subject of [id, ...descendants]) {
        plan.set(subject, 'engine.lifecycle', next);
        plan.set(subject, 'engine.containment', undefined);
    }
    cleanInvalidAssociations(plan);
    return plan.finish();
}

/**
 * Proposes explicit placement when activating a known participant.
 * @param {WorldChangePlan} plan - Temporary proposal.
 * @param {string} id - Participant.
 * @param {string} lifecycle - Current lifecycle.
 * @param {string} parentId - Proposed immediate parent.
 * @param {string} relationship - Placement relationship.
 * @returns {object} Validated proposal or semantic rejection.
 */
function activate(plan, id, lifecycle, parentId, relationship) {
    if (lifecycle === 'destroyed') {
        return plan.finish(C.INVALID_LIFECYCLE);
    }
    if (lifecycle === 'active') {
        const placement = plan.participant(id).properties['engine.containment'];
        return plan.finish(placement.parentId === parentId && placement.relationship === relationship
            ? undefined : C.INVALID_LIFECYCLE);
    }
    plan.set(id, 'engine.lifecycle', 'active');
    plan.set(id, 'engine.containment', { parentId, relationship });
    return plan.finish();
}
