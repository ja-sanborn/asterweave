# 0021 — Standard navigation vocabulary

Status: Accepted; implementation pending.

## Context

FND-05 validates the canonical definition before movement is implemented in FND-08. The four cardinal directions in ADR 0009 unnecessarily restrict classic adventures (including a future native Zork reference game) and other genres.

## Decision

Support twelve case-sensitive standard canonical direction identifiers: north, south, east, west, northeast, northwest, southeast, southwest, up, down, in and out. Use a domain-owned immutable vocabulary shared by definition validation and movement. Represent directions as validated semantic strings, not coordinates or angles. Parser aliases and abbreviations are separate from canonical identifiers.

Retain directed exit records with fixed location destinations, unique directions per source, no inferred reverse exits, and independent containment. Do not infer geometry or physical entry from direction names. Preserve existing destination, movement and turn semantics. Design the model so later explicitly registered custom identifiers are possible, but defer registration, ownership and authoring contracts; reject arbitrary custom identifiers in Foundation. Conditional, hidden, door-controlled and state-dependent navigation remain future work.

Advance the canonical definition format from 3.0.0 to 3.1.0 as a compatible vocabulary expansion, without changing the exit record shape or existing direction semantics. The first Foundation reader recognizes exactly 3.1.0; no legacy reader or migration is required. Update illustrative definitions and matching save fixtures. Save format 1.0.0 and engine package versions remain independent.

## Alternatives

- Retain four directions or a permanently closed expanded vocabulary: insufficient genre flexibility.
- Accept arbitrary authored directions now: weak typo detection and no explicit vocabulary ownership contract.

## Consequences and verification

Supersedes the direction restriction in [ADR 0009](0009-canonical-game-definition-contract.md) and the format version established by [ADR 0013](0013-namespaced-properties-and-runtime-state.md). Existing state, containment and action semantics remain in effect. See [canonical definitions](../contracts/GAME_DEFINITIONS.md), [action contracts](../contracts/ACTIONS_AND_RESULTS.md), [standard actions](../contracts/STANDARD_ACTIONS.md) and [testing strategy](../../tests/README.md).

Verify all twelve identifiers, duplicate and invalid direction rejection, destination references, directed semantics and exact format version. Future movement uses the same vocabulary. No runtime code, new dependency, parser or custom direction registration is introduced by this decision.
