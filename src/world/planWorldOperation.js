/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Validated relocation and association change planning.
 * @module world/planWorldOperation
 */

import { WorldChangePlan } from './WorldChangePlan.js';
import { WORLD_CODES as C } from './worldDiagnostics.js';
import { CONTAINMENT_RELATIONSHIPS, ASSOCIATION_RELATIONSHIPS, WORLD_ID } from './worldRelationships.js';
import { isIdentifier } from '../shared/identifiers.js';
import { validAssociationEndpoints, sharesAssociationFrame } from './associationFrame.js';

/**
 * Plans a protected world operation without mutating candidate state.
 * @param {object} state - Effective records.
 * @param {string} operation - Authorized operation.
 * @param {string} id - Subject identity.
 * @param {string} targetId - Parent or association target.
 * @param {string} relationship - Canonical relationship.
 * @returns {object} Semantic result and internal changes.
 */
export function planWorldOperation(state, operation, id, targetId, relationship) {
    if (!['relocate', 'establishAssociation', 'removeAssociation'].includes(operation)
        || !isIdentifier(id) || !isIdentifier(targetId)
        || !(operation === 'relocate' ? CONTAINMENT_RELATIONSHIPS
            : ASSOCIATION_RELATIONSHIPS).includes(relationship)) {
        throw new TypeError('Invalid world operation arguments.');
    }
    const plan = new WorldChangePlan(state);
    if ((id !== WORLD_ID && !plan.participant(id))
        || (targetId !== WORLD_ID && !plan.participant(targetId))) {
        throw new TypeError('Unknown world operation identity.');
    }
    const reason = operation === 'relocate'
        ? relocate(plan, id, targetId, relationship)
        : associate(plan, operation, id, targetId, relationship);
    const failure = reason ?? plan.validate();
    if (failure !== undefined) {
        return Object.freeze({
            result: Object.freeze({ status: 'rejected', reason: failure }),
            changes: Object.freeze([]),
        });
    }
    const changes = plan.changes();
    return Object.freeze({
        result: Object.freeze({ status: 'completed', changed: changes.length > 0 }),
        changes,
    });
}

/**
 * Proposes relocation and removes only associations invalidated by the new frame.
 * @param {WorldChangePlan} plan - Temporary proposal.
 * @param {string} id - Subject.
 * @param {string} parentId - New parent.
 * @param {string} relationship - Placement.
 * @returns {string|undefined} Rejection reason.
 */
function relocate(plan, id, parentId, relationship) {
    if (plan.participant(id)?.properties['asterweave.lifecycle'] !== 'active'
        || (parentId !== WORLD_ID
            && plan.participant(parentId)?.properties['asterweave.lifecycle'] !== 'active')) {
        return C.INVALID_CONTAINMENT;
    }
    plan.set(id, 'asterweave.containment', { parentId, relationship });
    for (const [subject, { properties }] of plan.participants) {
        const associations = properties['asterweave.associations'];
        const retained = associations.filter(({ targetId }) =>
            sharesAssociationFrame(plan.participants, subject, targetId));
        if (retained.length !== associations.length) {
            plan.set(subject, 'asterweave.associations', retained);
        }
    }
    return undefined;
}

/**
 * Proposes a directed association addition or removal.
 * @param {WorldChangePlan} plan - Temporary proposal.
 * @param {string} operation - Association operation.
 * @param {string} id - Subject.
 * @param {string} targetId - Target.
 * @param {string} relationship - Association relationship.
 * @returns {string|undefined} Rejection reason.
 */
function associate(plan, operation, id, targetId, relationship) {
    if (!validAssociationEndpoints(plan.participants, id, targetId)
        || !sharesAssociationFrame(plan.participants, id, targetId)) {
        return C.INVALID_ASSOCIATION;
    }
    const associations = plan.participant(id).properties['asterweave.associations'];
    const matches = (edge) => edge.targetId === targetId && edge.relationship === relationship;
    const exists = associations.some(matches);
    if (operation === 'establishAssociation' && !exists) {
        plan.set(id, 'asterweave.associations', [...associations, { targetId, relationship }]);
    } else if (operation === 'removeAssociation' && exists) {
        plan.set(id, 'asterweave.associations', associations.filter((edge) => !matches(edge)));
    }
    return undefined;
}
