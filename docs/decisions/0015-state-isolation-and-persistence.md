# 0015 — State isolation, serialization and save compatibility

Status: Accepted

## Context
[FND-04 (issue #6)](https://github.com/ja-sanborn/asterweave/issues/6) establishes state and persistence contracts after FND-12.

## Decision
Engine-owned transactions stage and validate all changes; detached recursively read-only snapshots expose effective state. World turn starts at zero, nonnegative safe integer, dispatcher-controlled; zero-turn changes allowed; reject overflow atomically. Save format 1.0.0 stores normalized current overrides and supported dynamic data, matching game ID, content version and definition format. Restore validates complete candidate and replaces atomically. Storage, save IDs and optional protection outside core; unprotected JSON supported. No gameplay undo, action-history replay or backward navigation in core; transaction rollback mandatory. Future migration and fingerprint deferred.

## Alternatives
Full duplicated definitions, required historical replay, mutable public references, mandatory encryption or implicit compatibility.

## Consequences
See [save data](../contracts/SAVE_DATA.md) and [runtime state](../contracts/RUNTIME_STATE.md). Elaborates ADR 0004 and preserves ADRs 0006, 0008, 0010–0012. Phase 2 implementation tracked by #25; no serializer in Foundation.
