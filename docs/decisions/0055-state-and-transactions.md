# ADR 0055 — Authoritative state and transactional ownership

Status: Accepted

## Context

Asterweave requires a coherent first-party modular architecture, with independently usable gameplay execution and declarative game content.

## Decision

Use one authoritative current gameplay state per runtime, immutable detached authored baseline and normalized overrides rather than competing effective copies. Support six JSON types, structural equality, complete-value replacement, explicit removals and null distinct from absence. Engine-controlled qualified domain namespaces govern engine properties; game-authored properties are declarative. No external namespace claims or universal declaration requirement for custom/dynamic values. Preserve current property grammar until separately reviewed. Modules share engine-owned state and validation, never independent authoritative stores. Six scopes: world, location, entity, actor, player and directional relationship. Gameplay-relevant state remains engine-owned; purely presentation/interaction state stays outside.

RuntimeState owns committed state, immutable GameBaseline, encapsulated Map-based overrides and complete player records. Use structured addresses and shared effective-property resolution. Dedicated synchronous dispatcher, isolated StateTransaction and restricted ActionExecutionContext stage candidate data and ordered outputs; candidate reads see staged writes, public reads committed state. Independent candidate collections, explicit presence entries, four-state private transaction lifecycle, prepared publication and engine-established executable grants. Guard before external data inspection; disallow reentrant dispatch/reset. Expire handler capability immediately at exit and track invocation-local violations through outcome inspection. Caught programming/integrity failures invalidate candidates. Reject unauthorized mutations; default-deny grants independent of registration and actor control. Validate local preconditions and complete candidate integrity; reuse pure effective-state validators across initialization, transitions and restoration, separating initial viability, structural prerequisites, ongoing invariants and forward-transition checks. Preserve deterministic findings and suppress cascades. Dispatcher alone advances checked nonnegative safe-integer turns from zero; reject overflow atomically. Zero-turn changes permitted. No public setters, middleware, global event bus, gameplay undo or competing state. Detached recursively read-only snapshots and independent runtimes. Atomicity covers engine-owned state only. See [runtime implementation](../engine/RUNTIME_IMPLEMENTATION.md), [properties](../engine/contracts/PROPERTIES.md) and [runtime state](../engine/contracts/RUNTIME_STATE.md).

## Alternatives and consequences

Prefer explicit cohesive responsibilities and reviewed contracts over speculative generalized frameworks. Preserve applicable existing behavior, security and verification; accepted design does not establish implementation or authorize new feature scope.
