# Extensions

Optional gameplay, interaction and presentation capabilities. Planned independent extensions are Date Time (fictional calendars derived from committed turns), Text Parsing (deterministic canonical action translation) and Visual Novel (dialogue, choices, narrative progression and presentation). None is required by the core or by another extension merely because it exists. Keep genre-specific mechanics and optional graphics/audio outside the platform-independent core; omit unused optional modules from distributions.

Executable JavaScript extensions are trusted code selected by the implementing developer, not sandboxed data. Use explicitly supported extension contracts when introduced; respect namespace ownership, gameplay authorization, state transactions and semantic output boundaries. Do not bypass validation or load arbitrary executable code from game data. The core cannot undo arbitrary external side effects.

Read the [documentation index](../docs/README.md), [public API](../docs/contracts/PUBLIC_API.md), [action definitions](../docs/contracts/ACTION_DEFINITIONS.md), [properties](../docs/contracts/PROPERTIES.md), [security model](../docs/contracts/SECURITY_MODEL.md) and [coding standards](../docs/CODE_STYLE.md).

Foundation includes public extension architecture: controlled setup, identity/version compatibility, restricted capabilities, namespaced transactional state, and persistence/distribution integration. Concrete interfaces require design approval. The current internal registry is not a supported external registration API. Input and presentation clients need not receive mutation authority. No extensions are implemented yet.
