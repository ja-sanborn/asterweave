# Action definitions and registration

Status: Accepted design; implementation pending. Origin: [FND-02, issue #4](https://github.com/ja-sanborn/asterweave/issues/4).

See [action/result envelopes](ACTIONS_AND_RESULTS.md), [standard catalog](STANDARD_ACTIONS.md) and [ADR 0007](../decisions/0007-extensible-and-configurable-action-definitions.md).

## Classifications and identity

Standard action identifiers are unqualified lower camel case names reserved for the engine catalog (e.g. move, lieDown). Extension identifiers use a registered namespace and a dot, e.g. combat.attack; game-defined actions use the reserved game namespace, e.g. game.hackTerminal. Namespace segments and action names begin with a lowercase ASCII letter followed by ASCII letters or digits; names are case-sensitive. No empty segments, whitespace or ambiguous normalization. Reserve game for game-defined actions and unqualified names for standards. A registration must reject duplicate full identifiers and conflicting namespace ownership; a game cannot replace a trusted handler by configuring its name.

The reserved game action namespace is specific to action identifiers. It is distinct from the author-selected game.namespace for qualified properties in [PROPERTIES.md](PROPERTIES.md). Do not assume the namespaces are interchangeable; any future unification requires an explicit decision in the applicable story.

A registry is scoped to a runtime instance or an immutable definition set with isolated effective registrations. It resolves an action definition and trusted handler by exact type. Registry infrastructure does not depend on the dispatcher. The dispatcher consumes registry lookup and validation capabilities; movement supplies its actual handler later. Catalog entries are not registrations and do not imply implementation or availability.

## Definition metadata

```json
{
  "type": "move",
  "enabled": true,
  "turnCostSuccess": 1,
  "turnCostFail": 0
}
```

| Field | Contract |
| --- | --- |
| type | Required exact registered identifier. |
| enabled | Required boolean effective availability; standard defaults are enabled when supported and included. |
| turnCostSuccess | Required nonnegative safe integer effective cost for a completed success. |
| turnCostFail | Required nonnegative safe integer effective cost for a completed failure. |

A complete registration also supplies an action-specific argument specification and a trusted handler association; the above JSON illustrates metadata, not executable registration or a finalized canonical game schema. Each argument specification identifies required/optional fields, value types, reference kinds and allowed values; validate shape before execution and validate world prerequisites in the runtime. The catalog gives initial conventions, not complete schemas for unimplemented mechanics. Native JavaScript validation is sufficient; no schema-library dependency.

Effective configuration is derived from trusted registered defaults and validated per-game overrides. Omitted overrides inherit defaults; zero and false are legitimate explicit overrides. Never read costs from submitted action arguments or caller metadata. Invalid costs (negative, fractional, nonfinite, unsafe integer or wrong type), unsupported types and attempts to replace handlers are rejected. Detect turn-counter overflow before committing. Definitions and effective metadata are detached from mutable caller-owned data; no cross-instance leakage. Dynamic registry mutation during dispatch is not supported by the Foundation contract.

Foundation only requires move with costs 1/0. Game configuration of supported actions is subsequent work; the canonical JSON location and versioning are coordinated with FND-03 and the configuration story, not prescribed here.

Illustrative future override (not a canonical game-definition fragment):

```json
{"type":"move","enabled":true,"turnCostSuccess":2,"turnCostFail":1}
```

## Extension and game-defined actions

Trusted JavaScript extensions may register handlers and argument validators through explicit runtime contracts. Executable extensions are code, not safe game data; transactional guarantees apply only to engine-owned state and cannot undo arbitrary external side effects. The runtime remains independent of platform APIs.

Future declarative custom actions use validated JSON data for arguments, conditions, effects, outcomes, semantic outputs and turn costs. They must not execute arbitrary code. Creator can author those definitions later; it is not required at runtime. Both registration paths must use the same dispatch and result contracts.

Registry implementation: [FND-10, issue #15](https://github.com/ja-sanborn/asterweave/issues/15). Dispatcher integration: [FND-06, issue #8](https://github.com/ja-sanborn/asterweave/issues/8). Configurable actions: [issue #16](https://github.com/ja-sanborn/asterweave/issues/16). Declarative actions: [issue #17](https://github.com/ja-sanborn/asterweave/issues/17). No implementation is introduced by this specification.
