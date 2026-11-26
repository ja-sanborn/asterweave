# ADR 0059 — World identity, containment and authorized transitions

Status: Accepted

## Context

Asterweave requires a coherent first-party modular architecture, with independently usable gameplay execution and declarative game content.

## Decision

One implicit engine-recognized non-navigable World root (reserved ID world). Each active participant has one immediate parent/relationship with acyclic ancestry reaching World. Locations, actors and entities retain categories and shared stable IDs. Containment: in, on, carried, held, worn, attached, partOf. Descendants move with parents; derive location, contents, possessions and loads from effective state without competing indexes. Directed non-containing associations under, behind, beside, near describe relative position, not ownership or visibility; invalidate when structural prerequisites cease. Nonphysical property relationship addressing remains independent; no relationship properties are currently supported. Future domains require explicit relationship semantics and lifecycle contracts. Lifecycle active, inactive, destroyed; preserve identities, terminal destroyed cannot resurrect during forward gameplay. Legal ownership is optional authored policy. Future relationship semantics require explicit review, no arbitrary registration.

Twelve case-sensitive canonical directions: north, south, east, west, northeast, northwest, southeast, southwest, up, down, in, out. Domain-owned immutable shared vocabulary; parser aliases separate; directed fixed location destinations, unique direction per source, no inferred reverse exit, geometry or physical entry. Reject arbitrary custom directions; future conditional/hidden/door-controlled navigation and custom vocabularies require review.

Separately authorized relocation, association establishment/removal, activation, deactivation, individual destruction and recursive destruction; physical mutations follow separate grant. Activation requires explicit placement. Individual destruction/deactivation requires explicit prior resolution of active descendants; recursive destruction is explicitly requested for target and active containment descendants, never inferred. Resolve player control/selection, preserve unrelated properties, no automatic restoration of control/associations. World owns structural rules, player owns control, state coordinates consequences. Use temporary structural-only proposals against latest candidate, validate before staging normalized writes; expected restrictions leave attempted operation unstaged, unexpected authority/programming/integrity failures invalidate whole candidate. Independent final validation and dispatcher atomic publication remain mandatory. Iterative traversal and shared validation/calculation; no general nested transactions, dynamic identities or direct public mutations. See [world containment](../engine/contracts/WORLD_CONTAINMENT.md).

## Alternatives and consequences

Prefer explicit cohesive responsibilities and reviewed contracts over speculative generalized frameworks. Preserve applicable existing behavior, security and verification; accepted design does not establish implementation or authorize new feature scope.
