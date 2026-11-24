# Asterweave architecture

Status: initial design; contracts and schemas are not yet finalized.

## Boundaries

The runtime is environment-independent ECMAScript. It must not directly access the DOM, browser storage, Node-specific APIs, network services or the filesystem. Hosts provide these capabilities. Development tooling may use Node.js without imposing a runtime requirement.

## Runtime modules

| Module | Responsibility |
| --- | --- |
| Core | Lifecycle, action dispatch, validation, state transitions |
| Parser | Rule-based command interpretation and contextual object resolution |
| Choice | Conditional choices and selection validation |
| Narrative | Dialogue, sequences, branching, call/return and progression |
| World | Locations, exits, entity identity and ownership |
| Rules and events | Conditions, effects, triggers and turn scheduling |
| Persistence | Versioned serialization, restoration and migration |

These are logical boundaries; physical module organization will evolve as contracts are defined. The parser and choice modules are optional where a game does not need them.

## Action flow

    Host input -> Command parser or choice selection -> Action dispatcher
      -> Rules and world/state transition -> Structured output -> Host

Actions identify an actor, action type and relevant targets. The runtime validates availability and permissions, not merely syntax. Output carries semantic information and an intended audience; hosts decide how to render or deliver it.

## Game packages

A versioned JSON definition describes the initial world, entities, narrative, vocabulary, rules and optional extension requirements. Stable IDs connect definitions. Definitions are immutable during play; mutable instance state is separate. Custom JavaScript extensions may register behavior through explicit contracts. Untrusted executable extensions must not be treated as safe data.

Creator is an optional development-time module that translates readable authoring definitions into the canonical JSON format, validates references and exports game packages. It is not distributed with finished games.

## State and saves

Track player location, inventory, entity state, merchant stock, relationships, quests, flags, pending events, narrative position and parser context as appropriate. Use a single authoritative ownership model for item instances.

Prefer snapshots of mutable state or deltas against a known game definition. Preserve dynamically created entities, turn counters and random state when relevant. Save envelopes identify game and schema versions. Restoration must validate compatibility; incompatible definitions require migration or a clear error.

The runtime serializes state without knowing where it is stored. Browser hosts may use IndexedDB with portable file import/export as a fallback; local-file browser persistence is not guaranteed. Rollback history, if implemented, is separate and bounded.

## Hosts and extensions

The initial browser host will support text input, numbered choices and offline distribution, ideally as a self-contained HTML artifact. Future hosts may include command-line, server and Discord adapters.

Design action and state contracts for multiple actors now, but implement one player first. Future multiplayer requires server-authoritative state, actor/session identity, scoped outputs, concurrency control and transactional persistence. Do not assume single-player game definitions are automatically multiplayer-safe.

Visual and audio presentation are optional extensions. The engine emits semantic results, not rendered graphics.

## Testing

Test the runtime headlessly with game fixtures, action sequences, invalid commands, rule enforcement, save/restore equivalence and deterministic replay where applicable. Test host adapters separately.

Development uses Node.js 26 LTS, npm and the native test runner, with no third-party npm dependencies. These tools do not enter the runtime or standalone game distributions. See [ADR 0005](decisions/0005-development-and-testing-tooling.md).
