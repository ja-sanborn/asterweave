# Asterweave architecture

Status: initial design; action, game-definition, containment and physical capacity contracts are defined; state/save contracts are defined; runtime implementation remains pending.

## Boundaries

The runtime is environment-independent ECMAScript. It must not directly access the DOM, browser storage, Node-specific APIs, network services or the filesystem. Hosts provide these capabilities. Development tooling may use Node.js without imposing a runtime requirement.

## Runtime modules

| Module | Responsibility |
| --- | --- |
| Core | Lifecycle, action registry, dispatch, validation, atomic state transitions |
| Parser | Rule-based command interpretation and contextual object resolution |
| Choice | Conditional choices and selection validation |
| Narrative | Dialogue, sequences, branching, call/return and progression |
| World | Locations, exits, identity, containment, associations and physical capacity |
| Rules and events | Conditions, effects, triggers and turn scheduling |
| Persistence | Versioned serialization, restoration and migration |

These are logical boundaries; physical module organization will evolve as contracts are defined. The parser and choice modules are optional where a game does not need them.

## Modular implementation

Follow [ADR 0016](decisions/0016-modular-architecture-and-design-patterns.md) and [coding standards](CODE_STYLE.md). Organize cohesive domain types in separate modules; use native classes for encapsulation where appropriate and pure functions for domain calculations and validation. Prefer composition, explicit dependencies and acyclic module boundaries. A public facade hides internal organization; platform adapters depend on core contracts, not the reverse.

Locations, actors and entities share a common world-participant model. Authored objects are data, not individual JavaScript classes, and container capability is a property. Domain objects must not duplicate authoritative mutable state. Definition validation, baseline mapping and effective-state invariant validation are distinct responsibilities; initialization, future transactions and restoration reuse the same domain validators without coupling them to serialized representations or orchestration. Concrete module interfaces remain subject to implementation-story approval.

## Action flow

    Host input -> Parser, choice, narrative or direct action submission
      -> Action dispatcher -> Registry resolution and validation
      -> Atomic rules/world transition and turn progression -> Semantic result -> Host

Actions identify an actor, action type and relevant targets. The runtime validates availability and permissions, not merely syntax. Output carries semantic information and an intended audience; hosts decide how to render or deliver it.

The action-driven design distinguishes standard, extension and game-defined action types. The registry resolves supported definitions and trusted handlers; it is independent of dispatch. Completed results distinguish gameplay success and failure, while rejected actions and execution errors commit no state or turns. The dispatcher exclusively selects configured success/failure costs and commits state and progression atomically. Foundation movement consumes one turn on success; invalid or unavailable exits consume none. Committed turns advance abstract game time; an optional clock/calendar translates them into fictional dates and durations. Intermediate scheduled turns cannot be skipped; interruption semantics are deferred.

See the [action/result contract](contracts/ACTIONS_AND_RESULTS.md), [action definitions](contracts/ACTION_DEFINITIONS.md), [standard action catalog](contracts/STANDARD_ACTIONS.md), and ADRs [0006](decisions/0006-atomic-action-execution-and-turn-progression.md), [0007](decisions/0007-extensible-and-configurable-action-definitions.md), and [0008](decisions/0008-game-time-and-calendar-separation.md). These define design only; runtime support remains planned.

## Game packages

The [canonical game-definition contract](contracts/GAME_DEFINITIONS.md) defines the initial world, game identity and format/content versions under [ADR 0009](decisions/0009-canonical-game-definition-contract.md). Foundation format 3.0.0 supports locations, directed exits, actors and entities with unified initial containment, lifecycle, spatial associations and optional physical characteristics; narrative, vocabulary, rules and optional extension requirements are future schema work. Stable world IDs connect definitions. Definitions are immutable during play; mutable instance state is separate. Native validation and initialization remain FND-05 work. Custom JavaScript extensions may register behavior through explicit contracts. Untrusted executable extensions must not be treated as safe data.

Creator is an optional development-time module that translates readable authoring definitions into the canonical JSON format, validates references and exports game packages. It is not distributed with finished games.

### Distribution packages and content protection

Keep the readable canonical JSON definition distinct from distributed packages. Optional packaging/export tooling outside the core (usable without Creator) may protect content against casual inspection; unprotected distribution is the default. Host/package loaders unpack and, when applicable, decode or decrypt data outside the core, then validate the canonical definition before initializing runtime state. Package versioning is independent of definition and content versions. Both modes must support offline gameplay. No mandatory DRM, online activation or guarantee of secrecy from an operator who controls the offline client; embedded unlock material is recoverable. See [ADR 0010](decisions/0010-game-packaging-and-content-protection.md). The concrete package format, protection mechanism and loader/export implementation are planned Phase 2 work ([issue #22](https://github.com/ja-sanborn/asterweave/issues/22)); Creator integration follows later.

## State and saves

Track player location, inventory, entity state, merchant stock, relationships, quests, flags, pending events, narrative position and parser context as appropriate. Use one authoritative containment tree rooted at engine-recognized, non-navigable World. Actor locations, inventories and loads are derived. Containment transports descendants; spatial associations do not. Lifecycle and capacity invariants apply to all candidate transitions. See [containment](contracts/WORLD_CONTAINMENT.md), [physical properties](contracts/PHYSICAL_PROPERTIES.md), [ADR 0011](decisions/0011-unified-world-containment.md) and [ADR 0012](decisions/0012-physical-properties-and-capacity.md). Legal ownership, visibility and access are separate game mechanics.

Store only normalized current overrides against the immutable baseline and supported dynamic data. Six gameplay scopes: world, location, entity, actor, player and directional relationship. Namespaces identify the engine, game or extension. Players and actors are distinct; no persistent instance ID. Save format 1.0.0 requires exact game/content/definition version matching and complete candidate validation before atomic replacement. Future capabilities define dynamic state, randomness and event persistence when developed. See [properties](contracts/PROPERTIES.md), [runtime state](contracts/RUNTIME_STATE.md) and [save data](contracts/SAVE_DATA.md).

The runtime serializes state without knowing where it is stored. Browser hosts may use IndexedDB with portable file import/export as a fallback; local-file browser persistence is not guaranteed. No gameplay undo or backward navigation; transaction rollback is mandatory. Human player knowledge and host/session data are not saved.

## Hosts and extensions

The initial browser host will support text input, numbered choices and offline distribution, ideally as a self-contained HTML artifact. Future hosts may include command-line, server and Discord adapters.

Design action and state contracts for multiple actors now, but implement one player first. Future multiplayer requires server-authoritative state, actor/session identity, scoped outputs, concurrency control and transactional persistence. Do not assume single-player game definitions are automatically multiplayer-safe.

Visual and audio presentation are optional extensions. The engine emits semantic results, not rendered graphics.

## Testing

Test the runtime headlessly with game fixtures, action sequences, invalid commands, rule enforcement, save/restore equivalence and deterministic replay where applicable. Test host adapters separately.

Development uses Node.js 26 LTS, npm and the native test runner, with no third-party npm dependencies. These tools do not enter the runtime or standalone game distributions. See [ADR 0005](decisions/0005-development-and-testing-tooling.md).
