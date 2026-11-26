# Asterweave architecture

> Reconciliation note: the [active ADR catalog](decisions/README.md) establishes the approved first-party modular direction. This document still describes aspects of the pre-reconciliation implementation and planned scope; obsolete public extension plans are not authoritative. Full content reconciliation is a separate FND-26 increment.


This document describes accepted architecture and development standards. Design descriptions do not imply implemented behavior; consult the [public API contract](contracts/PUBLIC_API.md) for supported interfaces. See the [documentation index](README.md) and [contract catalog](contracts/README.md).

## Boundaries

The runtime is environment-independent ECMAScript. It must not directly access the DOM, browser storage, Node-specific APIs, network services or the filesystem. Hosts provide these capabilities. Development tooling may use Node.js without imposing a runtime requirement.

## Runtime modules

| Module | Responsibility |
| --- | --- |
| Core | Lifecycle, orchestration, dispatch and atomic state transitions |
| Actions | Independent action registry, registration authority, definition and argument validation |
| Parser | Rule-based command interpretation and contextual object resolution |
| Choice | Conditional choices and selection validation |
| Narrative | Dialogue, sequences, branching, call/return and progression |
| World | Locations, exits, identity, containment, associations and physical capacity |
| Rules and events | Conditions, effects, triggers and turn scheduling |
| Persistence | Versioned serialization and restoration; migration only under an explicitly defined future contract |

These are logical boundaries; physical module organization will evolve as contracts are defined. Foundation provides a headless core and reusable standard handlers. Date Time, Text Parsing and Visual Novel are independent optional extensions; choice and narrative progression may be modular within the latter. Games own content and specialized policies; hosts own platform integration. See [ADR 0051](decisions/0051-product-architecture.md).

## Modular implementation

Follow [ADR 0064](decisions/0064-modular-design-patterns.md) and [coding standards](CODE_STYLE.md). Organize cohesive domain types in separate modules; use native classes for encapsulation where appropriate and pure functions for domain calculations and validation. Prefer composition, explicit dependencies and acyclic module boundaries. Within core, initialization may compose the dispatcher and resetter; intra-core imports must remain acyclic and must not couple gameplay and administrative orchestration to each other. Cross-domain dependency restrictions remain unchanged. A public facade hides internal organization; platform adapters depend on core contracts, not the reverse.

Locations, actors and entities share a common world-participant model. Authored objects are data, not individual JavaScript classes, and container capability is a property. Domain objects must not duplicate authoritative mutable state. Definition validation, baseline mapping and effective-state invariant validation are distinct responsibilities; initialization, runtime transactions and future restoration must reuse the same applicable domain validators without coupling them to serialized representations or orchestration. Concrete module interfaces require review against the applicable contracts.

### Foundation domain types

The world model uses WorldObject with shallow Location, Actor and Entity subclasses, each with meaningful shared or category-specific behavior. World is separate from WorldObject and owns a private WorldObjectRegistry using a native Map keyed by shared stable participant IDs. The implicit root is resolved separately; inactive and destroyed identities remain registered. Derive category collections when needed, with deterministic enumeration. Player is a separate nonphysical domain type. Domain objects must not duplicate authoritative effective state; registry ownership is identity only, not containment, properties, turns, dispatch or player control. Construction remains engine-controlled. No authored item subclasses or process-wide singleton.

### Action registry

The facade privately owns RuntimeState and an independent ActionRegistry. GameInitializer creates and finalizes the registry after successful definition and configuration validation. Registry-local Symbol capabilities govern trusted standard, game and extension registration; definitions are detached and immutable, executable associations are protected, and modifications are additive and atomic during setup. Finalization prevents further changes. The actions domain depends only on shared utilities, diagnostics and authoritative world vocabulary, not state or orchestration. Production registries are currently empty until real handlers are available. Foundation will establish controlled public extension setup and restricted capabilities without exposing the internal registry or permitting gameplay-time registration. See [ADR 0053](decisions/0053-action-architecture.md) and [action definitions](contracts/ACTION_DEFINITIONS.md).

### Runtime execution architecture

