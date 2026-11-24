# Architecture decision records

ADRs record the context, alternatives and consequences of significant architectural decisions. See [architecture](../ARCHITECTURE.md) for the current system design.

Use sequential filenames such as `0001-platform-independent-runtime.md`. Each record contains a title, status (Proposed, Accepted, Superseded or Rejected), context, decision, alternatives and consequences. Link the originating GitHub issue and any superseding record when available. Do not silently rewrite historical decisions.

Initial records capture already documented design principles, not implemented functionality.

[ADR 0016 — Modular architecture and design patterns](0016-modular-architecture-and-design-patterns.md) establishes project-wide implementation boundaries and complements the existing domain contracts. See also [coding standards](../CODE_STYLE.md).

[ADR 0017 — Error handling and diagnostics](0017-error-handling-and-diagnostics.md) establishes common failure semantics and boundaries. See the [error-handling contract](../contracts/ERROR_HANDLING.md).

[ADR 0018 — Public API and compatibility](0018-public-api-and-compatibility.md) establishes the consumer boundary and independent version authorities. See the [public API contract](../contracts/PUBLIC_API.md).

[ADR 0019 — Security and trust boundaries](0019-security-and-trust-boundaries.md) establishes defense in depth, security responsibilities and resource ownership. See the [security model](../contracts/SECURITY_MODEL.md).
