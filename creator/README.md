# Creator

Creator is planned as an optional offline JavaScript web application:  readable game authoring, compilation to canonical JSON, validation, diagnostics, editing, playtesting and export. It is not required in player distributions. Direct JSON authoring remains supported.

Creator consumes documented validation and public interfaces where available; canonical JSON, not Creator's authoring representation, is the runtime contract. Reuse engine validation where applicable, present useful diagnostic codes and paths, and keep packaging and optional content protection outside core. Do not introduce executable code through untrusted definitions.

Read the [documentation index](../docs/README.md), [canonical definitions](../docs/contracts/GAME_DEFINITIONS.md), [public API](../docs/contracts/PUBLIC_API.md), [error handling](../docs/contracts/ERROR_HANDLING.md), [security model](../docs/contracts/SECURITY_MODEL.md) and [packaging decision](../docs/decisions/0010-game-packaging-and-content-protection.md).

Creator is a post-Foundation application. Framework and application dependencies require explicit design review and remain isolated from the engine and player distributions. No mandatory network, account or AI service is required. The established distribution workflow will be reused; optional extension-specific editors use supported contracts. No compiler or authoring tool exists yet.
