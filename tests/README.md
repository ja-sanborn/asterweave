# Testing strategy

See the [documentation index](../docs/README.md) for the authoritative reading paths, contracts and decisions.

Run tests from the repository root with Node.js 26 LTS and its bundled npm:

```sh
npm ci
npm test
```

Run an individual test with `node --test tests/infrastructure/tooling.test.js`.
Use `node:test` and `node:assert/strict` in `*.test.js` files. Keep fixtures
separate from test cases, mirror runtime modules as they are introduced, and
test hosts separately. A failing assertion must result in a nonzero exit
status. The current smoke test verifies ES module imports and native assertions,
not engine behavior.

## Remote branch verification

Local execution with the supported Node.js version is preferred when available. When it is unavailable, the existing Linux CI may execute npm ci and npm test after each focused commit to an authorized feature, fix, refactor or docs branch. Include applicable tests in the same increment. Match the workflow run to the exact commit SHA, verify the test job and inspect relevant logs (including test counts and failures). A missing, pending, cancelled or inaccessible run does not establish success. Resolve failed checks before advancing to the next implementation increment. Preserve existing main and pull request verification; this alternative does not authorize a PR, merge or issue closure.

## Strategy and scope

Use native Node.js tooling and the existing Linux CI configuration under [ADR 0005](../docs/decisions/0005-development-and-testing-tooling.md). No third-party testing dependencies. Apply [coding standards](../docs/CODE_STYLE.md), [public API](../docs/contracts/PUBLIC_API.md), [security model](../docs/contracts/SECURITY_MODEL.md) and [error handling](../docs/contracts/ERROR_HANDLING.md). Test capabilities when implemented; fixtures and planned contracts do not establish passing behavior.

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

Review and, where useful, add native automated checks for prohibited core platform imports, circular dependencies, dependency direction, intentional public exports and independent domain testing. Verify that core does not depend on hosts, validators are reusable, runtimes share no mutable state and snapshots expose no writable references. Automated checks complement review; do not claim a check exists until implemented.

Test malformed definitions/actions/saves as applicable, unsafe property keys, cycles, invalid references, overflow, authorization, safe diagnostic translation, independent diagnostic aggregation, atomic failure and deterministic behavior. Test resource handling for relevant workloads and host-specific protections separately. Use controllable time and randomness when those capabilities are introduced. Future save tests verify round trips and failed-restore atomicity rather than assuming the synthetic fixture is a working save.

## Definition of done

For each implementation story, satisfy acceptance criteria; pass relevant domain, contract and integration tests; cover applicable negative, boundary, security, atomicity, determinism and isolation cases; add regression tests where practical; review architecture and dependencies; follow coding standards and JSDoc; update contracts and documentation; preserve licenses; report actual verification results and limitations. A passing functional test alone is not completion. Do not close issues or merge without the required authorization.

## Foundation fixtures

The [Lantern House fixture](fixtures/games/minimal-foundation.json) follows the
[canonical game-definition contract](../docs/contracts/GAME_DEFINITIONS.md).
It is authored data for FND-05 validation/initialization, FND-07 containment and
FND-09 integration tests; it does not demonstrate implemented gameplay.

The [containment fixture](fixtures/games/containment-foundation.json) adds a single implicit World root, nested locations, safe/money, actor-in-vehicle, loaded backpack, non-containing under association, on relation and inactive/destroyed identities. Both migrated fixtures use format 3.2.0. FND-05 tests invalid roots, IDs, cycles, lifecycle, associations, physical fields and capacity; FND-07 tests descendant movement, atomic rejection, individual and aggregate limits, ancestor weight, unknown measurements and derived queries; FND-09 preserves the Lantern House route and integrates representative transfers. No production validation or gameplay is implemented by these fixtures.

