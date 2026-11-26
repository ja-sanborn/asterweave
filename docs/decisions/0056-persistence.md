# ADR 0056 — Persistence and deterministic restoration

Status: Accepted

## Context

Asterweave requires a coherent first-party modular architecture, with independently usable gameplay execution and declarative game content.

## Decision

Platform-independent capture and atomic restoration are planned Foundation deliverables. Save format 1.0.0 remains the accepted baseline; store normalized current overrides and supported dynamic data, not duplicated definitions or action-history replay. Match game ID, content version and definition format exactly; validate complete candidate and replace atomically. Include necessary random, event and selected gameplay-module state for deterministic continuation; concrete composition compatibility and any format changes require review. No independent module version negotiation. Storage, save IDs and optional protection are outside gameplay engine; unprotected JSON supported. No persistent instance ID, gameplay undo, backward navigation or human knowledge tracking. Transaction rollback mandatory. Future migration/fingerprint deferred. See [save data](../contracts/SAVE_DATA.md).

## Alternatives and consequences

Prefer explicit cohesive responsibilities and reviewed contracts over speculative generalized frameworks. Preserve applicable existing behavior, security and verification; accepted design does not establish implementation or authorize new feature scope.
