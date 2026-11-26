# Action and result contracts

Status: Runtime action execution infrastructure; production gameplay handlers are planned Foundation work.

This specification elaborates [ADR 0053](../../decisions/0053-action-architecture.md) and [ADR 0053](../../decisions/0053-action-architecture.md). Commands, choices, narrative and direct callers submit the same platform-independent data. Only the dispatcher authorizes and commits world transitions.

## Action envelope

```json
{"actorId":"player","type":"move","args":{"direction":"east"},"requestId":"r1"}
```

| Field | Required | Contract |
| --- | --- | --- |
| actorId | Yes | Nonempty stable actor ID; resolved against the runtime, not authentication. |
| type | Yes | Exact recognized engine catalog identifier; registration is checked separately; see [definitions](ACTION_DEFINITIONS.md). |
| args | Yes | JSON object, possibly empty; fields and types governed by the action definition. |
| requestId | No | Nonempty opaque string for correlation only; does not grant authority or imply deduplication. |

Use JSON-compatible data only: null, booleans, strings, finite numbers, arrays and plain data objects. Reject cycles, functions, accessors, undefined, nonfinite numbers and non-data objects. Required IDs must be nonempty strings; do not coerce or trim inputs to make them valid. Reject unknown envelope fields and all arguments not declared by the registered definition. The current argument specification is closed; any future open argument contract requires an explicit design. Do not accept turn costs, raw command syntax, UI events, credentials, handler references or platform-specific metadata. Resolve actor authority, visibility, containment and other prerequisites in the engine, not just in the caller. Hosts must authenticate/authorize callers separately.

