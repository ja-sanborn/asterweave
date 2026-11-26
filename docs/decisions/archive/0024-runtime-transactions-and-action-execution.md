# ADR 0024 — Runtime transactions and action execution

> **Archived — historical only.** Superseded by [ADR 0053](../0053-action-architecture.md), [ADR 0055](../0055-state-and-transactions.md). The original decision text below is not current authority.


Status: Accepted

## Context

The immutable baseline, normalized state, unified action contracts and independent finalized registry establish the foundation for deterministic gameplay. Execution must preserve domain authority and atomicity without coupling the dispatcher to individual actions or introducing a general framework.

## Decision

Retain the single Asterweave facade. Public synchronous action submission validates explicit actor control; trusted internal submission requires separate authority and shares orchestration. RuntimeState owns committed state, with an immutable GameBaseline, encapsulated Map-based normalized overrides and complete player records. Use structured addresses and shared property semantics with domain-owned mutation rules.

Compose a dedicated dispatcher, isolated transaction and restricted synchronous handler context. Share immutable baseline and stage mutable candidate state and ordered semantic outputs independently. Guard runtime operations before inspecting external data; disallow reentrant dispatch/reset. Candidate reads see staged writes; public reads see committed state. Expire handler capabilities at exit. Handlers return internal outcomes; dispatcher selects registered success/failure costs, prepares the specialized ActionResult and commits valid completed outcomes atomically. Rejection and error discard all staged state, turns and outputs. Programming/integrity failures invalidate candidates even if caught by a handler.

Reuse pure domain validation across initialization and candidate transitions, separating initial viability from ongoing invariants. Check local mutation preconditions and complete candidate integrity before commit. Use checked arithmetic without intermediate iteration until events exist; preserve future ordered intermediate event semantics. No production placeholder handlers, direct public state setters, middleware, event bus, async execution, gameplay undo or persistence implementation. Trusted executable code is not sandboxed; atomicity covers engine-owned state only.

### Clarifications

Separate initialization viability, shared effective structural prerequisites and domain invariants, and forward-transition checks; preserve existing initialization diagnostics and independent findings. Lifecycle mechanics remain deferred while their invariants and player consistency are enforced. Share effective-property resolution across consumers without duplicating authoritative state. Separate argument structure/syntax, runtime reference existence/category and action-specific eligibility. Engine-established mutation capabilities are independent of actor control and registration ownership. Share synchronous-return protection where applicable without merging return contracts. Preserve inherited result semantics and deterministic rejection precedence with safe identity echo; trusted-host results are not remote-client privacy guarantees. Normative details remain in the linked contracts.

### Detailed implementation

Use the accepted [runtime implementation design](../RUNTIME_IMPLEMENTATION.md) for the focused PropertyOverrideStore, EffectiveStateReader, StateTransaction, ActionExecutionContext, ActionDispatcher and specialized result responsibilities. Use independent candidate collections, explicit presence entries, a four-state private transaction lifecycle and prepared RuntimeState publication. Retain a separate engine-established executable authority association, immediate context expiration and invocation-local violation tracking through outcome inspection. Preserve existing dependency direction and normative contracts; these details do not introduce public interfaces.

## Alternatives

Live mutation with inverse journals risks incomplete rollback. Full baseline cloning duplicates immutable data. Copy-on-write adds complexity before measured need. Facade-owned or handler-owned orchestration couples responsibilities. A universal property dictionary or separate stores duplicate or weaken domain rules. Declarative-only handlers and middleware are premature.

## Consequences

Clear authority boundaries and consistent outcomes enable future command, choice, narrative and NPC actions. Candidate copying and complete validation have costs; optimize only with evidence. Internal contracts remain independent of serialized formats. Test isolation, reentrancy, failure paths, capability expiration, deterministic ordering and safe arithmetic with trusted test handlers.

Elaborates ADRs [0006](0006-atomic-action-execution-and-turn-progression.md), [0013](0013-namespaced-properties-and-runtime-state.md), [0014](0014-player-identity-and-state-scopes.md), [0015](0015-state-isolation-and-persistence.md), [0016](0016-modular-architecture-and-design-patterns.md), [0019](0019-security-and-trust-boundaries.md) and [0023](0023-action-registry-ownership-and-lifecycle.md). Normative details: [runtime state](../contracts/RUNTIME_STATE.md), [properties](../contracts/PROPERTIES.md), [actions and results](../contracts/ACTIONS_AND_RESULTS.md), [action definitions](../contracts/ACTION_DEFINITIONS.md), [public API](../contracts/PUBLIC_API.md).

## Subsequent scope clarification

[ADR 0026](0026-functional-foundation-and-optional-extension-boundaries.md) brings generic lifecycle operations, transactional randomness, events, authorized internal actor execution and persistence into planned Foundation scope. The original infrastructure decision remains historical; detailed additions must preserve transaction ownership and atomicity.
