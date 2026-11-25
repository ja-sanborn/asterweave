# 0018 — Public API and compatibility

Status: Accepted

## Context

The platform-independent runtime and modular architecture in ADRs [0001](0001-platform-independent-runtime.md) and [0016](0016-modular-architecture-and-design-patterns.md) need an explicit consumer boundary. The initial runtime implementation requires a defined public boundary. Engine releases, authored content, canonical definitions, saves and distribution packages have distinct compatibility concerns.

## Decision

Provide one primary public facade, with explicitly selected, documented exports and supported factories controlling construction of engine-owned runtime/domain objects. Internal ES module exports are not automatically supported public APIs. Consumers depend on documented contracts rather than internal files, concrete representations or writable state. Expose detached snapshots and supported queries for reading; use authorized operations for mutations. Keep platform integration and optional extension contracts separate. Do not require a global engine object. JavaScript encapsulation is not a security sandbox.

Use [Semantic Versioning 2.0.0](https://semver.org/) for engine releases, with public API compatibility governed by the engine version rather than a separately negotiated API version. Retain independent definition-format, content, save-format and future distribution-format versions. The current private 0.0.0 package is not a production release. Pre-1.0 changes are permitted but must be intentional, reviewed and documented; accepted contracts are not silently changed. Establish stable public API compatibility at 1.0.0. After stability, prefer documented deprecation and replacements before incompatible changes where practical.

## Alternatives

- Treat all internal exports as public: unnecessarily constrains refactoring and couples consumers to implementation.
- Permit arbitrary external construction or direct mutation of engine-owned objects: undermines state ownership and validation.
- Introduce a separate API version now: adds negotiation and release complexity without an established need.
- Promise stable compatibility from 0.0.0: constrains initial design exploration.

## Consequences

Public interfaces, semantic behavior, errors, defaults and compatibility must be intentionally documented and tested. Internal refactoring can remain independent of public contracts. Release decisions do not automatically change data formats. See the normative [public API contract](../contracts/PUBLIC_API.md) and [security model](../contracts/SECURITY_MODEL.md).

Concrete entry point paths, signatures, classes, export lists and lifecycle interfaces are decided in their owning stories after explicit implementation-design authorization. This record introduces no implementation or package changes.
