# Asterweave

*Stories woven. Worlds imagined.*

Asterweave is an open-source interactive fiction development environment, created for storytellers who want to build worlds, meaningful choices and narrative experiences. It is an independent sibling project to Asterwake, focused on narrative and world interaction rather than graphical game rendering.

Inspired by classic parser adventures such as Zork, branching fiction, gamebooks and visual novels, Asterweave brings together a platform-independent Engine, independently usable Tools and an optional Creator application.

## Project status

Asterweave is in Foundation development. Development and native test infrastructure are established. The architecture, canonical game-definition format 4.0.0, state/save design and project-wide standards are documented. The runtime supports native definition validation, isolated initialization, read-only effective-state inspection and internal action registration and argument validation. Internal containment transfers, directed associations, physical mutations and explicit lifecycle transitions are implemented. Synchronous action processing, transactional state and administrative reset infrastructure are implemented; production gameplay handlers remain planned and no playable release exists. The current private package is version 0.0.0.

## Design goals

- Standard ECMAScript and ES modules; zero third-party runtime or development npm dependencies under current decisions.
- Offline-first gameplay; no DOM, graphics, network, filesystem or storage dependencies in the gameplay engine.
- Declarative, genre-independent game content using versioned canonical JSON.
- Deterministic interaction without AI services.
- First-party reusable gameplay and interaction capabilities, selected before distribution; no public executable extension framework.
- Independent direct JSON authoring, future declarative authoring language and visual authoring workflows.

## Product architecture

| Component | Responsibility |
| --- | --- |
| Engine | Mandatory gameplay infrastructure and selected first-party gameplay modules; owns state, authorized actions and consequences. Independently usable. |
| Tools | Translation, assembly, coordinated validation, selective composition, compilation and distribution. Independently usable. |
| Creator | Optional authoring application using Engine and Tools for structured editing, UI/UX design, playtesting and export. |

Interaction modules such as the Text Parser and Visual Novel sit above the engine and submit canonical actions through its documented interface. Game-specific presentation handles input, rendering and platform integration. Games define content and specialized policies declaratively; reusable executable behavior belongs to the engine. Finished games exclude Creator, development tools and unneeded executable capabilities.

## Planned capabilities

- Foundation: a functional headless JSON-authored game through an authored conclusion; reusable navigation, observation, speech, inventory, mechanical and contextual actions; configurable engine actions and declarative behavior; rules, events, deterministic randomness and authorized non-player execution.
- Portable saves: versioned state capture and atomic restoration, independent of storage.
- Standalone distribution: compact engine bundle and versioned encrypted game content packages, independently of Creator; selected modules and required dependencies only. Build Tools always encrypt compiled game content packages; direct unencrypted canonical JSON remains independently supported. Complete playable distributions follow interaction and presentation integration.
- Additional gameplay and interaction: Date Time, Text Parser and Visual Novel; a text-only offline browser interface is a subsequent playable target.
- Authoring: modular canonical JSON, future declarative language and bidirectional semantic translation; Creator integrates these workflows.
- Samples: Lantern House and a native Zork I recreation, subject to compatibility and rights review. Additional presentation targets and multiplayer remain future work.

The current supported canonical format is 4.0.0. Modular definition loading, compilation, authoring tools and interaction modules are planned rather than implemented. See the [architecture](docs/ARCHITECTURE.md), [active ADRs](docs/decisions/README.md) and [roadmap](docs/ROADMAP.md).

## Documentation

Start with the [technical documentation index](docs/README.md).

| Resource | Purpose |
| --- | --- |
| [Architecture](docs/ARCHITECTURE.md) | System design and boundaries |
| [Engine contracts](docs/engine/contracts/README.md) | Required behavior and data formats |
| [Architecture decisions](docs/decisions/README.md) | Current architectural decisions and rationale |
| [Coding standards](docs/CODE_STYLE.md) | JavaScript conventions |
| [Testing strategy](tests/README.md) | Verification and definition of done |
| [Roadmap](docs/ROADMAP.md) | Development priorities |
| [Future considerations](docs/FUTURE_CONSIDERATIONS.md) | Nonbinding ideas |

A versioned game-author guide is planned. The [public API contract](docs/engine/contracts/PUBLIC_API.md) identifies supported interfaces and their behavior. See the [roadmap](docs/ROADMAP.md) for planned capabilities.

## Repository layout

The approved source boundaries are `src/engine/`, `src/modules/`, `src/interaction/`, `src/tools/` and `src/creator/`. Tests and component documentation follow corresponding responsibilities; samples hold reference games and demonstrations. Maintain the agreed component directories with meaningful README files even before implementation; introduce further subdirectories only when justified. Directory presence does not imply implemented functionality.

The current runtime resides under `src/engine/`, with engine-specific tests under `tests/engine/`, shared fixtures and repository-wide checks under `tests/`, and samples under `samples/`. Engine technical documentation resides under `docs/engine/`. The target layout does not imply that planned components are implemented.

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

See the [technical security model](docs/engine/contracts/SECURITY_MODEL.md) for trust boundaries and [SECURITY.md](SECURITY.md) for private vulnerability reporting. Do not disclose vulnerabilities in public issues.

## License and attribution

Asterweave is licensed under the [Mozilla Public License 2.0](LICENSE). Independently authored games and independently licensed works may use their own licenses, subject to the MPL obligations for covered source files.

Originally created by [JA Sanborn](https://github.com/ja-sanborn). See [NOTICE](NOTICE) and [AUTHORS.md](AUTHORS.md) for attribution.
