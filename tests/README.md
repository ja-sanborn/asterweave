# Testing strategy

See the [documentation index](../docs/README.md) for the authoritative reading paths, contracts and decisions.

Run tests from the repository root with Node.js 26 LTS and its bundled npm:

```sh
npm ci
npm test
```

Run an individual test with `node --test tests/infrastructure/tooling.test.js`.
Use `node:test` and `node:assert/strict` in `*.test.js` files. Keep fixtures
separate from test cases, organize component tests under engine and future component directories as introduced, and
test hosts separately. A failing assertion must result in a nonzero exit
status. The infrastructure smoke test verifies ES module imports and native assertions,
not engine behavior. The test suite also includes domain, contract, integration and architecture tests.

## Remote branch verification

Local execution with the supported Node.js version is preferred when available. When it is unavailable, the existing Linux CI may execute npm ci and npm test after each focused commit to an authorized feature, fix, refactor or docs branch. Include applicable tests in the same increment. Match the workflow run to the exact commit SHA, verify the test job and inspect relevant logs (including test counts and failures). A missing, pending, cancelled or inaccessible run does not establish success. Resolve failed checks before advancing to the next implementation increment. Preserve existing main and pull request verification; this alternative does not authorize a PR, merge or issue closure.

## Strategy and scope

Use native Node.js tooling and the existing Linux CI configuration under [ADR 0061](../docs/decisions/0061-development-and-testing-tooling.md). No third-party testing dependencies. Apply [coding standards](../docs/CODE_STYLE.md), [public API](../docs/engine/contracts/PUBLIC_API.md), [security model](../docs/engine/contracts/SECURITY_MODEL.md) and [error handling](../docs/engine/contracts/ERROR_HANDLING.md). Test capabilities when implemented; fixtures and planned contracts do not establish passing behavior.

| Category | Purpose |
| --- | --- |
| Unit/domain | Independent types, functions and invariants |
| Contract | Documented input/output, errors and public behavior |
| Integration | Cooperation between modules |
| End-to-end | Representative complete gameplay scenarios when available |
| Negative/boundary | Invalid input, limits and expected failure |
| Regression | Reproduce and prevent known defects |
| Determinism | Equivalent inputs and actions produce equivalent observable behavior |
| Isolation | Independent runtimes and detached caller data |
| Security | Malformed data, unsafe keys, authorization and safe outputs |
| Architecture | Dependency direction, intentional public exports and platform independence |
| Host | Adapter-specific behavior and protections |

Prefer numerous focused domain and contract tests supported by integration and host tests. Measure meaningful behavioral coverage rather than require an arbitrary fixed percentage.

## Test conventions

Name tests by expected behavior; use Arrange, Act, Assert where helpful. Keep cases independent and repeatable; no dependence on test execution order, uncontrolled clocks or randomness, or external services for core tests. Create fresh state and fixtures for each case that mutates data. Cover success, rejection, failure and boundary conditions as applicable. Use lightweight native stubs, fakes, spies or selective mocks for explicit collaborators when useful; prefer observable behavior over internal call assertions. Avoid global monkey patching; do not modify native prototypes. Restore test-owned resources and collaborators after use. Test host adapters separately.

## Architectural and security verification

Native source-convention checks are implemented in [moduleBoundaries.test.js](architecture/moduleBoundaries.test.js) for relative static imports, dependency direction, cycles and prohibited dynamic imports, plus [public facade tests](engine/public/Asterweave.test.js). These checks are not a general ECMAScript parser or security sandbox. Continue reviewing platform independence and domain behavior as the runtime grows. Verify that core does not depend on hosts, validators are reusable, runtimes share no mutable state and snapshots expose no writable references. Automated checks complement review; do not claim a check exists until implemented.

Test malformed definitions/actions/saves as applicable, unsafe property keys, cycles, invalid references, overflow, authorization, safe diagnostic translation, independent diagnostic aggregation, atomic failure and deterministic behavior. Test resource handling for relevant workloads and host-specific protections separately. Use controllable time and randomness when those capabilities are introduced. Future save tests verify round trips and failed-restore atomicity rather than assuming the synthetic fixture is a working save.

The [action tests](engine/actions/ActionRegistry.test.js) verify registration, authority, immutable resolution and finalization; [security tests](engine/actions/actionRegistrySecurity.test.js) verify reentrancy and isolation. [Definition validation](engine/actions/validateActionDefinition.test.js), [argument validation](engine/actions/validateActionArguments.test.js), [identity](engine/actions/actionIdentifiers.test.js) and [standard metadata](engine/actions/standardDefinitions.test.js) tests cover the internal action contracts. [Initialization tests](engine/core/GameInitializer.test.js) verify private registry ownership and absence of production registrations. Test-only registry handlers establish registration behavior, not production navigation. Dispatch integration tests separately exercise authorized internal world operations.

## Definition of done

For each implementation story, satisfy acceptance criteria; pass relevant domain, contract and integration tests; cover applicable negative, boundary, security, atomicity, determinism and isolation cases; add regression tests where practical; review architecture and dependencies; follow coding standards and JSDoc; update contracts and documentation; preserve licenses; report actual verification results and limitations. A passing functional test alone is not completion. Do not close issues or merge without the required authorization.

