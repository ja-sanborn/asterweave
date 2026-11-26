# Namespaced properties

Status: Accepted contract. See [ADR 0055](../../decisions/0055-state-and-transactions.md), [runtime state](RUNTIME_STATE.md) and [save data](SAVE_DATA.md).

## Ownership and values

A qualified key has exactly one dot separating namespace and property name. Each segment matches `[a-z][A-Za-z0-9]*` in full, case-sensitively; no trimming or coercion. Use lower camel case. Mandatory engine infrastructure owns engine.*; selected first-party gameplay domains may define functional namespaces when implemented. Only explicitly supported properties are valid, in their defined scopes. Reject unknown or unavailable keys. No game-owned namespaces, external claims, aliases or generic property registration. Namespaces are not authorization.

The defining domain establishes meaning, scope, type, validation, defaults, configuration, mutability and invariants. Game data configures supported semantics; it cannot establish arbitrary properties or executable behavior. Future reusable game variables require a separate reviewed contract. Domains share one authoritative state and request changes through authorized domain operations.

Values support booleans, finite numbers, strings, dense arrays, plain data objects and null. Reject non-JSON data, cycles, accessors, inherited values, executable code and platform objects under [definition data rules](GAME_DEFINITIONS.md). Treat keys as data, not paths; safe lookup/copy prevents prototype mutation. Copy input values, including nested values; do not retain caller-owned mutable references. Null differs from absence. No implicit conversion. Nested object keys are ordinary JSON data, not qualified property keys.

## Authored baseline

Canonical format 4.0.0 rejects game.namespace, initialProperties and initialRelationships. Structural fields are the sole current authored source of engine values, mapped as follows:

| Engine property (engine prefix) | Initial source / effective default | Mutability |
| --- | --- | --- |
| id | participant id; World is world | immutable |
| name | authored name; World is World | immutable in current runtime |
| description | authored description or absent | immutable in current runtime |
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

Player identity, control and selection are initialized through dedicated configuration fields; options.player.initialProperties is rejected. Store complete runtime player properties separately from baseline overrides; see [runtime state](RUNTIME_STATE.md#players-and-actors).

## Overrides

Store only current differences from the immutable baseline. For a property read: explicit removal means absent; otherwise an override wins; otherwise return the baseline (or absence). Reset deletes override and removal marker. Setting a baseline-equal value removes its override; dynamically introduced values with no baseline are recorded, including null. Removing a dynamic property deletes it; removing a present baseline property records a removal marker if permitted. Removing an already absent property is a no-op. No historic changes are retained. Do not confuse false, zero, null or empty values with absence. Default engine values participate in baseline comparison.

Compare JSON values structurally: scalars by value and type (negative zero equals zero), arrays by ordered values, objects by own key set and recursively equal values independent of member order. No partial nested patches in Foundation; replace a complete value. Reject conflicting set/remove records, duplicate keys/subjects, redundant baseline-equal overrides and removal markers for absent baseline properties in canonical saved data. Runtime normalizes empty records away. Every supported property must satisfy its domain contract.

```json
{"scope":"entity","id":"brassLantern","values":{"engine.weight":85},"removed":["engine.size"]}
```

Conceptual operations: read initial/effective property, check existence and changed status, stage set/reset/remove, and retrieve detached snapshots. The public API exposes getStateSnapshot() under the [effective state snapshot contract](RUNTIME_STATE.md#effective-state-snapshot); each scoped subject includes applicable effective qualified properties, with absent or removed values omitted and explicit null preserved. The accepted internal property operations and presence-entry representation are described in the [runtime implementation design](../RUNTIME_IMPLEMENTATION.md#addresses-equality-and-normalized-storage); they are not public interfaces. All mutations use appropriate authorized domain operations; generic set/remove/reset are internal storage primitives, not handler capabilities. Changes are atomic with world state and turn progression. See [runtime state](RUNTIME_STATE.md).

Use one internal structured addressing mechanism for world (no ID), location, entity, actor and player (scope plus stable ID), and directed relationship (typed from/to endpoints). Resolve scope and identity centrally; enforce domain-owned validation and authority independently. Use private native collections rather than ambiguous concatenated keys; never expose mutable indexes. Directed nonphysical property relationship pairs and their reverses are independent; self-pairs are permitted and empty relationships have no persistent identity. No relationship properties are currently supported; the effective relationship collection must be empty. Future domain-defined relationship properties require valid typed endpoints and explicit lifecycle semantics. These records do not establish physical placement, shared spatial frames or load, and are not automatically removed by physical-association cleanup. See [world containment](WORLD_CONTAINMENT.md).

Use a pure shared structural equality utility for validated JSON values, with safe traversal rather than unbounded recursion. Internal reads distinguish absence from null; set, remove and reset follow normalization above. Player properties use complete records, not authored overrides. All mutation requests are transaction-scoped and authorized through explicit domain-operation grants independent of registration and actor control. Use one effective-value resolution mechanism for all state consumers, with separate committed and candidate views and complete separate player records. See [runtime state](RUNTIME_STATE.md#staging-validation-and-authority).

Implemented internal lifecycle and physical property operations follow the containment and physical contracts. Planned first-party gameplay-module state, randomness and events define their state contracts as developed, prefer existing scopes and namespaces where applicable, and preserve deterministic continuation. No speculative combat, quest, calendar, random or event sections.
