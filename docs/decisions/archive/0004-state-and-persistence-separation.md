# 0004 — State and persistence separation

> **Archived — historical only.** Superseded by [ADR 0055](../0055-state-and-transactions.md), [ADR 0056](../0056-persistence.md). The original decision text below is not current authority.


Status: Accepted design principle

## Context
Large interactive worlds need portable, consistent saves across hosts.

## Decision
Separate immutable definitions from mutable instance state. Serialize versioned snapshots or deltas independently of storage; use stable IDs and one authoritative ownership model.

## Alternatives
Duplicate entire definitions in saves or require full action-history replay.

## Consequences
Hosts can select storage independently. Compatibility, dynamic entities, pending events and deterministic restoration require explicit contracts.

This principle is elaborated in [ADR 0013](0013-namespaced-properties-and-runtime-state.md), [ADR 0014](0014-player-identity-and-state-scopes.md) and [ADR 0015](0015-state-isolation-and-persistence.md), selecting normalized deltas and independent saves without persistent instance IDs or gameplay undo.
