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