## Foundation fixtures

The [Lantern House fixture](fixtures/games/minimal-foundation.json) follows the
[canonical game-definition contract](../docs/engine/contracts/GAME_DEFINITIONS.md).
It provides authored data for validation, initialization, containment and integration tests; it does not demonstrate implemented gameplay.

The [containment fixture](fixtures/games/containment-foundation.json) adds a single implicit World root, nested locations, safe/money, actor-in-vehicle, loaded backpack, non-containing under association, on relation and inactive/destroyed identities. The game fixtures follow the current canonical definition contract. Cover invalid roots, IDs, cycles, lifecycle, associations, physical fields and capacity during validation; cover descendant movement, atomic rejection, individual and aggregate limits, ancestor weight, unknown measurements and derived queries through implemented internal transfers. Preserve the Lantern House route and integrate representative transfers in gameplay tests. The game fixtures are exercised by validation, initialization and internal world-operation integration tests; production gameplay handlers remain unimplemented.

The [state game fixture](fixtures/games/state-foundation.json) and [synthetic save fixture](fixtures/saves/state-foundation.json) illustrate namespaced values, directional relationship overrides, explicit removal versus null, dynamic properties, lifecycle and player control. Test baseline isolation, initial control and detached snapshots. Extend coverage to override normalization, transaction semantics and actual serialization/restoration as those capabilities are introduced; fixtures alone are not runtime tests.

## Operation result verification

Under [ADR 0067](../docs/decisions/0067-operation-results.md), test status predicates and operation-specific invariants, controlled construction, detached recursively read-only result data and safe failure translation. For validation and initialization, verify ValidationResult.toJSON and JSON.stringify field presence/omission in all statuses, exclusion of derived predicates, and InitializationResult serialization throwing TypeError in all statuses without exposing live game state. Action execution tests must verify serialized envelope compatibility, all five inherited predicates for every status (including both completed outcomes), and ordered outputs.

## Candidate mapping verification

Verify that documented defaults and explicit equivalent authored values yield equivalent effective candidate state, mapping does not mutate input or repair invalid definitions, and standalone validation and initialization share applicable invariant checks. Test source-path translation for domain findings, invalid prerequisite suppression, invalid candidate rejection without game publication, immutable baseline finalization after successful checks, and independent domain validators that do not depend on authored JSON or persistence layouts. Runtime transactions and future restoration must reuse applicable domain invariants.

## Diagnostic source verification

Verify required source values (definition and options), identical definition source/path semantics across standalone validation and initialization, argument-relative JSON Pointer escaping and root paths, one aggregated diagnostics collection with definition findings first, deterministic within-source order, duplicate suppression, independent safe configuration checks and suppression of checks with invalid definition prerequisites. Verify serialized validation diagnostics preserve source. Action error envelopes remain unchanged.

## Effective state snapshot verification

Verify the public facade's metadata and turn-zero getters and getStateSnapshot() against the [effective state snapshot contract](../docs/engine/contracts/RUNTIME_STATE.md#effective-state-snapshot). Cover required root fields and record shapes, empty arrays, all six scopes, inactive/destroyed identities, effective defaults and qualified values, null versus absence, deterministic ID/relationship/key order, preserved semantic array order, detached recursive immutability, independent games, native JSON serialization and absence of internal state/override records or redundant derived fields. When mutations and reset are supported, verify the same snapshot interface after those operations, including point-in-time isolation, overrides and removals.

## Standard navigation verification

Verify all twelve canonical direction identifiers, duplicate direction rejection, case-sensitive matching, rejection of parser aliases and unregistered custom directions, directed exits without inferred inverses, valid location destinations and exact supported definition format acceptance. Reject unsupported definition versions rather than silently migrate them. When movement is supported, verify it uses the same vocabulary and preserves existing turn and containment semantics.

## Physical measurement range verification

Under [ADR 0060](../docs/decisions/0060-physical-properties-and-capacity.md), Verify positive safe-integer intrinsic size/weight and nonnegative safe-integer individual and cumulative limits. Cover values greater than five, maximum safe integer, zero limits, invalid zero intrinsic values, negatives, fractions, unsafe integers, nonfinite values and numeric strings. Verify omission remains unspecified or unlimited as appropriate; existing five-point definitions retain their behavior. Test inclusive individual and cumulative comparisons, unknown measurements, nested descendant weight and safe aggregation of individually valid values without overflow or rounding. Reuse these invariants when testing candidate transfers.

Also verify the closed optional player configuration (including game-owned initialProperties), explicit selection without inference, separate player identity/state, detached original configuration, registry ownership and retention of inactive/destroyed identities, domain-owned diagnostic constants and per-operation collector isolation. No custom exceptions are required; test safe operation-boundary translation of native exceptions. Cover subsequent control changes, reset and mutations when supported.

## Runtime execution verification

