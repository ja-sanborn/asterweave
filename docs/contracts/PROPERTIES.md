# Namespaced properties

Status: Accepted contract. See [ADR 0013](../decisions/0013-namespaced-properties-and-runtime-state.md), [runtime state](RUNTIME_STATE.md) and [save data](SAVE_DATA.md).

## Ownership and values

A qualified key has exactly one dot separating namespace and property name. Each segment matches `[a-z][A-Za-z0-9]*` in full, case-sensitively; no trimming or coercion. Prefer lower camel case. Asterweave owns reserved namespace asterweave. The required game.namespace is a stable machine name independent of title, e.g. zork; extensions use their own stable machine name. A runtime must reject duplicate namespace ownership, including game/extension collisions and attempts to claim asterweave. Only namespaces actually available in that runtime are valid. Foundation supports the game and core namespaces; extension registration/requirements and executable behavior are later contracts, not arbitrary JSON code. Property namespace ownership is independent of action namespace ownership. The reserved action namespace game is not an alias for the authored game.namespace, and claiming an action namespace does not grant property access or ownership. See [action definitions](ACTION_DEFINITIONS.md). Namespaces are not an authentication or sandbox mechanism.

The defining component establishes meaning, validation, defaults and mutability; only engine properties require explicit engine declarations. Games/extensions may establish additional properties at runtime without a universal declaration schema. Their logic requests updates through common engine transactions, not independent persistence or direct writable references. Unknown game properties are permitted within the game namespace; unknown reserved engine keys are not. Future trusted extension handlers/validators may be registered explicitly; no loading code from property values.

Values support booleans, finite numbers, strings, dense arrays, plain data objects and null. Reject non-JSON data, cycles, accessors, inherited values, executable code and platform objects under [definition data rules](GAME_DEFINITIONS.md). Treat keys as data, not paths; safe lookup/copy prevents prototype mutation. Copy input values, including nested values; do not retain caller-owned mutable references. Null differs from absence. No implicit conversion. Nested object keys are ordinary JSON data, not qualified property keys.

## Authored baseline

Canonical format 3.0.0 introduced (retained in 3.2.0) required game.namespace and optional initialProperties maps to world and each authored participant; optional world.initialRelationships supplies directed initial relationship properties. Maps contain qualified game-owned keys (and registered extension keys when supported), never asterweave keys. Omitted map means empty. No generic property-declaration or arbitrary extension section. Structural fields remain the sole authored source of engine values, mapped as follows:

| Engine property (asterweave prefix) | Initial source / effective default | Mutability |
| --- | --- | --- |
| id | participant id; World is world | immutable |
| name | authored name; World is World | mutable on locations/actors/entities only |
| description | authored description or absent | mutable on locations/actors/entities; removable |
| containment | initialContainment or absent | restricted; absent for inactive/destroyed |
| lifecycle | initialLifecycle or active | restricted; World always active |
| associations | initialAssociations or empty array | restricted; empty when inactive/destroyed |
| isContainer | physical.isContainer or category default | restricted |
| size, weight | corresponding physical fields or absent | restricted |
| maxItemSize, maxItemWeight | physical fields or absent (unlimited) | restricted |
| sizeCapacity, weightCapacity | physical fields or absent (unlimited) | restricted |
| turn | World only; 0 | dispatcher-controlled |
| controlledActors | player only; explicit initialization | restricted |
| selectedActor | player only; explicit initialization or absent | restricted |

World has no authored physical fields, containment or mutable name/lifecycle. World associations are not supported. Player id is immutable; player records are not authored world participants. Exits are immutable Foundation definition data, not mutable properties. Required structural properties cannot be removed; optional physical values may be removed only through authorized core operations that revalidate all affected invariants. Engine defaults cannot be suppressed by removal (e.g. isContainer must be set explicitly). An inactive/destroyed participant has no containment; remove a formerly present containment with an explicit removal marker. Lifecycle cannot resurrect destroyed participants during forward play. See [containment](WORLD_CONTAINMENT.md) and [physical properties](PHYSICAL_PROPERTIES.md).

Initial player properties are supplied through optional options.player.initialProperties at initialization, not the authored definition. Apply the same game-owned qualified map rules as authored initialProperties; reserved engine keys and unavailable extension namespaces are rejected. Player control and selection are initialized through dedicated configuration fields and mapped to their reserved properties. Store complete runtime player properties separately from baseline overrides; see [runtime state](RUNTIME_STATE.md#players-and-actors).

## Overrides

Store only current differences from the immutable baseline. For a property read: explicit removal means absent; otherwise an override wins; otherwise return the baseline (or absence). Reset deletes override and removal marker. Setting a baseline-equal value removes its override; dynamically introduced values with no baseline are recorded, including null. Removing a dynamic property deletes it; removing a present baseline property records a removal marker if permitted. Removing an already absent property is a no-op. No historic changes are retained. Do not confuse false, zero, null or empty values with absence. Default engine values participate in baseline comparison.

Compare JSON values structurally: scalars by value and type (negative zero equals zero), arrays by ordered values, objects by own key set and recursively equal values independent of member order. No partial nested patches in Foundation; replace a complete value. Reject conflicting set/remove records, duplicate keys/subjects, redundant baseline-equal overrides and removal markers for absent baseline properties in canonical saved data. Runtime normalizes empty records away. No implicit type rules for author properties beyond universal data constraints unless their owner defines additional validation.

```json
{"scope":"entity","id":"brassLantern","values":{"stateFoundation.fuel":85,"stateFoundation.target":null},"removed":["stateFoundation.label"]}
```

Conceptual operations: read initial/effective property, check existence and changed status, stage set/reset/remove, and retrieve detached snapshots. The public API exposes getStateSnapshot() under the [effective state snapshot contract](RUNTIME_STATE.md#effective-state-snapshot); each scoped subject includes applicable effective qualified properties, with absent or removed values omitted and explicit null preserved. The remaining JavaScript property operation interfaces require explicit public or internal interface contracts as appropriate. Changes to reserved engine properties use appropriate authorized engine operations; property ownership does not bypass core validation. Changes are atomic with world state and turn progression. See [runtime state](RUNTIME_STATE.md).

Use one internal structured addressing mechanism for world (no ID), location, entity, actor and player (scope plus stable ID), and directed relationship (typed from/to endpoints). Resolve scope and identity centrally; enforce domain-owned validation and authority independently. Use private native collections rather than ambiguous concatenated keys; never expose mutable indexes. Directed nonphysical property relationship pairs and their reverses are independent; self-pairs are permitted and empty relationships have no persistent identity. Dynamic directed property relationships require valid typed endpoints; inactive/destroyed participants may retain nonphysical relationship properties. These records do not establish physical placement, shared spatial frames or load, and are not automatically removed by physical-association cleanup. See [world containment](WORLD_CONTAINMENT.md).

Use a pure shared structural equality utility for validated JSON values, with safe traversal rather than unbounded recursion. Internal reads distinguish absence from null; set, remove and reset follow normalization above. Ordinary player properties use complete records, not authored overrides; reset restores the original initialization value or absence. Identity, turn, containment, lifecycle, control and other protected properties cannot be modified through generic game-property authority. All mutation requests are transaction-scoped. Engine-established mutation authority is independent of registration ownership and actor control; action namespace ownership does not grant property namespace authority. Use one effective-value resolution mechanism for all state consumers, with separate committed and candidate views and complete separate player records. See [runtime state](RUNTIME_STATE.md#staging-validation-and-authority).

Future capabilities define their state contracts as developed, prefer existing scopes and namespaces, and preserve deterministic continuation. No speculative combat, quest, calendar, random or event sections.
