# ADR 0057 — Minimal engine interface and compatibility

Status: Accepted

## Context

Asterweave requires a coherent first-party modular architecture, with independently usable gameplay execution and declarative game content.

## Decision

One primary documented engine facade, intentionally selected exports and engine-controlled factories; internal ES module exports are not automatically public. Ordinary ECMAScript classes, methods, functions and explicit collaborators suffice. Consumers use documented initialization, authorized actions, lifecycle, detached snapshots and supported queries; introduce capability inspection only for demonstrated requirements. Interaction, Tools and Creator use supported interfaces, not private registry or state. Gameplay module instances, registration, composition, transactions and mutation remain internal. No public module APIs, generic lookup, global engine object, network infrastructure or speculative discovery framework. JavaScript encapsulation is not a hostile-code sandbox.

Engine releases use Semantic Versioning 2.0.0, one version across included gameplay modules, no separate API negotiation. Definition, content, save and distribution versions remain independent; future language versioning is separately reviewed. Private 0.0.0 is not a production release. Intentional pre-1.0 changes require review and documentation, but superseded pre-release APIs, schemas, aliases, migration paths and implementations need not be retained. Remove obsolete code and tests when they no longer support current requirements or distinct verification. Continue to enforce explicitly supported formats and current contracts. Stable API at 1.0.0; prefer deprecation and replacements before incompatible changes after stability. Distribution compatibility depends on explicitly supported distribution and canonical definition formats, engine compatibility requirements and required capabilities, not mandatory exact engine-version matching. Compatible engine updates need not invalidate packages; pre-1.0 compatibility is not presumed. Reject incompatible packages, unsupported formats and unavailable required capabilities. See [ADR 0058](0058-compilation-and-distribution.md). Source relocation alone does not change data versions. Concrete interfaces require reviewed design. See [public interface contract](../engine/contracts/PUBLIC_API.md).

## Alternatives and consequences

Prefer explicit cohesive responsibilities and reviewed contracts over speculative generalized frameworks. Preserve applicable existing behavior, security and verification; accepted design does not establish implementation or authorize new feature scope.
