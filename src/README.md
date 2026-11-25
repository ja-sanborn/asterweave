# Runtime source

Reserved for platform-independent ECMAScript runtime modules. FND-05 shared data-safety, diagnostic and operation result modules are under implementation; the public runtime facade and initialized game are not available yet.

The runtime owns validated definitions, authoritative state, domain invariants and semantic results. It must not depend on DOM, browser storage, Node-specific APIs, networking, filesystem, graphics or host implementations.

Use cohesive domain-oriented modules, one principal type per file, explicit dependencies, independent validators and a single primary public facade. Concrete source layout and interfaces are decided in authorized implementation stories; this directory description does not prescribe classes or exports.

Read the [documentation index](../docs/README.md), [architecture](../docs/ARCHITECTURE.md), [public API](../docs/contracts/PUBLIC_API.md), [coding standards](../docs/CODE_STYLE.md), [engine contracts](../docs/contracts/README.md) and [testing strategy](../tests/README.md).

The internal shared and diagnostics modules establish descriptor-based JSON data inspection, detached immutable copies, canonical identifier grammar, checked arithmetic, JSON Pointer paths and per-operation diagnostic aggregation. These internal exports are not public APIs. Validation orchestration and game initialization are subsequent FND-05 increments.

The internal results modules implement common status predicates, controlled specialized result construction, detached diagnostic data and operation-specific serialization under ADR 0020. Execution-boundary integration and public facade construction remain subsequent increments.
