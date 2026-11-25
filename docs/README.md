# Documentation

Start here for the current technical design and development standards. See the [project README](../README.md) for an introduction. Asterweave is in Foundation development; accepted designs are not evidence of implemented or tested capabilities.

## Reading paths

| Audience | Start with | Then consult |
| --- | --- | --- |
| Engine developer | [Architecture](ARCHITECTURE.md), [coding standards](CODE_STYLE.md) | [Contracts](contracts/README.md), [decisions](decisions/README.md), [testing](../tests/README.md), relevant issue |
| AI contributor | [AGENTS.md](../AGENTS.md), this index | Same standards, contracts, decisions, tests and issue as human contributors |
| Game author | [Canonical definitions](contracts/GAME_DEFINITIONS.md), [examples](../examples/README.md) | World/property contracts and [planned author guide (#20)](https://github.com/ja-sanborn/asterweave/issues/20); no playable runtime yet |
| Host developer | [Public API](contracts/PUBLIC_API.md), [hosts](../hosts/README.md) | [Security model](contracts/SECURITY_MODEL.md), [error handling](contracts/ERROR_HANDLING.md), actions and persistence contracts |
| Creator or extension developer | [Creator](../creator/README.md), [extensions](../extensions/README.md) | Relevant canonical data, public API and security contracts |

## Document authority

| Source | Responsibility |
| --- | --- |
| [Architecture](ARCHITECTURE.md) | Current system overview and boundaries |
| [Accepted ADRs](decisions/README.md) | Decisions and rationale; respect explicit supersession |
| [Normative contracts](contracts/README.md) | Required domain and public behavior |
| [Coding standards](CODE_STYLE.md) | JavaScript implementation conventions |
| [Testing strategy](../tests/README.md) | Verification and definition of done |
| [Contributing](../CONTRIBUTING.md), [AGENTS.md](../AGENTS.md) | Human and AI contributor workflow |
| [Security policy](../SECURITY.md) | Private vulnerability reporting |
| [GitHub Issues](https://github.com/ja-sanborn/asterweave/issues) | Authoritative actionable scope, dependencies and acceptance criteria |
| [Roadmap](ROADMAP.md) | Priorities and milestones |
| [Future considerations](FUTURE_CONSIDERATIONS.md) | Nonbinding ideas, not implementation authorization |
| Source and actual test results | Evidence of implemented and verified behavior, not automatic authority to change contracts |

Read the current branch and relevant issue, follow cross-references and explicit supersession notes. Surface conflicts between documents, issues and code before proceeding; do not silently choose a different interpretation. Historical ADR text is retained for context. Update affected authoritative documents and indexes together when decisions change.

## Current contract versions

Canonical game-definition format: 3.2.0. Save format: 1.0.0 (implementation deferred to Phase 2). Engine package: private 0.0.0 development package; no production release. These versions are independent under the [public API contract](contracts/PUBLIC_API.md). Verify supported versions against their normative contracts.

## Repository navigation

[Runtime](../src/README.md), [hosts](../hosts/README.md), [Creator](../creator/README.md), [extensions](../extensions/README.md), [examples](../examples/README.md), [tests and fixtures](../tests/README.md). See [contributing](../CONTRIBUTING.md) before changing the repository.
