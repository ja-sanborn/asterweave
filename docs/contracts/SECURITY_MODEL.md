# Security model and trust boundaries

Status: Accepted contract. See [ADR 0066](../decisions/0066-security-and-trust.md). For private vulnerability reporting see [SECURITY.md](../../SECURITY.md).

## Trust boundaries

Treat game definitions, save data, imported packages, player input, action requests and external author configuration as untrusted until validated. Engine implementation and deliberately selected executable extensions are trusted code, not validated data. Host-provided identity and authority cross an explicit trust boundary; do not infer authorization from an identifier. Defense in depth combines safe data inspection, schema and reference validation, ownership/authorization checks, domain invariants, isolated state and atomic commits.

| Responsibility | Owner |
| --- | --- |
| Definition, configuration, action and save validation | Engine for supported contracts |
| Gameplay actor control and state integrity | Engine |
| Caller authentication and transport/delivery authorization | Host |
| Filesystem permissions, storage protection, network security | Host |
| Safe rendering and presentation | Host |
| Executable extension selection and trust | Implementing developer |
| Package decoding/protection | Packaging tools and loaders, outside core |

Apply these requirements as the corresponding capabilities are introduced.

## Data and state safety

Apply [canonical definitions](GAME_DEFINITIONS.md), [actions](ACTIONS_AND_RESULTS.md), [runtime state](RUNTIME_STATE.md) and [save data](SAVE_DATA.md) at applicable boundaries. JSON compatibility alone is insufficient.

- Validate own data properties, closed shapes, scalar constraints, identifiers, references and ownership before use. Reject unsupported values, executable values, accessors, cycles and non-data objects as the contract requires. Use safe indexes/copying and never interpret arbitrary keys as prototype mutation paths.
- Do not invoke caller getters during ordinary data validation. Arbitrary Proxy traps cannot be guaranteed side-effect-free; catch inspection failures and prefer parsed JSON supplied by loaders. Core is not a sandbox for hostile JavaScript objects.
- Validate numeric ranges and safe-integer arithmetic, detect cycles and enforce lifecycle, containment, capacity and other applicable invariants.
- Detach caller data and preserve immutable definitions, authoritative engine-owned state and independent runtimes. No writable internal references or unauthorized state mutation.
- Stage changes and validate before atomic commit. Fail closed when integrity cannot be assured; preserve safe errors under [ERROR_HANDLING.md](ERROR_HANDLING.md). Never leak secrets, raw exception internals or private state to unauthorized recipients.

## Authorization and extensions

Actor IDs are not authorization credentials. Validate gameplay control for player-facing requests; trusted headless actions and game logic retain their separately documented authority. Future online hosts authenticate callers, establish trusted player identity, enforce server-authoritative state and scoped delivery, and provide concurrency and transactional persistence protections. Do not expose trusted snapshots directly to players without appropriate authorization.

Executable JavaScript extensions are trusted by the implementing developer and can execute with their environment's privileges. Do not allow data to load arbitrary executable code. No sandbox guarantee or untrusted extension execution is provided. Supported extension access is planned within Foundation through explicitly reviewed setup, capability and compatibility contracts. Registration, namespace ownership, gameplay authorization and mutation grants remain separate. Validate extension-owned authored data and transactional state; do not interpret a package requirement as permission to execute arbitrary code.

Action registration is restricted to trusted internal setup with registry-local Symbol capabilities. Extension claims of reserved namespaces game and asterweave are rejected; authorized game registration uses its own registry-local capability. Duplicate identifiers, foreign or forged capabilities and reentrant modifications are rejected; finalization prevents subsequent mutation. Metadata is safely inspected and detached, while executable associations are protected but trusted. This registration authority is not gameplay actor authorization or a sandbox. See [action definitions](ACTION_DEFINITIONS.md) and [ADR 0053](../decisions/0053-action-architecture.md).

