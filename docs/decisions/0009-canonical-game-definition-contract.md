# 0009 — Canonical game-definition contract

Status: Accepted; version and placement/schema portions superseded by [ADR 0011](0011-unified-world-containment.md) and [ADR 0012](0012-physical-properties-and-capacity.md). [ADR 0013](0013-namespaced-properties-and-runtime-state.md) subsequently supersedes the format version; [ADR 0021](0021-standard-navigation-vocabulary.md) supersedes the four-direction vocabulary and advances the format to 3.1.0; [ADR 0022](0022-flexible-physical-measurement-ranges.md) subsequently advances the current normative format to 3.2.0. Historical decision below is retained.

## Context

The canonical definition design elaborates [ADR 0003](0003-canonical-json-game-format.md). Foundation requires a minimal directly authored game definition before state and validation implementation.

## Decision

Use a closed, versioned JSON document with formatVersion, game and world. Foundation recognizes exactly format version 1.0.0. Game identity uses author-managed reverse-domain-style IDs and a separate semantic-style content version. World IDs are stable lower camel case, case-sensitive and unique across locations, actors and entities. Use explicit arrays of definitions and directed exit records; Foundation supports north, south, east and west without implicit reverse exits. Actors specify initialLocationId; each entity specifies exactly one typed initialPlacement referencing a location or actor. Do not duplicate inventory or current state in definitions. Require native JavaScript validation and structured JSON Pointer diagnostics. Reject unsupported fields and executable or platform-specific data. Future vocabulary, narrative, rules, events, action configuration, extension requirements and optional calendar sections require explicit later schema contracts; no placeholder fields or arbitrary code. Preserve independent action registration and dispatcher-owned turn progression.

Packaging and optional content protection are separate from the canonical authoring schema; see [ADR 0010](0010-game-packaging-and-content-protection.md). The core receives validated canonical data, not encrypted packages.

## Alternatives

Unversioned or executable definitions; per-category IDs; implicit reverse exits; direction maps; duplicated ownership lists; permissive unknown fields or premature future schemas.

## Consequences

The [game-definition contract](../contracts/GAME_DEFINITIONS.md) is normative for Foundation; the [fixture](../../tests/fixtures/games/minimal-foundation.json) is reusable for downstream verification. Runtime state and save contracts are separate from definition validation and initialization. Strict version acceptance avoids silent unsupported behavior but requires explicit future compatibility policy. Arrays permit duplicate-ID and direction detection after JSON parsing. No runtime or new dependency is introduced. This elaborates rather than supersedes ADR 0003 and preserves ADRs 0001–0008.

[ADR 0013](0013-namespaced-properties-and-runtime-state.md) supersedes the accepted format version with 3.0.0; ADR 0021 subsequently advances it to 3.1.0 and expands navigation; ADR 0022 advances it to 3.2.0 and expands physical measurements; the historical decision above is retained. See the current [canonical contract](../contracts/GAME_DEFINITIONS.md).
