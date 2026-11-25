# 0012 — Physical characteristics and capacity

Status: Accepted

## Context
[FND-12 (issue #23)](https://github.com/ja-sanborn/asterweave/issues/23) requires a simple core physical model that prevents oversized or overweight items from bypassing capacity through nesting.

## Decision
Use optional physical characteristics on all authored world categories: isContainer, size and weight on independent integer 1–5 scales, individual maxItemSize/maxItemWeight 0–5, and nonnegative safe-integer cumulative sizeCapacity/weightCapacity (omission means unlimited). World is exempt. Locations default to container capability; other categories do not. The in relationship requires a container; other relationships do not imply that capability. Cumulative size counts immediate external sizes; cumulative weight counts all descendant intrinsic weights once. Individual limits compare the immediate participant's own classification; loaded weight is subject to cumulative limits. Missing required measurements for finite limits are invalid. Evaluate all affected ancestors atomically. Prefer simple core behavior with optional advanced rules/extensions; no actual dimensions or physics.

## Alternatives
Real-world units or geometry; no core capacities; a single capacity limit that cannot distinguish individual fit from cumulative load.

## Consequences
The [physical contract](../contracts/PHYSICAL_PROPERTIES.md) is normative. Initial properties are authored in canonical format 2.0.0; mutable state belongs to FND-04. FND-05 validates and FND-07 enforces structural capacity; FND-09 verifies integration. Player-facing actions and advanced physical mechanics remain future work. No runtime or dependency is introduced.

## Subsequent decisions

The reference to format 2.0.0 above is historical. [ADR 0013](0013-namespaced-properties-and-runtime-state.md) establishes format 3.0.0 and maps initial physical fields into reserved engine properties without superseding the capacity invariants. See [canonical definitions](../contracts/GAME_DEFINITIONS.md) and [properties](../contracts/PROPERTIES.md).

[ADR 0022](0022-flexible-physical-measurement-ranges.md) supersedes only the fixed 1–5 intrinsic and 0–5 individual limit restrictions. Format 3.2.0 accepts positive safe-integer intrinsic measurements and nonnegative safe-integer limits; the remaining capacity invariants are unchanged. The original decision above is retained.
