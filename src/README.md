# Runtime source

Reserved for platform-independent ECMAScript runtime modules. No runtime implementation exists yet.

The runtime owns validated definitions, authoritative state, domain invariants and semantic results. It must not depend on DOM, browser storage, Node-specific APIs, networking, filesystem, graphics or host implementations.

Use cohesive domain-oriented modules, one principal type per file, explicit dependencies, independent validators and a single primary public facade. Concrete source layout and interfaces are decided in authorized implementation stories; this directory description does not prescribe classes or exports.

Read the [documentation index](../docs/README.md), [architecture](../docs/ARCHITECTURE.md), [public API](../docs/contracts/PUBLIC_API.md), [coding standards](../docs/CODE_STYLE.md), [engine contracts](../docs/contracts/README.md) and [testing strategy](../tests/README.md).
