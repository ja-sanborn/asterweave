# Tests

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

Future runtime tests should cover valid and invalid actions, deterministic
transitions, containment and capacity, and save/restore equivalence where applicable.

The [Lantern House fixture](fixtures/games/minimal-foundation.json) follows the
[canonical game-definition contract](../docs/contracts/GAME_DEFINITIONS.md).
It is authored data for FND-05 validation/initialization, FND-07 containment and
FND-09 integration tests; it does not demonstrate implemented gameplay.

The [containment fixture](fixtures/games/containment-foundation.json) adds a single implicit World root, nested locations, safe/money, actor-in-vehicle, loaded backpack, non-containing under association, on relation and inactive/destroyed identities. Both migrated fixtures use format 3.0.0. FND-05 tests invalid roots, IDs, cycles, lifecycle, associations, physical fields and capacity; FND-07 tests descendant movement, atomic rejection, individual and aggregate limits, ancestor weight, unknown measurements and derived queries; FND-09 preserves the Lantern House route and integrates representative transfers. No production validation or gameplay is implemented by these fixtures.

The [state game fixture](fixtures/games/state-foundation.json) and [synthetic save fixture](fixtures/saves/state-foundation.json) illustrate namespaced values, directional relationship overrides, explicit removal versus null, dynamic properties, lifecycle and player control. FND-05/FND-06/FND-09 verify baseline isolation, override normalization, detached snapshots, control and transaction semantics. Phase 2 #25 verifies actual serialization/restoration; fixtures alone are not runtime tests.
