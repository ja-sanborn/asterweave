# Action definitions and registration

Status: Foundation registry, argument validation, synchronous dispatch and trusted handler execution infrastructure implemented. Production gameplay execution and game configuration are planned Foundation work beyond current runtime infrastructure.

See [action/result envelopes](ACTIONS_AND_RESULTS.md), [standard catalog](STANDARD_ACTIONS.md) and [ADR 0053](../decisions/0053-action-architecture.md).

## Classifications and identity

Standard action identifiers are unqualified lower camel case names reserved for the engine catalog (e.g. move, lieDown). Extension identifiers use a registered namespace and a dot, e.g. combat.attack; game-defined actions use the reserved game namespace, e.g. game.hackTerminal. Namespace segments and action names begin with a lowercase ASCII letter followed by ASCII letters or digits; names are case-sensitive. No empty segments, whitespace or ambiguous normalization. Qualified identifiers contain exactly two segments. Reserve game for game-defined actions, asterweave for future engine use, and unqualified names for standards. A registration must reject duplicate full identifiers and conflicting namespace ownership; a game cannot replace a trusted handler by configuring its name.

The reserved game action namespace is specific to action identifiers. It is distinct from the author-selected game.namespace for qualified properties in [PROPERTIES.md](PROPERTIES.md). Do not assume the namespaces are interchangeable; any future unification requires an explicit decision.

Terminology distinguishes four conditions. A recognized identifier belongs to the standard catalog or satisfies the permitted qualified identifier grammar (excluding reserved asterweave-qualified identifiers). A registered action has validated metadata and a trusted handler in a particular registry. An enabled action is a registration whose enabled flag is true; this is not a guarantee of actor permission or world availability. An executable action additionally satisfies the dispatcher’s authorization, argument and world prerequisites. These terms are descriptive, not additional result statuses.

Each runtime privately owns an independent registry, separate from authoritative gameplay state. It resolves an action definition and trusted handler by exact type. Registry infrastructure does not depend on the dispatcher. The dispatcher consumes registry lookup and validation capabilities; movement supplies its actual handler later. Catalog entries are not registrations and do not imply implementation or availability.

## Definition metadata

```json
{
  "type": "move",
  "enabled": true,
  "turnCostSuccess": 1,
  "turnCostFail": 0,
  "arguments": {
    "direction": {"type": "string", "required": true, "allowedValues": ["north", "south", "east", "west", "northeast", "northwest", "southeast", "southwest", "up", "down", "in", "out"]}
  }
}
```

| Field | Contract |
| --- | --- |
| type | Required recognized identifier; registration separately checks ownership and uniqueness. |
| enabled | Required Boolean flag permitting consideration for execution; does not establish authorization or world availability. |
| turnCostSuccess | Required nonnegative safe integer effective cost for a completed success. |
| turnCostFail | Required nonnegative safe integer effective cost for a completed failure. |
| arguments | Required record of argument specifications keyed by argument name. |

A complete registration also supplies a trusted handler association and optionally a specialized argument validator, separately from the data metadata. The above JSON illustrates internal metadata, not canonical game JSON. Each argument specification identifies required/optional fields, value types, reference kinds and allowed values; validate shape before execution and validate world prerequisites in the runtime. The catalog gives initial conventions, not complete schemas for unimplemented mechanics. Native JavaScript validation is sufficient; no schema-library dependency.

All five metadata fields are required; unknown fields are rejected. Current setup supplies complete metadata directly. Future effective configuration will derive from trusted registered defaults and validated per-game overrides; omitted overrides will inherit defaults, and zero and false will be legitimate explicit overrides. Never read costs from submitted action arguments or caller metadata. Invalid costs (negative, fractional, nonfinite, unsafe integer or wrong type), unsupported types and attempts to replace handlers are rejected. Detect turn-counter overflow before committing. Definitions and effective metadata are detached from mutable caller-owned data; no cross-instance leakage. Dynamic registry mutation during dispatch is not supported by the Foundation contract.

The planned Foundation action set is identified in the [standard catalog](STANDARD_ACTIONS.md); move currently has metadata with default costs 1/0. The internal immutable MOVE_DEFINITION in src/actions/standardDefinitions.js reuses the authoritative STANDARD_DIRECTIONS vocabulary. It is metadata only: tests associate it with a test-only handler, and production registration requires the actual navigation handler. Game configuration of supported actions is planned Foundation work; the canonical JSON location and versioning must be defined in the canonical definition contract when configuration is introduced, not prescribed here.

