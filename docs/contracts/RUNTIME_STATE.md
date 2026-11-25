# Runtime state

Status: Accepted design; implementation pending. Origin: [FND-04 (#6)](https://github.com/ja-sanborn/asterweave/issues/6). See [properties](PROPERTIES.md), [save data](SAVE_DATA.md), ADRs [0013](../decisions/0013-namespaced-properties-and-runtime-state.md), [0014](../decisions/0014-player-identity-and-state-scopes.md) and [0015](../decisions/0015-state-isolation-and-persistence.md).

## Authority and scopes

Each runtime has one authoritative current state: immutable, isolated authored baseline plus current normalized overrides and supported dynamic data. Independent runtimes share no mutable state. No persistent game-instance identifier. Game ID/content version identify the baseline; world participant IDs retain FND-12 meaning. Save IDs, session IDs, authentication, connection state and presentation preferences belong to hosts/storage, never core gameplay state.

| Scope identifier | Subject |
| --- | --- |
| world | implicit singleton, no id |
| location | authored location id |
| entity | authored entity id |
| actor | authored actor id |
| player | runtime player id |
| relationship | ordered pair of typed endpoints |

Override records are closed objects with scope and scope-specific identity (id for location/entity/actor, from/to for relationship, none for world), optional values map and optional removed array; at least one must be nonempty. For Foundation, player records store complete current properties separately, not player override records, because they have no authored baseline. Relationship endpoints are closed {scope,id} references for location/entity/actor/player, or {scope:"world"} for World. Authored initial relationships cannot reference players because they are runtime-created. References must exist and have correct scope; inactive/destroyed world identities can retain nonphysical relationship state. Direction matters; reverse is independent. Self relationships are allowed as nonphysical data. One record per ordered pair; namespaced keys distinguish multiple kinds of relationship. Empty relationship state has no independent identity. Containment is not a relationship-scope record.

```json
{"scope":"relationship","from":{"scope":"actor","id":"guide"},"to":{"scope":"actor","id":"adventurer"},"values":{"stateFoundation.trust":3}}
```

## Initial candidate state

Under [ADR 0016](../decisions/0016-modular-architecture-and-design-patterns.md), FND-05 maps structurally validated canonical data into an isolated normalized candidate through GameDefinitionMapper, resolving documented baseline defaults. Validate effective domain invariants and applicable initialization configuration before finalizing the immutable baseline and publishing an independent game. Candidate data is not committed state; discard invalid candidates. Standalone definition validation uses the same applicable mapping and invariant checks without constructing a public game. Domain validators depend on effective values, not canonical JSON paths or override/save storage. Future transactions and restoration reuse these invariants with their own candidate representations and operation-specific translation. Do not introduce duplicate authoritative state or duplicate domain rules.

## Players and actors

Players do not exist in physical World. Foundation permits zero (headless testing) or one player; future hosts may support more. Player IDs follow world ID grammar but use a separate scope; they are not accounts. Runtime initialization explicitly supplies optional player configuration, including id, controlled actor IDs and optional selected actor; no implicit player from an actor name. Retain a detached initialization configuration for reset. Initial player state is runtime-created and stored fully, not duplicated in override records. Player properties include required asterweave.controlledActors (distinct actor IDs, ordered array) and optional asterweave.selectedActor (actor ID in the controlled list); omission means no selected actor, including when no actors are controlled. Other game/extension properties follow common rules.

Only active actors can be controlled; an actor has at most one controlling player. Control changes and lifecycle changes must resolve selection/control atomically. Game logic may direct non-player actors; trusted gameplay logic is distinct from player-authorized requests. Actions retain explicit actorId; the host/public entry point must validate player control when operating on behalf of a player, never infer authorization from actorId alone. Headless trusted actions with no player preserve existing action tests. No accounts, authentication, networking or multiplayer implementation in Foundation. Actor-to-player lookup is derived.

Initialization configuration diagnostics use source options and JSON Pointer paths relative to the options argument, for example /player/controlledActors/0. Definition findings use source definition; both belong to one ordered collection, with definition findings first. Independent safe configuration checks may proceed despite invalid definition data, but checks requiring invalid prerequisites must be suppressed. See [error handling](ERROR_HANDLING.md).

## Transactions and snapshots

Follow the [error-handling contract](ERROR_HANDLING.md) for atomic failure, exception translation and fail-closed integrity. A failed operation may leave a usable runtime when committed integrity is assured; otherwise prohibit further gameplay mutations. Precise faulted-runtime lifecycle and recovery interfaces remain FND-06 work.

All gameplay mutations are staged within an authorized action transaction. Validate property ownership and component restrictions, effective core invariants (including FND-12 hierarchy, lifecycle, associations and capacities), actor control and turn costs before committing. Rejected/error results discard all staged changes, turns and success outputs. Completed failure may commit intentional valid consequences under ADR 0006. No direct public writable state reference/setter. Reset and future restore are separate atomic administrative operations; they do not consume gameplay turns. Reset clears overrides and dynamic data, restores authored defaults and original initialization configuration, and does not affect external saves.

Snapshots are detached, recursively read-only effective values, including unchanged authored values and current overrides; later gameplay cannot alter earlier snapshots. Copy arrays/objects before freezing; never freeze caller input or expose live state. Snapshot/derived query order is deterministic; use stable case-sensitive code-unit ordering for identifiers/keys, preserve semantic array order. Cache only if observable behavior is identical. No duplicate authoritative inventories, locations, loads or actor-to-player mappings. Trusted snapshots are not automatically safe for player exposure; future hosts enforce authorization and scoped outputs.

World asterweave.turn starts at 0, is a nonnegative safe integer and advances exclusively through dispatcher-selected completed outcome costs. Reject overflow atomically. Zero-turn completed actions may change state; real-world elapsed time does not advance gameplay. Restore/reset may replace the counter administratively. All actors share it. Future events, RNG and calendar state preserve deterministic continuation when implemented.

## Knowledge and future capabilities

No core knowledge/discovery subsystem, human player knowledge tracking or gameplay undo/back navigation. Player-controlled actors do not track knowledge by default. NPC or fictional character knowledge is optional game/extension state; actual world changes persist. Visibility/accessibility are evaluated by gameplay rules. Interaction/narrative context is persisted only where a future gameplay contract requires it; host state remains outside. Transaction rollback is not gameplay undo. Restore earlier independent saves to return to earlier state. Visual novel backward navigation is out of scope.

Dynamic world participants, reserved IDs/allocation, randomness, pending events and future capabilities require explicit state contracts when implemented; preserve complete necessary dynamic data and deterministic continuation without unused placeholders. Foundation provides property/control/state infrastructure, not dynamic creation, lifecycle gameplay actions, parser or perception. See [fixture](../../tests/fixtures/games/state-foundation.json).
