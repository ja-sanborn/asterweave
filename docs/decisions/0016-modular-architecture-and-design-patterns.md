# 0016 — Modular architecture and design patterns

Status: Accepted

## Context

[FND-05 (issue #7)](https://github.com/ja-sanborn/asterweave/issues/7) begins implementation of the runtime after the definition, containment and state contracts were accepted. Initialization, action execution, containment changes and future restoration must enforce the same domain invariants without depending on each other's orchestration or serialized representations. The runtime must remain platform-independent, deterministic and independently testable.

## Decision

Organize the runtime into cohesive domain-oriented ES modules with explicit contracts and acyclic, unidirectional dependencies. Separate orchestration, domain behavior, data representation and platform integration. Use a hybrid object-oriented and functional approach:

- Encapsulate domain types using native ECMAScript classes where they provide meaningful identity, behavior or access boundaries. Organize one principal domain type per file; group small related functional helpers where cohesive.
- Prefer composition. Permit shallow inheritance only for genuine substitutable is-a relationships with shared behavior; do not create subclasses merely to classify authored content.
- Use pure functions for calculations, validation and invariant checks where practical. Orchestration owns sequencing and authorized state changes, not domain rules.
- Apply dependency inversion and interface segregation: depend on narrow documented data or behavior contracts; supply collaborators explicitly through parameters or factories. Do not use a dependency injection container or service locator.
- Provide a small public facade; keep internal implementation details private. Hosts and adapters depend on core contracts, never the reverse (ports and adapters, ADR 0001).
- Keep definitions immutable and detached from caller data, and keep one authoritative engine-owned state. Domain objects may expose or operate on effective values through explicit interfaces, but must not maintain competing mutable copies of placement, properties or other gameplay state. Independent runtimes share no mutable state.

Locations, actors and entities share the same world-participant identity, containment, lifecycle, associations and physical-property contracts (ADRs 0011–0014). Use a common world-object model, specializing only when justified by actual category-specific behavior, such as exits. House, Bedroom, Garage, Safe, Money and Car are authored data, not JavaScript classes. Container capability is a property, not a required subtype. World is a domain singleton per runtime, not a process-wide Singleton. Runtime players remain outside the physical World.

Definition validation checks canonical authored data; mapping constructs the initial baseline; reusable domain validators check effective state without knowing the authored JSON, override storage, save envelope, action dispatcher or requesting operation. Initialization and later candidate-state operations compose these validators, with operation-specific diagnostics mapped at their boundaries. Do not duplicate domain invariants or require a complete runtime to test them.

Use established patterns when they solve a concrete problem, adapting them to standard JavaScript rather than imposing class-based frameworks:

| Pattern | Intended application |
| --- | --- |
| Facade, factory | Public entry points and isolated runtime construction |
| Composite | Unified containment with stable IDs and derived hierarchy |
| Value object, data mapper | Structured domain values and mapping authored data to baseline |
| Strategy, specification, validation pipeline | Composable domain validation and rule evaluation |
| Command, registry, mediator | Unified action data, trusted handler resolution and dispatch coordination |
| Unit of work | Staged, validated, atomic state changes |
| Memento | Future independent versioned saves, without gameplay undo or action-history replay |
| Adapter / ports and adapters | Hosts, storage and distribution boundaries |

The latter action, transaction and persistence capabilities are implemented only in their respective stories. Patterns are guidance, not requirements to create a class, interface, framework or extension point before it is needed. Avoid global mutable singletons, global event buses, deep inheritance, service locators, active record, authoritative event sourcing, and speculative plugin infrastructure.

## Alternatives

A monolithic core; modules coupled to the canonical JSON layout or mutable runtime internals; exclusively class-based or exclusively functional implementation; deep type hierarchies; framework-driven dependency injection.

## Consequences

Module boundaries and dependencies must be reviewable and domain logic must be independently testable with native tooling. Reuse effective-state invariants across initialization, transactions and future restoration. Keep implementation details behind the public facade and maintain explicit JSDoc contracts. See [architecture](../ARCHITECTURE.md) and [coding standards](../CODE_STYLE.md).

This decision elaborates ADRs 0001–0004 and 0011–0015 without changing the canonical definition or save formats, state ownership or existing feature scope. Concrete interfaces and source files are introduced by approved implementation stories. No runtime implementation is introduced by this record.