Illustrative future override (not a canonical game-definition fragment):

```json
{"type":"move","enabled":true,"turnCostSuccess":2,"turnCostFail":1}
```

## Internal registration and lookup

Trusted setup obtains registry-local Symbol capabilities for standard, game and explicitly claimed extension namespaces. Tokens from other registries, duplicate identifiers and conflicting namespace claims are rejected. The internal ActionRegistry.create factory returns a frozen setup record containing the registry and its engineOwner, gameOwner and independent grantOwner Symbols. The constructor requires a private module capability. Only trusted orchestration receives this setup record; subsequent lookup never exposes ownership tokens. No public registration API is introduced.

The internal interfaces below are for trusted runtime construction and collaboration, not supported public or extension-facing APIs. The factory setup record is retained only by trusted initialization code; production initialization currently discards all setup tokens without registering handlers.

| Interface | Input and result |
| --- | --- |
| `ActionRegistry.create()` | No arguments; frozen record `{registry, engineOwner, gameOwner, grantOwner}` with a fresh registry and distinct Symbols. |
| `claimNamespace(namespace)` | Exact extension namespace string; completed result includes `owner`, a new registry-local Symbol. Reserved, malformed and previously claimed namespaces reject. |
| `register(owner, definition, handler, validator?)` | Registry-local owner Symbol, complete metadata, trusted handler function and optional trusted validator function (omit or pass undefined). Returns a completed/rejected operation record. |
| `has(type)` | Exact identifier; Boolean membership, including disabled registrations. |
| `getDefinition(type)` | Exact identifier; recursively immutable metadata or undefined. |
| `resolve(type)` | Exact identifier; frozen `{definition, handler, validator}` record or undefined. Validator is undefined when omitted. |
| `listDefinitions()` | Frozen array of immutable registered definitions in code-unit order. |
| `size` | Read-only count of registrations. |
| `isFinalized` | Read-only Boolean lifecycle flag. |
| `finalize()` | No arguments; completed/rejected operation record. Permanently closes setup, including an empty registry. |

Lookup uses exact identity without coercion. Unknown identifiers resolve to undefined; disabled registrations remain discoverable. Enumeration is a frozen point-in-time array sorted by case-sensitive code units. Individual definitions are detached and recursively immutable; the executable association record is frozen but function behavior is trusted, not frozen or sandboxed.

Registration is additive and atomic. Finalization is irreversible and idempotent outside an active modification. No replacement, removal or reopening is supported. Reentrant modifications are rejected, read-only lookup remains permitted, and unexpected exceptions release the modification guard. Registries and capabilities are excluded from gameplay snapshots and saves. Administrative reset preserves the registry. Production initialization creates a fresh registry only after definition and options validation succeeds, finalizes it before publication, and transfers private ownership alongside runtime state to the Asterweave facade. The registry is currently empty because no production action handler is implemented. No registry or capability appears in gameplay snapshots or public interfaces.

Registration checks lifecycle before inspecting data, validates metadata, checks authority and duplicates only for valid metadata, and independently checks executable associations. It prepares the result before insertion. Metadata inspection detaches the data once; successful validation freezes the detached tree in place. A failed operation leaves existing registrations and namespace ownership unchanged. Read-only lookup remains available during setup, including during a reentrant inspection callback. The dispatcher requires a finalized registry and receives narrow lookup and validation capabilities rather than setup authority.

Registry modification diagnostics use ordered sources registry, namespace, definition, owner, handler and validator. Lifecycle rejection codes are REGISTRY_BUSY (reentrant modification) and REGISTRY_FINALIZED. Namespace rejection codes are INVALID_NAMESPACE, RESERVED_NAMESPACE and NAMESPACE_CONFLICT. Definition duplicates use DUPLICATE_ACTION_TYPE; ownership mismatch uses INVALID_REGISTRATION_OWNER; invalid executable associations use INVALID_HANDLER and INVALID_VALIDATOR. Association validation checks function references without invocation and rejects identifiable same-realm asynchronous, generator and async-generator prototypes, including ordinary bound forms. Reflective failures propagate. This is not proof of synchronous behavior or a sandbox; altered prototypes, other realms and ordinary functions returning asynchronous values require trusted-code discipline and return-contract checks. Actual handler return validation belongs to the dispatcher. Expected failures return immutable internal records with status rejected and nonempty diagnostics; successful operations return completed and empty diagnostics. A successful namespace claim additionally returns the owner capability. Unexpected exceptions propagate to the appropriate orchestration boundary. The registry never executes gameplay handlers or constructs public action results.

