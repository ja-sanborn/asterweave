# 0015 — State isolation, serialization and save compatibility

> **Archived — historical only.** Superseded by [ADR 0055](../0055-state-and-transactions.md), [ADR 0056](../0056-persistence.md). The original decision text below is not current authority.


Status: Accepted

## Context
State and persistence contracts build on the unified containment design.

## Decision
Engine-owned transactions stage and validate all changes; detached recursively read-only snapshots expose effective state. World turn starts at zero, nonnegative safe integer, dispatcher-controlled; zero-turn changes allowed; reject overflow atomically. Save format 1.0.0 stores normalized current overrides and supported dynamic data, matching game ID, content version and definition format. Restore validates complete candidate and replaces atomically. Storage, save IDs and optional protection outside core; unprotected JSON supported. No gameplay undo, action-history replay or backward navigation in core; transaction rollback mandatory. Future migration and fingerprint deferred.

## Alternatives
Full duplicated definitions, required historical replay, mutable public references, mandatory encryption or implicit compatibility.

## Consequences
See [save data](../contracts/SAVE_DATA.md) and [runtime state](../contracts/RUNTIME_STATE.md). Elaborates ADR 0004 and preserves ADRs 0006, 0008, 0010–0012. Serialization and restoration are planned for Phase 2; no serializer in Foundation.

Subsequent decision: [ADR 0025](0025-runtime-reset-and-integrity-recovery.md) elaborates the accepted runtime execution or recovery contract without replacing this decision's underlying principles.

## Subsequent scope clarification

[ADR 0026](0026-functional-foundation-and-optional-extension-boundaries.md) supersedes the Phase 2 implementation restriction: platform-independent capture and atomic restoration are Foundation work. Storage separation and accepted persistence principles remain unchanged.
