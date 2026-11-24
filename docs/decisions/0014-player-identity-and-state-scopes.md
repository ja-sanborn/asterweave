# 0014 — Player identity, actor control and state scopes

Status: Accepted

## Context
[FND-04 (issue #6)](https://github.com/ja-sanborn/asterweave/issues/6) establishes state and persistence contracts after FND-12.

## Decision
One authoritative current state per runtime without persistent game-instance identity. Distinguish game, world participant and runtime player identities; session/save identifiers are host-owned. Six scopes: world, location, entity, actor, player and directional relationship. One player can control multiple active actors, each with at most one controlling player; selected actor belongs to controlled set. Foundation permits zero or one player. Player records are dynamic, not physical participants. No human knowledge tracking or dedicated discovery subsystem; optional fictional knowledge belongs to game/extension properties. Host/session data is excluded.

## Alternatives
Conflate player and actor, persist playthrough IDs, mandatory discovery tracking or duplicated control indexes.

## Consequences
See [runtime state](../contracts/RUNTIME_STATE.md). Multiplayer authentication and networking remain deferred; no new implementation.
