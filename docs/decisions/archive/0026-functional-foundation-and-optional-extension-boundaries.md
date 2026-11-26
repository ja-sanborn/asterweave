# 0026 — Functional Foundation and optional extension boundaries

> **Archived — historical only.** Superseded by [ADR 0051](../0051-product-architecture.md), [ADR 0052](../0052-module-composition.md), [ADR 0053](../0053-action-architecture.md), [ADR 0054](../0054-canonical-definitions-and-authoring.md), [ADR 0055](../0055-state-and-transactions.md), [ADR 0056](../0056-persistence.md), [ADR 0057](../0057-engine-interface-and-compatibility.md), [ADR 0058](../0058-compilation-and-distribution.md), [ADR 0062](../0062-game-time-and-calendar.md), [ADR 0065](../0065-error-handling.md). The original decision text below is not current authority.


Status: Accepted

## Context

The initial Foundation milestone focused on headless infrastructure and movement. The approved backlog expands it to a functional, independently usable gameplay engine with reusable actions, authored behavior, optional extension integration, portable persistence and standalone distribution. The engine should support diverse games without adopting any reference game's specialized mechanics as mandatory behavior.

## Decision

Foundation delivers a platform-independent engine capable of executing a manually authored JSON game to an authored conclusion through the documented public API, without a parser, visual novel, Creator or mandatory host interface.

- The core owns identity, authoritative state, validation, containment, generic lifecycle and relocation operations, action execution, transactions, abstract turns, rules/effects, ordered events and persistence. Provide shared actor-scoped visibility/access evaluation and authorized non-player actor execution; policies and NPC decision-making belong to games or extensions.
- Ship the planned reusable standard action handlers independently of dispatcher logic. Games may configure supported actions, define custom actions and authored conditional behavior. No game is required to use every standard action.
- Provide supported, narrow extension integration contracts for controlled setup, identity, compatibility, namespaces, validation, restricted capabilities, transactional state and lifecycle. Input and presentation clients do not automatically need gameplay mutation authority. Trusted executable extensions are not sandboxed; arbitrary executable JSON remains prohibited.
- Provide optional deterministic randomness with isolated transactional state and reproducible continuation. Its algorithm, seed policy and placement as a built-in primitive or supported capability provider require separate review.
- Include platform-independent save capture and atomic restoration in Foundation, with explicit compatibility for necessary random, event and supported extension state. Storage remains host-owned.
- Include standalone distribution outside core: one compact JavaScript engine module, minification, practical internal obfuscation, appropriate compression, versioned game packages with author-selectable encryption and supported unprotected default, and selective extension inclusion. Preserve public behavior, offline operation, zero core runtime dependencies, MPL obligations and the protection limitations of ADR 0010. Standalone HTML delivery remains subsequent host work.
- Date Time, Text Parsing and Visual Novel are independently optional post-Foundation extensions. Typed speech and selected spoken dialogue may submit equivalent canonical say actions; games define the meaning and consequences. Creator is an independent offline JavaScript web application with separately reviewed framework dependencies, not a runtime prerequisite.
- Lantern House and Zork I are reference-game initiatives. Zork is a compatibility reference, not a normative engine specification or dependency. Keep combat, lighting, scoring, fictional death, vehicle-specific behavior and other specialized mechanics in game data or optional extensions.

## Alternatives

Retain a minimal Foundation and defer persistence, extensibility and distribution; require parser or presentation layers to supply gameplay authority; implement reference-game mechanics directly in core. These alternatives either leave the engine incomplete as an independent product or couple it to particular games and interaction modes.

## Consequences

This record supersedes the milestone restrictions of ADRs [0006](0006-atomic-action-execution-and-turn-progression.md), [0010](0010-game-packaging-and-content-protection.md), [0015](0015-state-isolation-and-persistence.md) and [0017](0017-error-handling-and-diagnostics.md) only where they conflict with the revised scope. It elaborates ADRs 0007, 0008, 0018, 0021, 0023 and 0024 without changing their current normative technical contracts. Preserve historical decisions and update the relevant contracts when concrete designs are approved.

No public signature, schema field, format version, cryptographic mechanism, random algorithm or tooling dependency is selected by this record. Current canonical format 3.2.0, save format 1.0.0 and engine package 0.0.0 remain unchanged. The existing zero third-party development dependency policy remains in force until explicitly revised. Planned capabilities are not implemented or verified merely because their scope is accepted.

See the [roadmap](../ROADMAP.md), [architecture](../ARCHITECTURE.md), [public API](../contracts/PUBLIC_API.md) and [standard actions](../contracts/STANDARD_ACTIONS.md).
