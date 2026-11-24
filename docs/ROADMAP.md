# Roadmap

All milestones are planned and subject to refinement. [GitHub Issues](https://github.com/ja-sanborn/asterweave/issues) are the actionable user-story backlog for these milestones.

## 1. Foundation

- Define module boundaries, action/result contracts and versioned game and save schemas.
- Establish ES module development conventions and automated tests ([FND-01, issue #3](https://github.com/ja-sanborn/asterweave/issues/3); infrastructure introduced, CI verification tracked in the pull request).
- Implement state, entities, ownership, world navigation and action dispatch.

## 2. Text adventure

- Implement the basic deterministic command parser, object resolution and error responses.
- Add inventory, doors, containers, conditions and turn-based events.
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
