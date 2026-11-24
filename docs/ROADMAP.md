# Roadmap

All milestones are planned and subject to refinement. [GitHub Issues](https://github.com/ja-sanborn/asterweave/issues) are the actionable user-story backlog for these milestones.

## 1. Foundation

- Define module boundaries and versioned game and save schemas.
- Establish [action/result and action definition contracts](contracts/ACTIONS_AND_RESULTS.md) and the [standard action reference catalog](contracts/STANDARD_ACTIONS.md) ([FND-02, issue #4](https://github.com/ja-sanborn/asterweave/issues/4); design only, implementation tracked separately).
- Establish ES module development conventions and automated tests ([FND-01, issue #3](https://github.com/ja-sanborn/asterweave/issues/3); completed).
- Implement state, entities, ownership, world navigation and action dispatch.
- Implement the independent action registry ([FND-10, issue #15](https://github.com/ja-sanborn/asterweave/issues/15)) before FND-06 dispatch.

## 2. Text adventure

- Implement the basic deterministic command parser, object resolution and error responses.
- Add inventory, doors, containers, conditions and turn-based events; implement standard actions through focused stories as capabilities are designed.
- Implement configurable standard actions ([#16](https://github.com/ja-sanborn/asterweave/issues/16)) and declarative custom actions ([#17](https://github.com/ja-sanborn/asterweave/issues/17)).
- Implement optional fictional clock/calendar support ([#18](https://github.com/ja-sanborn/asterweave/issues/18)), coordinated with rules/events and persistence.
- Implement serialization and restoration.
- Build a small JSON-authored example and a text-only offline browser host.

## 3. Interactive narrative

- Add conditional choices, dialogue, branching sequences and transitions between interaction modes.
- Extend the example to demonstrate shared world and narrative state.

## 4. Creator

- Design a readable authoring format targeting the canonical JSON schema.
- Implement compiler, validation, diagnostics, playtesting and export.
- Keep all authoring dependencies outside the player runtime.

## 5. Extensions and additional hosts

- Evaluate visual novel and audio presentation extensions.
- Explore server-side hosting, Discord integration and multiple actors.
- Add multiplayer only after explicit concurrency, security and persistence designs.

## Future compatibility and reference games

- Evaluate recreating one or more games from the original Zork trilogy as reference games and compatibility proofs of concept when the runtime and authoring capabilities mature. Scope and priorities are undecided; use findings to identify general-purpose engine gaps.
- See [future considerations](FUTURE_CONSIDERATIONS.md) for nonbinding initiatives and open questions.