The runtime execution architecture composes a dedicated synchronous dispatcher, isolated transactions and restricted handler contexts with the existing facade, independent finalized registry and RuntimeState. RuntimeState owns committed state; GameBaseline remains immutable; an encapsulated Map-based override store maintains normalized differences, and Player owns complete current player records. Derive effective values on demand through shared structured addressing and domain-specific authority; all consumers use the same resolution semantics on their respective committed or isolated candidate state. See [runtime state](contracts/RUNTIME_STATE.md#staging-validation-and-authority). Do not duplicate authoritative world or player state.

The dispatcher coordinates validation, authorization, registry resolution, handler execution, outcome-based turn advancement and transaction completion. Domain operations enforce mutation rules; pure domain validators enforce candidate invariants. A transaction shares the immutable baseline and isolates mutable state and semantic outputs until completion. Reset is a separate administrative operation that retains the facade and registry. See [ADR 0055](decisions/0055-state-and-transactions.md), [ADR 0068](decisions/0068-runtime-reset-and-integrity.md) and the [runtime state contract](contracts/RUNTIME_STATE.md). Dispatch, transaction and administrative reset infrastructure are implemented; production gameplay handlers are planned Foundation work. See the [detailed runtime implementation design](RUNTIME_IMPLEMENTATION.md) for principal classes, internal collaboration, capability lifetime and publication responsibilities.

### Candidate state mapping

Definition validation uses an ordered pipeline and an internal GameDefinitionMapper (Data Mapper pattern). Safely inspect and isolate canonical input; validate schema, version, identities and references; map structurally valid data into a normalized candidate with documented defaults; validate effective domain invariants; validate applicable initialization configuration; and only then finalize the immutable baseline and publish an independent game. Standalone validation uses the same applicable mapping and invariant checks without publishing a game. Invalid candidates are discarded. The mapper translates representations, not gameplay rules, and must not repair invalid input. Domain validators use narrow effective-state contracts, independent of authored paths, storage layouts, the facade and result types. Orchestration translates domain findings into operation-specific diagnostics. Runtime transactions and future restoration must reuse the applicable domain validators without requiring the authored definition pipeline. Establish effective-record structural prerequisites before invariant checks, separate initialization viability from ongoing lifecycle invariants, and apply forward-transition checks only to forward gameplay. Preserve independent findings and suppress dependent cascades. See [runtime state](contracts/RUNTIME_STATE.md#initial-candidate-state).

## Public API and compatibility

Follow [ADR 0057](decisions/0057-engine-interface-and-compatibility.md) and the [public API contract](contracts/PUBLIC_API.md). One primary facade exposes explicitly documented interfaces; supported factories control construction of engine-owned objects. Internal exports are not automatically public. Engine releases use semantic versioning; pre-1.0 changes are documented and data-format versions remain independent. Concrete interfaces require explicit design, review and documentation.

## Security and resource ownership

Follow [ADR 0066](decisions/0066-security-and-trust.md) and the [security model](contracts/SECURITY_MODEL.md). Treat external data as untrusted, validate authorization and invariants, isolate state and commit atomically. Executable extensions are trusted code, not sandboxed data. Hosts own authentication, storage, network and presentation protections. Use safe algorithms and explicit resource ownership; introduce concrete limits and disposal interfaces only when justified.

## Error handling and diagnostics

Follow [ADR 0065](decisions/0065-error-handling.md) and the [error-handling contract](contracts/ERROR_HANDLING.md). Distinguish data validation, operation rejection, intentional gameplay failure, execution failure, programming error and platform failure. Domain modules detect findings independently; orchestration aggregates and translates them into existing operation-specific contracts. Expected failures use structured diagnostics or results, while unexpected failures may use native exceptions internally. Preserve atomicity and fail closed if committed integrity cannot be guaranteed. Hosts own reporting and logging; no core logger or global error bus in Foundation. Public initialization interfaces follow the [public API contract](contracts/PUBLIC_API.md). Administrative recovery follows the [runtime reset and integrity contract](contracts/RUNTIME_STATE.md#administrative-reset-and-integrity).

## Action flow

    Host input -> Parser, choice, narrative or direct action submission
      -> Action dispatcher -> Registry resolution and validation
      -> Atomic rules/world transition and turn progression -> Semantic result -> Host

Actions identify an actor, action type and relevant targets. The runtime validates availability and permissions, not merely syntax. Output carries semantic information and an intended audience; hosts decide how to render or deliver it.

The action-driven design distinguishes standard, extension and game-defined action types. The registry resolves supported definitions and trusted handlers; it is independent of dispatch. Completed results distinguish gameplay success and failure, while rejected actions and execution errors commit no state or turns. The dispatcher exclusively selects configured success/failure costs and commits state and progression atomically. The initial movement design defaults to one turn on success and zero on rejected unavailable exits; configurable costs and contextual behavior are planned Foundation work. Committed turns advance abstract game time; the optional Date Time Extension may translate them into fictional dates and durations. Intermediate scheduled turns cannot be skipped; interruption semantics are deferred.

See the [action/result contract](contracts/ACTIONS_AND_RESULTS.md), [action definitions](contracts/ACTION_DEFINITIONS.md), [standard action catalog](contracts/STANDARD_ACTIONS.md), and ADRs [0053](decisions/0053-action-architecture.md), and [0062](decisions/0062-game-time-and-calendar.md). The registry, argument validation, dispatcher and atomic turn progression infrastructure are implemented. Production gameplay transitions require registered gameplay handlers, which are planned but not yet implemented. Foundation includes shared visibility/access evaluation, navigation, speech, inventory, mechanical and contextual actions, configurable and declarative custom actions, generic conditions/effects, action reactions, deterministic randomness and ordered events. Authorized non-player actor execution must preserve transactional authority and avoid duplicate turn advancement. Specialized policies and NPC decision-making remain game or extension logic.

## Game packages

The [canonical game-definition contract](contracts/GAME_DEFINITIONS.md) defines the initial world, game identity and format/content versions under [ADR 0054](decisions/0054-canonical-definitions-and-authoring.md). Foundation format 3.2.0 supports locations, directed exits, actors and entities with unified initial containment, lifecycle, spatial associations and optional physical characteristics; rules, action configuration, events and optional extension requirements are planned Foundation schema work; narrative and vocabulary schemas belong to later optional extensions. Stable world IDs connect definitions. Definitions are immutable during play; mutable instance state is separate. Custom JavaScript extensions may register behavior through explicit contracts. Untrusted executable extensions must not be treated as safe data.

Creator is a planned independent offline JavaScript web application for structured authoring, canonical JSON import/export, validation, playtesting and distribution. Framework selection and application dependencies require review and remain outside the player runtime. It is not distributed with finished games.

### Distribution packages and content protection

Keep the readable canonical JSON definition distinct from distributed packages. Optional packaging/export tooling outside the core (usable without Creator) may protect content against casual inspection; unprotected distribution is the default. Host/package loaders unpack and, when applicable, decode or decrypt data outside the core, then validate the canonical definition before initializing runtime state. Package versioning is independent of definition and content versions. Both modes must support offline gameplay. No mandatory DRM, online activation or guarantee of secrecy from an operator who controls the offline client; embedded unlock material is recoverable. See [ADR 0058](decisions/0058-compilation-and-distribution.md). Foundation includes a reproducible single compact JavaScript engine bundle, practical minification/obfuscation, appropriate compression, protected/unprotected game packages and source/bundle equivalence verification. Selective extension inclusion and compatibility metadata are planned. Concrete tools, formats, encryption and key handling require design review; Creator and standalone HTML host integration follow later.

## State and saves

Derive actor location and inventory from authoritative containment; players and actors are distinct. Track entity state and directed nonphysical property relationships, and future merchant stock, quests, flags, pending events, narrative position and parser context only as their contracts require. Use one authoritative containment tree rooted at engine-recognized, non-navigable World. Actor locations, inventories and loads are derived. Containment transports descendants; spatial associations do not. Lifecycle and capacity invariants apply to all candidate transitions. See [containment](contracts/WORLD_CONTAINMENT.md), [physical properties](contracts/PHYSICAL_PROPERTIES.md), [ADR 0059](decisions/0059-world-containment-and-transitions.md) and [ADR 0060](decisions/0060-physical-properties-and-capacity.md). Authorized internal relocation, physical association and property mutations, and generic lifecycle transitions are implemented. Shared actor-scoped visibility/access evaluation is planned Foundation work; specific visibility policies, legal ownership, lighting and other specialized mechanics belong to games or extensions.

Store only normalized current overrides against the immutable baseline and supported dynamic data. Six gameplay scopes: world, location, entity, actor, player and directional relationship. Namespaces identify the engine, game or extension. Players and actors are distinct; no persistent instance ID. Save format 1.0.0 requires exact game/content/definition version matching and complete candidate validation before atomic replacement. Foundation will define necessary transactional random, pending event and supported extension state and implement atomic capture/restoration; current save format remains the accepted baseline until revised explicitly. Dynamic identity creation remains deferred. See [properties](contracts/PROPERTIES.md), [runtime state](contracts/RUNTIME_STATE.md) and [save data](contracts/SAVE_DATA.md).

The runtime serializes state without knowing where it is stored. Browser hosts may use IndexedDB with portable file import/export as a fallback; local-file browser persistence is not guaranteed. No gameplay undo or backward navigation; transaction rollback is mandatory. Human player knowledge and host/session data are not saved.

## Hosts and extensions

After the standalone Foundation distribution, a text-only offline browser interface is a planned playable target; standalone HTML and other host delivery mechanisms remain separate work. Future hosts may include command-line, server and Discord adapters.

Design action and state contracts for multiple actors now, but implement one player first. Future multiplayer requires server-authoritative state, actor/session identity, scoped outputs, concurrency control and transactional persistence. Do not assume single-player game definitions are automatically multiplayer-safe.

Date Time, Text Parsing and Visual Novel are optional extensions; visual/audio presentation remains outside core. The engine emits semantic results, not rendered graphics. Spoken dialogue selections and typed speech can submit equivalent canonical say actions; the game defines their consequences.

## Testing

The [testing strategy](../tests/README.md) establishes unit, contract, integration, security and architecture verification, meaningful behavioral coverage and implementation-story completion criteria. Use review and native automated checks where useful.

Test the runtime headlessly with game fixtures, action sequences, invalid commands, rule enforcement, save/restore equivalence and deterministic execution and test reproducibility where applicable, without requiring action-history replay for persistence. Test host adapters separately.

Development uses Node.js 26 LTS, npm and the native test runner, with no third-party npm dependencies. These tools do not enter the runtime or standalone game distributions. Distribution-only tooling exceptions and Creator framework dependencies require separate explicit approval; zero third-party core runtime dependencies remain mandatory. See [ADR 0061](decisions/0061-development-and-testing-tooling.md).
