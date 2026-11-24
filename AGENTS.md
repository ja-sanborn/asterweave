# Asterweave — Agent Instructions

Asterweave is an independent, open-source interactive fiction engine created by JA Sanborn, licensed under MPL 2.0. Read the [project README](README.md) and [documentation index](docs/README.md).

## Mandatory reading and authority

Before work, inspect the current branch, relevant GitHub issue, dependencies, acceptance criteria and affected files. Read [architecture](docs/ARCHITECTURE.md), [coding standards](docs/CODE_STYLE.md), [testing strategy](tests/README.md), [contributing](CONTRIBUTING.md), relevant [contracts](docs/contracts/README.md) and [ADRs](docs/decisions/README.md). Follow [security policy](SECURITY.md).

Accepted ADRs govern decisions; current normative contracts govern behavior; coding standards govern source; tests and actual results provide implementation evidence. GitHub Issues govern actionable scope and [roadmap](docs/ROADMAP.md) priorities. Future considerations are nonbinding. Respect explicit supersession and surface conflicts between docs, issues and code before proceeding. Do not silently change accepted contracts.

## Architecture and coding

- Use standard ECMAScript, ES modules and zero third-party runtime/development npm dependencies under current Foundation decisions. Node.js is permitted for development and compatible hosts.
- Keep src independent of DOM, storage, networking, filesystem, graphics and Node-specific APIs. Hosts integrate platforms; Creator is optional authoring; extensions provide optional mechanics/presentation. Exclude Creator and unused optional modules from distributions.
- Follow ADR 0016: cohesive domain modules, one principal type per file, native encapsulation, composition, narrow explicit dependencies, no circular imports or global mutable state. Use independently testable domain logic and separate orchestration.
- Follow [public API](docs/contracts/PUBLIC_API.md): one primary facade, engine-controlled construction, intentional documented public interfaces, compatibility review and independent version authorities.
- Use descriptive English identifiers, required license headers and JSDoc for public and private members, and EditorConfig formatting. Avoid speculative frameworks and premature optimization.
- Commands and choices share explicit actor-identified actions and one dispatcher; neither owns world logic. Return semantic results, not rendered interfaces. Design for multiple actors but implement single-player offline text first.

## Security, errors and state

- Follow [security model](docs/contracts/SECURITY_MODEL.md) and [error handling](docs/contracts/ERROR_HANDLING.md): validate external data, authorization, references and invariants; use safe algorithms and explicit resource ownership. Executable extensions are trusted code, not sandboxed data.
- Preserve operation-specific diagnostics/results, domain-owned codes, deterministic aggregation, exception cause when wrapping, atomic failure and fail-closed integrity. No core operational logger; hosts own reporting and platform security.
- Use immutable isolated definitions, normalized overrides, qualified component-owned properties, six gameplay scopes and one authoritative World containment hierarchy. Derive actor location, inventory and loads; enforce lifecycle, association and capacity invariants without duplicating placement.
- No persistent instance ID, human knowledge tracking or gameplay undo. Keep detached recursively read-only snapshots and engine-owned transactions. Storage adapters remain outside core; save implementation is Phase 2. See [properties](docs/contracts/PROPERTIES.md), [runtime state](docs/contracts/RUNTIME_STATE.md) and [save data](docs/contracts/SAVE_DATA.md).

## Testing and completion

Follow the [testing strategy](tests/README.md) and definition of done. Test relevant domain, contract, integration, security, negative, boundary, determinism, isolation and architecture behavior; test hosts separately. Use native tooling and meaningful behavioral coverage. Report actual checks/results and limitations. Do not claim planned capabilities are implemented or tested.

## Issue-driven workflow and authorization

- GitHub Issues are the authoritative backlog. Search existing issues before creating new ones; use templates and testable acceptance criteria. Track defects as bugs.
- Brainstorming or review does not authorize issue creation, repository changes or implementation. Respect explicit scope and approval; documentation approval does not authorize code. Discuss significant architecture, dependencies and breaking changes first.
- Use focused feature, fix, refactor or docs branches. Open PRs targeting main when authorized; do not create a PR when the user requests branch-only work. Reference issues; use closing keywords only when criteria are fully met.
- Never bypass branch protection, commit directly to main without explicit authorization, merge without authorization or close issues without authorization and evidence of completion.
- Update affected tests, docs, indexes and ADRs as appropriate. Preserve historical decisions and record accepted changes. Verify commits and report progress accurately.

## Licensing and safety

Preserve LICENSE, NOTICE and AUTHORS.md. Include MPL Exhibit A notices and SPDX-License-Identifier: MPL-2.0 in covered source files and preserve required distribution notices. Never commit credentials, unpublished private stories, local saves or generated builds. Report vulnerabilities privately under SECURITY.md. Prioritize small, working, tested increments over feature breadth.
