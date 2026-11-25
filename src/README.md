# Runtime source

Platform-independent ECMAScript runtime modules. FND-05 implements definition validation, isolated initialization and initial read-only inspection. Final contract audit corrections and review remain outstanding.

The runtime owns validated definitions, authoritative state, domain invariants and semantic results. It must not depend on DOM, browser storage, Node-specific APIs, networking, filesystem, graphics or host implementations.

## Supported entry point

The named Asterweave export in [Asterweave.js](Asterweave.js) is the sole supported public facade. See the [public API contract](../docs/contracts/PUBLIC_API.md) for signatures, results and snapshot behavior. All other source exports are internal.

## Module responsibilities

| Directory | Responsibility |
| --- | --- |
| core | Initialization sequencing; no domain rules |
| definition | Safe authored validation, identity and reference checks, candidate mapping and diagnostic translation |
| diagnostics | Per-operation diagnostic collection and JSON Pointer paths |
| results | Common status semantics, specialized immutable results and serialization |
| shared | Data inspection, detached copying, identifiers and checked arithmetic |
| state | Immutable baseline, initial runtime ownership, explicit player configuration and effective snapshots |
| world | Participant identities, private registry, vocabulary and reusable effective-state invariants |

World objects read authoritative properties through explicit collaborators; they do not maintain duplicate mutable gameplay records. RuntimeState owns the isolated baseline, empty initial differences, original configuration, World and optional separate Player. GameInitializer sequences validation and runtime construction; the facade translates unexpected failures into safe operation-specific results.

Gameplay, action dispatch, state mutations, reset, derived containment queries and persistence are not implemented by FND-05.

Read the [documentation index](../docs/README.md), [architecture](../docs/ARCHITECTURE.md), [coding standards](../docs/CODE_STYLE.md), [contracts](../docs/contracts/README.md) and [testing strategy](../tests/README.md).
