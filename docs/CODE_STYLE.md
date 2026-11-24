# Asterweave coding standards

These standards apply to JavaScript source, tests and development tooling. They are the authoritative project coding conventions. See [architecture](ARCHITECTURE.md), [ADR 0016](decisions/0016-modular-architecture-and-design-patterns.md), [contributing](../CONTRIBUTING.md) and [agent instructions](../AGENTS.md). Normative engine contracts govern domain behavior.

**MUST** and **MUST NOT** denote requirements; **SHOULD** and **SHOULD NOT** denote preferred practices (justify deviations in review); **MAY** denotes a permitted choice. Imperative rules in this document are mandatory unless explicitly qualified. Examples illustrate conventions, not implemented APIs.

References: the [ECMAScript language specification](https://tc39.es/ecma262/) governs language semantics; the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html) is an informative style reference, not a binding dependency. Asterweave's adopted conventions take precedence over external style preferences.

## 1. Language and compatibility

- Use standard ECMAScript and native ES modules exclusively; modules already execute in strict mode. Do not add redundant strict-mode directives or use CommonJS in core.
- Use ratified language features supported by intended runtime environments; do not use experimental proposals. Do not permanently tie the engine to a particular ECMAScript edition.
- No TypeScript requirement, transpilation or third-party runtime or development npm dependencies under current Foundation decisions. Discuss dependency/tooling changes before adoption.
- Keep core independent of DOM, storage, Node.js APIs, networking, filesystem and operating systems. Node.js 26 and bundled npm are development tooling and may support compatible hosts.

## 2. File and directory organization

- Organize modules by domain and responsibility. One principal domain type per file; closely related private helpers or functional utilities MAY share a cohesive file.
- Class files use PascalCase (WorldObject.js); functional files use camelCase (jsonData.js). Use lowercase directory names, hyphenated where necessary. Use .js for JavaScript and .test.js for tests; mirror source domains in tests where practical.
- Match path capitalization exactly. Use UTF-8, LF and a final newline. Follow [EditorConfig](../.editorconfig).
- Authored houses, rooms, cars and other individual participants are data, not dedicated classes or files. Container capability is a property.
- Do not impose arbitrary file-length limits; split files when responsibilities cease to be cohesive.

## 3. Source file structure

Use this order where applicable: license/SPDX header; JSDoc file/module overview; imports; module constants; shared JSDoc typedefs; principal class or function; supporting private functions; separate export declarations if needed. Avoid unrelated executable initialization and import-time side effects. Keep related declarations together when necessary for clarity.

## 4. Formatting

- Four spaces per JavaScript indentation level; two spaces for JSON/YAML. No tabs. Follow EditorConfig for trailing whitespace, including its Markdown exception.
- Prefer lines of at most 100 columns; maximum 120 columns except unavoidable URLs, generated content, meaningful strings or similarly indivisible content. Break long expressions and argument lists at natural boundaries.
- Use same-line opening braces and closing braces on their own line for multiline blocks; place else and catch on the closing-brace line. Always use braces for conditional and loop bodies.
- Use semicolons, single-quoted ordinary strings, one statement per line, spaces around binary operators and after commas and control-flow keywords. Avoid padding solely for alignment.
- Require trailing commas in multiline array/object literals, import/export lists, parameter and argument lists where ECMAScript allows them. Do not put a comma after a rest parameter or in JSON where prohibited. Use blank lines to separate logical sections.

```javascript
if (isValid) {
    initialize();
} else {
    reject();
}

const physicalProperties = {
    size: 3,
    weight: 2,
    isContainer: true,
};

validateContainment(
    participant,
    parent,
    candidateState,
);
```

## 5. Naming

Use descriptive English domain names rather than type prefixes, Hungarian notation or unclear abbreviations.

| Element | Convention | Example |
| --- | --- | --- |
| Class or JSDoc named type | PascalCase | WorldObject, ValidationResult |
| Function, method, variable, parameter, property | camelCase | validateCapacity, parentId |
| Fixed meaningful constant | UPPER_SNAKE_CASE | WORLD_ID |
| Private class member | Native # syntax with camelCase | #state |
| Boolean | Prefer is/has/can or another meaningful predicate | isActive |
| Collection | Prefer plural names | participants |

## 6. Variables and scope

Use const by default and let only when reassignment is required. Never use var or implicit globals. Declare one variable per declaration where practical; minimize scope and avoid confusing shadowing. Const prevents rebinding, not mutation of referenced values. Never use shared mutable global or module-level runtime state.

## 7. Data types and equality

- Use strict equality and inequality (=== and !==); do not use loose equality or rely on implicit coercion. Use explicit validated conversion when needed.
- Use Array.isArray, Number.isFinite and Number.isSafeInteger where applicable. Do not construct primitive wrapper objects.
- Use the shared structural JSON equality contract for data comparison rather than reference equality or serialization order. Preserve array order; object member order is not semantic.
- Distinguish absence (internal undefined where permitted) from explicit null, false, zero and empty strings. Undefined is not a canonical JSON value. Use nullish defaults only when both null and undefined are intended to trigger the default.
- BigInt, Symbol, Map and Set MAY be used internally when justified; they are not canonical JSON values. Do not expose them through JSON contracts.

## 8. Classes and encapsulation

- Use native class declarations for meaningful domain types. Use native # private fields and methods to protect class internals; closures MAY encapsulate functional modules. Public fields must be intentional contract members.
- Constructors establish valid invariants; avoid unrelated side effects and calling overridable methods from constructors. Prefer factories for multi-stage validated construction.
- Prefer composition. Inheritance must be shallow and justified by genuine substitutability and shared behavior, not merely authored categories. Do not modify native prototypes or introduce deep class hierarchies.
- Static methods should be type-related. Never store shared mutable runtime state in static fields. Avoid static-only utility classes; use functions in modules instead.
- Organize members where practical: static constants/fields, instance fields, constructor, public accessors, public methods, private methods. Document public and private members with JSDoc.

## 9. Functions and methods

Use function declarations for named top-level functions, native method syntax for class behavior and arrow functions for short callbacks. Prefer pure functions for calculations and validation. Use descriptive parameters and consistent documented return contracts. Avoid mutating arguments; document intentional side effects. Prefer options objects for several optional settings and rest parameters over arguments. Do not impose arbitrary function-length or parameter-count limits; keep responsibilities focused.

```javascript
const activeActors = actors.filter(
    (actor) => actor.lifecycle === 'active',
);
```

## 10. Properties and accessors

Getters should be predictable, inexpensive and side-effect-free. Use explicitly named methods for expensive traversal or calculation. Public setters must not bypass validation or authoritative state ownership; gameplay mutations use authorized operations rather than unrestricted setters. Do not expose writable references to internal records. Read-only annotations alone do not enforce immutability.

## 11. Objects and collections

Use literals for ordinary objects and arrays, arrays for ordered values, Map for internal identity indexes, Set for uniqueness/membership and null-prototype records or other safe structures for externally keyed dictionaries. Classes encapsulate behavior where appropriate. Use own properties and avoid unsafe arbitrary-key assignment. Object.freeze is shallow and does not prevent Map.set or Set.add; encapsulate mutable collections and explicitly detach and recursively freeze snapshot data. Spread and destructuring do not deep-copy nested values.

## 12. Control flow

Always brace conditional and loop bodies. Prefer clear guard clauses and early returns; avoid excessive nesting. Prefer for...of for iterable values, indexed for loops when index control is needed, and while for condition-driven iteration. Avoid for...in for data enumeration; use own-key enumeration after validation. Switch cases terminate explicitly unless intentional fall-through is documented. Avoid nested ternaries and assignment in conditions.

## 13. Operators and expressions

Use strict equality, simple conditional expressions, and optional chaining only for legitimately optional fields; never hide missing required data. Use ?? only when nullish fallback is semantically correct. Destructuring, spread, increment/decrement and logical assignment MAY be used where clear. Use bitwise operations only for intentional bitwise behavior, not numeric validation or truncation. Avoid the comma operator.

## 14. Strings and identifiers

Use single quotes for ordinary strings and template literals for interpolation. Preserve authored Unicode text; do not silently normalize, trim or case-fold IDs, directions or namespace keys to make invalid inputs valid. Apply exact domain-specific grammar and case-sensitive matching. Escape strings appropriately at external presentation boundaries; core returns semantic data.

## 15. Numeric operations

Require finite numbers for JSON data; enforce contract-defined integer ranges, nonnegative safe integer turns and cumulative capacity limits. Check arithmetic overflow explicitly and handle division by zero when applicable. Do not use parseInt as a general input validator; validate complete numeric representations before intentional conversion. Use descriptive constants for meaningful domain values. Do not silently round a required safe-integer comparison.

## 16. ES modules and dependencies

Follow the [public API contract](contracts/PUBLIC_API.md). Only explicitly documented public interfaces carry compatibility guarantees; do not expose engine-owned construction or mutable internals through unrestricted exports. Document public compatibility changes and deprecations; internal exports do not become public merely by being exported from a module.

Use explicit relative .js extensions. Group imports consistently: external/platform imports where permitted, then internal imports, with blank lines as useful. Prefer named exports; default exports MAY be justified. Import immediate collaborators directly, avoid unnecessary internal barrels, and expose a small public facade. No circular dependencies, mutable exported globals, hidden service locators or core imports of platform adapters. Avoid import-time side effects.

## 17. Asynchronous programming

Runtime execution is synchronous by default, especially Foundation domain validation, initialization and deterministic transitions. Put asynchronous I/O primarily in hosts and adapters. Prefer async/await where asynchronous operations are required; handle rejections and avoid untracked promises. Do not introduce timers, background tasks or asynchronous gameplay transitions without accepted architectural requirements. Keep asynchronous platform concerns outside the core.

## 18. Error handling

Follow the normative [error-handling contract](contracts/ERROR_HANDLING.md) and [ADR 0017](decisions/0017-error-handling-and-diagnostics.md). Preserve operation-specific failure contracts.

| Failure | Contract |
| --- | --- |
| Invalid definition or configuration | Structured validation diagnostics |
| Invalid or unauthorized action | Rejected action result |
| Intentional gameplay failure | Completed/failure result |
| Unexpected execution failure | Safe documented error result or exception at the appropriate boundary |
| Programmer contract violation | Appropriate JavaScript exception |
| Platform failure | Host-owned handling |

- Use guard clauses and early returns for expected invalid input. Do not use exceptions for routine validation findings. Aggregate independent diagnostics deterministically; suppress dependent cascades and stop unsafe branches.
- Use domain-owned stable uppercase snake case codes. Never compare diagnostic message text for control flow. Use nonblank safe English diagnostic messages initially.
- Throw native Error objects or justified subclasses, not strings or primitives. An optional AsterweaveError base is permitted when useful; do not create a subclass for every code.
- Prefer the catch variable name `error`. Catch only at meaningful recovery or translation boundaries; otherwise let exceptions propagate. Never silently swallow errors or use empty catch blocks. Handle arbitrary thrown values safely, without assuming an Error instance.
- When wrapping an exception to add meaningful context, preserve its original value with native `cause`. Do not repeatedly wrap without purpose.
- Use `finally` for necessary cleanup; never return from it or deliberately suppress an existing exception or intended result. Design cleanup to avoid replacing the primary failure; handle cleanup failure explicitly.
- Document applicable thrown exceptions with JSDoc `@throws`, and document structured failure results, side effects and atomicity guarantees.
- Do not expose raw exception objects, causes, stacks, secrets, unsafe object representations or writable internals through public results. Translate at orchestration boundaries, not in reusable domain validators.
- Preserve committed state, turns and output boundaries on rejected/error operations; fail closed if integrity cannot be guaranteed.
- Do not use console logging for operational reporting in core. Hosts and development tools own reporting and presentation.
- Test relevant negative paths, diagnostic ordering, exception translation/chaining, isolation, safe output and atomic failure behavior.

Example of meaningful internal exception translation (illustrative, not a required API):

```javascript
try {
    performInternalOperation();
} catch (error) {
    throw new Error('Internal operation failed.', { cause: error });
}
```

## 19. File headers, documentation and comments

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

## 20. Architecture and design patterns

Follow [ADR 0016](decisions/0016-modular-architecture-and-design-patterns.md): high cohesion, loose coupling, single responsibility, substitutability, interface segregation, dependency inversion, encapsulation and composition. Supply collaborators explicitly through parameters or factories; avoid DI frameworks. Use established patterns to solve concrete problems, not speculative abstractions. Keep orchestration separate from domain logic; reuse independently testable effective-state validators across initialization and future transactions/restoration without coupling them to serialized representations.

## 21. State management and determinism

Keep authored definitions detached and immutable and current state engine-owned with one authority. Independent runtimes must share no mutable state. Expose detached recursively read-only snapshots, not live references; never freeze caller-owned input. Derive inventory, location and loads rather than storing competing authorities. Use authorized staged transactions for future mutations, validate before commit and preserve state and turns on rejection/error. Use stable code-unit ordering for identifiers/keys and preserve semantic array order. Do not use Math.random, Date.now or real-world elapsed time implicitly to decide gameplay; future randomness requires explicit engine-managed contracts and turns remain dispatcher-controlled.

## 22. Security and external data

Follow the [security model](contracts/SECURITY_MODEL.md) and its explicit trust boundaries. Validate gameplay authority independently of identifiers; do not treat semantic text as safe executable or presentation syntax. Host-specific authentication, rendering and storage protections belong outside core.

Validate definitions, actions and saves at their respective boundaries. Inspect own data descriptors and reject unsupported types, accessors, inherited application data, cycles and non-data objects according to normative contracts. Do not execute caller getters during ordinary object validation. Arbitrary Proxy traps cannot be guaranteed side-effect-free; catch inspection failures and prefer parsed JSON from loaders. Use safe indexes and copies; treat arbitrary keys as data, not prototype mutation paths. Do not substitute JSON.stringify for validation. Executable extensions are trusted code, not safe data. Never execute data as code or retain caller-owned mutable references.

## 23. Performance and resource consumption

Keep resource ownership explicit, avoid retained references and shared mutable resources, and release owned subscriptions or resources when introduced. Do not rely on garbage-collection timing. Distinguish semantic engine limits from operational host limits; introduce explicit budgets or disposal interfaces only when justified under the security model.

Favor correctness and clarity before optimization. Use iterative hierarchy traversal where depth is unbounded, explicit visited-state tracking for cycle detection, appropriate identity indexes and safe arithmetic. Bound resource consumption appropriately; avoid duplicate computations and unnecessary allocation. Add caching, pooling or concurrency only when justified by evidence and compatible with deterministic behavior and state authority.

## 24. Testing and maintenance

Follow the authoritative [testing strategy](../tests/README.md), including contract, security and architecture verification, lightweight native test doubles where useful, independent cases and implementation-story completion criteria.

Use native node:test and node:assert/strict with the existing npm ci and npm test workflow. Name tests for expected behavior; use Arrange, Act, Assert where useful. Mirror source domains, keep reusable fixtures separate, test domain modules independently and avoid external services for core tests. Cover positive and negative cases, boundaries, invariants, deterministic behavior and isolation as applicable; test hosts separately. Prefer meaningful behavioral coverage over an arbitrary fixed percentage. Report actual check results and limitations. Maintain documentation alongside behavior and preserve licensing.

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';

// Test names describe the expected behavior.
test('compares known size limits inclusively', () => {
    assert.ok(3 <= 3);
});
```

## 25. Prohibited practices

- var, implicit globals, with statements, eval and dynamic Function construction.
- Modification of native object prototypes, circular imports, shared mutable runtime singletons and hidden platform dependencies in core.
- Untrusted executable game data, unvalidated external data entering state, unauthorized direct mutation and duplicated authoritative state.
- Silently swallowed errors, undocumented public or private contracts, unapproved third-party dependencies and speculative frameworks.

## 26. Review and enforcement

EditorConfig and code review are the approved formatting enforcement mechanisms. Use the requirements in this document as review criteria; justify deviations from preferred conventions. Do not introduce lint, formatting or documentation tooling without approval. Consult the relevant issue and normative contracts before implementation; discuss significant architectural changes and record accepted ADRs. Keep source, tests and documentation aligned. These standards do not authorize new capabilities or change accepted game/save formats.
