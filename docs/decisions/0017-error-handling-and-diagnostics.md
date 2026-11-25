# 0017 — Error handling and diagnostics

Status: Accepted

## Context

Initial runtime implementation introduces definition validation and initialization. Existing contracts distinguish validation diagnostics, rejected actions, intentional gameplay failure and execution errors. A consistent architecture must preserve atomicity without coupling domain modules to callers, serialization, logging or presentation. See ADRs [0006](0006-atomic-action-execution-and-turn-progression.md), [0015](0015-state-isolation-and-persistence.md) and [0016](0016-modular-architecture-and-design-patterns.md).

## Decision

Distinguish six categories: data validation, operation rejection, intentional gameplay failure, unexpected execution failure, programming error and platform failure. Expected invalid data and rejected operations use documented diagnostics or results rather than exceptions. Intentional gameplay failure is a completed outcome, not a technical error.

Preserve operation-specific public contracts, not a universal error envelope. Foundation diagnostic severity is error only. Domain-owned stable codes use uppercase snake case and documented meanings. English diagnostic text is not a machine contract; localization infrastructure and extension error namespaces are deferred.

Use native ECMAScript Error objects for unexpected failures and internal contract violations. An optional AsterweaveError base extending Error is permitted when useful; specialized subclasses require a concrete caller distinction. Preserve native cause when wrapping exceptions. Catch only at meaningful recovery or translation boundaries.

Domain modules detect findings independently; orchestration aggregates and translates them into the appropriate public contract. Aggregate independent validation findings deterministically, suppress cascades and stop unsafe branches. Do not expose internal causes, stacks or sensitive values in public results.

Stage candidate state and commit atomically. Rejections and execution errors preserve committed state and turns; completed gameplay failure may commit valid intentional consequences. Fail closed if committed integrity cannot be guaranteed. Any faulted-runtime lifecycle and recovery interface requires explicit design; restoration remains Phase 2.

Core emits structured diagnostics, semantic results and appropriate exceptions; hosts and development tools own reporting, presentation and logging. Foundation introduces no core logger, global error bus, dependency or localization framework.

Use small cohesive types and functions as needed, applying Result Object, Notification, Guard Clause, Exception Translation, Error Boundary and Unit of Work patterns without a central error manager or speculative hierarchy.

## Alternatives

- Exceptions for all failures obscure expected outcomes and aggregation.
- A universal error envelope or global enumeration couples unrelated domains and conflicts with accepted public contracts.
- Fail-fast validation is less useful to authors when independent errors can be collected safely.
- Core-owned logging or a global event bus hides dependencies and compromises platform independence.
- Continuing mutations despite uncertain integrity risks corruption.

## Consequences

Validation, dispatch and future restoration reuse domain invariants while translating findings at their respective boundaries. Error behavior, isolation and failure paths require independent tests. The normative [error-handling contract](../contracts/ERROR_HANDLING.md) defines behavior; [coding standards](../CODE_STYLE.md#18-error-handling) define JavaScript conventions.

This decision preserves existing action, definition and save formats and error meanings. Apply the requirements to validation and initialization and to subsequent operations as introduced. This record does not implement code or authorize additional runtime features.

[ADR 0020](0020-standardized-operation-result-architecture.md) elaborates the approved common result base class, specialized interfaces and serialization conventions without replacing operation-specific error contracts or this failure taxonomy.

A subsequent diagnostic design decision adds a required source to definition and initialization configuration diagnostics, identifying the input argument to which the JSON Pointer is relative. See the current [error-handling contract](../contracts/ERROR_HANDLING.md). Existing action error envelopes are unchanged.

Subsequent decision: [ADR 0025](0025-runtime-reset-and-integrity-recovery.md) elaborates the accepted runtime execution or recovery contract without replacing this decision's underlying principles.