The [state game fixture](fixtures/games/state-foundation.json) and [synthetic save fixture](fixtures/saves/state-foundation.json) illustrate namespaced values, directional relationship overrides, explicit removal versus null, dynamic properties, lifecycle and player control. FND-05/FND-06/FND-09 verify baseline isolation, override normalization, detached snapshots, control and transaction semantics. Phase 2 #25 verifies actual serialization/restoration; fixtures alone are not runtime tests.

## Operation result verification

Under [ADR 0020](../docs/decisions/0020-standardized-operation-result-architecture.md), test status predicates and operation-specific invariants, controlled construction, detached recursively read-only result data and safe failure translation. For FND-05 verify ValidationResult.toJSON and JSON.stringify field presence/omission in all statuses, exclusion of derived predicates, and InitializationResult serialization throwing TypeError in all statuses without exposing live game state. Future action tests verify serialized envelope compatibility and ordered outputs. These are requirements, not implemented tests.

## Candidate mapping verification

FND-05 verifies that documented defaults and explicit equivalent authored values yield equivalent effective candidate state, mapping does not mutate input or repair invalid definitions, and standalone validation and initialization share applicable invariant checks. Test source-path translation for domain findings, invalid prerequisite suppression, invalid candidate rejection without game publication, immutable baseline finalization after successful checks, and independent domain validators that do not depend on authored JSON or persistence layouts. Future transactions and restoration reuse the same domain invariants. These are verification requirements, not implemented tests.

## Diagnostic source verification

FND-05 verifies required source values (definition and options), identical definition source/path semantics across standalone validation and initialization, argument-relative JSON Pointer escaping and root paths, one aggregated diagnostics collection with definition findings first, deterministic within-source order, duplicate suppression, independent safe configuration checks and suppression of checks with invalid definition prerequisites. Verify serialized validation diagnostics preserve source. Action error envelopes remain unchanged. These are test requirements, not implemented tests.

## Effective state snapshot verification

FND-05 verifies the public facade's metadata and turn-zero getters and getStateSnapshot() against the [effective state snapshot contract](../docs/contracts/RUNTIME_STATE.md#effective-state-snapshot). Cover required root fields and record shapes, empty arrays, all six scopes, inactive/destroyed identities, effective defaults and qualified values, null versus absence, deterministic ID/relationship/key order, preserved semantic array order, detached recursive immutability, independent games, native JSON serialization and absence of internal state/override records or redundant derived fields. FND-06 verifies the same snapshot interface after committed mutations and reset, including point-in-time isolation, overrides and removals. These are verification requirements, not implemented tests.

## Standard navigation verification

FND-05 verifies all twelve canonical direction identifiers, duplicate direction rejection, case-sensitive matching, rejection of parser aliases and unregistered custom directions, directed exits without inferred inverses, valid location destinations and exact definition format 3.2.0 acceptance. Reject unsupported 3.0.0 and 3.1.0 rather than silently migrate them. FND-08 verifies movement uses the same vocabulary and preserves existing turn and containment semantics. These are verification requirements, not implemented tests.

## Physical measurement range verification

Under [ADR 0022](../docs/decisions/0022-flexible-physical-measurement-ranges.md), FND-05 verifies positive safe-integer intrinsic size/weight and nonnegative safe-integer individual and cumulative limits. Cover values greater than five, maximum safe integer, zero limits, invalid zero intrinsic values, negatives, fractions, unsafe integers, nonfinite values and numeric strings. Verify omission remains unspecified or unlimited as appropriate; existing five-point definitions retain their behavior. Test inclusive individual and cumulative comparisons, unknown measurements, nested descendant weight and safe aggregation of individually valid values without overflow or rounding. FND-07 reuses these invariants for candidate transfers. These are verification requirements, not implemented tests.

FND-05 also verifies the closed optional player configuration (including game-owned initialProperties), explicit selection without inference, separate player identity/state, detached original configuration, registry ownership and retention of inactive/destroyed identities, domain-owned diagnostic constants and per-operation collector isolation. No custom exceptions are required; test safe operation-boundary translation of native exceptions. FND-06 owns subsequent control changes, reset and mutation tests.
