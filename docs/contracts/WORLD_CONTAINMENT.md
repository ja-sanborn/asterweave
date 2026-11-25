# Unified world containment and placement

Status: Accepted contract. See [ADR 0011](../decisions/0011-unified-world-containment.md), [canonical definitions](GAME_DEFINITIONS.md) and [physical properties](PHYSICAL_PROPERTIES.md).

## Identity and hierarchy

Locations, actors and entities retain their distinct categories and share one case-sensitive ID namespace. Every instance has exactly one engine-created root, ID `world`, generically named World. It is not an authored participant or navigable room, has no parent, cannot be deactivated or destroyed, and is exempt from physical restrictions. Reserve its ID across all categories; do not declare it or target it with an exit. Every other active participant has exactly one immediate parent and an ancestry reaching World. Reject missing parents, self-containment, cycles, disconnected branches and active children of inactive or destroyed parents. Locations can nest in locations or compatible entities, actors can occupy vehicles, and objects can nest inside objects. No fixed hierarchy depth is prescribed; use bounded resource consumption and avoid unbounded recursive call stacks.

Containment is independent of navigable exits. Foundation movement selects an explicitly authored exit from the actor's immediate active location when contained there via in; actors in vehicles or other non-location parents cannot use the surrounding room's exits directly (reject EXIT_UNAVAILABLE). Authorized internal relocation is implemented; generic player-facing enter/exit handlers are planned Foundation operations; specialized boarding/disembarking verbs and vehicle policies may be game or extension behavior. The current directional move contract remains unchanged pending approved design. On successful move, replace the actor's immediate containment with in at the destination, validate all invariants, and leave descendants attached. No separate current location field is authoritative.

## Authored containment

Each active authored participant supplies initialContainment with exactly two required fields: parentId (existing world ID, including world) and relationship (standard containment identifier below). The subject is the enclosing record's ID. No parent kind is required; resolve the ID and category. This structure applies to locations, actors and entities equally.

```json
{"parentId":"safe","relationship":"in"}
```

| Relationship | Structural meaning |
| --- | --- |
| in | Inside a container; parent must have effective isContainer true |
| on | Supported by a parent |
| carried | Carried by an actor |
| held | Held by an actor |
| worn | Worn by an actor |
| attached | Physically connected |
| partOf | Constituent component |

World accepts only in; carried, held and worn require an actor parent. Otherwise any participant category may be a child or parent subject to structural invariants, container capability for in, and physical restrictions. For on, attached, partOf and other game-specific eligibility, future authored rules govern appropriateness; the core does not infer surfaces, wearability or mobility from names or categories. Standard relationships are exact case-sensitive identifiers. All containment edges transport descendants when the parent moves. A relationship can change while the parent remains the same. No legal, original or historical ownership is tracked by the core; such mechanics belong to games/extensions.

Direct contents are immediate children; recursive contents are all descendants. Effective location is the nearest active authored location ancestor (absent when none); enclosing regions are further location ancestors. Possession is derived from an actor's carried, held and worn branches, including descendants; equipment is the worn branch and held items the held branch. Physical load counts all direct children regardless of relationship. An actor inside a vehicle is not automatically carried inventory. Unordered derived query results use stable ascending ID order (case-sensitive ECMAScript code-unit order); ancestry and location ancestry are nearest first. Strict ancestry excludes the subject. Known inactive/destroyed identities have no placement or contents; unknown identities are invalid references. World is active and has contents but no parent or effective location. Internal enclosingLocations includes the nearest location and all further location ancestors; enclosing regions are the further ancestors only. Queries are detached point-in-time views, never duplicate authoritative lists. These queries do not grant visibility, access or permission.

## Associations

Optional initialAssociations is an array of closed objects with required targetId and relationship. Standard association identifiers are under, behind, beside and near. Associations are directed records on a subject; no implied reverse record. Zero or more may coexist with containment, but reject duplicate (targetId, relationship) pairs, self-targets, root targets and missing/inactive/destroyed endpoints. Foundation requires both endpoints active and sharing the same immediate parent, which provides a deterministic local spatial frame. Association cycles are not containment cycles. Physical associations are distinct from directed nonphysical property relationships (the relationship scope in [properties](PROPERTIES.md)); those relationships do not establish placement, loads or a shared spatial frame, may use player or World endpoints and may persist independently of physical-association cleanup. Associations do not carry a target or subject during movement. A candidate transition must remove associations made invalid by lifecycle or changes to the shared immediate parent, atomically with the transition; future rules may additionally reevaluate positions within a frame. Moving a rug out of the room leaves a key there; looking behind a bookshelf can reveal a door without moving either. Visibility and accessibility remain separate future rules. Fictional character knowledge may be optional game/extension state; no core human knowledge tracking.

