# Documentation

Start here for the current technical design and development standards. See the [project README](../README.md) for an introduction. Asterweave is in Foundation development; accepted designs are not evidence of implemented or tested capabilities. Proposed means awaiting acceptance; accepted means approved design; implemented means corresponding source exists; verified means relevant test evidence exists; deferred means outside current approved scope; superseded means replaced by a subsequent accepted decision. These distinctions are descriptive, not a separate capability lifecycle. See the [public API](engine/contracts/PUBLIC_API.md) for supported interfaces and the [roadmap](ROADMAP.md) for planned capabilities.

## Reading paths

| Audience | Start with | Then consult |
| --- | --- | --- |
| Engine developer | [Engine documentation](engine/README.md), [coding standards](CODE_STYLE.md) | [Contracts](engine/contracts/README.md), [decisions](decisions/README.md), [testing](../tests/README.md), relevant issue |
| AI contributor | [AGENTS.md](../AGENTS.md), this index | Same standards, contracts, decisions, tests and issue as human contributors |
| Game author | [Canonical definitions](engine/contracts/GAME_DEFINITIONS.md), [samples](../samples/README.md) | World/property contracts and planned author guide; no playable runtime yet |
| Interaction or presentation developer | [Architecture](ARCHITECTURE.md), [Public API](engine/contracts/PUBLIC_API.md) | [Security model](engine/contracts/SECURITY_MODEL.md), [error handling](engine/contracts/ERROR_HANDLING.md), actions and persistence contracts |
| First-party gameplay module developer | [Architecture](ARCHITECTURE.md), [module composition](decisions/0052-module-composition.md) | Action, state, domain, security and testing contracts |
| Tools or Creator developer | [Architecture](ARCHITECTURE.md), [canonical authoring](decisions/0054-canonical-definitions-and-authoring.md), [distribution](decisions/0058-compilation-and-distribution.md) | Relevant canonical data, public interface, security and verification contracts |

## Document authority

| Source | Responsibility |
| --- | --- |
| [Architecture](ARCHITECTURE.md) | Current system overview and boundaries |
| [Runtime implementation design](engine/RUNTIME_IMPLEMENTATION.md) | Accepted internal runtime collaboration and responsibilities |
| [Active ADRs](decisions/README.md) | Current architectural decisions and rationale; archive is historical only |
| [Normative contracts](engine/contracts/README.md) | Required domain and public behavior |
| [Coding standards](CODE_STYLE.md) | JavaScript implementation conventions |
| [Testing strategy](../tests/README.md) | Verification and definition of done |
| [Contributing](../CONTRIBUTING.md), [AGENTS.md](../AGENTS.md) | Human and AI contributor workflow |
| [Security policy](../SECURITY.md) | Private vulnerability reporting |
| [GitHub Issues](https://github.com/ja-sanborn/asterweave/issues) | Authoritative actionable scope, dependencies and acceptance criteria |
| [Roadmap](ROADMAP.md) | Priorities and milestones |
| [Future considerations](FUTURE_CONSIDERATIONS.md) | Nonbinding ideas, not implementation authorization |
| Source and actual test results | Evidence of implemented and verified behavior, not automatic authority to change contracts |

Read the current branch and relevant issue, follow active cross-references. Surface conflicts between documents, issues and code before proceeding; do not silently choose a different interpretation. Historical ADRs are outside the mandatory reading path. Update affected authoritative documents and indexes together when decisions change. Keep living documentation capability-oriented: use contracts and ADRs for technical requirements and rationale, and GitHub Issues and pull requests for individual work assignments, progress, and execution evidence. Avoid ticket-specific headings, branch status and historical CI reports in living documents.

## Current contract versions

Canonical game-definition format: 4.0.0. Save format: 1.0.0 (implementation planned within Foundation). Engine package: private 0.0.0 development package; no production release. These versions are independent under the [public API contract](engine/contracts/PUBLIC_API.md). Verify supported versions against their normative contracts.

## Repository navigation

[Current runtime](../src/engine/README.md), [samples](../samples/README.md), [tests and fixtures](../tests/README.md). See [contributing](../CONTRIBUTING.md) before changing the repository. Engine-specific documentation is under [engine](engine/README.md); the agreed component documentation directories and guides directory are maintained with meaningful README files, with substantive documentation added as capabilities are designed. Engine source and tests use their corresponding engine subdirectories. See [Creator](creator/README.md) for its planned responsibilities.

The [active ADR index](decisions/README.md) is the sole architectural decision catalog. Archived records are non-authoritative and not required reading. The active ADRs establish the approved direction. Existing technical contracts document supported behavior and previously accepted technical design; obsolete public executable extension plans are not current requirements. Detailed contract, code and roadmap reconciliation must be separately reviewed; surface conflicts rather than silently changing behavior. Do not infer implementation from an accepted decision.
