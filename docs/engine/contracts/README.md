# Engine contracts

These documents specify accepted behavior. Implementation status is tracked separately from normative design. Consult the [documentation index](../../README.md), [architecture](../../ARCHITECTURE.md) and [ADR catalog](../../decisions/README.md). Implementation scope and verification are tracked by [GitHub Issues](https://github.com/ja-sanborn/asterweave/issues).

| Contract | Responsibility | Related ADRs |
| --- | --- | --- |
| [ACTIONS_AND_RESULTS](ACTIONS_AND_RESULTS.md) | Action and result envelopes | 0053, 0059, 0065, 0067 |
| [ACTION_DEFINITIONS](ACTION_DEFINITIONS.md) | Action registration, argument validation and future configuration | 0052, 0053 |
| [STANDARD_ACTIONS](STANDARD_ACTIONS.md) | Standard action reference catalog; availability is not implied | 0053 |
| [GAME_DEFINITIONS](GAME_DEFINITIONS.md) | Canonical JSON format 4.0.0 | 0054, 0055, 0059, 0060 |
| [WORLD_CONTAINMENT](WORLD_CONTAINMENT.md) | Identity, hierarchy, lifecycle and associations | 0059 |
| [PHYSICAL_PROPERTIES](PHYSICAL_PROPERTIES.md) | Physical measurements and capacity | 0060 |
| [PROPERTIES](PROPERTIES.md) | Qualified keys and baseline overrides | 0055 |
| [RUNTIME_STATE](RUNTIME_STATE.md) | State ownership, players, transactions and snapshots | 0055, 0056, 0063, 0068 |
| [SAVE_DATA](SAVE_DATA.md) | Save format 1.0.0; implementation planned within Foundation | 0056 |
| [ERROR_HANDLING](ERROR_HANDLING.md) | Diagnostics, results, exceptions and reporting boundaries | 0065, 0067 |
| [PUBLIC_API](PUBLIC_API.md) | Public interfaces and compatibility | 0057, 0067 |
| [SECURITY_MODEL](SECURITY_MODEL.md) | Trust boundaries, security and resource ownership | 0066 |

Canonical definitions use format 4.0.0; saves use format 1.0.0 and remain pending Foundation implementation work. Read related contracts together: action dispatch uses world/state invariants, definition validation seeds the baseline, and future restoration reuses effective-state validation. Cross-cutting error handling, public API and security apply throughout. Do not infer a supported API, registered action or implemented feature from an illustrative example. Surface conflicts rather than silently overriding accepted decisions. See [ADR 0051](../../decisions/0051-product-architecture.md) for planned scope; first-party module integration, rules, events, randomness and distribution interfaces require their own reviewed contracts before implementation.

The active ADRs define the revised architecture; these contracts describe the currently supported behavior and remaining previously accepted technical design until detailed reconciliation. Obsolete public extension plans are not current requirements. Do not infer new implementation or silently change supported contracts.
