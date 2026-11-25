# Error handling and diagnostics

Status: Accepted design; implementation pending. Origin: [FND-05 (#7)](https://github.com/ja-sanborn/asterweave/issues/7), [ADR 0017](../decisions/0017-error-handling-and-diagnostics.md).

This contract establishes common failure semantics. Operation-specific contracts remain authoritative for exact envelopes, codes and behavior. It does not introduce a universal public error object, change a schema version or implement logging.

## Failure taxonomy

| Category | Meaning | Handling |
| --- | --- | --- |
| Data validation | External data violates its contract | Structured diagnostics at validation boundaries; malformed actions use existing rejected results |
| Operation rejection | Requested operation is invalid, unavailable or unauthorized | Documented rejected result or operation-specific rejection |
| Gameplay failure | Intentional unsuccessful gameplay attempt | Completed action with failure outcome and semantic explanation |
| Execution failure | Unexpected failure during an operation | Exception internally; documented safe error result or exception at appropriate public boundary |
| Programming error | Internal API misuse or violated programming invariant | Appropriate ECMAScript Error; translate at a public boundary when its contract requires |
| Platform failure | Host I/O, storage, transport or presentation failure | Host-owned handling, not a core gameplay error |

Categories describe meaning, not detection mechanism. Platform failures may be expected or unexpected. Invalid external input is not an internal programming defect merely because its type is wrong.

## Public contracts and severity

Preserve [definition diagnostics](GAME_DEFINITIONS.md#validation-and-diagnostics): source, code, severity, path and message are required for definition and initialization configuration findings. Foundation severity is exactly error. Warning and info are deferred; debug, trace and fatal are not validation severities. Severity is distinct from action status and runtime health.

Example:

```json
{
  "source": "definition",
  "code": "UNKNOWN_REFERENCE",
  "severity": "error",
  "path": "/world/locations/1/exits/0/destinationId",
  "message": "Referenced location does not exist."
}
```

The required source identifies the input argument: definition for canonical data and options for initialization configuration. Paths are relative to that argument, consistently across standalone validation and initialization. Future operations define their own supported sources; do not add source to ordinary action errors. Paths identify validated input using JSON Pointer: empty string for root, zero-based array indices, tilde escaped as ~0 and slash as ~1. Missing fields use expected paths; duplicate IDs or directions identify the later occurrence. Messages are nonblank English text initially, not stable machine contracts.

Preserve [action results](ACTIONS_AND_RESULTS.md#result-envelope): status completed, rejected or error; outcome success or failure only when completed; error object only for rejected/error, with required code and optional safe JSON-compatible details. Do not require definition diagnostic fields on action errors. Gameplay failure explanations are semantic outputs. The dispatcher uses existing action codes and zero committed turns for rejection/error.

Initialization validates definitions and applicable configuration before publishing a runtime. Failure exposes no partial runtime. Configuration findings use source options and JSON Pointer paths relative to the options argument (for example /player/selectedActor); definition findings use source definition. Both appear in one diagnostics collection. Unexpected initialization failures are translated according to the approved public API, without misrepresenting internal defects as invalid authored data.

[Save restoration](SAVE_DATA.md#compatibility-and-restore) rejects invalid candidates atomically; exact codes and public interfaces remain Phase 2 work. Future Creator diagnostics may reuse the definition convention where appropriate.

## Standardized operation results

[ADR 0020](../decisions/0020-standardized-operation-result-architecture.md) establishes OperationResult with specialized subclasses. The authoritative status is completed, rejected or error. Read-only isCompleted, isRejected and isError predicates derive from status; isSuccess equals isCompleted and isFailure is its inverse. This describes operation completion, not gameplay outcome. Preserve operation-specific payloads and errors. Results are engine-constructed and read-only, with detached recursively protected data and controlled operational references where required.

ValidationResult and InitializationResult expose diagnostics (always a read-only array) and error (undefined except on error). Completed results have empty diagnostics; rejected results have one or more diagnostics and no error; error results have empty diagnostics and safe operation-specific error information. InitializationResult additionally exposes game only on completion, otherwise undefined. ValidationResult has no separate valid Boolean. No partial game is exposed. Additional concrete error codes remain FND-05 work.

ValidationResult.toJSON returns a detached record containing status and diagnostics, with error only for error status. InitializationResult.toJSON throws TypeError in every status. Other result serialization follows its owning contract; omit derived predicates and preserve field omission rules. Do not expose raw exceptions or live operational objects. Ordinary getters and calculations do not require result wrappers.

## Codes and ownership

Engine-defined codes use uppercase snake case, documented meanings and stable identifiers. Never repurpose existing codes or branch on human-readable messages. Domains own detection and their vocabularies; shared codes may use common definitions where semantics match. Existing definition and action catalogs remain authoritative. No global enumeration coupling every domain to all others.

Orchestration maps findings into operation-specific codes. For example, CAPACITY_EXCEEDED maps to ACTION_UNAVAILABLE for rejected Foundation movement under the action contract. Validators need not know action statuses, authored JSON paths or save layout. New public codes require documented meaning, ownership and compatibility review in their story. Extension error contracts and naming are deferred.

## Aggregation and deterministic diagnostics

Collect independent findings when safe and useful. Use prerequisite-aware stages: safe data inspection, structural and version checks, identity collection, reference resolution, normalized candidate mapping and effective-state invariants. FND-05 uses GameDefinitionMapper to translate structurally valid input and resolve contractual defaults before reusable invariant checks; orchestration maps domain findings back to authored JSON Pointer paths. Do not make reusable validators depend on source paths, save envelopes or runtime storage. Mapping cannot repair invalid data; suppress dependent checks when mapping prerequisites are invalid. Configuration checks follow applicable prerequisites. Stop unsafe branches and suppress dependent findings when required data, identities or references are invalid. Do not traverse invalid cycles or compute capacities over invalid containment; do not interpret unsupported versions with the current schema. Continue independent checks where prerequisites remain valid.

Order definition findings before options findings, then use documented stage order, schema field order, array indices, case-sensitive ECMAScript code-unit ordering of unordered keys and defined validator check order as applicable. Suppress identical duplicate findings. Continue independent configuration checks when safe; suppress checks dependent on invalid definition prerequisites. No arbitrary diagnostic count cap; explicit resource limits may be designed separately. Never mutate caller input.

## Exceptions and translation

Use native Error, TypeError, RangeError or other appropriate ECMAScript exceptions for unexpected failures or internal contract violations. SyntaxError may represent parsing failure; AggregateError may represent multiple actual exceptions, not routine validation findings. An optional AsterweaveError extending Error may identify engine exceptions when useful. No mandatory base-class implementation, class per code or speculative hierarchy.

Throw Error objects, not primitives. Let unhandled exceptions propagate to meaningful recovery or translation boundaries; wrap only to add useful context, preserving the original thrown value through native cause. Handle arbitrary thrown values from collaborators without assuming Error instances or unsafe stringification. Keep internal exceptions, causes and stacks out of public data. Do not silently swallow or repeatedly wrap exceptions.

Domain modules own detection through narrow contracts; orchestration owns public translation. Catch unexpected failures when a documented public contract requires structured failure; otherwise documented exceptions may propagate to trusted callers. Translation must not publish partial state or unsafe information.

## Atomicity and recoverability

Follow [runtime state](RUNTIME_STATE.md#transactions-and-snapshots) and [action results](ACTIONS_AND_RESULTS.md#turn-and-transaction-invariants). Stage candidate changes, validate before commit and release committed semantic outputs only after successful commit. Discard staged changes, turns and gameplay outputs on rejection/error, including random/event state when implemented. Intentional completed failure may commit valid consequences and configured cost. Initialization failure publishes no runtime; failed reset/restore preserves committed state. Host storage failure does not authorize core mutations.

A failed operation is not necessarily a failed runtime. Continue only when committed integrity is assured. Otherwise fail closed: prohibit further gameplay mutations rather than attempt speculative repair or continue on potentially corrupt state. FND-06 defines precise faulted-runtime lifecycle and recovery interfaces if needed; no new public status or recovery guarantee is implied. Transaction rollback is not gameplay undo.

## Reporting, security and localization

Core emits structured diagnostics, semantic results and appropriate exceptions; no operational console logging, platform I/O or global error broadcasts. Hosts and development tools own presentation, authorized reporting and logging. No core logger, logging framework, global event bus or localization catalog in Foundation.

Players receive semantic explanations or safe host-rendered messages; authors receive useful codes, paths and messages. Internal exception context belongs only in trusted debugging boundaries; no new reporting interface is implied. Hosts enforce authorization and audience scope. Avoid leaking secrets, private game content, stacks, unsafe object representations or live state references. Malformed requests receive safe diagnostics to the requester, not a broadcast.

English diagnostic messages are initial. Hosts may map stable codes to customized or localized text later; wording may change independently of code semantics.

## Implementation and tests

Use small cohesive types, plain records and pure functions as appropriate. FND-05 uses an encapsulated DiagnosticCollector per validation operation, with deterministic aggregation, identical duplicate suppression and immutable detached diagnostic snapshots. Domain validators own cascade suppression; use immutable named constants for domain-owned codes, not a global catalog. The collector is not a global error manager, rule evaluator or logging facility. No speculative framework. FND-05 introduces no custom exception classes; native exceptions and operation-boundary translation suffice. Follow [coding standards](../CODE_STYLE.md#18-error-handling) and [ADR 0016](../decisions/0016-modular-architecture-and-design-patterns.md).

Test applicable failure paths in owning stories: invalid definition/configuration and no partial runtime; independent aggregation and cascade suppression; stable codes, paths and ordering; caller isolation; exception translation and cause preservation when wrapping; safe handling of non-Error thrown values; no sensitive output; independent runtimes; rejected actions and unexpected failures preserving state, turns and outputs; intentional completed failure; failed restoration preserving state. Test fail-closed behavior when the lifecycle is implemented. Test hosts separately. FND-05 implements only definition validation and initialization requirements; dispatcher, transactions and restoration remain in their respective stories.
