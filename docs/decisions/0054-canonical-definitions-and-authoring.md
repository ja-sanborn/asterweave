# ADR 0054 — Canonical modular game definitions and authoring

Status: Accepted

## Context

Asterweave requires a coherent first-party modular architecture, with independently usable gameplay execution and declarative game content.

## Decision

Canonical modular JSON is the native game-definition representation. Direct JSON, future declarative authoring language and Creator are independent workflows targeting common contracts. Tools own bidirectional semantic translation, assembly and cross-component validation; exact source formatting/comments need not round-trip. Creator-specific workspace metadata remains separate. Gameplay, interaction and presentation data have distinct logical responsibilities. Engine consumes applicable canonical gameplay data, not source-file organization, authoring language, encrypted packages or presentation. Games configure supported engine actions and declarative behavior without introducing action identities or executable handlers. No executable or platform-specific authored data; no second execution environment. Detailed modular schemas, references, assembly semantics and API shape require review.

Current supported definition format remains exactly 4.0.0; modular definition loading is planned, not implemented. Preserve closed versioned game/world records, author-managed reverse-domain-style game ID, independent semantic-style content version, stable case-sensitive lower camel case world IDs unique across categories, arrays for definitions and directed exits, no duplicate inventory/current-state authorship. Preserve common initialContainment, lifecycle, associations, physical data, the applicable structural fields per normative contracts. Format 4.0.0 rejects the former game.namespace, initialProperties and initialRelationships fields; game data configures supported domain properties only. Map structural fields to reserved properties without duplicate authorship. Preserve twelve canonical directions and safe-integer physical ranges. Validate with native JavaScript and deterministic structured JSON Pointer diagnostics; reject unsupported fields/versions and unsafe data. No legacy reader or silent migration; intentional schema changes require explicit compatibility review. Future rules, events, action configuration, module and interaction data require reviewed contracts, not placeholders. See [canonical definitions](../engine/contracts/GAME_DEFINITIONS.md).

## Alternatives and consequences

Prefer explicit cohesive responsibilities and reviewed contracts over speculative generalized frameworks. Preserve applicable existing behavior, security and verification; accepted design does not establish implementation or authorize new feature scope.
