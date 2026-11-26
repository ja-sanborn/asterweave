# ADR 0052 — First-party gameplay modules and composition

Status: Accepted

## Context

Asterweave requires a coherent first-party modular architecture, with independently usable gameplay execution and declarative game content.

## Decision

Mandatory engine infrastructure has no dependency on optional gameplay or interaction capabilities, Creator or Tools. First-party gameplay modules contribute reusable behavior to the composed engine; interaction modules sit above it and consume supported interfaces. Dependencies are explicit and acyclic; ordinary ECMAScript imports and explicit collaborator injection suffice. Tools compose selected capabilities and required dependencies before gameplay. Inclusion is distinct from game usage. Unselected executable modules are physically omitted unless required by a selected dependency. All included gameplay modules share the engine version. No public executable extension architecture, dynamic discovery, runtime loading framework, service locator or independent module version negotiation. Do not create generic composition abstractions ahead of real requirements. Engine-controlled setup contributes trusted handlers and domain contracts without exposing internal authority; modules do not claim action namespaces or independent registration authority. Exact composition interfaces require reviewed design. See [action architecture](0053-action-architecture.md) and [distribution](0058-compilation-and-distribution.md).

## Alternatives and consequences

Prefer explicit cohesive responsibilities and reviewed contracts over speculative generalized frameworks. Preserve applicable existing behavior, security and verification; accepted design does not establish implementation or authorize new feature scope.
