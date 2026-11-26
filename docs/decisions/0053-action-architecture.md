# ADR 0053 — Unified action execution and registration

Status: Accepted

## Context

Asterweave requires a coherent first-party modular architecture, with independently usable gameplay execution and declarative game content.

## Decision

Canonical actions identify actors, types and relevant targets; text, choices, narrative and direct calls share one dispatcher. Engine and included first-party modules exclusively supply executable behavior in the initial release. Games configure supported engine actions, conditions, effects and outcomes declaratively; no independently authored action identities or executable handlers. Declarative behavior composition requires later review. No executable game registration authority, arbitrary scripts, external namespace claims or public registration. Future scripting is nonbinding and requires separate review. Stable action identifiers do not expose module paths; recognize only unqualified case-sensitive identifiers in the authoritative standard catalog. Recognition does not imply inclusion, registration or availability. Catalog additions require reviewed engine development.

Each runtime owns an independent registry separate from gameplay state. Trusted setup validates registrations, rejects duplicate identities and invalid registration authority, detaches and recursively freezes metadata and protects handler/validator associations against replacement. Registration and lookup do not execute handlers. Setup is additive and atomic; prevent reentrant modification, finalize irreversibly before gameplay, retain lookup, no replacement/removal/reopening/global cache or arbitrary quota. Preserve separate actor-control, registration and engine-established default-deny mutation authority; use one registry-local registration Symbol and one distinct mutation grant Symbol. Integrity verification checks remaining metadata, authority, associations and grants without invoking handlers. Retain finalized registry across reset. No dynamic namespace claims or game registration authority.

Public synchronous submission validates actor control; separately authorized internal submission shares orchestration. Distinguish envelope/argument syntax, reference existence/category and gameplay eligibility. Dispatcher selects effective trusted success/failure turn costs; callers and handlers cannot supply costs. Completed success or intentional gameplay failure may commit valid consequences; rejection and execution errors commit no state, turns or staged outputs. Publish state, turns and ordered semantic outputs atomically. Initial movement defaults to one turn on success and zero on rejected exits; configurable costs and conditional behavior remain planned. Intermediate scheduled turns cannot be silently skipped; event ordering/interruption require detailed design. No production placeholder handlers, async gameplay execution or external side-effect rollback guarantee. See [state and transactions](0055-state-and-transactions.md), [action contracts](../engine/contracts/ACTIONS_AND_RESULTS.md) and [definitions](../engine/contracts/ACTION_DEFINITIONS.md).

## Alternatives and consequences

Prefer explicit cohesive responsibilities and reviewed contracts over speculative generalized frameworks. Preserve applicable existing behavior, security and verification; accepted design does not establish implementation or authorize new feature scope.
