# 0011 — Unified world containment and placement

Status: Accepted

## Context
The unified containment design extends the canonical definition model before runtime implementation. Locations, actors and entities must support nested placement and shared worlds without separate inventory or actor-location authorities.

## Decision
Use one engine-recognized non-navigable root World (reserved ID world) per instance. Every other active participant has one immediate parent and relationship, with acyclic ancestry reaching World. Preserve separate categories and shared IDs. Standard containment relationships are in, on, carried, held, worn, attached and partOf. Descendants move with parents; queries derive location, contents and possessions. Non-containing associations under, behind, beside and near describe relative position, not ownership or visibility; invalidate them when structural prerequisites cease to hold. Lifecycle states active, inactive and destroyed distinguish world presence; reserve identity and explicitly resolve children on removal. Prefer standard engine relationships; future validated extensions and author-defined relationships must declare structural semantics and obey invariants. Legal/historical ownership is optional game logic. Physical constraints are defined in [ADR 0012](0012-physical-properties-and-capacity.md).

Replace initialLocationId and initialPlacement with common initialContainment (parentId, relationship); add initialLifecycle, initialAssociations and physical as specified in [canonical definitions](../contracts/GAME_DEFINITIONS.md). Advance canonical format to 2.0.0; no legacy runtime reader is required because no runtime exists. This supersedes the placement, accepted version and world schema portions of ADR 0009, preserving its remaining principles and ADR 0010's packaging boundary.

## Alternatives
Separate inventories/locations/containers; multiple roots; generic unrestricted relationship graph; retain format 1.0.0 despite breaking fields.

## Consequences
The [containment contract](../contracts/WORLD_CONTAINMENT.md) is normative. State, validation, initialization, internal containment and navigation follow this design and require integrated verification. No gameplay runtime, custom registration, lifecycle actions, visibility system or multiplayer implementation is introduced. Preserve ADRs 0001–0008.

[ADR 0013](0013-namespaced-properties-and-runtime-state.md) supersedes the accepted format version with 3.0.0; ADRs [0021](0021-standard-navigation-vocabulary.md) and [0022](0022-flexible-physical-measurement-ranges.md) subsequently advance the format to 3.2.0; the historical decision above is retained. See the current [canonical contract](../contracts/GAME_DEFINITIONS.md).
