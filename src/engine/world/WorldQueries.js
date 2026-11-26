/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Point-in-time structural queries over effective containment.
 * @module world/WorldQueries
 */

import { collectDescendants } from './collectDescendants.js';
import { calculatePhysicalLoads, describeLoad } from './physicalLoads.js';
import { indexParticipants } from './indexParticipants.js';
import { validateContainment } from './validateContainment.js';
import { validateLifecycle } from './validateLifecycle.js';
import { WORLD_ID } from './worldRelationships.js';

/** Detached structural view derived from one effective state, not an authority. */
export class WorldQueries {
    /** @type {Map} Detached identity and placement records. */
    #participants = new Map();
    /** @type {Map} Validated derived parent index. */
    #parents;
    /** @type {Map} Validated derived child index. */
    #children;
    /** @type {Map} Detached checked load aggregates for this temporary view. */
    #loads;

    /**
     * Builds a temporary query view from structurally valid effective records.
     * @param {object} state - Committed or candidate effective records.
     * @throws {Error} If hierarchy or lifecycle integrity is invalid.
     */
    constructor(state) {
        const participants = indexParticipants(state);
        let valid = true;
        const report = () => { valid = false; };
        const invalid = validateLifecycle(participants, report);
        const hierarchy = validateContainment(participants, invalid, report);
        if (!valid || hierarchy.invalid.size !== 0) {
            throw new Error('Invalid effective world hierarchy.');
        }
        this.#parents = hierarchy.parents;
        this.#children = hierarchy.children;
        this.#loads = calculatePhysicalLoads(participants, hierarchy);
        for (const [id, { kind, properties }] of participants) {
            const containment = properties['engine.containment'];
            this.#participants.set(id, Object.freeze({
                kind,
                lifecycle: properties['engine.lifecycle'],
                containment: containment === undefined ? undefined : Object.freeze({
                    parentId: containment.parentId, relationship: containment.relationship,
                }),
            }));
        }
        Object.freeze(this);
    }

    /**
     * Resolves a known identity, distinguishing unknown from nonactive participants.
     * @param {string} id - World or participant identity.
     * @throws {TypeError} For unknown identity.
     */
    #requireIdentity(id) {
        if (id !== WORLD_ID && !this.#participants.has(id)) {
            throw new TypeError('Unknown world identity.');
        }
    }

    /**
     * Reads effective lifecycle, including the implicit root.
     * @param {string} id - Identity.
     * @returns {string} Lifecycle.
     */
    lifecycle(id) {
        this.#requireIdentity(id);
        return id === WORLD_ID ? 'active' : this.#participants.get(id).lifecycle;
    }

    /**
     * Returns immutable immediate containment, if placed.
     * @param {string} id - Identity.
     * @returns {object|undefined} Containment.
     */
    containment(id) {
        this.#requireIdentity(id);
        return this.#participants.get(id)?.containment;
    }

    /**
     * Returns immediate parent, if placed.
     * @param {string} id - Identity.
     * @returns {string|undefined} Parent identity.
     */
    parent(id) { return this.containment(id)?.parentId; }

    /**
     * Returns immediate children in ascending ID order.
     * @param {string} id - Identity.
     * @returns {ReadonlyArray<string>} Children.
     */
    directContents(id) {
        this.#requireIdentity(id);
        return Object.freeze([...(this.#children.get(id) ?? [])].sort());
    }

    /**
     * Returns all descendants, excluding the subject.
     * @param {string} id - Identity.
     * @returns {ReadonlyArray<string>} Descendants.
     */
    recursiveContents(id) {
        return collectDescendants(this.#children, this.directContents(id));
    }

    /**
     * Returns strict ancestry nearest first, including World where applicable.
     * @param {string} id - Identity.
     * @returns {ReadonlyArray<string>} Ancestors.
     */
    ancestors(id) {
        this.#requireIdentity(id);
        const result = [];
        let current = this.#parents.get(id);
        while (current !== undefined) {
            result.push(current);
            current = this.#parents.get(current);
        }
        return Object.freeze(result);
    }

    /**
     * Checks strict ancestry.
     * @param {string} ancestor - Potential ancestor.
     * @param {string} descendant - Potential descendant.
     * @returns {boolean} Whether ancestor strictly encloses descendant.
     */
    isAncestor(ancestor, descendant) {
        this.#requireIdentity(ancestor);
        return this.ancestors(descendant).includes(ancestor);
    }

    /**
     * Checks strict descent.
     * @param {string} descendant - Potential descendant.
     * @param {string} ancestor - Potential ancestor.
     * @returns {boolean} Whether descendant is strictly enclosed.
     */
    isDescendant(descendant, ancestor) { return this.isAncestor(ancestor, descendant); }

    /**
     * Returns all authored location ancestors, nearest first.
     * @param {string} id - Identity.
     * @returns {ReadonlyArray<string>} Location ancestry.
     */
    enclosingLocations(id) {
        return Object.freeze(this.ancestors(id).filter(
            (ancestor) => this.#participants.get(ancestor)?.kind === 'location',
        ));
    }

    /**
     * Returns nearest authored location ancestor.
     * @param {string} id - Identity.
     * @returns {string|undefined} Effective location.
     */
    effectiveLocation(id) { return this.enclosingLocations(id)[0]; }

    /**
     * Returns all participants in the specified actor containment branches.
     * @param {string} id - Actor identity.
     * @param {string[]} relationships - Branch relationships.
     * @returns {ReadonlyArray<string>} Ordered branch members.
     */
    #actorBranches(id, relationships) {
        if (this.#participants.get(id)?.kind !== 'actor') {
            throw new TypeError('Expected actor identity.');
        }
        return collectDescendants(this.#children, this.directContents(id).filter(
            (child) => relationships.includes(this.containment(child).relationship),
        ));
    }

    /**
     * Returns carried, held and worn branches including descendants.
     * @param {string} id - Actor identity.
     * @returns {ReadonlyArray<string>} Possessions.
     */
    possessions(id) { return this.#actorBranches(id, ['carried', 'held', 'worn']); }

    /**
     * Returns worn branches including descendants.
     * @param {string} id - Actor identity.
     * @returns {ReadonlyArray<string>} Equipment.
     */
    equipment(id) { return this.#actorBranches(id, ['worn']); }

    /**
     * Returns held branches including descendants.
     * @param {string} id - Actor identity.
     * @returns {ReadonlyArray<string>} Held items.
     */
    heldItems(id) { return this.#actorBranches(id, ['held']); }

    /**
     * Returns checked direct size and recursive weight, excluding the subject.
     * @param {string} id - Participant identity.
     * @returns {object|undefined} Immutable loads, absent for World and nonactive participants.
     */
    physicalLoad(id) {
        this.#requireIdentity(id);
        const load = this.#loads.get(id);
        if (load === undefined) {
            return undefined;
        }
        return Object.freeze({
            size: describeLoad(load.contentsSize),
            weight: describeLoad(load.contentsWeight),
        });
    }
}
