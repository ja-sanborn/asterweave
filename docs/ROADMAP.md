# Roadmap

Milestones establish development priorities, not rigid dependency barriers or mandatory runtime composition. Accepted design, implemented capability and verified behavior are distinct; only actual implementation and tests establish the latter two. [GitHub Issues](https://github.com/ja-sanborn/asterweave/issues) are the authoritative actionable backlog, acceptance criteria, dependencies and completion status. See the [documentation index](README.md), [active decisions](decisions/README.md) and [product architecture](decisions/0051-product-architecture.md).

## Story identifier conventions

Story identifiers classify work by principal component responsibility, independently of priority, implementation order and roadmap phase. Numeric suffixes identify stories within a component; GitHub issue numbers remain stable.

| Prefix | Responsibility |
| --- | --- |
| ENG | Mandatory engine infrastructure and shared gameplay mechanisms |
| MOD | Reusable first-party gameplay modules |
| INT | Interaction modules and presentation integration |
| TLS | Authoring, translation, validation coordination, compilation and distribution Tools |
| CRT | Creator application and workspace management |
| SMP | Samples and reference games |
| PRJ | Cross-component project initiatives, integration and documentation |
| FND | Historical Foundation identifiers retained for continuity |

Completed, canceled and transitional historical stories retain their original identifiers. New work follows component-based classification. Foundation is a milestone, not a synonym for mandatory engine infrastructure.

## 1. Foundation

Deliver a functional, modular, platform-independent headless gameplay engine that can execute a directly authored game through an authored conclusion and produce independently usable engine bundles and encrypted game content packages without Creator or mandatory presentation.

### Established infrastructure

- Development conventions, native automated tests, [coding standards](CODE_STYLE.md), [testing strategy](../tests/README.md), and cross-cutting architecture, public API, error-handling and security principles.
- [Canonical definitions](engine/contracts/GAME_DEFINITIONS.md), [containment](engine/contracts/WORLD_CONTAINMENT.md), [physical capacity](engine/contracts/PHYSICAL_PROPERTIES.md), [properties](engine/contracts/PROPERTIES.md), [runtime state](engine/contracts/RUNTIME_STATE.md), [save design](engine/contracts/SAVE_DATA.md) and [action contracts](engine/contracts/ACTIONS_AND_RESULTS.md).
- Native definition validation for supported format 4.0.0, isolated initialization, detached read-only effective-state inspection, engine-controlled internal action registry, transactional dispatch and administrative reset.
- Internal authoritative containment transfers, derived queries and physical loads, directed association operations, authorized physical property mutations and explicit participant lifecycle operations, with transactional player-control cleanup. Production gameplay handlers, persistence implementation and distribution Tools remain planned.

### Planned capabilities

- Introduce first-party gameplay modules using minimal explicit acyclic composition and restricted transaction capabilities. No public executable extension framework.
- Implement navigation, observation and shared actor-scoped access, speech, inventory, mechanical and contextual interactions through the [standard action catalog](engine/contracts/STANDARD_ACTIONS.md). Shared required access enforcement must remain available when optional observation handlers are omitted.
- Implement engine-controlled configurable actions and declarative action behavior, deterministic randomness, conditions, effects and action reactions, without arbitrary authored action identities or executable handlers.
- Implement ordered turn-based events and authorized non-player actor execution without duplicate turn advancement.
- Implement platform-independent versioned save capture and atomic restoration, including necessary random, event and selected gameplay-module state. Storage remains outside Engine; optional save-file protection is independent of content package encryption.
- Implement modular canonical gameplay definition assembly and coordinated validation after gameplay and persistence implementation and before integrated verification. Preserve complete canonical JSON as a directly consumable independent workflow; explicitly review schema and persistence compatibility.
- Verify a complete small JSON-authored game through production public interfaces, including authored completion, deterministic continuation, selected capability composition and equivalent assembled/direct definitions. Keep specialized gameplay policies in authored data or justified reusable first-party modules.
- Deliver a standalone compact JavaScript engine bundle and an independently useful versioned encrypted game content package through Tools. Explicitly select modules and resolve dependencies, safely optimize and exclude unnecessary executable capabilities and development tools. All compiled game content packages are encrypted at build time; direct readable unencrypted canonical JSON remains independently supported. Loaders perform authenticated decryption and unpacking outside gameplay Engine; applicable consumers independently validate decoded data. Verify compatibility, integrity, source/bundle behavior, direct/decrypted semantic equivalence, offline execution and applicable licensing. See [ADR 0058](decisions/0058-compilation-and-distribution.md).
- Reconcile documentation and establish the versioned game-author guide after integrated runtime and initial distribution verification.

## 2. Interaction and expanded gameplay

Planned first-party capabilities, independently selectable where applicable:

- Date Time: fictional dates and calendars derived from committed turns, with compatible transactional state and persistence.
- Text Parser: deterministic vocabulary, grammar and contextual resolution translating input into canonical actions through documented Engine interfaces.
- Visual Novel: authored dialogue, choices and narrative progression, with optional visual presentation. Spoken selections submit speech actions; other selections submit applicable actions. Separate authoritative gameplay progression from interaction coordination and rendering.
- Offline text-only browser presentation: integrate Text Parser, safe semantic rendering, accessible input/output and portable saves without placing platform responsibilities in Engine.
- Complete playable game distribution: Tools compose the engine bundle, encrypted content package, selected interaction modules, applicable presentation, assets and dependencies. Start with the offline text-only browser interface; extend to other presentation targets when justified. Verify offline gameplay, compatible loading, exclusion and licensing. No mandatory dependency on Visual Novel, Date Time, authoring language or Creator for the initial text-based distribution.

Specialized mechanics remain authored wherever practical; promote reusable gameplay functionality only when justified. Interaction and presentation data extend the applicable canonical contracts through reviewed design.

## 3. Authoring and expanded Tools

- Implement an independently usable expressive declarative authoring language targeting supported canonical JSON semantics, with reviewed syntax, grammar, diagnostics and versioning.
- Provide bidirectional semantic translation and coordinated validation using shared Tools; exact formatting and comments need not round-trip. No second gameplay runtime or arbitrary executable authored code.
- Expand canonical assembly, validation, compilation and distribution workflows as additional supported gameplay, interaction and presentation capabilities justify them.
- Preserve direct canonical JSON and Creator as independent authoring workflows targeting common contracts. Review generated UI/UX design separately before adding requirements.

## 4. Creator

- Build an optional offline JavaScript web application for workspace management, visual editing, language editing, UI/UX authoring, diagnostics, playtesting orchestration and export UX.
- Initially support text-adventure authoring and preview using established Engine, canonical assembly, language translation, Text Parser, browser presentation and complete playable distribution interfaces.
- Reuse Engine gameplay validation and execution and independently usable Tools for translation, assembly, coordinated validation, compilation and distribution. Do not duplicate domain rules or independently simulate gameplay.
- Keep Creator workspace metadata separate from canonical definitions and finished distributions. Additional module-specific editors can be introduced incrementally; Visual Novel and Date Time are not initial prerequisites.
- Review frameworks, tooling, licensing and dependencies before adoption; isolate application dependencies from Engine and player distributions. Direct JSON authoring and distribution remain independent of Creator.

## 5. Complete reference games

- Lantern House: complete original example with direct API playability, parser-driven offline browser interface and reproducible complete playable distribution using encrypted content packages.
- Zork I: subsequent native Asterweave recreation after Lantern House; review fidelity, compatibility, licensing and distribution rights before porting. Treat it as a compatibility reference, not a normative engine specification or runtime dependency.
- Smaller samples and integration fixtures are introduced throughout development. Complete reference games do not require Creator, the authoring language or unrelated gameplay modules.

## Future considerations

Standalone HTML delivery, additional browser interfaces, CLI, audio, server and Discord hosts require separate scope and design review. Multiplayer requires explicit authentication, concurrency, security, scoped output and persistence designs. Other potential initiatives, including Zork II/III and executable scripting, are nonbinding unless separately approved. See [future considerations](FUTURE_CONSIDERATIONS.md).
