# 0006 — Atomic action execution and turn progression

Status: Accepted

## Context

The action and result contract elaborates the unified action principle in [ADR 0002](0002-unified-action-contract.md). A valid gameplay attempt can fail without being an invalid action or an engine failure.

## Decision

Use completed, rejected and error execution statuses. Completed results carry a success or failure gameplay outcome. The dispatcher exclusively owns turn advancement and selects the effective success/failure cost from trusted definitions. Rejection and unexpected execution failure advance zero turns and commit no engine-owned state. Completed gameplay failures may commit intentional consequences. Commit state, turn delta and staged semantic outputs atomically; never expose partial transitions. Foundation movement costs exactly one turn on success and zero for rejected exits. Multi-turn progression must account for intermediate scheduled turns in order; detailed event ordering and interruption semantics are deferred to rules/events design. Do not rely on external side effects being reversible.

## Alternatives

Handler-owned turns; a single ambiguous success/failure status; fixed costs for all actions; immediate partial state mutation.

## Consequences

Transaction guarantees and dispatcher integration precede movement implementation. Configuration and event scheduling are later capabilities. See [action and result contracts](../contracts/ACTIONS_AND_RESULTS.md). This record accepts a design, not implemented behavior.

Subsequent decision: [ADR 0024](0024-runtime-transactions-and-action-execution.md) elaborates the accepted runtime execution or recovery contract without replacing this decision's underlying principles.
