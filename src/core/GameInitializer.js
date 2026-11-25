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

/** Sequences initial candidate validation and runtime ownership. */
export class GameInitializer {
    /**
     * Validates both arguments and constructs state only if all checks succeed.
     * @param {unknown} definition - Parsed canonical game definition.
     * @param {unknown} [options] - Optional initialization configuration.
     * @returns {{state: RuntimeState|undefined, diagnostics: ReadonlyArray<object>}}
     *     Complete state or ordered validation findings; never partial state.
     */
    initialize(definition, options) {
        const validated = new GameDefinitionValidator().validate(definition);
        const configuration = validatePlayerConfiguration(options, validated.candidate);
        const diagnostics = Object.freeze([
            ...validated.diagnostics,
            ...configuration.diagnostics,
        ]);
        if (diagnostics.length !== 0) {
            return { state: undefined, diagnostics };
        }
        return {
            state: new RuntimeState(validated.candidate, configuration.options),
            diagnostics,
        };
    }
}
