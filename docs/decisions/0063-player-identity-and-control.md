# ADR 0063 — Player identity, actor control and state scopes

Status: Accepted

## Context
State and persistence contracts build on the unified containment design.

## Decision
One authoritative current state per runtime without persistent game-instance identity. Distinguish game, world participant and runtime player identities; session/save identifiers are host-owned. Six scopes: world, location, entity, actor, player and directional relationship. One player can control multiple active actors, each with at most one controlling player; selected actor belongs to controlled set. Foundation permits zero or one player. Player records are dynamic, not physical participants. No human knowledge tracking or dedicated discovery subsystem; optional fictional knowledge requires a future supported gameplay-domain contract under ADR 0055; games may configure supported semantics but cannot define arbitrary properties. Host/session data is excluded.

## Alternatives
Conflate player and actor, persist playthrough IDs, mandatory discovery tracking or duplicated control indexes.

## Consequences
See [runtime state](../engine/contracts/RUNTIME_STATE.md). Multiplayer authentication and networking remain deferred; no new implementation.

Subsequent decision: [ADR 0055](0055-state-and-transactions.md) elaborates the accepted runtime execution or recovery contract without replacing this decision's underlying principles.
