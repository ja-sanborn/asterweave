/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Validation and atomic initial runtime construction.
 * @module core/GameInitializer
 */

import { GameDefinitionValidator } from '../definition/GameDefinitionValidator.js';
import { validatePlayerConfiguration } from '../state/validatePlayerConfiguration.js';
import { RuntimeState } from '../state/RuntimeState.js';
import { ActionDispatcher } from './ActionDispatcher.js';
import { RuntimeResetter } from './RuntimeResetter.js';
import { ActionRegistry } from '../actions/ActionRegistry.js';

/** Sequences initial candidate validation and runtime ownership. */
export class GameInitializer {
    /**
     * Validates both arguments and constructs state and registry only if all checks succeed.
     * @param {unknown} definition - Parsed canonical game definition.
     * @param {unknown} [options] - Optional initialization configuration.
     * @returns {{state: RuntimeState|undefined, registry: ActionRegistry|undefined,
     *     dispatcher?: ActionDispatcher, resetter?: RuntimeResetter, diagnostics: ReadonlyArray<object>}}
     *     Complete runtime collaborators or ordered findings; never partial runtime.
     */
    initialize(definition, options) {
        const validated = new GameDefinitionValidator().validate(definition);
        const configuration = validatePlayerConfiguration(options, validated.candidate);
        const diagnostics = Object.freeze([
            ...validated.diagnostics,
            ...configuration.diagnostics,
        ]);
        if (diagnostics.length !== 0) {
            return { state: undefined, registry: undefined, diagnostics };
        }
        const state = new RuntimeState(validated.candidate, configuration.options);
        const { registry } = ActionRegistry.create();
        // Only real executable handlers may be registered in production.
        const finalized = registry.finalize();
        if (finalized.status !== 'completed') {
            throw new Error('Action registry finalization failed.');
        }
        const dispatcher = new ActionDispatcher(state, registry);
        const resetter = new RuntimeResetter(state, registry);
        return { state, registry, dispatcher, resetter, diagnostics };
    }
}
