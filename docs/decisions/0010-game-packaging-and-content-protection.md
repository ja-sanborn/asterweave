# 0010 — Game packaging and content protection

Status: Accepted

## Context

The canonical definition design establishes the canonical JSON authoring contract through [ADR 0003](0003-canonical-json-game-format.md) and [ADR 0009](0009-canonical-game-definition-contract.md). Authors may wish to conceal puzzle solutions, hidden locations and narrative content from casual inspection in distributed games. The initial distribution target is standalone offline HTML; the runtime must remain platform-independent under [ADR 0001](0001-platform-independent-runtime.md).

## Decision

Keep canonical JSON readable, unencrypted and independently authorable. Separate the versioned distribution package from the canonical definition, content and save versions. Support author-selectable optional content protection, with unprotected distribution as the default. Packaging must not change the canonical source and must be usable independently of Creator.

Packaging/export tooling and host/package loading, including any cryptography and key handling, belong outside src/. A loader unpacks, decodes or decrypts as appropriate, then validates the resulting canonical definition before initializing the runtime. Protected and unprotected delivery must produce equivalent canonical game data and preserve offline gameplay. Do not embed credentials or unrelated private authoring material.

The objective is to deter casual inspection and spoilers, not to enforce DRM or guarantee confidentiality against a player controlling the client. An offline client that possesses both protected content and everything required to unlock it can be inspected; embedded keys and decrypted data are recoverable. Compression and encoding are not encryption. Obfuscation is reversible. Document actual guarantees and limitations; do not require online activation, a license server or mandatory encryption.

Defer concrete package schema, protection mechanism, cryptographic algorithm and key-management decisions to the Phase 2 design review. If encryption is selected, use established cryptographic primitives rather than custom cryptography. Discuss new dependencies before adopting them; preserve ADR 0005 and zero core runtime dependencies.

## Alternatives

Distribute only plain JSON; embed encryption in the canonical schema or runtime core; mandate DRM or server-side content access. These either omit optional spoiler protection, couple the core to delivery mechanisms, or undermine offline operation. Server-side secrecy is a separate future hosting concern.

## Consequences

Foundation establishes the boundary only; no packaging or encryption code, new canonical fields, runtime implementation or dependencies are introduced. Phase 2 includes package design, implementation, offline host verification, failure handling and author-facing documentation. Creator export integration is later Phase 4 work. The separate state and save contracts define state and save contracts. This record complements ADRs 0001, 0003, 0005 and 0009 without superseding them.

See the [canonical definition contract](../contracts/GAME_DEFINITIONS.md) and [architecture](../ARCHITECTURE.md).
