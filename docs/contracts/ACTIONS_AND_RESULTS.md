# Action and result contracts

Status: Accepted design; implementation pending. Origin: [FND-02, issue #4](https://github.com/ja-sanborn/asterweave/issues/4).

This specification elaborates [ADR 0002](../decisions/0002-unified-action-contract.md) and [ADR 0006](../decisions/0006-atomic-action-execution-and-turn-progression.md). Commands, choices, narrative and direct callers submit the same platform-independent data. Only the dispatcher authorizes and commits world transitions.

## Action envelope

```json
{"actorId":"player","type":"move","args":{"direction":"east"},"requestId":"r1"}
```

| Field | Required | Contract |
| --- | --- | --- |
| actorId | Yes | Nonempty stable actor ID; resolved against the runtime, not authentication. |
| type | Yes | Exact registered action identifier; see [definitions](ACTION_DEFINITIONS.md). |
| args | Yes | JSON object, possibly empty; fields and types governed by the action definition. |
| requestId | No | Nonempty opaque string for correlation only; does not grant authority or imply deduplication. |

Use JSON-compatible data only: null, booleans, strings, finite numbers, arrays and plain data objects. Reject cycles, functions, accessors, undefined, nonfinite numbers and non-data objects. Required IDs must be nonempty strings; do not coerce or trim inputs to make them valid. Reject unknown envelope fields and unrecognized arguments unless the specific definition explicitly permits them. Do not accept turn costs, raw command syntax, UI events, credentials, handler references or platform-specific metadata. Resolve actor authority, visibility, ownership and other prerequisites in the engine, not just in the caller. Hosts must authenticate/authorize callers separately.

Arguments use descriptive lower camel case keys. Use stable IDs rather than display names or live objects: targetId for a primary entity, objectId for a manipulated item where a separate target is needed, destinationId for a destination, instrumentId for a tool, recipientId for a receiving actor, topicId/choiceId for authored topics/choices. A relation is a canonical semantic value (e.g. in, on, under, behind), not a parser token. Direction is a canonical exit identifier as agreed with the game definition; Foundation uses north, south, east, west and may support other explicitly defined directions. See the [catalog](STANDARD_ACTIONS.md). Action inputs and outputs must be detached from mutable runtime state.

## Result envelope

```json
{
  "status": "completed",
  "outcome": "success",
  "actorId": "player",
  "requestId": "r1",
  "turnsAdvanced": 1,
  "outputs": [
    {
      "type": "location.entered",
      "audience": {"scope":"actor","actorId":"player"},
      "data": {"locationId":"hall","exits":["west"]}
    }
  ]
}
```

| Field | Required | Contract |
| --- | --- | --- |
| status | Yes | completed, rejected or error. |
| outcome | Only for completed | success or failure (gameplay outcome). Omit otherwise. |
| turnsAdvanced | Yes | Nonnegative safe integer; actual committed turn delta. |
| outputs | Yes | Ordered array of semantic output records, possibly empty. |
| actorId | No | Echo a valid established actor identity, if known and safe. |
| requestId | No | Echo a well-formed request ID if present and safe. |
| error | Only for rejected/error | Structured diagnostic object; omit for completed. |

A completed failure is an intentionally resolved gameplay attempt, not a validation rejection or technical failure. It can commit intentional consequences and its configured failure cost. Rejection or execution error commits no engine-owned state change and advances zero turns; discard staged success/failure outputs. Safe diagnostics may still be returned to the submitting caller. A malformed request must not require a valid actor or request ID to receive a result. No stack traces, secrets, or live state references.

### Error vocabulary

The error object requires a stable code string and may contain JSON-compatible safe details. Initial codes:

| Code | Status | Meaning |
| --- | --- | --- |
| INVALID_ACTION | rejected | Malformed envelope or non-data input. |
| UNKNOWN_ACTION_TYPE | rejected | No registered action type. |
| INVALID_ARGUMENTS | rejected | Argument schema or reference validation failed. |
| ACTOR_NOT_FOUND | rejected | Actor identity cannot be resolved. |
| ACTION_UNAVAILABLE | rejected | Registered action is disabled or unavailable. |
| ACTION_FORBIDDEN | rejected | Actor is not permitted to perform action. |
| EXIT_UNAVAILABLE | rejected | Foundation exit does not exist or cannot be used. |
| EXECUTION_FAILED | error | Unexpected handler, transaction or invariant failure. |

Gameplay failure explanations belong in semantic outputs, not the technical error field. Later codes may be added without changing these meanings.

### Semantic outputs

Each output requires a nonempty type string (semantic identifier), audience object and JSON data object. Outputs describe events or information, not HTML, widgets, transport destinations or rendering instructions. Authored narrative text may be included as data; hosts choose presentation. Output order is meaningful.

| Audience | Shape | Meaning |
| --- | --- | --- |
| Individual | {"scope":"actor","actorId":"player"} | One actor. |
| Explicit group | {"scope":"actors","actorIds":["player","guide"]} | Nonempty distinct actor IDs. |
| All | {"scope":"all"} | All applicable actors in the runtime context, not arbitrary connected users. |

Reject malformed audience definitions, avoid leaking private data through shared outputs, and deliver only to authorized recipients. The host must enforce delivery authorization; scope is not authentication. Diagnostics without a valid actor are returned to the requesting caller, not broadcast.

## Representative examples

Valid Foundation action:

```json
{"actorId":"player","type":"move","args":{"direction":"north"}}
```

Valid future observation (not implemented in Foundation):

```json
{"actorId":"player","type":"examine","args":{"targetId":"chest","relation":"in"}}
```

Invalid action (missing actor):

```json
{"type":"move","args":{"direction":"east"}}
```

```json
{"status":"rejected","turnsAdvanced":0,"outputs":[],"error":{"code":"INVALID_ACTION"}}
```

Invalid action (wrong direction argument type):

```json
{"actorId":"player","type":"move","args":{"direction":12}}
```

```json
{"status":"rejected","actorId":"player","turnsAdvanced":0,"outputs":[],"error":{"code":"INVALID_ARGUMENTS"}}
```

A well-formed but unregistered action yields UNKNOWN_ACTION_TYPE. A well-formed move toward a missing exit yields:

```json
{"status":"rejected","actorId":"player","turnsAdvanced":0,"outputs":[],"error":{"code":"EXIT_UNAVAILABLE"}}
```

A future gameplay attempt that fails at its objective may still complete:

```json
{
  "status":"completed",
  "outcome":"failure",
  "actorId":"player",
  "turnsAdvanced":1,
  "outputs":[{"type":"search.unsuccessful","audience":{"scope":"actor","actorId":"player"},"data":{"targetId":"chest"}}]
}
```

An unexpected exception returns:

```json
{"status":"error","actorId":"player","turnsAdvanced":0,"outputs":[],"error":{"code":"EXECUTION_FAILED"}}
```

## Turn and transaction invariants

The dispatcher alone advances turns. It resolves success/failure costs from trusted action definitions, commits the outcome, state and turn delta together, and releases committed outputs only after success of the transaction. Rejected actions and execution errors leave all engine-owned state unchanged, including random state and pending events when introduced. Foundation successful movement costs one turn; invalid or unavailable exits are rejected and cost zero. Future game overrides apply only to completed outcomes. Intermediate scheduled turns must not be skipped; exact event ordering and interruption semantics belong to the future rules/events design. See [ADR 0006](../decisions/0006-atomic-action-execution-and-turn-progression.md).
