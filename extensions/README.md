# Extensions

Optional gameplay mechanics and presentation capabilities. Keep genre-specific mechanics and optional graphics/audio outside the platform-independent core; omit unused optional modules from distributions.

Executable JavaScript extensions are trusted code selected by the implementing developer, not sandboxed data. Use explicitly supported extension contracts when introduced; respect namespace ownership, gameplay authorization, state transactions and semantic output boundaries. Do not bypass validation or load arbitrary executable code from game data. The core cannot undo arbitrary external side effects.

Read the [documentation index](../docs/README.md), [public API](../docs/contracts/PUBLIC_API.md), [action definitions](../docs/contracts/ACTION_DEFINITIONS.md), [properties](../docs/contracts/PROPERTIES.md), [security model](../docs/contracts/SECURITY_MODEL.md) and [coding standards](../docs/CODE_STYLE.md).

Extension capabilities require explicitly defined contracts before implementation; no extensions are implemented yet.
