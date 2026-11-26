# ADR 0060 — Physical properties, capacity and mutation

Status: Accepted

## Context

Asterweave requires a coherent first-party modular architecture, with independently usable gameplay execution and declarative game content.

## Decision

Optional physical characteristics apply to all world categories. isContainer Boolean, locations default true and others false; in requires container, other relationships do not imply it. Intrinsic size/weight positive safe integers; individual maxItemSize/maxItemWeight and cumulative sizeCapacity/weightCapacity nonnegative safe integers. Omitted measurements unspecified, omitted limits unlimited; zero limits admit no children and missing required measurements reject. World exempt. Independent abstract scales; five-point scale optional, no real-world units, fractions, geometry or physics simulation. Individual comparisons use immediate participant intrinsic values; cumulative size immediate external sizes, cumulative weight all descendant intrinsic weights counted once. Validate affected ancestors atomically; checked arithmetic without overflow/rounding. Preserve existing valid five-point behavior. Derive load views, share calculations and invariants with initialization and final candidate validation.

Physical property set/remove/reset share a dedicated operation grant separate from actor control and registration. Use validated structural proposals before staging; no generic reserved-property writes. Preserve association cleanup and all world invariants, expected restrictions unstaged, unexpected faults invalidate candidate. No new public interface or data format change. See [physical properties](../engine/contracts/PHYSICAL_PROPERTIES.md) and [world transitions](0059-world-containment-and-transitions.md).

## Alternatives and consequences

Prefer explicit cohesive responsibilities and reviewed contracts over speculative generalized frameworks. Preserve applicable existing behavior, security and verification; accepted design does not establish implementation or authorize new feature scope.
