# Contributing to Asterweave

Asterweave is in its initial design phase. Discuss substantial changes through GitHub issues before implementation.

## Development principles

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

Use ES modules with explicit relative `.js` import extensions, single-quoted
JavaScript strings, semicolons, descriptive English identifiers, and prefer
`const` over `let` where practical. Follow `.editorconfig`: UTF-8, LF,
four-space JavaScript indentation and two-space JSON/YAML indentation.
Use native `node:test` and `node:assert/strict`; see [test guidance](tests/README.md).
CI runs on Linux for pull requests targeting main and pushes to main.
Do not introduce additional tooling or dependencies without discussion.

## Workflow

Use focused branches and pull requests targeting main. Link the related issue in the pull request; use a closing keyword only when the acceptance criteria are fully met. Keep commits coherent and reviewable. Respect branch protection and maintainer review. Follow established tests and checks once available, and report actual verification results. Record significant accepted architectural decisions in [ADRs](docs/decisions/). AI-assisted contributors should follow [AGENTS.md](AGENTS.md).

## Licensing

Contributions to covered project files are made under MPL 2.0. Preserve applicable copyright and license notices. New covered source files should include the MPL Exhibit A notice and an SPDX-License-Identifier: MPL-2.0 identifier. Only contribute material you have the right to license.

Follow the [Code of Conduct](CODE_OF_CONDUCT.md) and report vulnerabilities privately according to [SECURITY.md](SECURITY.md).