```json
{"targetId":"rug","relationship":"under"}
```

Prefer standard engine relationships when semantics fit; synonyms are vocabulary, not new structural relationships. Future extension or game-defined relationship identifiers may use owned namespaces, following the general ownership principle in [ADR 0007](../decisions/0007-extensible-and-configurable-action-definitions.md). Relationship registration and ownership require a separate contract; the action registry does not register relationships or grant relationship authority. Each definition must explicitly classify containment versus association and comply with core invariants. Format 3.2.0 accepts only the standard identifiers; custom relationship registration and authoring remain deferred. Planned non-owning scoped references must preserve authoritative containment and require explicit design.

## Lifecycle

Optional initialLifecycle is active (default), inactive or destroyed. Active participants require initialContainment and may have associations; inactive/destroyed participants omit containment and associations. IDs remain reserved, including destroyed instances. World is always active. Active may become inactive or destroyed; inactive may become active or destroyed; destroyed is terminal in normal forward play. Authorized internal activation, deactivation and destruction of authored participants are implemented. Activation requires explicit valid placement; activation of an already active participant at identical placement is a no-op, while different placement requires relocation. Deactivation and individual destruction reject if active descendants remain. A separately authorized recursive destruction operation explicitly destroys the target and its entire active containment subtree; relocate intended survivors first. There is no implicit cascade. Repeated deactivation of an inactive participant and destruction of a destroyed participant are no-ops. Destroyed identities cannot reactivate or deactivate, including within the same transaction. Remove containment and invalid incoming/outgoing physical associations, revoke affected actor controls and clear affected selection atomically; reactivation restores none automatically. Preserve stable identities, unrelated properties and nonphysical relationships. Fictional death and resurrection remain game-owned concepts. Administrative reset and restoration of earlier valid saves are separate from forward gameplay. Dynamic creation remains deferred. See [ADR 0027](../decisions/0027-authorized-world-transitions.md) and [runtime state](RUNTIME_STATE.md#staging-validation-and-authority). Dynamic identities and allocation state, when implemented, must survive restoration without collisions.

## Mutation and persistence

The engine owns current containment, lifecycle and associations. Immutable initial definitions seed state, never become live records. Authorized relocation proposes a new immediate parent and relationship for any active authored participant, preserving its subtree. World may be the destination subject to its rules but cannot be relocated. Identical valid placement is a no-op. Explicit association establishment/removal requires distinct active endpoints in the same immediate frame; identical addition and absent removal are no-ops with valid inputs. Relocation removes invalid incoming/outgoing associations while retaining associations whose shared frame remains valid; reunion does not restore removed associations. Each operation validates its proposal against the latest candidate before staging normalized writes. Expected restrictions leave that operation unstaged; prior valid staged changes remain available. The dispatcher alone commits the complete action, including turns and outputs, or discards it. State, turns and semantic outputs follow [ADR 0006](../decisions/0006-atomic-action-execution-and-turn-progression.md). For example money initially in safe becomes carried by player:

```json
{"parentId":"player","relationship":"carried"}
```

The runtime state and save contracts specify state/snapshot/save structures and mutable properties, including gameplay-relevant associations and lifecycle. Human player knowledge is not tracked; fictional character knowledge is optional game/extension state, not a core subsystem. See [runtime state](RUNTIME_STATE.md). Restore must preserve current authoritative records, not recreate consumed objects or reset placements. Player-facing container actions, perception, locks, dynamic creation, multiplayer, networking and storage are not introduced by this contract.

See [containment fixture](../../tests/fixtures/games/containment-foundation.json) and [Lantern House](../../tests/fixtures/games/minimal-foundation.json).

Runtime state maps authored structural values to reserved asterweave properties and stores only current differences, including explicit removal of containment when an active participant leaves World. See [properties](PROPERTIES.md), [runtime state](RUNTIME_STATE.md) and [save data](SAVE_DATA.md). No duplicate authoritative values; core validation remains mandatory.
