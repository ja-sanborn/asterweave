# Architecture decision records

ADRs record significant architectural decisions, context, alternatives and consequences. See the [documentation index](../README.md), [architecture](../ARCHITECTURE.md) and [normative contracts](../contracts/README.md).

Use sequential filenames such as `0001-platform-independent-runtime.md`. Each record contains a title, status (Proposed, Accepted, Superseded or Rejected), context, decision, alternatives and consequences. Link superseding records and relevant technical contracts. Preserve historical decisions and their rationale; append explicit subsequent-decision notes instead of silently rewriting history. Keep individual issue assignments, branch progress and CI execution reports in GitHub Issues and pull requests rather than ADRs. Accepted design does not establish implemented behavior.

| ADR | Subject | Status and relationship |
| --- | --- | --- |
| [0001](0001-platform-independent-runtime.md) | Platform-independent runtime | Accepted principle |
| [0002](0002-unified-action-contract.md) | Unified action contract | Accepted; elaborated by 0006–0008 |
| [0003](0003-canonical-json-game-format.md) | Canonical JSON game format | Accepted; elaborated by 0009–0013 |
| [0004](0004-state-and-persistence-separation.md) | State and persistence separation | Accepted; elaborated by 0013–0015 |
| [0005](0005-development-and-testing-tooling.md) | Development and testing tooling | Accepted |
| [0006](0006-atomic-action-execution-and-turn-progression.md) | Atomic action execution and turn progression | Accepted |
| [0007](0007-extensible-and-configurable-action-definitions.md) | Extensible and configurable action definitions | Accepted |
| [0008](0008-game-time-and-calendar-separation.md) | Game time and calendar separation | Accepted |
| [0009](0009-canonical-game-definition-contract.md) | Canonical game-definition contract | Accepted; schema/version portions superseded by 0011–0013, 0021–0022 |
| [0010](0010-game-packaging-and-content-protection.md) | Game packaging and content protection | Accepted |
| [0011](0011-unified-world-containment.md) | Unified world containment | Accepted; format version superseded by 0013, 0021–0022 |
| [0012](0012-physical-properties-and-capacity.md) | Physical properties and capacity | Accepted; measurement ranges superseded by 0022 |
| [0013](0013-namespaced-properties-and-runtime-state.md) | Namespaced properties and runtime state | Accepted |
| [0014](0014-player-identity-and-state-scopes.md) | Player identity and state scopes | Accepted |
| [0015](0015-state-isolation-and-persistence.md) | State isolation and persistence | Accepted |
| [0016](0016-modular-architecture-and-design-patterns.md) | Modular architecture and design patterns | Accepted |
| [0017](0017-error-handling-and-diagnostics.md) | Error handling and diagnostics | Accepted |
| [0018](0018-public-api-and-compatibility.md) | Public API and compatibility | Accepted |
| [0019](0019-security-and-trust-boundaries.md) | Security and trust boundaries | Accepted |
| [0020](0020-standardized-operation-result-architecture.md) | Standardized operation result architecture | Accepted |
| [0021](0021-standard-navigation-vocabulary.md) | Standard navigation vocabulary | Accepted |
| [0022](0022-flexible-physical-measurement-ranges.md) | Flexible physical measurement ranges | Accepted |

Current canonical format is 3.2.0 under ADRs 0013, 0021 and 0022 and the [definition contract](../contracts/GAME_DEFINITIONS.md). Save format 1.0.0 is specified separately. See [coding standards](../CODE_STYLE.md) and [testing strategy](../../tests/README.md) for implementation and verification requirements.
