# Contributing to Asterweave

Asterweave is in its initial design phase. Discuss substantial changes through GitHub issues before implementation.

## Getting started

Read the [documentation index](docs/README.md), [architecture](docs/ARCHITECTURE.md), [coding standards](docs/CODE_STYLE.md) and [testing strategy](tests/README.md). Inspect the current branch and relevant issue, dependencies and acceptance criteria; read applicable [contracts](docs/contracts/README.md) and [ADRs](docs/decisions/README.md). Respect explicit supersession and raise discrepancies before changing behavior. AI contributors must also read [AGENTS.md](AGENTS.md); both use the same technical authorities.

## Development principles

Follow the [public API contract](docs/contracts/PUBLIC_API.md), [security model](docs/contracts/SECURITY_MODEL.md) and [testing strategy](tests/README.md). Review changes to documented interfaces for compatibility, including before 1.0.0. Satisfy the testing strategy's definition of done for implementation stories; preserve trust boundaries and report actual verification results.

Follow the [error-handling contract](docs/contracts/ERROR_HANDLING.md) and [ADR 0017](docs/decisions/0017-error-handling-and-diagnostics.md) alongside the coding standards. Include applicable negative-path tests and preserve documented failure semantics.

- Keep runtime code in standard JavaScript without third-party core runtime dependencies.
- Isolate platform-specific APIs in hosts and adapters.
- Keep graphics and authoring tools outside the runtime core.
- Prefer deterministic behavior, explicit contracts and testable modules.
- Include tests and update documentation when behavior changes.
- Do not commit credentials, private game content or generated distributions.

## User stories and backlog

[GitHub Issues](https://github.com/ja-sanborn/asterweave/issues) are the authoritative development backlog. Use user stories for features and technical enablers, and bug reports for defects. Describe the intended benefit, scope, dependencies and testable acceptance criteria. Search existing issues before opening duplicates. The [roadmap](docs/ROADMAP.md) sets overall priorities; issues track actionable work.

## Development and testing

Use Node.js 26 LTS and its bundled npm. The supported major version is recorded
in `.nvmrc` and `package.json`. With nvm, run `nvm install` and `nvm use`.
From the repository root, run `npm ci` and `npm test`. Commit the lockfile
when changing the manifest. No third-party npm dependencies are required.

Follow [coding standards](docs/CODE_STYLE.md) for source organization, naming, formatting, license headers, JSDoc, validation and maintainability. Follow [ADR 0016](docs/decisions/0016-modular-architecture-and-design-patterns.md) for modular architecture and design patterns.
Use native `node:test` and `node:assert/strict`; see [test guidance](tests/README.md).
CI runs on Linux for pull requests targeting main and pushes to main, feature/**, fix/**, refactor/** and docs/**. When local execution is unavailable, contributors may commit focused changes with their applicable tests to an authorized working branch and use CI as the test environment. Verify the exact commit SHA, successful test job and relevant logs before advancing to the next implementation increment. Correct failures first; report pending or unavailable results as unverified. Existing PR, merge and issue closure authorization requirements remain unchanged.
Do not introduce additional tooling or dependencies without discussion.

## Workflow

Discussion and review do not authorize issue creation, code or repository changes. Follow maintainer authorization and scope; documentation approval does not authorize implementation. A branch-only request does not authorize a pull request or merge. Review public compatibility and security effects, update authoritative contracts and indexes together, preserve historical ADRs and satisfy the [definition of done](tests/README.md#definition-of-done). Report actual checks and unresolved limitations.

Use focused branches and pull requests targeting main. Link the related issue in the pull request; use a closing keyword only when the acceptance criteria are fully met. Keep commits coherent and reviewable. Respect branch protection and maintainer review. Follow established tests and checks once available, and report actual verification results. Record significant accepted architectural decisions in [ADRs](docs/decisions/). AI-assisted contributors should follow [AGENTS.md](AGENTS.md).

## Licensing

Contributions to covered project files are made under MPL 2.0. Preserve applicable copyright and license notices. New covered source files should include the MPL Exhibit A notice and an SPDX-License-Identifier: MPL-2.0 identifier. Only contribute material you have the right to license.

Follow the [Code of Conduct](CODE_OF_CONDUCT.md) and report vulnerabilities privately according to [SECURITY.md](SECURITY.md).
