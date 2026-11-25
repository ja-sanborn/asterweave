# Namespaced properties

Status: Accepted design; implementation pending. Origin: [FND-04 (#6)](https://github.com/ja-sanborn/asterweave/issues/6). See [ADR 0013](../decisions/0013-namespaced-properties-and-runtime-state.md), [runtime state](RUNTIME_STATE.md) and [save data](SAVE_DATA.md).

## Ownership and values

A qualified key has exactly one dot separating namespace and property name. Each segment matches `[a-z][A-Za-z0-9]*` in full, case-sensitively; no trimming or coercion. Prefer lower camel case. Asterweave owns reserved namespace asterweave. The required game.namespace is a stable machine name independent of title, e.g. zork; extensions use their own stable machine name. A runtime must reject duplicate namespace ownership, including game/extension collisions and attempts to claim asterweave. Only namespaces actually available in that runtime are valid. Foundation supports the game and core namespaces; extension registration/requirements and executable behavior are later contracts, not arbitrary JSON code. Namespaces are not an authentication or sandbox mechanism.

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

## Overrides

Store only current differences from the immutable baseline. For a property read: explicit removal means absent; otherwise an override wins; otherwise return the baseline (or absence). Reset deletes override and removal marker. Setting a baseline-equal value removes its override; dynamically introduced values with no baseline are recorded, including null. Removing a dynamic property deletes it; removing a present baseline property records a removal marker if permitted. Removing an already absent property is a no-op. No historic changes are retained. Do not confuse false, zero, null or empty values with absence. Default engine values participate in baseline comparison.

Compare JSON values structurally: scalars by value and type (negative zero equals zero), arrays by ordered values, objects by own key set and recursively equal values independent of member order. No partial nested patches in Foundation; replace a complete value. Reject conflicting set/remove records, duplicate keys/subjects, redundant baseline-equal overrides and removal markers for absent baseline properties in canonical saved data. Runtime normalizes empty records away. No implicit type rules for author properties beyond universal data constraints unless their owner defines additional validation.

```json
{"scope":"entity","id":"brassLantern","values":{"stateFoundation.fuel":85,"stateFoundation.target":null},"removed":["stateFoundation.label"]}
```

Conceptual operations: read initial/effective property, check existence and changed status, stage set/reset/remove, and retrieve detached snapshots. FND-05 exposes getStateSnapshot() under the [effective state snapshot contract](RUNTIME_STATE.md#effective-state-snapshot); each scoped subject includes applicable effective qualified properties, with absent or removed values omitted and explicit null preserved. The remaining JavaScript property operation interfaces belong to their owning implementation stories. Changes to reserved engine properties use appropriate authorized engine operations; property ownership does not bypass core validation. Changes are atomic with world state and turn progression. See [runtime state](RUNTIME_STATE.md).

Future capabilities define their state contracts as developed, prefer existing scopes and namespaces, and preserve deterministic continuation. No speculative combat, quest, calendar, random or event sections.
