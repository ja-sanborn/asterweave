/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Runtime source dependency and boundary checks.
 * @module tests/architecture/moduleBoundaries
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {string} Runtime source root. */
const ROOT = fileURLToPath(new URL('../../src/', import.meta.url));

/**
 * Enumerates JavaScript files without inspecting external directories.
 * @param {string} directory - Source directory.
 * @returns {Array<string>} Absolute source paths.
 */
function sourceFiles(directory) {
    const files = [];
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...sourceFiles(path));
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(path);
        }
    }
    return files.sort();
}

/**
 * Identifies static module specifiers using the project's import style.
 * This is a source convention check, not a general JavaScript parser.
 * @param {string} source - Module text.
 * @returns {Array<string>} Static import and re-export specifiers.
 */
function dependencies(source) {
    return [...withoutJsdoc(source).matchAll(/^(?:import|export)\s+(?:[^;]*?\sfrom\s+)?['"]([^'"]+)['"]/gm)]
        .map((match) => match[1]);
}

/**
 * Excludes standalone and inline JSDoc blocks from convention checks.
 * The checks are not a general ECMAScript lexer or security sandbox.
 * @param {string} source - Runtime module text.
 * @returns {string} Source without JSDoc type annotations.
 */
function withoutJsdoc(source) {
    return source.replace(/\/\*\*[\s\S]*?\*\//g, '');
}

test('architecture scanner distinguishes JSDoc type references from executable imports', () => {
    const documented = "/** @type {import('./example.js').Example} */\n";
    assert.doesNotMatch(withoutJsdoc(documented), /\bimport\s*\(/);
    assert.match(withoutJsdoc(documented + "const value = import('./example.js');"), /\bimport\s*\(/);
    assert.deepEqual(dependencies(documented + "import { Example } from './example.js';"), ['./example.js']);
});

/**
 * Determines a module's architectural domain.
 * @param {string} file - Absolute module path.
 * @returns {string} Domain or facade.
 */
function domain(file) {
    return relative(ROOT, file).split(/[\\/]/)[0];
}

test('core static dependencies remain relative, explicit and inside runtime source', () => {
    const files = sourceFiles(ROOT);
    const known = new Set(files);
    for (const file of files) {
        const source = readFileSync(file, 'utf8');
        assert.match(source, /SPDX-License-Identifier: MPL-2.0/);
        assert.doesNotMatch(withoutJsdoc(source), /\bimport\s*\(/, file);
        for (const dependency of dependencies(source)) {
            assert.ok(dependency.startsWith('.'), file + ': ' + dependency);
            assert.ok(dependency.endsWith('.js'), file + ': ' + dependency);
            assert.ok(known.has(resolve(dirname(file), dependency)), file + ': ' + dependency);
        }
    }
});

test('runtime static module graph is acyclic and respects domain dependency direction', () => {
    const allowed = {
        'Asterweave.js': ['core', 'definition', 'results', 'state'],
        core: ['definition', 'state', 'results', 'shared', 'diagnostics'],
        actions: ['actions', 'shared', 'diagnostics', 'world'],
        definition: ['definition', 'state', 'world', 'shared', 'diagnostics'],
        state: ['state', 'world', 'shared', 'diagnostics'],
        world: ['world', 'shared'],
        results: ['results', 'shared', 'diagnostics'],
        diagnostics: ['diagnostics', 'shared'],
        shared: ['shared', 'diagnostics'],
    };
    const graph = new Map();
    for (const file of sourceFiles(ROOT)) {
        const targets = dependencies(readFileSync(file, 'utf8'))
            .map((specifier) => resolve(dirname(file), specifier));
        graph.set(file, targets);
        for (const target of targets) {
            assert.ok(allowed[domain(file)].includes(domain(target)),
                domain(file) + ' -> ' + domain(target));
        }
    }
    const complete = new Set();
    const active = new Set();
    /**
     * Traverses the finite source graph and rejects import cycles.
     * @param {string} file - Module path.
     */
    function visit(file) {
        assert.equal(active.has(file), false, 'Dependency cycle: ' + file);
        if (complete.has(file)) {
            return;
        }
        active.add(file);
        for (const target of graph.get(file)) {
            visit(target);
        }
        active.delete(file);
        complete.add(file);
    }
    for (const file of graph.keys()) {
        visit(file);
    }
});
