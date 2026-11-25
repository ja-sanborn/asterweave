# Engine contracts

These documents specify accepted behavior. Implementation status is tracked separately from normative design. Consult the [documentation index](../README.md), [architecture](../ARCHITECTURE.md) and [ADR catalog](../decisions/README.md). Implementation scope and verification are tracked by [GitHub Issues](https://github.com/ja-sanborn/asterweave/issues).

| Contract | Responsibility | Related ADRs |
| --- | --- | --- |
| [ACTIONS_AND_RESULTS](ACTIONS_AND_RESULTS.md) | Action and result envelopes | 0002, 0006, 0017, 0020, 0021 |
| [ACTION_DEFINITIONS](ACTION_DEFINITIONS.md) | Action registration, argument validation and future configuration | 0007, 0023 |
| [STANDARD_ACTIONS](STANDARD_ACTIONS.md) | Standard action reference catalog; availability is not implied | 0007 |
| [GAME_DEFINITIONS](GAME_DEFINITIONS.md) | Canonical JSON format 3.2.0 | 0003, 0009, 0011, 0013, 0021, 0022 |
| [WORLD_CONTAINMENT](WORLD_CONTAINMENT.md) | Identity, hierarchy, lifecycle and associations | 0011 |
| [PHYSICAL_PROPERTIES](PHYSICAL_PROPERTIES.md) | Physical measurements and capacity | 0012, 0022 |
| [PROPERTIES](PROPERTIES.md) | Qualified keys and baseline overrides | 0013 |
| [RUNTIME_STATE](RUNTIME_STATE.md) | State ownership, players, transactions and snapshots | 0013–0015 |
| [SAVE_DATA](SAVE_DATA.md) | Save format 1.0.0; implementation deferred to Phase 2 | 0015 |
| [ERROR_HANDLING](ERROR_HANDLING.md) | Diagnostics, results, exceptions and reporting boundaries | 0017, 0020 |
| [PUBLIC_API](PUBLIC_API.md) | Public interfaces and compatibility | 0018, 0020 |
| [SECURITY_MODEL](SECURITY_MODEL.md) | Trust boundaries, security and resource ownership | 0019 |

Canonical definitions use format 3.2.0; saves use format 1.0.0 and remain Phase 2 implementation work. Read related contracts together: action dispatch uses world/state invariants, definition validation seeds the baseline, and future restoration reuses effective-state validation. Cross-cutting error handling, public API and security apply throughout. Do not infer a supported API, registered action or implemented feature from an illustrative example. Surface conflicts rather than silently overriding accepted decisions.
