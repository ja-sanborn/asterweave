# 0020 — Standardized operation result architecture

Status: Accepted.

## Context

FND-05 establishes the first public validation and initialization operations. Decisions 4, 5 and 13 establish a consistent object-oriented Result Object pattern while preserving the operation-specific contracts and failure taxonomy in [ADR 0017](0017-error-handling-and-diagnostics.md) and the public boundary in [ADR 0018](0018-public-api-and-compatibility.md).

## Decision

Use an internal OperationResult base class and shallow, operation-specific subclasses for public operations with meaningful completion, rejection or execution-failure outcomes. Status is authoritative: completed, rejected or error. Read-only Boolean accessors isCompleted, isRejected and isError identify the corresponding status; isSuccess equals isCompleted and isFailure is its inverse. Operation completion is distinct from gameplay success. Preserve the existing action outcome and transaction semantics.

Use explicitly named operation-specific properties rather than a mandatory generic payload or universal error object. Engine-controlled construction enforces result invariants. Results are read-only, with detached recursively protected result-owned data. A controlled operational reference (such as an initialized game) remains usable through its supported interface but cannot be replaced in the result. Document consumer interfaces; concrete constructors, factories and inheritance remain internal. Ordinary getters, predicates and calculations return their documented values directly. Use native exceptions and operation-boundary translation under ADR 0017.

FND-05 introduces ValidationResult and InitializationResult. Both expose diagnostics (always a read-only array) and error (undefined unless status is error). Completed results have empty diagnostics and no error; rejected results have one or more diagnostics and no error; error results have empty diagnostics and safe operation-specific error details. InitializationResult additionally exposes game, an initialized Asterweave instance only on completion and undefined otherwise. No separate valid Boolean or partial game publication.

Definition and configuration diagnostics include a required source (definition or options), with JSON Pointer paths relative to that input argument. Standalone validation and initialization preserve the same definition paths; initialization aggregates both sources, definition first, with deterministic within-source ordering and cascade suppression. This intentional public diagnostic contract addition does not change action errors or game/save formats. See [error handling](../contracts/ERROR_HANDLING.md).

## Serialization (Decision 13)

Define serializability per result type. Supported result classes implement the ECMAScript toJSON convention, returning detached JSON-compatible data in the documented operation-specific envelope. JSON.stringify invokes this method; do not rely on property enumerability or private field serialization. Omit derived status predicates and unavailable fields according to the applicable envelope. Serialization never grants authority to disclose data; hosts enforce audience and authorization.

ValidationResult supports serialization: include status and diagnostics, plus error only for error status. InitializationResult does not support serialization in any status: toJSON throws TypeError rather than producing an incomplete record or exposing the live game reference. Other unsupported result types must likewise explicitly reject serialization with TypeError. Game persistence is a separate future save contract.

Future ActionResult serialization preserves the existing action result envelope, including omission rules, ordered semantic outputs and safe operation-specific errors. Future save and restoration result serialization is defined in their owning stories. No generic serialization of operational objects or new transport protocol is introduced.

## Alternatives

- Unrelated result shapes: inconsistent consumer experience.
- One generic result or universal error envelope: loses operation-specific meaning.
- Enumerable public fields as the serialization mechanism: couples representation to the wire contract.
- Manual toObject conversion alone: less convenient than the native serialization convention.
- Serializing live initialization results: risks misleading or unauthorized state exposure.

## Consequences and verification

Document and test status predicates, result invariants, immutable detached data, construction control, operation-specific envelopes, serialization field presence and omission, and TypeError for unsupported serialization. Preserve the existing action contracts and exception boundaries. Introduce only the result types needed by each story. No schema version change, implementation, dependency or release is implied.

See [public API](../contracts/PUBLIC_API.md), [error handling](../contracts/ERROR_HANDLING.md), [action results](../contracts/ACTIONS_AND_RESULTS.md), [coding standards](../CODE_STYLE.md) and [testing strategy](../../tests/README.md).

## Implementation note

FND-05 implements the common operation result, validation and initialization result classes and their public boundary translation and serialization tests. Final story review remains outstanding. Action results and save/restore results remain future work under their owning contracts. The decision above is unchanged.
