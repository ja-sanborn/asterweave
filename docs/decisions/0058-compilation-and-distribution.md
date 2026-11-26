# ADR 0058 — Compilation, distribution and content protection

Status: Accepted

## Context

Asterweave requires a coherent first-party modular architecture, with independently usable gameplay execution and declarative game content.

## Decision

Tools own translation where applicable, coordinated validation, composition, compilation and packaging; Creator consumes those capabilities. Foundation includes standalone compact JavaScript engine bundle, practical minification/obfuscation, appropriate compression and versioned protected/unprotected game packages; standalone HTML and other delivery targets require later design. Include mandatory engine, selected gameplay/interaction modules and explicit dependencies, applicable UI/UX, definitions, assets and required notices. Physically exclude unneeded executable capabilities and Creator/development tools. Verify source/bundle behavior equivalence, offline execution and capability compatibility. Engine-only distribution and independent packaging without Creator supported. Runtime loaders distinct from build tools.

Distinguish required capabilities (necessary for correct operation), included capabilities (physically composed into the distribution), and used capabilities (actually exercised during play). Tools derive requirements from canonical data where reliable, accept justified explicit requirements and resolve dependencies before composition. Runtime consumers reject unsupported required configuration. Concrete requirement fields, dependency metadata and resolution algorithms require separate reviewed design; no manifest or discovery framework is implied.

Keep canonical JSON readable and independently authorable; package version independent of definition/content/save versions. Optional author-selectable content encryption; unprotected default. Packaging does not alter canonical source. Unpack/decode/decrypt outside gameplay engine and validate resulting canonical data before initialization. Protected and unprotected delivery yield equivalent canonical data. No credentials or unrelated private authoring material. Protection deters casual inspection/spoilers, not DRM or secrecy from device operator; embedded keys and decrypted data recoverable. Compression/encoding are not encryption; obfuscation reversible. No online activation/license server. Use established cryptographic primitives, not custom cryptography; concrete algorithms, keys, formats, compression and tooling require review. Preserve MPL obligations and zero core runtime dependencies; any tooling exception needs approval. See [architecture](../ARCHITECTURE.md).

## Alternatives and consequences

Prefer explicit cohesive responsibilities and reviewed contracts over speculative generalized frameworks. Preserve applicable existing behavior, security and verification; accepted design does not establish implementation or authorize new feature scope.
