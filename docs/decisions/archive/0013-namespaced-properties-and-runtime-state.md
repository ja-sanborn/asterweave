# 0013 — Namespaced properties and override-based runtime state

> **Archived — historical only.** Superseded by [ADR 0054](../0054-canonical-definitions-and-authoring.md), [ADR 0055](../0055-state-and-transactions.md). The original decision text below is not current authority.


Status: Accepted

## Context
State and persistence contracts build on the unified containment design.

## Decision
Use immutable authored baseline plus normalized current overrides, not duplicate effective state. Support six JSON types; null distinct from absence, explicit removal markers, structural equality and complete-value replacements. Reserve asterweave namespace; game and extension machine names own their properties and validation; no universal declaration requirement for custom/dynamic values. Core invariants remain mandatory. Add required game.namespace, optional initialProperties and initialRelationships to canonical format 3.0.0; map existing structural fields to engine properties without duplicate authorship. No legacy reader before runtime exists. Future capabilities define their state contracts incrementally.

## Alternatives
Duplicated mutable snapshots, mandatory declarations for all custom properties, unrestricted unqualified keys, nested patch language.

## Consequences
See [properties](../contracts/PROPERTIES.md) and [canonical definitions](../contracts/GAME_DEFINITIONS.md). The decision governs initial validation and runtime state; no runtime implementation is implied. Supersedes accepted format version portions of ADRs 0009/0011; preserves containment/physical contracts.

[ADR 0021](0021-standard-navigation-vocabulary.md) advances the canonical definition format to 3.1.0 for the navigation vocabulary expansion; [ADR 0022](0022-flexible-physical-measurement-ranges.md) subsequently advances it to 3.2.0; this ADR's property and state decisions remain in effect.

Subsequent decision: [ADR 0024](0024-runtime-transactions-and-action-execution.md) elaborates the accepted runtime execution or recovery contract without replacing this decision's underlying principles.
