/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Independent runtime ownership and authoritative effective reads.
 * @module state/RuntimeState
 */

import { StateTransaction } from './StateTransaction.js';
import { validateEffectiveState } from './validateEffectiveState.js';
import { GameBaseline } from './GameBaseline.js';
import { PropertyOverrideStore } from './PropertyOverrideStore.js';
import { EffectiveStateReader } from './EffectiveStateReader.js';
import { Player } from './Player.js';
import { WORLD_ID } from '../world/worldRelationships.js';
import { PARTICIPANT_CATEGORIES } from '../world/worldVocabulary.js';
import { World } from '../world/World.js';
import { areJsonValuesEqual } from '../shared/jsonEquality.js';
import { validatePlayerConfiguration } from './validatePlayerConfiguration.js';
import { immutableCopy } from '../shared/immutableData.js';

/** Owns one runtime's baseline, normalized differences and dynamic player state. */
export class RuntimeState {
    /** @type {GameBaseline} Immutable authored baseline. */
    #baseline;
    /** @type {object} Single committed state record. */
    #committed;
    /** @type {object|undefined} Original immutable player record. */
    #initialPlayer;
    /** @type {boolean} Runtime integrity status. */
    #compromised = false;
    /** @type {symbol|undefined} Runtime-local operation lease. */
    #guard;
    /** @type {StateTransaction|undefined} Active owned transaction. */
    #transaction;
    /** @type {object|undefined} Private prepared reset candidate. */
    #resetCandidate;
    /** @type {object} Detached original initialization configuration. */
    #initialOptions;
    /** @type {World} World root and stable participant registry. */
    #world;

    /**
     * Constructs initial state only after definition and configuration validation.
     * @param {object} candidate - Fully validated authored candidate.
     * @param {object} options - Validated initialization configuration.
     */
    constructor(candidate, options) {
        this.#baseline = new GameBaseline(candidate);
        this.#initialOptions = immutableCopy(options);
        this.#committed = this.#createInitialState();
        this.#initialPlayer = this.#committed.player?.record;
        const identities = Object.fromEntries(PARTICIPANT_CATEGORIES.map(({ collection }) => [
            collection, this.#baseline[collection].map((entry) => entry.id),
        ]));
        this.#world = new World(identities,
            (id) => this.readWorldProperties(id),
            (id) => this.#baseline.participant(id).exits);
        Object.freeze(this);
    }

    /** @returns {object} Immutable authored game metadata. */
    get game() {
        return this.#baseline.game;
    }

    /** @returns {World} Internal World domain root. */
    get world() {
        return this.#world;
    }

    /** @returns {object|undefined} Immutable complete player record, if configured. */
    get player() {
        this.#requireReadable();
        return this.#committed.player?.record;
    }

    /**
     * Resolves the controlling player without exposing mutable domain state.
     * @param {string} actorId - Actor identity.
     * @returns {string|undefined} Controlling player ID.
     */
    controllingPlayerId(actorId) {
        this.#requireReadable();
        const player = this.#committed.player;
        return player?.controls(actorId) ? player.id : undefined;
    }

    /** @returns {number} Authoritative World turn property. */
    get turn() {
        return this.readWorldProperties(WORLD_ID)['engine.turn'];
    }