For dispatch and reset, verify observable property normalization and structural equality across all six scopes; control, selection and lifecycle; shared candidate invariants; deterministic rejection precedence; registered argument validation; independent runtimes; isolated staged reads and committed snapshots; atomic completion, rejection and exception paths; zero/multi-turn costs and safe-integer overflow; ordered detached outputs and audience validation; immutable ActionResult and ResetResult serialization; reset restoration and registry retention; compromised-state read protection and recovery. Cover malformed input, unsafe keys, reflective reentrancy, ownership bypass, invalid handler returns, caught programming failures and expired capabilities. Verify no public mutation or registration backdoor, no prohibited platform dependencies and no duplicate authoritative state.

Use trusted test-only handlers to exercise success, completed failure, rejection, exceptions, outputs, unauthorized mutation, nested dispatch, promises and retained contexts. Do not register placeholder production handlers. Test expected gameplay restrictions independently from unexpected candidate integrity errors. Evidence must cover acceptance criteria, public contracts and meaningful failure paths; a coverage percentage alone is insufficient. Review against [ADR 0055](../docs/decisions/0055-state-and-transactions.md) and [ADR 0068](../docs/decisions/0068-runtime-reset-and-integrity.md).

Verify initialization-only viability separately from ongoing lifecycle and forward-transition invariants; preserve initialization diagnostic order. Test malformed effective shapes, suppression of dependent cascades and independent valid-branch findings. Exercise lifecycle/control consistency using authorized trusted test-only handlers, including explicit recursive destruction and terminal transitions. Verify nonphysical directed property relationships remain independent of physical associations and containment. Assert identical property resolution across all six scopes and consumers on the same state, including removals, null, reset and candidate isolation. Test independent registration, actor-control and mutation authority, and layered reference validation (existence/category versus gameplay eligibility), including inactive targets and wrong scopes. Test simultaneous failures for deterministic precedence, safe actor/request echo and trusted-host disclosure limits. Test shared synchronous-return protection against native rejected promises, arbitrary thenables, malformed returns and expired contexts. Verify bounded recovery, retained registry and identity consistency, failed recovery with unverifiable dependencies and preservation of prior healthy state on isolated failures. No test may imply recovery repairs executable code or proves environmental integrity.

Follow the [accepted detailed runtime design](../docs/engine/RUNTIME_IMPLEMENTATION.md) for component boundaries. Verify complete before/after effective snapshots on rejection and execution error, both completed outcomes, independent candidate collection ownership, idempotent player operations, current committed reader callbacks after publication/reset, and detected expired-context violations during reflective outcome inspection (including caught violations). Late expired-context calls must not affect later transactions. Test default-deny mutation grants separately from registration ownership and actor control. Validate ordered duplicate outputs, state-dependent audience rechecks, status-specific factories and code-only reset errors. Use native component, integration and public facade tests with trusted test-only handlers; no production testing backdoors. Implement and verify cohesive dependency-ordered increments rather than deferring all testing to integration; retain actionable sequencing and CI evidence in the backlog and commit records.

## World operation verification

[World queries](engine/world/WorldQueries.test.js), [physical loads](engine/world/physicalLoads.test.js), [change proposals](engine/world/WorldChangePlan.test.js) and [dispatch integration](engine/core/worldOperations.test.js) cover deterministic derived views, checked loads, transfer and association cleanup, baseline normalization, physical mutation, lifecycle/control coordination, separate grants, malformed writes, expired capabilities, rollback, independent runtimes and reset. Deep recursive destruction testing exercises operation planning without claiming full dispatch at the same depth. Test unknown and overflow flags together and repeated rejection without retained overrides. These tests use trusted test-only handlers, not production navigation or inventory handlers.

## Planned Foundation capability verification

As the remaining Foundation capabilities are designed and implemented, add applicable observable behavior and negative-path tests for actor-scoped access and non-owning references, standard/configurable/custom actions, conditions/effects, contextual behavior, ordered events and authorized non-player actor execution. Verify no duplicate turn advancement or bypass of domain authority. Verify independent optional extension setup and omission, capability and namespace enforcement, transactional extension/random state, rollback, reset and deterministic save/restore continuation. Verify protected/unprotected packaging, public API and behavior equivalence between source and bundled engine, selective extension inclusion and offline execution. Keep game-specific policies out of mandatory core tests; use authored fixtures or minimal synthetic trusted extensions where appropriate. Verify a complete small authored game through production public interfaces. These are planned verification obligations, not claims of existing coverage. See the [roadmap](../docs/ROADMAP.md).

## Current test coverage

The native suites under engine/shared, engine/diagnostics, engine/results, engine/definition, engine/world and engine/state exercise internal domain behavior. [Public API tests](engine/public/Asterweave.test.js) and [initialization integration tests](engine/integration/initialization.test.js) exercise the supported entry point, result translation and effective snapshots. [Architecture checks](architecture/moduleBoundaries.test.js) verify the static module graph under the repository's source conventions. Consult CI and pull request records for execution results for specific commits. Tests establish internal transaction, reset and world-operation behavior, not production gameplay or save/restore support.
