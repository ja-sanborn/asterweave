# 0002 — Unified action contract

Status: Accepted design principle

## Context
Typed commands and predefined choices must interact with the same world consistently.

## Decision
Both input systems produce standardized actions identifying an actor and relevant targets. The core validates and executes actions and returns semantic results.

## Alternatives
Independent world logic in each input system.

## Consequences
Rules and state transitions have one authoritative path. Exact action and result schemas remain to be designed.
