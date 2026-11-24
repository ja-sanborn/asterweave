# 0007 — Extensible and configurable action definitions

Status: Accepted

## Context

[FND-02 (issue #4)](https://github.com/ja-sanborn/asterweave/issues/4) requires one genre-independent action contract. A fixed list of implemented actions cannot accommodate every game.

## Decision

Distinguish standard, extension and game-defined actions. Reserve unqualified names for standard actions and use explicit owned namespaces for other actions. Maintain a reference catalog with individual default turnCostSuccess and turnCostFail values. Register supported definitions and trusted handlers through an isolated registry, rejecting duplicates and namespace collisions. Keep the registry independently testable and make dispatcher integration depend on it. Game data may eventually enable/disable supported actions and override costs; submitted actions cannot supply their own costs or handlers. Support future trusted JavaScript registration and declarative JSON custom actions, with no arbitrary executable code in untrusted data. Only move is required for Foundation; implement other catalog entries through focused future stories.

## Alternatives

Hardcoded closed action enumeration; separate execution paths for extensions; caller-controlled costs; requiring executable scripts for authors.

## Consequences

[FND-10 (issue #15)](https://github.com/ja-sanborn/asterweave/issues/15) provides registry infrastructure before FND-06. [Configuration (#16)](https://github.com/ja-sanborn/asterweave/issues/16) and [declarative actions (#17)](https://github.com/ja-sanborn/asterweave/issues/17) follow later. See [definitions](../contracts/ACTION_DEFINITIONS.md) and [catalog](../contracts/STANDARD_ACTIONS.md). This decision does not implement handlers or finalize the game JSON schema.