Public dispatch requires explicit actor identity and control by the configured player; a missing player grants no authority. Trusted internal dispatch requires separate explicit authority and uses the same guarded dispatcher. Registration ownership, actor control and engine-established handler mutation authority are independent; no namespace claim, action registration or caller-supplied key grants mutation authority automatically. Administrative reset is trusted host functionality; the host controls access. Guard runtime operations before reflective input inspection; reject reentrancy without affecting the outer transaction.

Grant handlers only restricted transaction capabilities, with detached data and domain-enforced ownership. Protected placement and lifecycle grants are independent, including individual versus recursive destruction; physical set/remove/reset share a dedicated grant. Required intrinsic cleanup uses the initiating operation's authority. The world proposal boundary accepts only closed structural keys and validated shapes, never arbitrary game data or a writable participant index. Terminal destruction is checked against current staged state. See [ADR 0059](../decisions/0059-world-containment-and-transitions.md). Revoke capabilities on exit. No direct committed-state mutation, arbitrary turn assignment, nested dispatch or registry access. Planned authorized internal actor execution must reuse guarded candidate semantics without recursive public dispatch or duplicate turn advancement. Invalid mutation data or prohibited mutation invalidates the transaction even if a handler catches the failure. Validate audience references and semantic data before commitment; audience metadata is not authentication. Apply deterministic rejection precedence and safe echo rules under [actions and results](ACTIONS_AND_RESULTS.md#dispatch-sequence). Distinct rejection codes can disclose actor existence or lifecycle: Foundation results are trusted-host data, not a remote-client privacy or enumeration-resistance guarantee. Future remote hosts require explicit disclosure filtering and authentication/authorization contracts. Block gameplay and unverified state exposure if committed integrity is uncertain; only bounded validated recovery may restore operation. Recovery verifies engine-controlled structures and trustworthy retained dependencies, not arbitrary executable behavior, environment integrity or external side effects. See [runtime state](RUNTIME_STATE.md#administrative-reset-and-integrity).

## Presentation and offline limitations

Semantic text and data are not inherently safe HTML, Markdown, SQL, shell syntax or executable JavaScript. Hosts must render or escape content appropriately, avoid unsafe interpolation and enforce message privacy. Core does not render UI or perform logging/storage/network I/O.

Offline clients are controlled by their operators. Ordinary engine validation and state-integrity rules are required, but do not guarantee prevention of deliberate local modification, tamper-proof saves, secrecy of distributed content or isolation from malicious same-environment JavaScript. Optional package protection follows [ADR 0058](../decisions/0058-compilation-and-distribution.md); it is not DRM. Decode/decrypt outside core and validate canonical data afterward.

## Resource ownership and consumption

Use safe algorithms, iterative traversal where depth is unbounded, explicit cycle detection, safe arithmetic and appropriate indexes. Avoid unnecessary long-lived references, shared mutable resources and global caches. Manage collection growth and resource consumption where applicable; avoid speculative caching or unbounded retained histories. Each runtime owns its resources; host resources belong to adapters. Release owned resources and subscriptions explicitly when introduced; do not rely on garbage-collection timing. A disposal interface is introduced only when needed.

Distinguish semantic limits (engine contracts such as capacity) from operational limits (host/loader file sizes, upload and session policies). Do not introduce arbitrary fixed room, actor or containment-depth limits in Foundation. This does not guarantee unlimited processing or memory. Hosts may impose appropriate operational limits; design explicit validation budgets or quotas when justified, especially before exposing remote untrusted workloads. Synchronous validation is not a general denial-of-service sandbox.

## Verification and scope

Review trust boundaries and test invalid input, unsafe keys, cycles, arithmetic overflow, authorization, isolation, atomic failure, safe output and applicable resource behavior under the [testing strategy](../../tests/README.md). Test host protections separately. No new authentication, encryption, sandbox, quota, logging or disposal implementation is authorized by this design.