Arguments use descriptive lower camel case keys. Use stable IDs rather than display names or live objects: targetId for a primary entity, objectId for a manipulated item where a separate target is needed, destinationId for a destination, instrumentId for a tool, recipientId for a receiving actor, topicId/choiceId for authored topics/choices. A relation is a canonical semantic value (e.g. in, on, under, behind), not a parser token. Direction is a canonical exit identifier as agreed with the game definition; Foundation uses the twelve standard navigation identifiers defined in [canonical definitions](GAME_DEFINITIONS.md#locations-and-exits); aliases and custom identifiers are not accepted as Foundation canonical directions. See the [catalog](STANDARD_ACTIONS.md). Action inputs and outputs must be detached from mutable runtime state.

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

The ActionResult class follows [ADR 0067](../../decisions/0067-operation-results.md). Its public read-only accessors and all five inherited status predicates (isCompleted, isRejected, isError, isSuccess, isFailure) are distinct from the serialized envelope above. Inherit the common predicate implementation without redefining it; completed gameplay failure is operation success. Its toJSON method returns detached data preserving the documented fields, omission rules and output order; derived Boolean predicates are not serialized. This does not change action outcomes, turn costs, error vocabulary or authorization requirements.

### Error vocabulary

Follow the common [error-handling contract](ERROR_HANDLING.md). Preserve this operation-specific error record and code vocabulary; definition diagnostic fields are not required here. Orchestration translates domain findings into these codes, and unexpected exceptions are translated at the dispatcher boundary without exposing internal causes or stacks.

The error object is closed: required code and optional details containing JSON-compatible, explicitly selected safe semantic data. Omit all other fields, including stack, cause and raw exception messages. Trusted handlers are responsible for selecting non-sensitive details; JSON shape validation alone cannot establish confidentiality. The dispatcher preserves validated rejection details and never forwards unexpected exception internals. Initial codes:

| Code | Status | Meaning |
| --- | --- | --- |
| INVALID_ACTION | rejected | Malformed envelope or non-data input. |
| UNKNOWN_ACTION_TYPE | rejected | No registered action type. |
| INVALID_ARGUMENTS | rejected | Argument schema or reference validation failed. |
| ACTOR_NOT_FOUND | rejected | Actor identity cannot be resolved. |
| ACTION_UNAVAILABLE | rejected | Registered action is disabled or unavailable; actor is inactive; or dispatch is reentrant. |
| ACTION_FORBIDDEN | rejected | Actor is not permitted to perform action. |
| EXIT_UNAVAILABLE | rejected | Foundation exit does not exist or cannot be used. |
| EXECUTION_FAILED | error | Unexpected handler, transaction or invariant failure; committed integrity cannot be established. |

Gameplay failure explanations belong in semantic outputs, not the technical error field. Later codes may be added without changing these meanings.

### Semantic outputs

Each output requires a nonempty type string (semantic identifier), audience object and JSON data object. Outputs describe events or information, not HTML, widgets, transport destinations or rendering instructions. Authored narrative text may be included as data; hosts choose presentation. Output order is meaningful.

| Audience | Shape | Meaning |
| --- | --- | --- |
| Individual | {"scope":"actor","actorId":"player"} | One actor. |
| Explicit group | {"scope":"actors","actorIds":["player","guide"]} | Nonempty distinct actor IDs. |
| All | {"scope":"all"} | All applicable actors in the runtime context, not arbitrary connected users. |

Reject malformed audience definitions, avoid leaking private data through shared outputs, and deliver only to authorized recipients. The host must enforce delivery authorization; scope is not authentication. Diagnostics without a valid actor are returned to the requesting caller, not broadcast.

## Dispatch sequence

The dispatcher is synchronous and independent of action-specific gameplay. Establish the execution guard and verify runtime availability before inspecting external action data. Validate and detach the envelope, rejecting malformed, unknown or qualified action identifiers with INVALID_ACTION; resolve the active actor; verify player control or separately established trusted internal authority; resolve exact registration and enabled status; validate declared argument structure, syntax and specialized constraints; resolve declared runtime references for existence and category; begin isolated transaction; invoke the trusted handler; validate its outcome, outputs, applicable turn cost and complete candidate state; commit only on valid completion; otherwise discard; return ActionResult and reliably release the guard. Earliest applicable failed stage determines rejection; do not evaluate unnecessary later stages. Unknown acting actor yields ACTOR_NOT_FOUND; inactive acting actor yields ACTION_UNAVAILABLE; unauthorized active actor yields ACTION_FORBIDDEN. Recognized but unregistered actions yield UNKNOWN_ACTION_TYPE after actor checks; disabled action and invalid arguments follow the existing error vocabulary. Invalid declared target references yield INVALID_ARGUMENTS, while action-specific target eligibility belongs to gameplay logic. Only the acting actor is universally required to be active. Reentrant dispatch rejects with ACTION_UNAVAILABLE and compromised runtime dispatch returns EXECUTION_FAILED, before inspecting input. No implicit selected actor or player-free authorization bypass.

ActionResult extends the common OperationResult contract; isSuccess equals isCompleted even for completed gameplay failure. Construction is engine-controlled; serialization omits derived predicates and absent fields. Output records are validated and detached at staging, with state-dependent constraints rechecked before commitment; audience records are closed and referenced actors must exist. Preserve emission order, including intentional duplicates. See [internal execution and result design](../RUNTIME_IMPLEMENTATION.md#turns-outputs-and-results). Rejection/error returns an empty output array and zero turns. Safe errors are returned to the submitting caller, not broadcast. Echo actorId only when the identity is established, authorized for the submission and safe; omit it for unknown, malformed, inactive or unauthorized actors, reentrant dispatch and compromised-runtime dispatch. Echo a well-formed requestId only when known and safe. Do not include internal records or capabilities. Distinct codes may reveal existence or lifecycle despite omitted actorId; these results are trusted-host data, not an enumeration-resistant remote-client contract. See [security model](SECURITY_MODEL.md#authorization-and-extensions).

Expected domain precondition failures are rejections. Unexpected malformed returns, unauthorized mutation attempts by handlers, invalid mutation data, arithmetic overflow or final candidate integrity violations are execution errors; programming/integrity failures invalidate the transaction even if caught by handler code. See [runtime state](RUNTIME_STATE.md#transactions-and-snapshots).

## Representative examples

Illustrative well-formed Foundation movement request (the production movement handler is not yet implemented):

```json
{"actorId":"player","type":"move","args":{"direction":"north"}}
```

Illustrative observation request (planned Foundation action, not yet implemented):

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

## Containment and movement

World references and relationship semantics follow [world containment](WORLD_CONTAINMENT.md) and [physical properties](PHYSICAL_PROPERTIES.md). Foundation move changes the actor's immediate containment from one active location to another and preserves descendants; exits do not follow containment automatically. A missing usable exit returns EXIT_UNAVAILABLE; structural or capacity rejection returns ACTION_UNAVAILABLE with zero committed turns. No separate actor location or inventory is mutated. Relation arguments are semantic identifiers, not parser tokens; action-specific schemas determine allowed values. Future association, lifecycle and access changes follow the same atomic boundary.

## Turn and transaction invariants

The dispatcher alone advances turns. It resolves success/failure costs from trusted action definitions, commits the outcome, state and turn delta together, and releases committed outputs only after success of the transaction. Rejected actions and execution errors leave all engine-owned state unchanged, including random state and pending events when introduced. The initial movement design defaults to one turn on success; invalid or unavailable exits are rejected and cost zero under the current contract. Planned Foundation game overrides apply only to completed outcomes. Use checked nonnegative safe-integer addition without per-turn iteration while no intermediate events exist. Intermediate scheduled turns must not be skipped when events are introduced; exact event ordering and authorized internal actor execution belong to the planned Foundation rules/events design; interruption semantics remain subject to separate review. See [ADR 0053](../../decisions/0053-action-architecture.md).

## Runtime state authority

Use [runtime state](RUNTIME_STATE.md) and [properties](PROPERTIES.md): normalized overrides and supported dynamic data are staged in the action transaction. Explicit actorId remains required; player-facing requests must validate control separately, while trusted game logic and headless actions retain their own authorization boundary. Detached effective snapshots expose no writable references. Dispatcher-owned asterweave.turn starts at zero, rejects overflow, and permits zero-turn state changes. Administrative reset/restore are not gameplay actions. No gameplay undo.