    /** @returns {object} Detached immutable original initialization configuration. */
    get initialOptions() {
        return immutableCopy(this.#initialOptions);
    }

    /** @returns {ReadonlyArray<object>} Current normalized differences. */
    get overrides() {
        this.#requireReadable();
        return this.#committed.overrides.listOverrides();
    }

    /**
     * Reads authoritative effective world/participant properties.
     * @param {string} id - World or participant identity.
     * @returns {object|undefined} Immutable effective property map.
     */
    readWorldProperties(id) {
        this.#requireReadable();
        return this.#committed.reader.readWorldProperties(id);
    }

    /**
     * Provides an internal read-only effective record view for snapshot construction.
     * @returns {object} Effective state records; not a public detached snapshot.
     */
    readEffectiveState() {
        this.#requireReadable();
        return this.#committed.reader.readEffectiveState();
    }
    /**
     * Derives structural queries from the current committed state.
     * @returns {object} Detached world query view.
     */
    readWorldQueries() {
        this.#requireReadable();
        return this.#committed.reader.readWorldQueries();
    }

    /**
     * Reconstructs original mutable containers from immutable initialization inputs.
     * @returns {object} Independent initial state record.
     */
    #createInitialState() {
        const overrides = new PropertyOverrideStore();
        const player = Object.hasOwn(this.#initialOptions, 'player')
            ? new Player(this.#initialOptions.player) : undefined;
        const reader = new EffectiveStateReader(this.#baseline, overrides, player);
        return Object.freeze({ overrides, player, reader });
    }

    /** @throws {Error} If committed integrity cannot be established. */
    #requireReadable() {
        if (this.#compromised) {
            throw new Error('Runtime state is unavailable.');
        }
    }

    /** @returns {boolean} Whether committed integrity is established. */
    get isOperational() { return !this.#compromised; }

    /** @returns {symbol|undefined} Exclusive runtime-local operation lease. */
    acquireOperation() {
        if (this.#guard !== undefined) {
            return undefined;
        }
        this.#guard = Symbol('runtime operation');
        return this.#guard;
    }

    /**
     * Verifies current operation ownership.
     * @param {symbol} lease - Operation lease.
     */
    #requireLease(lease) {
        if (typeof lease !== 'symbol' || lease !== this.#guard) {
            throw new Error('Invalid runtime operation lease.');
        }
    }

    /**
     * Releases abandoned transaction and guard.
     * @param {symbol} lease - Operation lease.
     */
    releaseOperation(lease) {
        this.#requireLease(lease);
        this.#transaction?.discard();
        this.#transaction = undefined;
        this.#resetCandidate = undefined;
        this.#guard = undefined;
    }

    /**
     * Resolves physical participant category.
     * @param {string} id - Participant ID.
     * @returns {string|undefined} Category.
     */
    participantKind(id) { return this.#baseline.participantKind(id); }

    /**
     * Creates a single isolated action candidate.
     * @param {symbol} lease - Operation lease.
     * @returns {StateTransaction} Owned transaction.
     */
    beginTransaction(lease) {
        this.#requireLease(lease);
        this.#requireReadable();
        if (this.#transaction !== undefined || this.#resetCandidate !== undefined) {
            throw new Error('Transaction already active.');
        }
        this.#transaction = new StateTransaction(this.#baseline, this.#committed, this.#initialPlayer);
        return this.#transaction;
    }

    /**
     * Publishes only the active owned prepared transaction.
     * @param {symbol} lease - Operation lease.
     * @param {StateTransaction} transaction - Owned transaction.
     * @param {symbol} prepared - Opaque prepared publication token.
     */
    commitTransaction(lease, transaction, prepared) {
        this.#requireLease(lease);
        this.#requireReadable();
        if (transaction !== this.#transaction) {
            throw new Error('Invalid transaction owner.');
        }
        this.#committed = transaction.take(prepared);
    }

    /**
     * Marks integrity compromised after an unverifiable internal failure.
     * @param {symbol} lease - Operation lease.
     */
    markCompromised(lease) {
        this.#requireLease(lease);
        this.#compromised = true;
    }

    /**
     * Reconstructs and validates original state for administrative replacement.
     * @param {symbol} lease - Operation lease.
     * @returns {void}
     */
    prepareReset(lease) {
        this.#requireLease(lease);
        if (this.#transaction !== undefined || this.#resetCandidate !== undefined) {
            throw new Error('Runtime candidate already exists.');
        }
        // Verify retained sources before attempting an isolated reconstruction.
        try {
            const baseline = this.#baseline.readState();
            const configuration = validatePlayerConfiguration(this.#initialOptions, baseline);
            const originalPlayer = configuration.options?.player === undefined
                ? undefined : new Player(configuration.options.player).record;
            if (!validateEffectiveState(baseline, true)
                || configuration.diagnostics.length !== 0
                || !areJsonValuesEqual(configuration.options, this.#initialOptions)
                || !areJsonValuesEqual(originalPlayer, this.#initialPlayer)
                || baseline.world.properties['engine.turn'] !== 0
                || !this.#verifyIdentities()) {
                throw new Error('Original state could not be verified.');
            }
        } catch (cause) {
            this.#compromised = true;
            throw new Error('Retained state integrity could not be established.', { cause });
        }
        const prepared = this.#createInitialState();
        const view = prepared.reader.readEffectiveState();
        if (!validateEffectiveState(view, true)
            || !areJsonValuesEqual(prepared.player?.record, this.#initialPlayer)
            || prepared.reader.readWorldProperties(WORLD_ID)['engine.turn'] !== 0
            || prepared.overrides.listOverrides().length !== 0) {
            throw new Error('Invalid isolated reset candidate.');
        }
        this.#resetCandidate = prepared;
    }

    /**
     * Verifies retained baseline and World identity indexes.
     * @returns {boolean} Whether identities are consistent.
     */
    #verifyIdentities() {
        let count = 0;
        for (const { kind, collection } of PARTICIPANT_CATEGORIES) {
            for (const record of this.#baseline[collection]) {
                count++;
                const participant = this.#world.resolve(record.id);
                if (this.#baseline.participant(record.id) !== record
                    || this.#baseline.participantKind(record.id) !== kind
                    || participant?.kind !== kind || participant.id !== record.id) {
                    return false;
                }
            }
        }
        return count === this.#world.participants().length
            && this.#world.resolve(WORLD_ID) === this.#world;
    }

    /**
     * Publishes a privately prepared administrative replacement.
     * @param {symbol} lease - Current operation lease.
     */
    commitReset(lease) {
        this.#requireLease(lease);
        if (this.#resetCandidate === undefined || this.#transaction !== undefined) {
            throw new Error('No prepared reset candidate.');
        }
        this.#committed = this.#resetCandidate;
        this.#resetCandidate = undefined;
        this.#compromised = false;
    }
}
