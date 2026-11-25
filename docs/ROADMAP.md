# Roadmap

Milestones are subject to refinement. Accepted design, implemented capability and verified behavior are distinct; only actual tests establish verification. See the [documentation index](README.md). [GitHub Issues](https://github.com/ja-sanborn/asterweave/issues) are the actionable user-story backlog for these milestones.

## 1. Foundation

- Establish ES module development conventions, native automated tests, [coding standards](CODE_STYLE.md), [testing strategy](../tests/README.md) and cross-cutting architecture, public API, error-handling and security principles.
- Establish the [canonical JSON game-definition contract](contracts/GAME_DEFINITIONS.md), [unified containment](contracts/WORLD_CONTAINMENT.md), [physical capacity](contracts/PHYSICAL_PROPERTIES.md), [properties](contracts/PROPERTIES.md), [runtime state](contracts/RUNTIME_STATE.md) and [save data](contracts/SAVE_DATA.md) contracts.
- Establish [action and result contracts](contracts/ACTIONS_AND_RESULTS.md), [action definitions](contracts/ACTION_DEFINITIONS.md) and the [standard action reference catalog](contracts/STANDARD_ACTIONS.md).
- Provide native definition validation, isolated initialization and read-only effective-state inspection.
- Implement the independent action registry before runtime transactions and dispatch.
- Implement runtime mutations, reset, atomic transactions and action dispatch.
- Implement internal containment transfers, capacity enforcement and derived queries.
- Implement world navigation.
- Verify integrated headless runtime behavior and establish the versioned author guide.
- Establish the authoring/distribution boundary for optional content protection ([ADR 0010](decisions/0010-game-packaging-and-content-protection.md)).

## 2. Text adventure

- Implement the basic deterministic command parser, object resolution and error responses.
- Add player-facing inventory/container actions, doors, lifecycle operations, perception, conditions and turn-based events; implement standard actions as capabilities are designed.
- Implement configurable standard actions and declarative custom actions.
- Implement optional fictional clock/calendar support, coordinated with rules/events and persistence.
- Implement versioned save serialization and atomic restoration; storage adapters and optional protection remain separate.
- Build a small JSON-authored example and a text-only offline browser host.
- Design and implement versioned game packaging and optional content protection outside the core; support unprotected and protected offline distributions without Creator.

## 3. Interactive narrative

- Add conditional choices, dialogue, branching sequences and transitions between interaction modes.
- Extend the example to demonstrate shared world and narrative state.

## 4. Creator

- Design a readable authoring format targeting the canonical JSON schema.
- Implement compiler, validation, diagnostics, playtesting and export, including integration with the Phase 2 packaging workflow.
- Keep all authoring dependencies outside the player runtime.

## 5. Extensions and additional hosts

- Evaluate visual novel and audio presentation extensions.
- Explore server-side hosting, Discord integration and multiple actors.
- Add multiplayer only after explicit concurrency, security and persistence designs.

## Future compatibility and reference games

- Evaluate recreating one or more games from the original Zork trilogy as reference games and compatibility proofs of concept when the runtime and authoring capabilities mature. Scope and priorities are undecided; use findings to identify general-purpose engine gaps.
- See [future considerations](FUTURE_CONSIDERATIONS.md) for nonbinding initiatives and open questions.
