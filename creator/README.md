# Creator

Creator is optional development-time authoring tooling: readable game authoring, compilation to canonical JSON, validation, diagnostics, editing, playtesting and export. It is not required in player distributions. Direct JSON authoring remains supported.

Creator consumes documented validation and public interfaces where available; canonical JSON, not Creator's authoring representation, is the runtime contract. Reuse engine validation where applicable, present useful diagnostic codes and paths, and keep packaging and optional content protection outside core. Do not introduce executable code through untrusted definitions.

Read the [documentation index](../docs/README.md), [canonical definitions](../docs/contracts/GAME_DEFINITIONS.md), [public API](../docs/contracts/PUBLIC_API.md), [error handling](../docs/contracts/ERROR_HANDLING.md), [security model](../docs/contracts/SECURITY_MODEL.md) and [packaging decision](../docs/decisions/0010-game-packaging-and-content-protection.md).

Creator implementation is planned for Phase 4; no compiler or authoring tool exists yet.
