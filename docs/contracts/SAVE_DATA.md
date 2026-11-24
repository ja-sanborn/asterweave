# Save data

Status: Accepted design; serialization/restoration implementation deferred to Phase 2 ([issue #25](https://github.com/ja-sanborn/asterweave/issues/25)). Origin: [FND-04 (#6)](https://github.com/ja-sanborn/asterweave/issues/6). See [ADR 0015](../decisions/0015-state-isolation-and-persistence.md), [runtime state](RUNTIME_STATE.md) and [properties](PROPERTIES.md).

## Envelope 1.0.0

A save is a UTF-8 JSON object, with closed fields, plain data constraints and duplicate-member limitations as in [canonical definitions](GAME_DEFINITIONS.md). Version strings follow the canonical version grammar. Save format, canonical definition format, game content and engine release versions are independent.

| Required field | Meaning |
| --- | --- |
| saveFormatVersion | exactly 1.0.0 |
| gameId | exact authored game.id |
| gameVersion | exact authored game.version |
| gameFormatVersion | exact authored formatVersion; initially 3.0.0 |
| state | closed state object |

state requires overrides (dense array, may be empty), optionally players (dense nonempty array, omit when none). Override records follow [runtime state](RUNTIME_STATE.md): unique subject, nonempty values and/or removed, no overlap, duplicate removals, redundant baseline-equal values or removals of absent baseline properties. Each player record is closed {id,properties}, with unique id and complete current properties; maximum one player initially. No separate player override records. Unknown fields/unsupported scopes and namespaces reject. Dynamic game properties are stored in values; dynamic relationship state uses the same record type. Dynamic world participant serialization is deferred until creation capability is designed, and is not accepted by this format. Store no definition copy, derived state, human knowledge, host/session data, save ID, instance ID or action history.

Deterministic serialization orders override records by scope world, location, entity, actor, relationship (then case-sensitive code-unit identity; relationship endpoint order by scope then id, from before to), keys and removed names by code-unit order, player IDs likewise. Preserve semantic array order inside values and control lists. Readers may accept any record/key order if otherwise valid; ordering does not confer authority. Empty optional fields are omitted. No requirement for byte-identical JSON whitespace. Synthetic complete example: [state-foundation save](../../tests/fixtures/saves/state-foundation.json) and [matching definition](../../tests/fixtures/games/state-foundation.json).

```json
{"saveFormatVersion":"1.0.0","gameId":"org.example.stateFoundation","gameVersion":"0.1.0","gameFormatVersion":"3.0.0","state":{"overrides":[]}}
```

## Compatibility and restore

Treat every save as untrusted. Require supported versions and exact game ID, content version and definition format match. Version matching relies on authors incrementing content version for changed released baselines; it cannot prove byte-equivalent definitions. Definition fingerprinting and migration are deferred. No silent migration/coercion. Optional extension state will require explicit compatibility contracts when introduced; unsupported namespace state rejects rather than silently disappearing.

Validate envelope and plain data, references/ownership, property mutations and removals, reconstruct a fresh candidate from the current immutable baseline plus saved overrides and full dynamic player records, then validate the complete effective state. Validate control, identity, turn, lifecycle, association, containment and capacity invariants without applying gameplay actions or requiring forward transitions from the currently running state. A saved destroyed participant stays destroyed; restoring an earlier valid active state is allowed. An authored initially destroyed participant cannot become active through an override. Never merge a save into unrelated current state. Commit replacement atomically or preserve the running state unchanged. No side effects, turns or historical action replay. Structured diagnostic codes and public API are Phase 2 implementation details; diagnostics must be deterministic and safe. Reset restores initial configuration rather than saved player control.

## Storage and protection

Serialization/restoration is platform-independent; no filesystem, browser, SQL, networking or storage APIs in core. Hosts/adapters create, overwrite, enumerate, delete and label saves independently. Unprotected JSON is supported; optional compression, encoding and encryption belong outside core. Validation is mandatory after decoding/decryption. Offline client protection is not anti-cheat or DRM; see [ADR 0010](../decisions/0010-game-packaging-and-content-protection.md) for related package boundary. Multiplayer requires separate authorization/server-authoritative persistence. No gameplay undo, rollback history or automatic elapsed-time progression; transaction rollback remains mandatory. Future visual novel back behavior is outside scope.

Implementation tests must cover compatible round trips, invalid envelopes, unknown namespaces, corrupt references, capacity/control rejection, null/removal/reset, independent saves, deterministic continuation, isolation and failed-restore atomicity. This design and fixture are not a working serializer.
