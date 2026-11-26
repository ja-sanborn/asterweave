# Asterweave architecture

This document describes accepted architecture and development standards. Design descriptions do not imply implemented behavior; consult the [public API contract](engine/contracts/PUBLIC_API.md) for supported interfaces. See the [documentation index](README.md) and [contract catalog](engine/contracts/README.md).

## Product architecture and boundaries

Asterweave comprises three principal products: Engine, Tools and Creator. Engine and Tools are independently usable; Creator consumes both. The engine is platform-independent ECMAScript and never directly accesses DOM, graphics, storage, networking, filesystem or Node-specific APIs. Platform integration belongs to presentation environments and loaders; development tools may use Node.js without imposing a gameplay requirement.

| Boundary | Responsibility |
| --- | --- |
| Engine (`src/engine/`) | Mandatory infrastructure and the minimal facade: lifecycle, definitions, identity, world/state invariants, action dispatch, transactions, generic rules/events and persistence as implemented. |
| Gameplay modules (`src/modules/`) | Selectable first-party reusable gameplay capabilities, logically part of the composed engine; examples include navigation, inventory, speech, mechanical interaction and Date Time. |
| Interaction (`src/interaction/`) | Text Parser, Visual Novel and other input/interaction behavior; consume documented engine interfaces. |
| Tools (`src/tools/`) | Canonical translation, assembly, coordinated validation, selective composition, compilation and distribution. |
| Creator (`src/creator/`) | Optional visual and language authoring, UI/UX design, playtesting and export using Engine and Tools. |

Presentation is a game-specific responsibility, not a mandatory additional product. Presentation adapters own safe rendering, platform permissions, optional telemetry and logging, storage and delivery authorization; they consume semantic results and supported interfaces, not private engine state. Test platform adapters separately. It may submit canonical actions directly or use one or more selected interaction modules. Choice and narrative interaction coordinate input and presentation; authoritative gameplay-relevant dialogue, conditions, effects and progression remain engine-owned when introduced. Purely presentational state remains outside authoritative gameplay state.

```text
Authoring: direct JSON / declarative language / Creator
                          |
                        Tools
                          |
                 Distributable game
                 Presentation / UI
                          |
                Selected interaction modules (optional)
                          |
                 Minimal engine interface
                          |
                 Composed gameplay engine
            Mandatory engine + selected gameplay modules
```

Dependencies are explicit and acyclic. Mandatory engine infrastructure cannot depend on optional gameplay modules, interaction, Creator or Tools. First-party modules may depend on other first-party modules where justified; ordinary imports and explicit collaborators suffice. Composition happens before gameplay, not through dynamic public registration. Unselected executable capabilities are excluded from distribution unless required by a selected dependency. All gameplay modules share one engine version. No public executable plugin framework, service locator, runtime module manager or speculative discovery API.

Foundation is a development milestone, not a synonym for mandatory infrastructure. It includes planned essential gameplay modules, declarative behavior, persistence, functional headless play and initial distribution. Interaction modules and fictional calendar support are later planned work. See [ADR 0051](decisions/0051-product-architecture.md) and [ADR 0052](decisions/0052-module-composition.md).

### Repository organization

The target source boundaries above have corresponding test and documentation responsibilities; shared fixtures, infrastructure and architecture verification remain separate. Central documentation stays under docs, with active decisions, historical archive and guides as justified. Samples contain demonstrations and complete reference games, distinct from test fixtures. Create directories only for actual content. The current runtime resides under src/engine, with engine tests under tests/engine and shared fixtures and repository-wide checks under tests. Engine-specific technical documentation resides under [docs/engine](engine/README.md). This architectural target does not assert that any planned module exists.

## Modular implementation

Follow [ADR 0064](decisions/0064-modular-design-patterns.md) and [coding standards](CODE_STYLE.md). Organize cohesive domain types in separate modules; use native classes for encapsulation where appropriate and pure functions for domain calculations and validation. Prefer composition, explicit dependencies and acyclic module boundaries. Within core, initialization may compose the dispatcher and resetter; intra-core imports must remain acyclic and must not couple gameplay and administrative orchestration to each other. Cross-domain dependency restrictions remain unchanged. A public facade hides internal organization; platform adapters depend on core contracts, not the reverse.

Locations, actors and entities share a common world-participant model. Authored objects are data, not individual JavaScript classes, and container capability is a property. Domain objects must not duplicate authoritative mutable state. Definition validation, baseline mapping and effective-state invariant validation are distinct responsibilities; initialization, runtime transactions and future restoration must reuse the same applicable domain validators without coupling them to serialized representations or orchestration. Concrete module interfaces require review against the applicable contracts.

### Foundation domain types

