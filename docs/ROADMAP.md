# Roadmap

Milestones are subject to refinement. Accepted design, implemented capability and verified behavior are distinct; only actual tests establish verification. See the [documentation index](README.md). [GitHub Issues](https://github.com/ja-sanborn/asterweave/issues) are the actionable user-story backlog for these milestones.

## 1. Foundation

- Establish [unified containment](contracts/WORLD_CONTAINMENT.md) and [physical capacity](contracts/PHYSICAL_PROPERTIES.md) ([FND-12, issue #23](https://github.com/ja-sanborn/asterweave/issues/23); design defined; introduced format 2.0.0, superseded by FND-04 format 3.0.0 and FND-05 navigation expansion to 3.1.0 and physical measurement expansion to 3.2.0).
- Establish [properties](contracts/PROPERTIES.md), [runtime state](contracts/RUNTIME_STATE.md) and [save data](contracts/SAVE_DATA.md) ([FND-04, issue #6](https://github.com/ja-sanborn/asterweave/issues/6); design defined; initial state and inspection implemented in FND-05, mutations/reset in FND-06 and save/restore in Phase 2).
- Establish the [canonical JSON game-definition contract](contracts/GAME_DEFINITIONS.md) and reusable fixture ([FND-03, issue #5](https://github.com/ja-sanborn/asterweave/issues/5); design defined, validation and initialization tracked in FND-05).
- Establish [action/result and action definition contracts](contracts/ACTIONS_AND_RESULTS.md) and the [standard action reference catalog](contracts/STANDARD_ACTIONS.md) ([FND-02, issue #4](https://github.com/ja-sanborn/asterweave/issues/4); design only, implementation tracked separately).
- Establish ES module development conventions and automated tests ([FND-01, issue #3](https://github.com/ja-sanborn/asterweave/issues/3); completed).
- Establish project-wide [modular architecture (ADR 0016)](decisions/0016-modular-architecture-and-design-patterns.md), [error handling (ADR 0017)](decisions/0017-error-handling-and-diagnostics.md), [public API and compatibility (ADR 0018)](decisions/0018-public-api-and-compatibility.md), [security and resources (ADR 0019)](decisions/0019-security-and-trust-boundaries.md), [coding standards](CODE_STYLE.md) and [testing strategy](../tests/README.md); design accepted; FND-05 implements the applicable initial runtime boundaries and tests; later stories extend them.
- [FND-05 (#7)](https://github.com/ja-sanborn/asterweave/issues/7): definition validation (3.2.0), isolated initialization and initial public inspection; design accepted, implementation pending. See ADRs [0020](decisions/0020-standardized-operation-result-architecture.md)–[0022](decisions/0022-flexible-physical-measurement-ranges.md).
- [FND-06 (#8)](https://github.com/ja-sanborn/asterweave/issues/8): runtime state, transactions and dispatch (planned; depends on registry).
- [FND-07 (#9)](https://github.com/ja-sanborn/asterweave/issues/9): internal containment, capacity and derived queries (planned).
- [FND-08 (#10)](https://github.com/ja-sanborn/asterweave/issues/10): world navigation (planned).
- [FND-09 (#11)](https://github.com/ja-sanborn/asterweave/issues/11): integrated Foundation verification (planned).
- Implement the independent action registry ([FND-10, issue #15](https://github.com/ja-sanborn/asterweave/issues/15)) before FND-06 dispatch.
- Establish the versioned author guide after integrated Foundation verification ([FND-11, issue #20](https://github.com/ja-sanborn/asterweave/issues/20); planned).

- Establish the authoring/distribution boundary for optional content protection ([ADR 0010](decisions/0010-game-packaging-and-content-protection.md), FND-03 design only).

## 2. Text adventure

- Implement the basic deterministic command parser, object resolution and error responses.
- Add player-facing inventory/container actions, doors, lifecycle operations, perception, conditions and turn-based events; implement standard actions through focused stories as capabilities are designed.
- Implement configurable standard actions ([#16](https://github.com/ja-sanborn/asterweave/issues/16)) and declarative custom actions ([#17](https://github.com/ja-sanborn/asterweave/issues/17)).
- Implement optional fictional clock/calendar support ([#18](https://github.com/ja-sanborn/asterweave/issues/18)), coordinated with rules/events and persistence.
- Implement versioned save serialization and atomic restoration ([issue #25](https://github.com/ja-sanborn/asterweave/issues/25)); storage adapters and optional protection remain separate.
- Build a small JSON-authored example and a text-only offline browser host.
- Design and implement versioned game packaging and optional content protection outside the core ([issue #22](https://github.com/ja-sanborn/asterweave/issues/22)); support unprotected and protected offline distributions without Creator.

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