### Internal diagnostics

Every diagnostic is a closed record containing `source`, `code`, `severity`, `path` and `message`. Severity is error; paths are JSON Pointers relative to the named input (empty string for its root). Codes are stable uppercase snake case; messages are nonblank English explanations, not control-flow keys. Identical findings are suppressed. See [error handling](ERROR_HANDLING.md).

| Code | Source | Condition / path |
| --- | --- | --- |
| REGISTRY_BUSY | registry | Reentrant modification; root. |
| REGISTRY_FINALIZED | registry | Namespace claim or registration after finalization; root. |
| INVALID_NAMESPACE | namespace | Invalid namespace grammar; root. |
| RESERVED_NAMESPACE | namespace | Extension claim of game or asterweave; root. |
| NAMESPACE_CONFLICT | namespace | Namespace already claimed; root. |
| INVALID_REGISTRATION_OWNER | owner | Missing, forged, foreign or mismatched capability; root. |
| DUPLICATE_ACTION_TYPE | definition | Exact type already registered; /type. |
| INVALID_ACTION_IDENTIFIER | definition | Unsupported or malformed identifier; /type. |
| INVALID_TURN_COST | definition | Cost is not a nonnegative safe integer; cost field. |
| INVALID_ARGUMENT_SPECIFICATION | definition | Invalid name, specification, type declaration, reference kind or allowed-value constraint; offending field or entry. |
| INVALID_HANDLER | handler | Handler fails the trusted synchronous association check; root. |
| INVALID_VALIDATOR | validator | Supplied validator is not undefined and fails the trusted synchronous association check; root. |
| INVALID_DATA | definition, args | Unsafe or non-JSON-compatible data; offending path. |
| INVALID_TYPE | definition, args | Incorrect value type; offending path. |
| REQUIRED_FIELD | definition, args | Missing required own field; expected path. |
| UNKNOWN_FIELD | definition, args | Unrecognized own field; offending path. |
| INVALID_VALUE | args | Invalid reference syntax or value outside the allowed set; argument path. |

Internal definition validation returns frozen `{status, diagnostics, definition}` on completion and `{status, diagnostics}` on rejection. The definition field is absent on rejection. Unsafe inspection findings suppress semantic validation. Registry lifecycle rejection suppresses subsequent inspection and registration checks. Registry diagnostics are not public action errors; the dispatcher translates argument rejection into the documented action result contract.

## Argument specification

Each argument name matches `[a-z][A-Za-z0-9]*` in full. Its specification is a closed record with the following fields.

| Field | Required | Meaning |
| --- | --- | --- |
| type | Yes | One supported type name; no coercion or union types. |
| required | Yes | Boolean; true requires an own submitted field, false permits absence. |
| allowedValues | No | Nonempty unique list of compatible scalar values. |
| referenceKind | No | Supported semantic reference category; string arguments only. |

 Supported types are string, number (finite), integer (safe), boolean, object (JSON record), array and null. Unknown attributes, unknown submitted arguments, coercion and implicit defaults are prohibited. Explicit null differs from absence. Allowed values are a nonempty array of unique scalar values compatible with the declared type and any reference constraint; zero and negative zero compare equally. Object and array types do not support allowedValues. Supported reference kinds are location, actor, entity, participant (any authored physical participant), world (the implicit root only) and player (separate nonphysical identity). Reference kinds apply only to strings; authored participant references exclude world, whereas player IDs follow their separate scope. Future narrative and other reference kinds require additional contracts. Generic validation checks structure and identifier syntax, not reference existence, accessibility or authority. After generic and specialized argument validation, runtime/domain resolution checks declared reference existence and category through shared identity operations. Missing or wrong-category references reject with INVALID_ARGUMENTS. Only the acting actor universally requires active lifecycle; other target eligibility, visibility, accessibility and gameplay prerequisites belong to action/domain logic. The registry and argument validators remain independent of mutable runtime state. The world reference must equal the exact string world; physical participant references must follow the identifier grammar and exclude world. Player references follow the identifier grammar independently and may use world as a player ID. Objects and arrays are safely inspected JSON data, not recursively schema-validated by this shallow specification; specialized validators can impose additional constraints.

