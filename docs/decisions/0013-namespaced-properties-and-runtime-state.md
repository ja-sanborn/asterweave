# 0013 — Namespaced properties and override-based runtime state

Status: Accepted

## Context
[FND-04 (issue #6)](https://github.com/ja-sanborn/asterweave/issues/6) establishes state and persistence contracts after FND-12.

## Decision
Use immutable authored baseline plus normalized current overrides, not duplicate effective state. Support six JSON types; null distinct from absence, explicit removal markers, structural equality and complete-value replacements. Reserve asterweave namespace; game and extension machine names own their properties and validation; no universal declaration requirement for custom/dynamic values. Core invariants remain mandatory. Add required game.namespace, optional initialProperties and initialRelationships to canonical format 3.0.0; map existing structural fields to engine properties without duplicate authorship. No legacy reader before runtime exists. Future capabilities define their state contracts incrementally.

## Alternatives
Duplicated mutable snapshots, mandatory declarations for all custom properties, unrestricted unqualified keys, nested patch language.

## Consequences
See [properties](../contracts/PROPERTIES.md) and [canonical definitions](../contracts/GAME_DEFINITIONS.md). FND-05/FND-06 implement initial validation and state; no runtime introduced here. Supersedes accepted format version portions of ADRs 0009/0011; preserves containment/physical contracts.

[ADR 0021](0021-standard-navigation-vocabulary.md) advances the canonical definition format to 3.1.0 for the navigation vocabulary expansion; [ADR 0022](0022-flexible-physical-measurement-ranges.md) subsequently advances it to 3.2.0; this ADR's property and state decisions remain in effect.
