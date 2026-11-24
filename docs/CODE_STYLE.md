# Asterweave coding standards

These standards apply to JavaScript source, tests and development tooling. Platform-specific code belongs outside the runtime core. See [architecture](ARCHITECTURE.md), [ADR 0016](decisions/0016-modular-architecture-and-design-patterns.md), [contributing](../CONTRIBUTING.md) and [agent instructions](../AGENTS.md).

## Language and dependencies

- Use standard ECMAScript, native JavaScript ES modules and explicit relative import extensions such as `./WorldObject.js`.
- Keep the core independent of DOM, browser storage, Node.js APIs, networking, filesystem and operating systems. Node.js 26 and bundled npm support development and testing.
- Use no third-party runtime or development npm dependencies under current Foundation decisions. Discuss changes to dependencies or tooling before adoption.
- Prefer native language features and explicit contracts. Do not require TypeScript, transpilation, a documentation generator or a dependency injection framework.

## File organization and naming

- Organize modules by domain and responsibility rather than by technical operation alone. Use one principal domain type per JavaScript file; cohesive functional utilities may group closely related helpers.
- Use PascalCase for classes and their filenames (e.g. `WorldObject.js`), lower camel case for standalone functional module filenames (e.g. `jsonData.js`), functions, methods, properties and variables. Use descriptive English names; reserve uppercase snake case for genuine named constants where appropriate.
- Match filenames and import paths exactly, including case. Use named exports for public contracts where practical; avoid broad re-export barrels for internal modules. A public entry point may act as a facade.
- Name test files with the `.test.js` suffix and mirror runtime module organization where practical.
- Individual authored locations, actors and entities are data, not dedicated source files or classes.

## Formatting

Follow [EditorConfig](../.editorconfig): UTF-8, LF line endings, final newline, spaces, four-space JavaScript indentation and two-space JSON/YAML indentation. Markdown trailing whitespace follows its dedicated EditorConfig rule.

Use single-quoted JavaScript strings, semicolons, braces around control-flow blocks and `const` by default; use `let` when reassignment is necessary. Keep functions focused, avoid unnecessarily long expressions, and choose readable formatting over clever shorthand.

## File headers and JSDoc

Every covered JavaScript file must retain applicable copyright and license notices and begin with the MPL Exhibit A notice and SPDX identifier, followed by a JSDoc module description. For example:

```javascript
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * @fileoverview Common world-participant identity and property access.
 * @module world/WorldObject
 */
```

Use standard JSDoc documentation blocks (`/** ... */`), not XML documentation comments. Document classes, constructors, named functions and methods (including private methods), declared domain properties and fields, getters, setters and exported constants. Document important local callbacks where their contract is not evident; routine short inline expressions need not receive separate blocks.

Explain the purpose and contract, including input types, return types, optional values, exceptions where applicable, state ownership, side effects, mutation restrictions and diagnostic behavior. Use `@param`, `@returns`, `@throws`, `@type`, `@property`, `@typedef`, `@callback`, `@readonly`, `@private`, `@extends`, `@see` and `@example` as applicable. Do not claim an exception, guarantee or type constraint that the implementation does not provide. JSDoc annotations do not enforce runtime immutability or validation.

```javascript
/**
 * Determines whether a known item size satisfies an individual limit.
 *
 * Does not modify the item or parent.
 *
 * @param {number} itemSize - External size classification.
 * @param {number} maximumSize - Maximum permitted item size.
 * @returns {boolean} Whether the item satisfies the limit.
 */
export function fitsSizeLimit(itemSize, maximumSize) {
    return itemSize <= maximumSize;
}
```

Use shared JSDoc typedefs and callbacks for structured contracts and collaborator interfaces where useful. Keep public and internal documentation synchronized with implementation. Use ordinary comments to explain non-obvious decisions, invariants and algorithms, not to narrate obvious code. Avoid commented-out obsolete code.

## Domain design and dependencies

Follow [ADR 0016](decisions/0016-modular-architecture-and-design-patterns.md). Prefer high cohesion, loose coupling, composition, narrow explicit contracts, unidirectional dependencies and independent testability. Use native classes and private fields or closures for encapsulation when appropriate, shallow inheritance for genuine substitution, and pure functions for domain calculations and validation. Do not expose writable internals or introduce circular imports, global mutable state, service locators or speculative abstractions.

Supply required collaborators explicitly. Separate public facades and orchestration from domain rules. Reuse validators across initial and candidate state rather than duplicating checks or coupling domain logic to JSON field names, persistence layouts or platform APIs.

## State, validation and errors

- Preserve immutable detached definitions and a single authoritative engine-owned current state. Domain objects must not duplicate mutable placement, inventory, physical load or other state. Snapshots are detached and recursively read-only; do not freeze caller-owned input.
- Validate external data, definitions, actions and saves at their applicable boundaries. Use own data properties, safe lookup structures and explicit reference resolution; reject unsupported or executable data according to the relevant contracts.
- Never silently coerce, drop or corrupt invalid data. Return structured deterministic diagnostics for expected validation failures where the contract specifies them. Handle unexpected execution failures explicitly without leaking stacks, secrets or internal references. Do not mix definition diagnostics with gameplay action results.
- Preserve deterministic traversal, safe-integer arithmetic, lifecycle and containment invariants. Future mutations must be authorized, staged, validated and committed atomically, without partial state or turn changes.

## Testing and maintenance

Use native `node:test` and `node:assert/strict`. Test domain modules independently, positive and negative paths, deterministic behavior, state isolation and boundary conditions. Test hosts separately. Add tests and documentation with behavior changes. Use the existing `npm ci` and `npm test` workflow; report actual results and limitations.

Keep modules small and reviewable, avoid premature optimization and unnecessary abstractions, preserve license notices, and consult the relevant issue and normative contracts before changing behavior. Significant architectural changes require discussion and an ADR where appropriate. Review these standards when adding or changing source; do not introduce new tooling merely to enforce style without approval.
