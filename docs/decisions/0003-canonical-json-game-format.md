# 0003 — Canonical JSON game format

Status: Accepted design principle

## Context
Authors need accessible tools while the runtime must remain independent of Creator.

## Decision
Use a versioned canonical JSON game definition. Creator compiles readable authoring content to this format; direct JSON authoring remains supported.

## Alternatives
Interpret an authoring language directly at runtime or require executable game scripts.

## Consequences
Creator is optional and excluded from player distributions. Validation and compatibility contracts remain to be designed.

## Subsequent decisions

[ADR 0009](0009-canonical-game-definition-contract.md), [ADR 0010](0010-game-packaging-and-content-protection.md), [ADR 0011](0011-unified-world-containment.md), [ADR 0012](0012-physical-properties-and-capacity.md) and [ADR 0013](0013-namespaced-properties-and-runtime-state.md) elaborate the design. See the current [canonical game-definition contract](../contracts/GAME_DEFINITIONS.md), format 3.2.0 under [ADR 0022](0022-flexible-physical-measurement-ranges.md); validation implementation remains FND-05 work.
