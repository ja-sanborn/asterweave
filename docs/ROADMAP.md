# Roadmap

Milestones are subject to refinement. Accepted design, implemented capability and verified behavior are distinct; only actual tests establish verification. See the [documentation index](README.md). [GitHub Issues](https://github.com/ja-sanborn/asterweave/issues) are the authoritative actionable backlog and dependency order. [ADR 0026](decisions/0026-functional-foundation-and-optional-extension-boundaries.md) establishes the revised scope.

## 1. Foundation

Deliver a functional, extensible, platform-independent headless gameplay engine that can execute and distribute a manually authored game without Creator, a parser, a visual novel or other mandatory presentation components.

### Established infrastructure

- Development conventions, native automated tests, [coding standards](CODE_STYLE.md), [testing strategy](../tests/README.md) and cross-cutting architecture, public API, error-handling and security principles.
- [Canonical definitions](contracts/GAME_DEFINITIONS.md), [containment](contracts/WORLD_CONTAINMENT.md), [physical capacity](contracts/PHYSICAL_PROPERTIES.md), [properties](contracts/PROPERTIES.md), [runtime state](contracts/RUNTIME_STATE.md), [save design](contracts/SAVE_DATA.md) and [action contracts](contracts/ACTIONS_AND_RESULTS.md).
- Native definition validation, isolated initialization, read-only effective-state inspection, independent internal action registry, transactional dispatch and administrative reset infrastructure.

- Internal authoritative containment transfers, derived queries and physical loads, directed association operations, authorized physical property mutations and explicit participant lifecycle operations, with transactional player-control cleanup. Production action handlers and public extension capabilities are not yet available.

### Remaining capabilities

- Supported public extension architecture with restricted capabilities, validation, namespace ownership, transactional state and compatibility.
- Navigation, observation and shared actor-scoped access, speech, inventory and mechanical interactions; reusable standard handlers for the [planned Foundation actions](contracts/STANDARD_ACTIONS.md).
- Configurable standard actions, deterministic randomness, declarative conditions/effects and action reactions, declarative custom actions and contextual interactions.
- Ordered turn-based events and authorized non-player actor execution without duplicate turn advancement.
- Platform-independent versioned save capture and atomic restoration, including necessary random, event and supported extension state; storage remains host-owned.
- Verify a complete small JSON-authored game through the public API, including completion and deterministic continuation. Keep specialized policies in game data or extensions.
- Build a single compact JavaScript engine module and versioned protected/unprotected game packages outside core; verify source/bundle equivalence, selective extension inclusion and offline operation.
- Reconcile documentation and establish the versioned game-author guide after integrated runtime and distribution verification.

## 2. Optional extensions

Independent post-Foundation tracks, not mandatory engine layers:

- Date Time: fictional dates and calendars derived from committed turns, with compatible persistence.
- Text Parsing: deterministic vocabulary, grammar and contextual resolution translating input to canonical actions.
- Visual Novel: authored dialogue, choices and narrative progression, with optional visual presentation; spoken selections submit speech actions and other selections submit appropriate actions.

Use supported extension or client contracts and include only required capabilities in distributions. Specialized mechanics such as combat, lighting and scoring may be authored or provided by optional extensions.

## 3. Creator application

- Build an offline JavaScript web application for structured authoring, JSON import/export, validation, diagnostics, playtesting and distribution.
- Select frameworks and tooling during design review; isolate application dependencies from the engine and player runtime.
- Support optional extension-specific authoring through documented contracts. Direct JSON authoring and distribution remain independent of Creator.

## 4. Reference games

- Lantern House: complete original example with direct API playability, parser-driven offline interface and reproducible distribution.
- Zork I: subsequent native Asterweave recreation after Lantern House; review fidelity, compatibility, licensing and distribution rights before porting. Treat it as a compatibility reference, not a normative engine specification or runtime dependency.

## 5. Future hosts and capabilities

- Standalone HTML delivery, additional browser interfaces, CLI, audio, server and Discord hosts as separately scoped.
- Multiplayer only after explicit authentication, concurrency, security, scoped output and persistence designs.
- See [future considerations](FUTURE_CONSIDERATIONS.md) for nonbinding initiatives and open questions, including possible Zork II/III reference games.
