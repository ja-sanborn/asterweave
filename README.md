# Asterweave

*Stories woven. Worlds imagined.*

Asterweave is an open-source, platform-independent interactive fiction engine designed to empower storytellers through exploration, imagination, and meaningful choices. It is a sibling project to Asterwake, focused on narrative and world interaction rather than graphical game rendering.

Inspired by classic parser adventures such as Zork, branching fiction, gamebooks, and visual novels, Asterweave aims to combine free-form exploration with authored choices in a single reusable engine.

## Project status

Asterweave is in Foundation development. Development and native test infrastructure are established. The architecture, canonical game-definition format 3.2.0, state/save design and project-wide standards are documented. FND-05 implements native definition validation, isolated initialization and read-only effective-state inspection. The implementation has passed native tests on its feature branch; final contract corrections and review remain outstanding. Action processing and gameplay remain planned; no playable release exists. The current private package is version 0.0.0.

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

The planned command parser, choice engine and narrative systems submit actions to a shared, platform-independent core. The core validates requests, applies domain rules, commits state atomically and returns semantic results. Hosts handle input, output, logging, storage and platform security. Creator compiles authoring content to canonical JSON and is not required in finished games.

The initial Foundation milestone is a headless runtime; the first playable target is a text-only offline browser adventure in Phase 2. Online hosting, multiplayer and graphical presentation are later capabilities.

## Documentation

Start with the [technical documentation index](docs/README.md).

| Resource | Purpose |
| --- | --- |
| [Architecture](docs/ARCHITECTURE.md) | System design and boundaries |
| [Engine contracts](docs/contracts/README.md) | Required behavior and data formats |
| [Architecture decisions](docs/decisions/README.md) | Accepted decisions and historical context |
| [Coding standards](docs/CODE_STYLE.md) | JavaScript conventions |
| [Testing strategy](tests/README.md) | Verification and definition of done |
| [Roadmap](docs/ROADMAP.md) | Development priorities |
| [Future considerations](docs/FUTURE_CONSIDERATIONS.md) | Nonbinding ideas |

The versioned game-author guide is planned under [FND-11 (#20)](https://github.com/ja-sanborn/asterweave/issues/20). The [public API contract](docs/contracts/PUBLIC_API.md) identifies the implemented FND-05 interface; other planned capabilities remain governed by their contracts and stories.

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

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [coding standards](docs/CODE_STYLE.md). [GitHub Issues](https://github.com/ja-sanborn/asterweave/issues) track user stories, technical tasks and defects. AI coding agents must follow [AGENTS.md](AGENTS.md); human and AI contributors use the same [technical documentation index](docs/README.md). The project is currently establishing its foundations, so substantial architectural changes should be discussed before implementation.

## Security

See the [technical security model](docs/contracts/SECURITY_MODEL.md) for trust boundaries and [SECURITY.md](SECURITY.md) for private vulnerability reporting. Do not disclose vulnerabilities in public issues.

## License and attribution

Asterweave is licensed under the [Mozilla Public License 2.0](LICENSE). Independently authored games and extensions may use their own licenses, subject to the MPL obligations for covered source files.

Originally created by [JA Sanborn](https://github.com/ja-sanborn). See [NOTICE](NOTICE) and [AUTHORS.md](AUTHORS.md) for attribution.
