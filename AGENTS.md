# Asterweave — Agent Instructions

Asterweave is an independent, open-source interactive fiction engine created by JA Sanborn and licensed under MPL 2.0. See [README](README.md), [architecture](docs/ARCHITECTURE.md), [roadmap](docs/ROADMAP.md), [contributing](CONTRIBUTING.md) and [security policy](SECURITY.md).

## Architecture and code

Follow [public API and compatibility](docs/contracts/PUBLIC_API.md) and [security model](docs/contracts/SECURITY_MODEL.md) under ADRs [0018](docs/decisions/0018-public-api-and-compatibility.md) and [0019](docs/decisions/0019-security-and-trust-boundaries.md). Keep one primary public facade, engine-controlled construction, explicit documented compatibility and independent version authorities. Enforce trust boundaries, safe resource ownership and host responsibilities. Follow the [testing strategy](tests/README.md), including architecture and security checks and its definition of done.

Follow [ADR 0017](docs/decisions/0017-error-handling-and-diagnostics.md) and the [error-handling contract](docs/contracts/ERROR_HANDLING.md). Preserve operation-specific diagnostics/results, domain-owned codes, atomic failure, fail-closed integrity and host-owned reporting. Test applicable failure paths; do not introduce core logging or speculative exception frameworks.

Follow the authoritative [coding standards](docs/CODE_STYLE.md) and [ADR 0016 — modular architecture and design patterns](docs/decisions/0016-modular-architecture-and-design-patterns.md), including domain-oriented files, encapsulation, JSDoc headers and member documentation, independently testable domain logic and acyclic dependencies.

- Use standard ECMAScript, ES modules and zero third-party core runtime dependencies. Node.js is permitted for development and compatible hosts.
- Keep `src/` independent of DOM, storage, networking, filesystem, graphics and Node-specific APIs. Put platform integration in `hosts/`, authoring tools in `creator/`, optional mechanics and presentation in `extensions/`, examples in `examples/` and tests in `tests/`.
- Use deterministic, explicit actions with actor identity. Commands and choices share the action dispatcher; neither owns world logic. Return semantic results, not rendered interfaces.
- Keep immutable, versioned JSON definitions separate from mutable state. Use stable IDs, one authoritative World containment hierarchy, validated save/restore and storage adapters. Treat executable extensions as trusted code, not safe data. Prefer standard engine capabilities and relationships; use validated extension points only where needed. Enforce lifecycle, association and capacity invariants without duplicating placement.
- Design for multiple actors but implement single-player offline text gameplay first. Keep Creator and unused optional modules out of game distributions.
- Use descriptive English identifiers, focused modules, explicit contracts and consistent formatting. Avoid premature optimization, global mutable state and circular dependencies.
- Discuss major changes, new dependencies and breaking contracts before implementation. Record significant accepted decisions in `docs/decisions/`.

## Issue-driven workflow

GitHub Issues are the authoritative development backlog and user stories. Read the relevant issue, acceptance criteria, dependencies and repository state before implementing. Search for existing issues before creating new ones. Discuss ambiguous requirements rather than silently expanding scope.

- Use user stories for features and technical enablers, with measurable acceptance criteria. Track defects as bug issues.
- Brainstorming does not authorize issue creation or code changes. Create or update issues when requested.
- Use focused feature, fix, refactor or documentation branches and pull requests targeting `main`. Reference the corresponding issue; use a closing keyword only when the PR fully satisfies it.
- Never bypass branch protection, commit directly to main without explicit authorization, or merge without authorization.
- Add or update headless tests for behavior, invalid actions, deterministic transitions and save/restore as applicable. Test hosts separately. Run available checks and report actual results or limitations.
- Update documentation and issue progress based on evidence. Do not claim planned features are implemented or tests/commits succeeded without verification.

## Licensing and safety

Preserve LICENSE, NOTICE, AUTHORS.md and applicable MPL notices. Include MPL Exhibit A notices and SPDX-License-Identifier: MPL-2.0 in covered source files. Preserve required notices in distributions. Never commit credentials, unpublished private stories, local saves or generated builds. Report vulnerabilities privately according to SECURITY.md.

The repository is the durable source of truth. Surface conflicts between issues, architecture and implementation before proceeding. Prioritize small, working, tested increments over feature breadth.

State contracts: use immutable baseline plus normalized overrides, qualified component-owned properties and six gameplay scopes; no persistent instance ID, human knowledge tracking or gameplay undo. Preserve engine-owned transactions and detached recursively read-only snapshots. See [properties](docs/contracts/PROPERTIES.md), [runtime state](docs/contracts/RUNTIME_STATE.md) and [save data](docs/contracts/SAVE_DATA.md).
