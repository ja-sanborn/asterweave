# 0027 — Authorized world transitions

> **Archived — historical only.** Superseded by [ADR 0059](../0059-world-containment-and-transitions.md), [ADR 0060](../0060-physical-properties-and-capacity.md). The original decision text below is not current authority.


Status: Accepted

## Context

The unified containment, capacity and transaction decisions establish authoritative placement and normalized state, but require concrete internal operations that preserve world invariants independently of game-specific action policies.

## Decision

Derive detached hierarchy and load views on demand from effective state. Share iterative traversal, capacity calculations and validation with initialization and final candidate checks; do not maintain duplicate authoritative indexes.

Provide separately authorized generic relocation, directed association establishment/removal, physical property set/remove/reset and explicit activation, deactivation, individual destruction and recursive destruction. The three physical methods share one grant; each placement and lifecycle operation requires its own grant. Registration ownership and actor control do not confer mutation authority. Game data cannot grant executable capabilities.

Preserve descendants on relocation, remove invalid physical associations atomically, and keep nonphysical relationships independent. Activation requires explicit placement. Individual destruction and deactivation require prior explicit resolution of active descendants. Recursive destruction is a distinct explicit operation covering the target and all active containment descendants; it is never inferred. Resolve player control and selection as required consequences, preserve identity and unrelated properties, and prohibit terminal resurrection during forward gameplay. No automatic restoration of control or associations.

Use temporary structural-only world proposals against the latest candidate. Validate before staging normalized writes; expected restriction rejection leaves the attempted operation unstaged. Unexpected authority, programming or integrity failures invalidate the entire candidate. Independent final validation and dispatcher-owned atomic publication remain required. The player domain owns control/selection rules; state coordinates required consequences; world owns structural rules.

## Alternatives

Persistent mutable hierarchy and inventory caches would add competing state and invalidation complexity. Implicit cascading destruction would hide author intent and risk accidental loss of descendants. General-purpose nested transactions or journals would add unnecessary complexity; operation-local proposals suffice. Generic reserved-property writes would weaken domain authority.

## Consequences

World operations can support future navigation, inventory and specialized mechanics without embedding those policies in core. No new public interface, data-format revision, dependency, dynamic identity creation, visibility policy or gameplay undo is introduced. Administrative reset and future validated save restoration remain separate. See [world containment](../../engine/contracts/WORLD_CONTAINMENT.md), [physical properties](../../engine/contracts/PHYSICAL_PROPERTIES.md), [runtime state](../../engine/contracts/RUNTIME_STATE.md) and [runtime implementation](../../engine/RUNTIME_IMPLEMENTATION.md).
