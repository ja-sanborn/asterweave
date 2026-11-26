# Creator

Creator is planned as an optional offline JavaScript web application owning structured visual editing, workspace management, authoring UX, UI/UX design, playtesting orchestration and export UX. Direct canonical JSON, future declarative language and Creator are independent authoring workflows targeting common contracts. Creator-specific workspace metadata remains separate from canonical definitions and finished distributions. Creator is not required in player distributions.

Creator consumes supported Engine and Tools interfaces rather than duplicating validation rules or independently simulating gameplay. Engine remains authoritative for gameplay validation and execution; Tools own reusable translation, assembly, coordinated validation, compilation and distribution operations outside gameplay execution. Present useful diagnostic codes and paths. Canonical JSON, not Creator's workspace representation, is the runtime contract. Do not introduce executable code through untrusted definitions.

Read the [documentation index](../README.md), [canonical definitions](../engine/contracts/GAME_DEFINITIONS.md), [public API](../engine/contracts/PUBLIC_API.md), [error handling](../engine/contracts/ERROR_HANDLING.md), [security model](../engine/contracts/SECURITY_MODEL.md) and [packaging decision](../decisions/0058-compilation-and-distribution.md).

Creator is a post-Foundation application. Framework and application dependencies require explicit design review and remain isolated from the engine and player distributions. No mandatory network, account or AI service is required. The established distribution workflow will be reused; component-specific editors use supported canonical contracts. No compiler or authoring tool exists yet.