The internal submitted argument validator receives previously validated definition metadata, untrusted argument data and an optional trusted specialized function. On completion it returns an immutable record with status completed, empty diagnostics and detached recursively immutable args; rejection returns status rejected and nonempty diagnostics without args. Structural findings use source args, check declared keys in code-unit order before unknown keys, and suppress dependent checks after a type or reference failure. Optional trusted synchronous specialized validators must be side-effect-free and independent of mutable runtime state. They receive only those detached read-only arguments after generic validation succeeds and return a dense JSON-compatible array of closed diagnostic records (source args, code, severity error, path, message), empty for success. Findings retain validator order and identical duplicates are suppressed. Unexpected exceptions, promises and invalid return contracts propagate as internal failures. A non-array native Promise return is rejected synchronously; the intrinsic Promise then observes accidental rejection without awaiting or assimilating arbitrary thenables. This prevents ordinary unhandled rejections but cannot undo external side effects or guarantee behavior of modified Promise constructors/species or hostile trusted code. Gameplay handlers are synchronous trusted functions. Their accepted execution contract is specified below.

## Trusted handler execution

A finalized registration supplies the handler and optional pure synchronous argument validator; the dispatcher supplies validated detached action data and narrow transaction capabilities. Handlers read effective candidate state, perform authorized property mutations or supported domain operations and stage semantic outputs. They cannot mutate committed state, assign turn costs, commit/discard transactions, alter registry setup or submit nested actions. Handler mutation authority is established independently by the engine through restricted capabilities, not inferred from registration ownership, actor control, action namespace or caller-supplied property keys. Enforce component-owned property restrictions and supported domain operations. No generic permission configuration or public extension authority framework is currently implemented; the planned supported extension contract requires separate design. Capabilities expire when the handler exits, including exceptional exits.

The handler returns a minimal internal outcome: completed with success or failure, or rejected with a closed error record containing code and optional explicitly selected safe semantic JSON details. It does not construct the authoritative public ActionResult. Unexpected exceptions, malformed outcomes, promises and asynchronous returns are execution errors. Share synchronous-return protection with specialized validators where applicable, retaining their distinct return contracts. Reject asynchronous returns and arbitrary thenables without invoking their then method; safely observe accidental native Promise rejection where possible without awaiting or using its result. This neither cancels arbitrary asynchronous work nor reverses external effects. Expired capabilities cannot mutate committed state. Programming or integrity failures invalidate the transaction even if caught. The dispatcher owns result construction, registered turn advancement, validation and atomic completion. The invocation is handler(action, context), with closed completed-success, completed-failure or rejected outcome records. The [runtime implementation design](../RUNTIME_IMPLEMENTATION.md#restricted-execution-and-dispatch) specifies internal collaboration, separately controlled immutable executable authority associations, default-deny mutation grants and invocation-local violation tracking through outcome inspection. The registry establishes grants through establishMutationGrants(grantOwner, type, grants) before finalization. Grants are detached closed records containing namespaces and operations arrays; duplicate entries, reserved engine namespaces and unsupported operations are invalid. mutationGrants(type) returns immutable grants or the default-deny empty record. verifyIntegrity() checks retained registry structure, ownership and grants without invoking handlers. Protected world grants cover relocation, association establishment/removal, physical mutation and distinct activation, deactivation, individual destruction and recursive destruction operations; see [runtime implementation design](../RUNTIME_IMPLEMENTATION.md#world-operations-and-derived-queries). These interfaces do not alter authored metadata. This contract does not expose a public extension API.

## Extension and game-defined actions

The internal registry supports trusted extension and game namespace registration; an external extension-facing API and game-authored configuration are planned Foundation work but not yet provided. Dynamic discovery/loading is not required. Future trusted JavaScript extensions may register handlers and argument validators through explicitly supported contracts. Executable extensions are code, not safe game data; transactional guarantees apply only to engine-owned state and cannot undo arbitrary external side effects. The runtime remains independent of platform APIs.

Planned Foundation declarative custom actions use validated JSON data for arguments, conditions, effects, outcomes, semantic outputs and turn costs. They must not execute arbitrary code. Creator can author those definitions later; it is not required at runtime. Both registration paths must use the same dispatch and result contracts.

The independent registry precedes dispatcher integration. Configurable standard actions and declarative custom actions require explicit additional contracts.
