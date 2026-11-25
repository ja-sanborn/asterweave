# ADR 0025 — Runtime reset and integrity recovery

Status: Accepted

## Context

Administrative restoration to initialized state is distinct from gameplay undo and persistence. Isolated transaction failure need not compromise the runtime, but uncertain committed integrity must not permit further gameplay or invalid-state exposure.

## Decision

Provide synchronous administrative reset on the existing facade. Rebuild and validate the original initialized state and retained dependencies before atomic replacement. Clear normalized overrides, removal markers and dynamic data; restore original player configuration and initial turn. Retain baseline, facade and finalized registry; previously returned detached snapshots/results remain unchanged. Reset does not consume turns or affect external saves.

Use specialized ResetResult with completed/rejected/error status and closed safe error records: RESET_UNAVAILABLE for reentrant rejection, RESET_FAILED for execution failure. Inherit all five OperationResult predicates unchanged; no gameplay fields. Maintain minimal internal integrity status; ordinary isolated failures leave verified committed state usable. If committed integrity cannot be established, dispatch returns EXECUTION_FAILED, turn and snapshot reads throw safe native Error, and verified immutable game metadata remains readable. Only successful validated reset recovers the runtime; unsuccessful recovery publishes no candidate and leaves gameplay blocked. Initialize a new runtime in a trustworthy environment if recovery is impossible. Host controls administrative access.

### Clarifications

Recovery verification is bounded to engine-controlled structural and domain invariants: baseline, original configuration, reconstructed effective state, turn and override restoration, player and world identities, and retained registry ownership/finalization/structure. It does not prove handler correctness, repair executable code, establish environmental integrity or reverse external effects. An isolated reset failure preserves verified committed state; failed recovery of an already compromised runtime leaves it blocked. See the normative runtime state contract.

## Alternatives

Requiring new facade construction transfers restoration responsibility to hosts. Selective reset risks inconsistent state. A general lifecycle state machine, public health property or custom exception hierarchy is unnecessary. Continuing after uncertain integrity or speculative repair fails closed-state requirements.

## Consequences

Reset provides predictable restart and explicit recovery without gameplay history, save/restore implementation, pause/resume or rollback of external effects. Tests must distinguish ordinary transaction failure from integrity loss and verify recovery, registry retention and safe read failures.

Elaborates ADRs [0015](0015-state-isolation-and-persistence.md), [0017](0017-error-handling-and-diagnostics.md), [0018](0018-public-api-and-compatibility.md), [0019](0019-security-and-trust-boundaries.md) and [0020](0020-standardized-operation-result-architecture.md). Normative details: [runtime state](../contracts/RUNTIME_STATE.md#administrative-reset-and-integrity), [public API](../contracts/PUBLIC_API.md), [error handling](../contracts/ERROR_HANDLING.md#reset-result).
