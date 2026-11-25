# Asterweave

*Stories woven. Worlds imagined.*

Asterweave is an open-source, platform-independent interactive fiction engine designed to empower storytellers through exploration, imagination, and meaningful choices. It is a sibling project to Asterwake, focused on narrative and world interaction rather than graphical game rendering.

Inspired by classic parser adventures such as Zork, branching fiction, gamebooks, and visual novels, Asterweave aims to combine free-form exploration with authored choices in a single reusable engine.

## Project status

Asterweave is in Foundation development. Development and native test infrastructure are established. The architecture, canonical game-definition format 3.2.0, state/save design and project-wide standards are documented. The runtime supports native definition validation, isolated initialization, read-only effective-state inspection and internal action registration and argument validation. Synchronous action processing, transactional state and administrative reset infrastructure are implemented; production gameplay handlers remain planned and no playable release exists. The current private package is version 0.0.0.

## Design goals

- Standard JavaScript with no third-party runtime dependencies in the core.
- Offline-first gameplay, with an independently usable engine distribution before a standalone browser host.
- No DOM, graphics, network, filesystem, or storage dependencies in the core.
- Data-driven, genre-independent worlds and narratives using a versioned JSON game format.
- Deterministic command parsing and choice-driven interaction without AI services.
- Optional modules and host adapters; distribute only what a game requires.
- Accessible authoring tools that do not require programming knowledge.

## Planned capabilities

- Foundation: generic world and lifecycle operations, reusable standard actions, configurable and custom actions, declarative rules, events, deterministic randomness and supported extension contracts.
- Portable saves: versioned state capture and atomic restoration; storage adapters remain host responsibilities.
- Standalone distribution: a compact JavaScript engine bundle and versioned game packages with optional encryption, independent of Creator and presentation.
- Optional extensions: Date Time, Text Parsing and Visual Novel; games may include any combination or none.
- Creator: an offline JavaScript web application for authoring, validation, playtesting and export; not required in player distributions.
- Reference games: Lantern House and a native Zork I recreation, subject to compatibility and rights review. Additional hosts and multiplayer remain future work.

## Architecture

In the intended architecture, the command parser, choice engine and narrative systems submit actions to a shared, platform-independent core that validates requests, applies domain rules, commits state atomically and returns semantic results. Hosts handle input, output, logging, storage and platform security. The planned Creator toolkit will compile authoring content to canonical JSON and will not be required in finished games.

Foundation targets a functional, extensible headless engine, verified through direct public API gameplay and standalone distribution. A text-only offline browser interface is a subsequent playable target. Games own their content and specific rules; optional extensions provide reusable specialized mechanics and interaction. See the [roadmap](docs/ROADMAP.md).

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

A versioned game-author guide is planned. The [public API contract](docs/contracts/PUBLIC_API.md) identifies supported interfaces and their behavior. See the [roadmap](docs/ROADMAP.md) for planned capabilities.

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
