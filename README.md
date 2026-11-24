# Asterweave

*Stories woven. Worlds imagined.*

Asterweave is an open-source, platform-independent interactive fiction engine designed to empower storytellers through exploration, imagination, and meaningful choices. It is a sibling project to Asterwake, focused on narrative and world interaction rather than graphical game rendering.

Inspired by classic parser adventures such as Zork, branching fiction, gamebooks, and visual novels, Asterweave aims to combine free-form exploration with authored choices in a single reusable engine.

## Project status

Asterweave is establishing its headless runtime foundation. Action, result and canonical game-definition contracts are defined as architecture; the gameplay capabilities below are planned, not implemented. There is no playable release yet.

## Design goals

- Standard JavaScript with no third-party runtime dependencies in the core.
- Offline-first gameplay, with a standalone browser host as the initial target.
- No DOM, graphics, network, filesystem, or storage dependencies in the core.
- Data-driven, genre-independent worlds and narratives using a versioned JSON game format.
- Deterministic command parsing and choice-driven interaction without AI services.
- Optional modules and host adapters; distribute only what a game requires.
- Accessible authoring tools that do not require programming knowledge.

## Planned capabilities

- Command-based exploration: rooms, exits, objects, inventory, containers, synonyms and contextual command resolution.
- Choice-based storytelling: branching dialogue, conditional choices, narrative sequences and transitions between commands and choices.
- Persistent world state: NPCs, relationships, merchants, quests, flags, rules and turn-based events.
- Portable saves: versioned state serialization, browser storage through adapters, and save-file import/export.
- Creator toolkit: human-readable authoring, compilation to JSON, validation, playtesting and export. Creator tools are not required in game distributions.
- Future extensions: optional visual and audio presentation, server hosting, Discord interaction and multiplayer worlds.

## Architecture

The command parser, choice engine and narrative systems submit actions to the same action-driven core. The core validates actions, applies rules, updates world state and returns structured results. Hosts handle input, output and persistence. Game packages define content independently of both the authoring tools and the player interface.

The first milestone is a small, playable text-only adventure running offline in a browser. Online hosting, multiplayer and graphical presentation are future extensions, not prerequisites.

See [Architecture](docs/ARCHITECTURE.md), [action and result contracts](docs/contracts/ACTIONS_AND_RESULTS.md), [action definitions](docs/contracts/ACTION_DEFINITIONS.md), [standard action catalog](docs/contracts/STANDARD_ACTIONS.md), [canonical game definitions](docs/contracts/GAME_DEFINITIONS.md), and [Roadmap](docs/ROADMAP.md) for the design. [Future considerations](docs/FUTURE_CONSIDERATIONS.md) records nonbinding initiatives.

## Repository layout

| Directory | Purpose |
| --- | --- |
| `src/` | Runtime modules and shared contracts |
| `hosts/` | Browser and future host adapters |
| `creator/` | Optional authoring and compilation tools |
| `extensions/` | Optional gameplay and presentation capabilities |
| `examples/` | Example game definitions |
| `tests/` | Automated engine and integration tests |
| `docs/` | Architecture and project documentation |

## Development quick start

Install Node.js 26 LTS with its bundled npm. If using nvm, run `nvm install` and `nvm use` from the repository root.

```sh
npm ci
npm test
```

Node.js is for development and compatible hosts, not a requirement for standalone games. See [testing](tests/README.md) and [contributing](CONTRIBUTING.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). [GitHub Issues](https://github.com/ja-sanborn/asterweave/issues) track user stories, technical tasks and defects. AI coding agents should follow [AGENTS.md](AGENTS.md). The project is currently establishing its foundations, so substantial architectural changes should be discussed before implementation.

## License and attribution

Asterweave is licensed under the [Mozilla Public License 2.0](LICENSE). Independently authored games and extensions may use their own licenses, subject to the MPL obligations for covered source files.

Originally created by [JA Sanborn](https://github.com/ja-sanborn). See [NOTICE](NOTICE) and [AUTHORS.md](AUTHORS.md) for attribution.
