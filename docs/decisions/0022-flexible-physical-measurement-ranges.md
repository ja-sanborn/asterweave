# 0022 — Flexible physical measurement ranges

Status: Accepted.

## Context

ADR 0012 defines abstract physical points and containment capacity invariants, but restricts intrinsic size and weight to 1–5 and individual limits to 0–5. Review of initial runtime requirements identified insufficient granularity for games with more detailed inventory systems, including a potential native Zork reference game.

## Decision

Allow positive safe integers for size and weight and nonnegative safe integers for maxItemSize and maxItemWeight. Retain nonnegative safe integers for cumulative sizeCapacity and weightCapacity, Boolean isContainer and existing defaults. The five-point scale is an optional authoring convention, not an engine restriction. Games choose consistent independent abstract size and weight scales; no real-world units, fractions, geometry or physics simulation are introduced.

Preserve all existing capacity invariants: individual comparisons use intrinsic values; cumulative size counts immediate external sizes; cumulative weight counts descendant intrinsic weights once; validate affected ancestors atomically. Omitted measurements are unspecified, omitted limits unlimited, zero limits admit no children, and required unknown measurements reject. World remains exempt. Check safe arithmetic without overflow or silent rounding, including aggregation of individually valid large values. Existing valid five-point values retain their meaning.

Advance canonical definition format from 3.1.0 to 3.2.0 as a compatible range expansion. The first Foundation reader recognizes exactly 3.2.0; no legacy reader or migration is required. Update definition examples and matching synthetic save fixtures. Save format 1.0.0 and engine versions remain independent.

## Alternatives

- Retain fixed five-point limits: unnecessarily restricts author-defined gameplay granularity.
- Register configurable measurement systems now: premature complexity without a demonstrated Foundation requirement.

## Consequences and verification

Supersedes only the numeric range restrictions of [ADR 0012](0012-physical-properties-and-capacity.md) and the format version of [ADR 0021](0021-standard-navigation-vocabulary.md). All other containment, navigation, state and capacity decisions remain in effect.

Verify expanded numeric bounds, omitted measurements and limits, zero limits, invalid values and safe aggregation; Reuse the same invariants for candidate transfers. See [physical properties](../contracts/PHYSICAL_PROPERTIES.md), [canonical definitions](../contracts/GAME_DEFINITIONS.md) and [testing strategy](../../tests/README.md). No runtime implementation or new dependency is introduced by this decision.
