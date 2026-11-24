# Roadmap

All milestones are planned and subject to refinement.

## 1. Foundation

- Define module boundaries, action/result contracts and versioned game and save schemas.
- Establish ES module development conventions and automated tests.
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
