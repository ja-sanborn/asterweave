# Public API and compatibility

Status: Accepted contract. See [ADR 0057](../decisions/0057-engine-interface-and-compatibility.md).

## Consumer boundary

Asterweave provides one primary public facade for game integrators, hosts and authoring tools. Only explicitly designated, documented interfaces are supported public APIs. Internal ES module exports support collaboration between modules but do not automatically become consumer contracts. Consumers must not depend on internal file paths or implementation representations. A global engine object is not required. Optional extension access uses separate, explicitly supported contracts planned within Foundation. Input/presentation clients and trusted gameplay providers require different capabilities; no private registry or mutable state becomes public by implication.

Supported factories control construction of engine-owned runtimes and domain objects. Consumers cannot arbitrarily construct or mutate engine-owned objects through supported APIs. Native classes, private members, closures and module boundaries provide encapsulation, not a sandbox against code controlling the execution environment.

## Interface obligations

Document public input and output shapes, semantic behavior, validation, defaults, failure modes, state ownership, side effects and relevant ordering guarantees. Validate external data and configuration at applicable boundaries. Preserve platform independence and return semantic records rather than rendered UI. See [actions and results](ACTIONS_AND_RESULTS.md), [error handling](ERROR_HANDLING.md) and [security model](SECURITY_MODEL.md).

Use supported queries and detached recursively read-only snapshots for inspection. Use authorized operations for changes; no writable live state or unrestricted setters. Preserve independent runtimes, atomicity and caller isolation under [runtime state](RUNTIME_STATE.md). A trusted inspection interface is not automatically appropriate for player exposure; hosts enforce authorization and audience scope.

Concrete signatures, module entry path, exports, construction interfaces and lifecycle operations must be explicitly documented and tested. No new interface or capability is specified merely by naming this boundary.

## Validation, initialization and inspection API

