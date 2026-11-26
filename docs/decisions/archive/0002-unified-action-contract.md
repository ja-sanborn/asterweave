# 0002 — Unified action contract

> **Archived — historical only.** Superseded by [ADR 0053](../0053-action-architecture.md). The original decision text below is not current authority.


Status: Accepted design principle

## Context
Typed commands and predefined choices must interact with the same world consistently.

## Decision
Both input systems produce standardized actions identifying an actor and relevant targets. The core validates and executes actions and returns semantic results.

## Alternatives
Independent world logic in each input system.

## Consequences
Rules and state transitions have one authoritative path. Exact action and result schemas remain to be designed.

## Subsequent decisions

[ADR 0006](0006-atomic-action-execution-and-turn-progression.md), [ADR 0007](0007-extensible-and-configurable-action-definitions.md) and [ADR 0008](0008-game-time-and-calendar-separation.md) elaborate this principle. See the current [action and result contracts](../../engine/contracts/ACTIONS_AND_RESULTS.md), [action definitions](../../engine/contracts/ACTION_DEFINITIONS.md) and [error handling](../../engine/contracts/ERROR_HANDLING.md). The original consequences above describe the historical design stage.