The world model uses WorldObject with shallow Location, Actor and Entity subclasses, each with meaningful shared or category-specific behavior. World is separate from WorldObject and owns a private WorldObjectRegistry using a native Map keyed by shared stable participant IDs. The implicit root is resolved separately; inactive and destroyed identities remain registered. Derive category collections when needed, with deterministic enumeration. Player is a separate nonphysical domain type. Domain objects must not duplicate authoritative effective state; registry ownership is identity only, not containment, properties, turns, dispatch or player control. Construction remains engine-controlled. No authored item subclasses or process-wide singleton.

### Action registry

The facade privately owns RuntimeState and an independent ActionRegistry. GameInitializer creates and finalizes the registry after successful definition and configuration validation. The implementation uses one registry-local registration Symbol and one distinct mutation grant Symbol; definitions are detached and immutable, executable associations are protected, and modifications are additive and atomic during setup. Finalization prevents further changes. The actions domain depends only on shared utilities, diagnostics and authoritative world vocabulary, not state or orchestration. Production registries are currently empty until real handlers are available. Only engine-controlled first-party code supplies executable handlers. Games cannot register actions or supply handlers; no dynamic namespace claims exist. Registration, actor control and mutation authority remain distinct. No public registration or gameplay-time modification is supported. See [ADR 0053](decisions/0053-action-architecture.md) and [action definitions](engine/contracts/ACTION_DEFINITIONS.md).

### Runtime execution architecture