The named Asterweave class export in src/engine/Asterweave.js is the primary public facade. Static validateGame(definition) returns ValidationResult; static initializeGame(definition, options) returns InitializationResult. Both are synchronous, accept parsed canonical data (not JSON text), and share definition validation. Initialization options are optional and follow the closed configuration contract in [runtime state](RUNTIME_STATE.md#players-and-actors). Initialization always validates, creates independent game state, and exposes a game only on success. Construction is engine-controlled; each instance owns one independent game. Each initialized facade instance also privately owns an independent finalized action registry, which is not exposed by the facade, initialization options or snapshots. No public registration interface is provided. The dispatch and reset interfaces below are supported runtime infrastructure; production initialization has no registered gameplay handlers.

Instance getters gameId, gameVersion (authored content version) and turn return their documented scalar values directly. Instance getStateSnapshot() returns the detached, recursively read-only domain-organized effective state record defined in [runtime state](RUNTIME_STATE.md#effective-state-snapshot). It is constructed on demand and supports native JSON serialization. This trusted inspection interface is not a save interface or player perception API. Retain the same snapshot schema for subsequent committed state. No separate snapshot format version is introduced. Compatibility is governed by engine API SemVer.

### Initial usage

```javascript
import { Asterweave } from './src/engine/Asterweave.js';

const validation = Asterweave.validateGame(definition);
const result = Asterweave.initializeGame(definition);
if (result.isCompleted) {
    const game = result.game;
    const snapshot = game.getStateSnapshot();
}
```

The caller supplies parsed canonical data; the import path is relative to a consumer at the repository root. Validation alone publishes no game. Initialization validates independently even after a successful standalone check. Rejection exposes diagnostics and no game; unexpected failure exposes a safe error and no game. See [error handling](ERROR_HANDLING.md). Dispatch validates submitted actions and executes registered trusted handlers. Production initialization retains an empty registry, so no gameplay action is currently executable through the public facade. Administrative reset is supported. Save and restore, supported extension interfaces and actor-scoped queries are planned Foundation work, not currently supported public interfaces. A standalone bundle will preserve documented public behavior; concrete entry points and package-loading interfaces require design review.

## Action dispatch and reset

The synchronous instance method `dispatchAction(action)` returns an engine-constructed ActionResult following [actions and results](ACTIONS_AND_RESULTS.md). The explicit acting actor must be active and controlled by the configured player; selection is not authority. No-player configuration grants no public dispatch authority. Separately authorized internal headless or game-logic submission uses the same dispatcher but is not a public interface. Reentrant submission rejects without changing state. Result identity disclosure and deterministic error precedence follow the [dispatch contract](ACTIONS_AND_RESULTS.md#dispatch-sequence); results are trusted-host data, not a remote-client disclosure guarantee.

The synchronous instance method `reset()` returns an engine-constructed ResetResult. It restores the original initialized state atomically without changing facade identity or the finalized registry. Reset is administrative, not a gameplay action; hosts own access to administrative operations. See [runtime state](RUNTIME_STATE.md#administrative-reset-and-integrity) and [error handling](ERROR_HANDLING.md).

When committed integrity cannot be established, dispatch returns an error with EXECUTION_FAILED; turn and getStateSnapshot() throw a native Error with a safe fixed message, without exposing unverified state. gameId and gameVersion remain available from verified immutable metadata. Reset may attempt validated recovery. No public health flag, transaction, registry, unrestricted setter or handler-registration interface is introduced. Previously returned detached snapshots and results remain unchanged. The frozen facade retains stable private runtime, dispatcher, resetter and registry collaborators; the [internal design](../RUNTIME_IMPLEMENTATION.md#reset-integrity-and-facade) does not introduce additional supported interfaces.

## Operation result interfaces

Follow [ADR 0067](../decisions/0067-operation-results.md). Fallible public operations use operation-specific read-only result interfaces with common status semantics and inherited isCompleted, isRejected, isError, isSuccess and isFailure predicates (see [error handling](ERROR_HANDLING.md#standardized-operation-results)); ordinary getters and calculations return documented values. Concrete result classes and factories are internal. Supported serializable results implement toJSON and return detached JSON-compatible records; derived predicates are excluded and unavailable fields follow the operation envelope. ValidationResult supports serialization; InitializationResult explicitly throws TypeError from toJSON in every status. Serialization is not authorization and must never expose a live game reference. See the error-handling contract for result invariants.

Validation and initialization share a single diagnostics collection with required source, code, severity, path and message fields. Source is definition or options, identifying the argument to which the JSON Pointer is relative (empty string denotes that argument's root). Standalone validation produces only definition findings. Initialization orders definition findings before options findings and preserves deterministic ordering within each source. Action error envelopes remain unchanged.

## Version authorities

| Version | Authority and meaning |
| --- | --- |
| Engine release | Asterweave software release, following Semantic Versioning 2.0.0 |
| Public API compatibility | Governed by engine release version; no separate negotiated API version in Foundation |
| Game-definition format | Asterweave canonical JSON interpretation |
| Game content | Author-managed content revision |
| Save format | Asterweave serialized state interpretation |
| Distribution format | Planned Foundation packaging representation, independently versioned |

These versions do not advance in lockstep. A bug fix need not change a data format. Engine compatibility never implies support for every definition, save or package version. Respect each existing contract's explicit supported versions and compatibility rules, including exact save compatibility; no automatic migration promise. See [game definitions](GAME_DEFINITIONS.md), [save data](SAVE_DATA.md) and [ADR 0058](../decisions/0058-compilation-and-distribution.md).

## Release compatibility

Use [Semantic Versioning 2.0.0](https://semver.org/) for engine releases: after 1.0.0, MAJOR for incompatible public API changes, MINOR for backward-compatible functionality and deprecations, PATCH for backward-compatible fixes. The current private package at 0.0.0 is initial development, not a production release. During 0.x, public interfaces may evolve; changes must still be intentional, reviewed and documented, and accepted contracts must not be silently rewritten. Stable public API compatibility begins at 1.0.0.

Removing public interfaces, changing required fields or documented defaults, changing result structures incompatibly, or reinterpreting stable error codes can break consumers. Adding optional capabilities is compatible only if existing documented behavior remains intact. Private module reorganization alone is not a public API break. Corrections matching the documented contract are generally compatible; review observable effects and document relevant changes.

Prefer documented deprecation before incompatible changes to stable interfaces where practical. Use JSDoc @deprecated and identify replacements. Record compatibility changes in appropriate release documentation and update affected contracts, tests and author guidance. No new release, version bump, distribution format or publication workflow is authorized by this contract.

## Verification

Review public exports deliberately and test documented behavior, failure contracts, isolation and compatibility as interfaces become available. Internal tests may import private modules to verify domain behavior without making those imports public. Follow the [testing strategy](../../tests/README.md) and [coding standards](../CODE_STYLE.md).
