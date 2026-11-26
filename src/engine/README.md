# Mandatory engine source

Platform-independent ECMAScript runtime modules. The runtime provides definition validation, isolated initialization and initial read-only inspection and internal action registration and validation.

The runtime owns validated definitions, authoritative state, domain invariants and semantic results. It must not depend on DOM, browser storage, Node-specific APIs, networking, filesystem, graphics or host implementations.

## Supported entry point

The named Asterweave export in [Asterweave.js](Asterweave.js) is the sole supported public facade. See the [public API contract](../../docs/contracts/PUBLIC_API.md) for signatures, results and snapshot behavior. All other source exports are internal.

## Module responsibilities

| Directory | Responsibility |
| --- | --- |
| core | Initialization sequencing; no domain rules |
| actions | Action identity, registration authority, immutable definitions, argument validation and protected handler resolution |
| definition | Safe authored validation, identity and reference checks, candidate mapping and diagnostic translation |
| diagnostics | Per-operation diagnostic collection and JSON Pointer paths |
| results | Common status semantics, specialized immutable results and serialization |
| shared | Data inspection, detached copying, inspected-record predicates, identifiers and checked arithmetic |
| state | Immutable baseline, initial runtime ownership, explicit player configuration and effective snapshots |
| world | Participant identities, private registry, authoritative category and measurement vocabulary, detached property reads and reusable effective-state invariants |

World objects read authoritative properties through explicit collaborators; they do not maintain duplicate mutable gameplay records. RuntimeState owns the isolated baseline, empty initial differences, original configuration, World and optional separate Player. GameInitializer sequences validation and runtime construction, including creation and finalization of a separate action registry privately owned by the facade; the facade translates unexpected failures into safe operation-specific results.

Synchronous dispatch, transaction-scoped state mutations and administrative reset infrastructure are implemented. Production initialization has an empty action registry; internal derived containment/load queries, authorized relocation, physical association/property mutation and generic lifecycle operations are implemented. Production gameplay handlers, persistence, rules, events, randomness and first-party gameplay integration are planned Foundation work. Reusable gameplay modules and interaction/presentation remain separate from mandatory infrastructure. No public executable extension registration is planned. The [runtime implementation design](../../docs/RUNTIME_IMPLEMENTATION.md) describes internal collaborators and responsibilities.

Read the [documentation index](../../docs/README.md), [architecture](../../docs/ARCHITECTURE.md), [coding standards](../../docs/CODE_STYLE.md), [contracts](../../docs/contracts/README.md) and [testing strategy](../../tests/README.md).
