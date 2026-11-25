# ADR 0023 — Action registry ownership, registration authority and lifecycle

Status: Accepted

## Context

[ADR 0007](0007-extensible-and-configurable-action-definitions.md) establishes extensible action definitions. Registration must remain independent of dispatch, authoritative gameplay state and platform services. [ADR 0016](0016-modular-architecture-and-design-patterns.md), [ADR 0018](0018-public-api-and-compatibility.md) and [ADR 0019](0019-security-and-trust-boundaries.md) govern encapsulation and trust.

## Decision

Each runtime privately owns an independent action registry, separate from gameplay state. Trusted setup establishes registry-local opaque Symbol capabilities for engine, game and explicitly claimed extension namespaces. Unqualified identifiers belong to the standard catalog; game and asterweave are reserved qualified namespaces, with asterweave reserved for future engine use. Action and property namespace ownership are independent.

Registration is additive, validated and atomic. Duplicates and conflicting ownership are rejected. Definitions are detached and recursively immutable; executable associations are protected against replacement but trusted function behavior is not sandboxed. Registration and lookup do not execute handlers. Specialized argument validation is independent of runtime state.

Finalization irreversibly prevents modifications before gameplay. A private guard rejects reentrant modifications during inspection and releases on exceptions. Lookup remains available. No replacement, removal, reopening, global cache or arbitrary registration quota is introduced.

The dispatcher consumes narrow lookup and validation capabilities and exclusively owns authorization, transaction orchestration, cost selection and commitment. Registry data and authority tokens are not gameplay snapshots or save data. No public registration interface or canonical definition format change is introduced.

## Alternatives

Global registries risk cross-runtime leakage. State-owned registries mix executable capabilities with fictional state. Implicit namespace claims make ownership ambiguous. Mutable gameplay-time registries complicate deterministic execution. A general extension framework or executable sandbox is premature.

## Consequences

Trusted setup requires explicit ownership and complete validated definitions. Independent runtimes can use different registrations without shared mutable state. Registration contracts and diagnostic details are maintained in [action definitions](../contracts/ACTION_DEFINITIONS.md). This accepted design does not by itself establish implemented capabilities. It elaborates ADR 0007 and narrows its registry ownership alternatives to independent runtime ownership.

Subsequent decision: [ADR 0024](0024-runtime-transactions-and-action-execution.md) elaborates the accepted runtime execution or recovery contract without replacing this decision's underlying principles.

## Subsequent scope clarification

[ADR 0026](0026-functional-foundation-and-optional-extension-boundaries.md) establishes public extension integration as subsequent Foundation work. This record's internal registry ownership, setup-only registration and finalization principles remain in force; external interfaces require separate reviewed design.