The runtime execution architecture composes a dedicated synchronous dispatcher, isolated transactions and restricted handler contexts with the existing facade, independent finalized registry and RuntimeState. RuntimeState owns committed state; GameBaseline remains immutable; an encapsulated Map-based override store maintains normalized differences, and Player owns complete current player records. Derive effective values on demand through shared structured addressing and domain-specific authority; all consumers use the same resolution semantics on their respective committed or isolated candidate state. See [runtime state](engine/contracts/RUNTIME_STATE.md#staging-validation-and-authority). Do not duplicate authoritative world or player state.

The dispatcher coordinates validation, authorization, registry resolution, handler execution, outcome-based turn advancement and transaction completion. Domain operations enforce mutation rules; pure domain validators enforce candidate invariants. A transaction shares the immutable baseline and isolates mutable state and semantic outputs until completion. Reset is a separate administrative operation that retains the facade and registry. See [ADR 0055](decisions/0055-state-and-transactions.md), [ADR 0068](decisions/0068-runtime-reset-and-integrity.md) and the [runtime state contract](engine/contracts/RUNTIME_STATE.md). Dispatch, transaction and administrative reset infrastructure are implemented; production gameplay handlers are planned Foundation work. See the [detailed runtime implementation design](engine/RUNTIME_IMPLEMENTATION.md) for principal classes, internal collaboration, capability lifetime and publication responsibilities.

### Candidate state mapping

Definition validation uses an ordered pipeline and an internal GameDefinitionMapper (Data Mapper pattern). Safely inspect and isolate canonical input; validate schema, version, identities and references; map structurally valid data into a normalized candidate with documented defaults; validate effective domain invariants; validate applicable initialization configuration; and only then finalize the immutable baseline and publish an independent game. Standalone validation uses the same applicable mapping and invariant checks without publishing a game. Invalid candidates are discarded. The mapper translates representations, not gameplay rules, and must not repair invalid input. Domain validators use narrow effective-state contracts, independent of authored paths, storage layouts, the facade and result types. Orchestration translates domain findings into operation-specific diagnostics. Runtime transactions and future restoration must reuse the applicable domain validators without requiring the authored definition pipeline. Establish effective-record structural prerequisites before invariant checks, separate initialization viability from ongoing lifecycle invariants, and apply forward-transition checks only to forward gameplay. Preserve independent findings and suppress dependent cascades. See [runtime state](engine/contracts/RUNTIME_STATE.md#initial-candidate-state).

## Public API and compatibility

Follow [ADR 0057](decisions/0057-engine-interface-and-compatibility.md) and the [public API contract](engine/contracts/PUBLIC_API.md). One primary facade exposes explicitly documented interfaces; supported factories control construction of engine-owned objects. Internal exports are not automatically public. Engine releases use semantic versioning; pre-1.0 changes are documented and data-format versions remain independent. Concrete interfaces require explicit design, review and documentation. Interaction, Creator and Tools use supported interfaces rather than internal files or writable state. No separate public gameplay-module API, generic module lookup or network API is required; capability inspection is introduced only for demonstrated consumer needs.

## Security and resource ownership

Follow [ADR 0066](decisions/0066-security-and-trust.md) and the [security model](engine/contracts/SECURITY_MODEL.md). Treat external data as untrusted, validate authorization and invariants, isolate state and commit atomically. First-party executable engine code is trusted; canonical game data is untrusted and declarative, cannot select arbitrary executable code and cannot grant mutation authority. JavaScript encapsulation is not a security sandbox. Presentation environments and platform adapters own authentication, storage, network and presentation protections. Use safe algorithms and explicit resource ownership; introduce concrete limits and disposal interfaces only when justified.

## Error handling and diagnostics

Follow [ADR 0065](decisions/0065-error-handling.md) and the [error-handling contract](engine/contracts/ERROR_HANDLING.md). Distinguish data validation, operation rejection, intentional gameplay failure, execution failure, programming error and platform failure. Domain modules detect findings independently; orchestration aggregates and translates them into existing operation-specific contracts. Expected failures use structured diagnostics or results, while unexpected failures may use native exceptions internally. Preserve atomicity and fail closed if committed integrity cannot be guaranteed. Hosts own reporting and logging; no core logger or global error bus in Foundation. Public initialization interfaces follow the [public API contract](engine/contracts/PUBLIC_API.md). Administrative recovery follows the [runtime reset and integrity contract](engine/contracts/RUNTIME_STATE.md#administrative-reset-and-integrity).

## Action flow

    Presentation input -> Selected interaction or direct canonical action submission
      -> Action dispatcher -> Registry resolution and validation
      -> Atomic rules/world transition and turn progression -> Semantic result -> Presentation

Actions identify an actor, action type and relevant targets. The runtime validates availability and permissions, not merely syntax. Output carries semantic information and an intended audience; hosts decide how to render or deliver it.

The action architecture recognizes only unqualified identifiers in the authoritative standard catalog; games configure supported behavior declaratively. Executable handlers are engine-owned, including handlers contributed by selected first-party gameplay modules. The registry resolves supported definitions and trusted handlers; it is independent of dispatch. Completed results distinguish gameplay success and failure, while rejected actions and execution errors commit no state or turns. The dispatcher exclusively selects configured success/failure costs and commits state and progression atomically. The initial movement design defaults to one turn on success and zero on rejected unavailable exits; configurable costs and contextual behavior are planned Foundation work. Committed turns advance abstract game time; the optional Date Time gameplay module may translate them into fictional dates and durations. Intermediate scheduled turns cannot be skipped; interruption semantics are deferred.

See the [action/result contract](engine/contracts/ACTIONS_AND_RESULTS.md), [action definitions](engine/contracts/ACTION_DEFINITIONS.md), [standard action catalog](engine/contracts/STANDARD_ACTIONS.md), and ADRs [0053](decisions/0053-action-architecture.md) and [0062](decisions/0062-game-time-and-calendar.md). The registry, argument validation, dispatcher and atomic turn progression infrastructure are implemented. Production gameplay transitions require registered gameplay handlers, which are planned but not yet implemented. Foundation includes shared visibility/access evaluation, navigation, speech, inventory, mechanical and contextual actions, configurable actions and declarative behavior (composition requires review), generic conditions/effects, action reactions, deterministic randomness and ordered events. Authorized non-player actor execution must preserve transactional authority and avoid duplicate turn advancement. Specialized policies and NPC decision-making remain declarative game logic wherever practical; reusable executable capabilities require justified first-party development.

## Canonical definitions and authoring

The [canonical game-definition contract](engine/contracts/GAME_DEFINITIONS.md) defines the current supported format 3.2.0, including game identity, content version, stable world IDs, locations, directed exits, actors and entities with unified containment, lifecycle, associations and physical characteristics. Definitions are immutable during play; mutable instance state is separate. Future rules, events, action configuration and module requirements need explicit reviewed schema contracts.

The approved native representation is modular canonical JSON with distinct logical gameplay, interaction and presentation definitions. Direct JSON authoring, a future declarative language and Creator are independent workflows targeting common contracts. Tools assemble and resolve source definitions, validate cross-component references and translate bidirectionally with semantic equivalence; exact source formatting and comments need not round-trip. Engine validates applicable gameplay data and does not know source-file organization, authoring-language syntax, encrypted package details or UI/UX metadata. Creator workspace metadata stays separate. Modular loading, physical file boundaries, schema revisions and language design are planned and require review; format 3.2.0 remains unchanged.

The initial release uses declarative game-specific behavior, not executable scripts or a second execution environment. Future executable scripting is nonbinding and would require a separate architecture and security review. See [ADR 0054](decisions/0054-canonical-definitions-and-authoring.md).

Creator is a planned optional offline authoring application for structured editing, JSON import/export, language editing, UI/UX design, validation, playtesting and distribution. Tools own shared translation, validation coordination and compilation functionality; Creator consumes these rather than implementing separate semantics. Framework selection and application dependencies require review. Neither Creator nor development tools are part of finished games.

### Distribution packages and content protection

Keep the readable canonical JSON definition distinct from distributed packages. Tools, independently usable without Creator, may protect content against casual inspection; unprotected distribution is the default. Host/package loaders unpack and, when applicable, decode or decrypt data outside the core, then validate the canonical definition before initializing runtime state. Package versioning is independent of definition and content versions. Both modes must support offline gameplay. No mandatory DRM, online activation or guarantee of secrecy from an operator who controls the offline client; embedded unlock material is recoverable. See [ADR 0058](decisions/0058-compilation-and-distribution.md). Foundation includes a reproducible single compact JavaScript engine bundle, practical minification/obfuscation, appropriate compression, protected/unprotected game packages and source/bundle equivalence verification. Selective gameplay and interaction composition and compatibility metadata are planned. Tools include mandatory engine, selected modules and explicit dependencies, applicable definitions, assets, UI/UX and required license notices; exclude unneeded executable capabilities and development tools. Engine-only distribution is supported as an architectural target. Runtime loaders remain distinct from build tools. Concrete tools, formats, encryption and key handling require design review; Creator and standalone HTML host integration follow later.

## State and saves

Derive actor location and inventory from authoritative containment; players and actors are distinct. Track entity state and directed nonphysical property relationships, and future merchant stock, quests, flags, pending events and gameplay-relevant narrative position only as their contracts require. Purely interaction or presentation state remains outside authoritative gameplay state. Use one authoritative containment tree rooted at engine-recognized, non-navigable World. Actor locations, inventories and loads are derived. Containment transports descendants; spatial associations do not. Lifecycle and capacity invariants apply to all candidate transitions. See [containment](engine/contracts/WORLD_CONTAINMENT.md), [physical properties](engine/contracts/PHYSICAL_PROPERTIES.md), [ADR 0059](decisions/0059-world-containment-and-transitions.md) and [ADR 0060](decisions/0060-physical-properties-and-capacity.md). Authorized internal relocation, physical association and property mutations, and generic lifecycle transitions are implemented. Shared actor-scoped visibility/access evaluation is planned Foundation work; specific visibility policies, legal ownership, lighting and other specialized mechanics belong to declarative game content or justified first-party gameplay capabilities.

Store only normalized current overrides against the immutable baseline and supported dynamic data. Six gameplay scopes: world, location, entity, actor, player and directional relationship. The target uses engine-controlled qualified domain namespaces and game-authored properties. The current property grammar and authorization remain governed by reviewed contracts until reconciled. Players and actors are distinct; no persistent instance ID. Save format 1.0.0 requires exact game/content/definition version matching and complete candidate validation before atomic replacement. Foundation will define necessary transactional random, pending event and selected gameplay-module state and implement atomic capture/restoration; current save format remains the accepted baseline until revised explicitly. Dynamic identity creation remains deferred. See [properties](engine/contracts/PROPERTIES.md), [runtime state](engine/contracts/RUNTIME_STATE.md) and [save data](engine/contracts/SAVE_DATA.md).

Planned runtime serialization is independent of where state is stored. Browser hosts may use IndexedDB with portable file import/export as a fallback; local-file browser persistence is not guaranteed. No gameplay undo or backward navigation; transaction rollback is mandatory. Human player knowledge and host/session data are not saved.

## Interaction and presentation

After the standalone Foundation distribution, a text-only offline browser interface is a planned playable target; standalone HTML and other host delivery mechanisms remain separate work. Future hosts may include command-line, server and Discord adapters.

Design action and state contracts for multiple actors now, but implement one player first. Future multiplayer requires server-authoritative state, actor/session identity, scoped outputs, concurrency control and transactional persistence. Do not assume single-player game definitions are automatically multiplayer-safe.

Date Time is an optional first-party gameplay module. Text Parser and Visual Novel are optional interaction modules above the engine; visual/audio presentation remains outside gameplay execution. The engine emits semantic results, not rendered graphics. Spoken dialogue selections and typed speech can submit equivalent canonical say actions; the game defines their consequences.

## Testing

The [testing strategy](../tests/README.md) establishes unit, contract, integration, security and architecture verification, meaningful behavioral coverage and implementation-story completion criteria. Use review and native automated checks where useful.

Test the runtime headlessly with game fixtures, action sequences, invalid commands, rule enforcement, save/restore equivalence and deterministic execution and test reproducibility where applicable, without requiring action-history replay for persistence. Test interaction, presentation adapters, Tools and Creator separately as introduced.

Development uses Node.js 26 LTS, npm and the native test runner, with no third-party npm dependencies. These tools do not enter the runtime or standalone game distributions. Distribution-only tooling exceptions and Creator framework dependencies require separate explicit approval; zero third-party core runtime dependencies remain mandatory. See [ADR 0061](decisions/0061-development-and-testing-tooling.md).
