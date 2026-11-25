# Public API and compatibility

Status: Accepted design; implementation pending. Origin: [ADR 0018](../decisions/0018-public-api-and-compatibility.md), [FND-05 (#7)](https://github.com/ja-sanborn/asterweave/issues/7).

## Consumer boundary

Asterweave provides one primary public facade for game integrators, hosts and authoring tools. Only explicitly designated, documented interfaces are supported public APIs. Internal ES module exports support collaboration between modules but do not automatically become consumer contracts. Consumers must not depend on internal file paths or implementation representations. A global engine object is not required. Optional extension access uses separate, explicitly supported contracts when introduced.

Supported factories control construction of engine-owned runtimes and domain objects. Consumers cannot arbitrarily construct or mutate engine-owned objects through supported APIs. Native classes, private members, closures and module boundaries provide encapsulation, not a sandbox against code controlling the execution environment.

## Interface obligations

Document public input and output shapes, semantic behavior, validation, defaults, failure modes, state ownership, side effects and relevant ordering guarantees. Validate external data and configuration at applicable boundaries. Preserve platform independence and return semantic records rather than rendered UI. See [actions and results](ACTIONS_AND_RESULTS.md), [error handling](ERROR_HANDLING.md) and [security model](SECURITY_MODEL.md).

Use supported queries and detached recursively read-only snapshots for inspection. Use authorized operations for changes; no writable live state or unrestricted setters. Preserve independent runtimes, atomicity and caller isolation under [runtime state](RUNTIME_STATE.md). A trusted inspection interface is not automatically appropriate for player exposure; hosts enforce authorization and audience scope.

Concrete signatures, module entry path, exports, construction interfaces and lifecycle operations are defined and tested by their owning stories. No new interface or capability is specified merely by naming this boundary.

## Operation result interfaces

Follow [ADR 0020](../decisions/0020-standardized-operation-result-architecture.md). Fallible public operations use operation-specific read-only result interfaces with common status semantics; ordinary getters and calculations return documented values. Concrete result classes and factories are internal. Supported serializable results implement toJSON and return detached JSON-compatible records; derived predicates are excluded and unavailable fields follow the operation envelope. ValidationResult supports serialization; InitializationResult explicitly throws TypeError from toJSON in every status. Serialization is not authorization and must never expose a live game reference. See the error-handling contract for result invariants.

## Version authorities

| Version | Authority and meaning |
| --- | --- |
| Engine release | Asterweave software release, following Semantic Versioning 2.0.0 |
| Public API compatibility | Governed by engine release version; no separate negotiated API version in Foundation |
| Game-definition format | Asterweave canonical JSON interpretation |
| Game content | Author-managed content revision |
| Save format | Asterweave serialized state interpretation |
| Distribution format | Future packaging representation, independently versioned |

These versions do not advance in lockstep. A bug fix need not change a data format. Engine compatibility never implies support for every definition, save or package version. Respect each existing contract's explicit supported versions and compatibility rules, including exact save compatibility; no automatic migration promise. See [game definitions](GAME_DEFINITIONS.md), [save data](SAVE_DATA.md) and [ADR 0010](../decisions/0010-game-packaging-and-content-protection.md).

## Release compatibility

Use [Semantic Versioning 2.0.0](https://semver.org/) for engine releases: after 1.0.0, MAJOR for incompatible public API changes, MINOR for backward-compatible functionality and deprecations, PATCH for backward-compatible fixes. The current private package at 0.0.0 is initial development, not a production release. During 0.x, public interfaces may evolve; changes must still be intentional, reviewed and documented, and accepted contracts must not be silently rewritten. Stable public API compatibility begins at 1.0.0.

Removing public interfaces, changing required fields or documented defaults, changing result structures incompatibly, or reinterpreting stable error codes can break consumers. Adding optional capabilities is compatible only if existing documented behavior remains intact. Private module reorganization alone is not a public API break. Corrections matching the documented contract are generally compatible; review observable effects and document relevant changes.

Prefer documented deprecation before incompatible changes to stable interfaces where practical. Use JSDoc @deprecated and identify replacements. Record compatibility changes in appropriate release documentation and update affected contracts, tests and author guidance. No new release, version bump, distribution format or publication workflow is authorized by this contract.

## Verification

Review public exports deliberately and test documented behavior, failure contracts, isolation and compatibility as interfaces become available. Internal tests may import private modules to verify domain behavior without making those imports public. Follow the [testing strategy](../../tests/README.md) and [coding standards](../CODE_STYLE.md).
