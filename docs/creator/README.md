# Creator

Creator is planned as an optional offline JavaScript web application:  structured visual and language authoring, UI/UX design, translation to canonical JSON, validation, diagnostics, editing, playtesting and export. It is not required in player distributions. Direct JSON authoring remains supported.

Creator consumes documented validation and public interfaces where available; canonical JSON, not Creator's authoring representation, is the runtime contract. Reuse engine validation where applicable, present useful diagnostic codes and paths, and reuse independently usable Tools for translation, assembly, compilation and packaging outside gameplay execution. Do not introduce executable code through untrusted definitions.

Read the [documentation index](../README.md), [canonical definitions](../engine/contracts/GAME_DEFINITIONS.md), [public API](../engine/contracts/PUBLIC_API.md), [error handling](../engine/contracts/ERROR_HANDLING.md), [security model](../engine/contracts/SECURITY_MODEL.md) and [packaging decision](../decisions/0058-compilation-and-distribution.md).

Creator is a post-Foundation application. Framework and application dependencies require explicit design review and remain isolated from the engine and player distributions. No mandatory network, account or AI service is required. The established distribution workflow will be reused; component-specific editors use supported canonical contracts. No compiler or authoring tool exists yet.
