# 0007 — Extensible and configurable action definitions

> **Archived — historical only.** Superseded by [ADR 0052](../0052-module-composition.md), [ADR 0053](../0053-action-architecture.md). The original decision text below is not current authority.


Status: Accepted

## Context

The unified action design requires one genre-independent action contract. A fixed list of implemented actions cannot accommodate every game.

## Decision

Distinguish standard, extension and game-defined actions. Reserve unqualified names for standard actions and use explicit owned namespaces for other actions. Maintain a reference catalog with individual default turnCostSuccess and turnCostFail values. Register supported definitions and trusted handlers through an isolated registry, rejecting duplicates and namespace collisions. Keep the registry independently testable and make dispatcher integration depend on it. Game data may eventually enable/disable supported actions and override costs; submitted actions cannot supply their own costs or handlers. Support future trusted JavaScript registration and declarative JSON custom actions, with no arbitrary executable code in untrusted data. Only move is required for Foundation; implement other catalog entries as their capabilities and contracts are defined.

## Alternatives

Hardcoded closed action enumeration; separate execution paths for extensions; caller-controlled costs; requiring executable scripts for authors.

## Consequences

Registry infrastructure precedes dispatcher integration. Configurable and declarative actions follow later. See [definitions](../contracts/ACTION_DEFINITIONS.md) and [catalog](../contracts/STANDARD_ACTIONS.md). This decision does not implement handlers or finalize the game JSON schema.

## Subsequent scope clarification

[ADR 0026](0026-functional-foundation-and-optional-extension-boundaries.md) brings configurable standard actions, declarative custom actions and supported extension integration into Foundation. Detailed registration and authored schema contracts require separate design review.
