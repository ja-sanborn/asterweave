# Hosts

Hosts provide platform-specific input, presentation, storage and integration for the platform-independent engine. Foundation first delivers an independently usable engine bundle and game packages. A subsequent playable target is an offline, text-only browser host using the optional Text Parsing Extension; hosts may instead use direct actions or other selected extensions. Standalone HTML delivery is subsequent host work. CLI, server, Discord and other hosts remain future work.

Hosts consume documented public APIs and semantic results, not private state or implementation modules. They own error presentation, optional logging and telemetry, storage, safe rendering, platform permissions, and authentication and delivery authorization where applicable. The core retains gameplay authorization, validation and state integrity. Package decoding or optional protection happens outside core; validate canonical data afterward.

Read the [documentation index](../docs/README.md), [public API](../docs/contracts/PUBLIC_API.md), [security model](../docs/contracts/SECURITY_MODEL.md), [error handling](../docs/contracts/ERROR_HANDLING.md), [action and result contracts](../docs/contracts/ACTIONS_AND_RESULTS.md) and [save data](../docs/contracts/SAVE_DATA.md). Test host adapters separately under the [testing strategy](../tests/README.md).

No host implementation is present yet.
