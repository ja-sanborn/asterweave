# Canonical JSON game definitions

Status: Accepted contract; FND-05 validation and initialization implemented on the feature branch, final audit and review outstanding. Origin: [FND-03, issue #5](https://github.com/ja-sanborn/asterweave/issues/5), revised by [FND-12, issue #23](https://github.com/ja-sanborn/asterweave/issues/23) and [FND-04, issue #6](https://github.com/ja-sanborn/asterweave/issues/6).

This contract elaborates [ADR 0003](../decisions/0003-canonical-json-game-format.md) and [ADR 0009](../decisions/0009-canonical-game-definition-contract.md). [ADRs 0011](../decisions/0011-unified-world-containment.md) and [0012](../decisions/0012-physical-properties-and-capacity.md) supersede the version and placement portions of ADR 0009. [ADRs 0013](../decisions/0013-namespaced-properties-and-runtime-state.md)–[0015](../decisions/0015-state-isolation-and-persistence.md) elaborate state and supersede the accepted format version. [ADR 0021](../decisions/0021-standard-navigation-vocabulary.md) expands navigation; [ADR 0022](../decisions/0022-flexible-physical-measurement-ranges.md) establishes the current format 3.2.0 and expanded measurement ranges. Authors and future Creator tools produce the same JSON document. The runtime consumes data independently of Creator, hosts and distribution packaging.

## Authoring and distribution boundary

Canonical JSON is the readable, unencrypted authoring and interchange format, whether written manually or compiled by Creator. A distributed game package may wrap that data in an optional content-protection representation; package versions, encoding, encryption and keys are not canonical definition fields. Unprotected distribution remains the default. Packaging must not modify the author's source definition or require Creator.

Packaging/export and the host/package loader are outside the runtime core. The loader unpacks and, when applicable, decodes or decrypts the package, then passes canonical data through definition validation before runtime initialization. Both distribution modes must support offline play and yield equivalent definitions. Client-side protection discourages casual inspection and spoilers; it cannot guarantee secrecy when the client has everything needed to unlock the content. No mandatory DRM, online activation or embedded credentials.

See [ADR 0010](../decisions/0010-game-packaging-and-content-protection.md) and [issue #22](https://github.com/ja-sanborn/asterweave/issues/22). Package format, protection algorithms, key management and implementation are deferred to Phase 2; packaging does not change the canonical schema or fixture.

## Document and versioning

A definition is one UTF-8 JSON object. JSON member order is not semantic; array order is preserved. Use standard JSON (double-quoted keys and strings, no comments or trailing commas). Duplicate member names are prohibited at every level. All objects have closed field sets for the declared format; reject unknown fields and missing required fields. Optional fields are omitted, not null. No implicit coercion, trimming or defaulting of required fields.

| Field | Required | Type and constraints |
| --- | --- | --- |
| formatVersion | Yes | String, exactly `3.2.0` for Foundation |
| game | Yes | Game identity object |
| world | Yes | Initial world object |

Format and content versions use three nonnegative decimal integer components separated by dots, with no leading zero except zero itself, no prefix, suffix or whitespace (grammar: `(0\|[1-9][0-9]*)\.(0\|[1-9][0-9]*)\.(0\|[1-9][0-9]*)`, matched against the entire string). Format major revisions represent breaking interpretation changes; minor revisions represent compatible additions for newer readers; patch revisions represent compatible corrections. This does not promise forward compatibility: Foundation recognizes exactly 3.2.0. Version 2.0.0 replaced the pre-runtime 1.0.0 initialLocationId and initialPlacement fields with unified containment. Version 3.0.0 adds required game.namespace and optional initial properties and relationships. Version 3.1.0 expands the standard navigation vocabulary without changing the exit record shape or existing direction semantics (see [ADR 0021](../decisions/0021-standard-navigation-vocabulary.md)). Version 3.2.0 expands physical measurement ranges to safe integers without changing existing capacity semantics (see [ADR 0022](../decisions/0022-flexible-physical-measurement-ranges.md)). No 1.0.0, 2.0.0, 3.0.0 or 3.1.0 reader or migration is required for Foundation. Future readers must explicitly identify supported versions and reject unsupported versions clearly; migration is not required in Foundation. Content versions are author-managed release identifiers; authors should increment them when changing released definitions. Neither version is the engine package version. Save compatibility and migration policy belong to [FND-04](https://github.com/ja-sanborn/asterweave/issues/6).

## Game identity

| Field | Required | Type and constraints |
| --- | --- | --- |
| id | Yes | Stable reverse-domain-style identifier, at least two dot-separated segments |
| namespace | Yes | Stable machine-readable namespace, not asterweave; see [properties](PROPERTIES.md) |
| version | Yes | Content version string using the version grammar above |
| title | Yes | Nonblank Unicode string |

Each game ID segment and every world ID starts with a lowercase ASCII letter followed by zero or more ASCII letters or digits (segment grammar: `[a-z][A-Za-z0-9]*`, matched against the entire segment). Use lower camel case for world IDs. IDs are case-sensitive and matched exactly; do not normalize or trim them. Authors manage global game identity, e.g. `org.example.lanternHouse`; no domain ownership check or network lookup is required. Retain game identity across releases and retain world IDs for identities that persist. Do not recycle an ID for an unrelated identity in a compatible content release.

Locations, actors and entities share one game-local ID namespace: each ID is unique across all three arrays and distinct from the game ID. The ID world is reserved for the implicit engine-created root; it is not authored. The dotted game ID is a separate structural scope. Display names need not be unique and are not references. Action identifiers and future authored vocabulary/narrative identifiers are separate contracts; do not infer their grammar from world IDs.

## World

| Field | Required | Type and constraints |
| --- | --- | --- |
| locations | Yes | Array of location objects, at least one |
| actors | Yes | Array of actor objects, at least one |
| entities | Yes | Array of entity objects, may be empty |
| initialProperties | No | Qualified property map; see [properties](PROPERTIES.md) |
| initialRelationships | No | Dense array of initial directed relationship records |

Arrays are dense; no null entries, holes or extra properties. Definitions identify individual initial instances, not reusable templates. Multiple actor definitions are allowed; Foundation does not imply multiplayer, actor authentication, NPC behavior or a default player. The caller supplies actor identity explicitly.

All required names and titles must be strings containing at least one non-whitespace character; preserve authored text as provided. Optional descriptions are Unicode strings, including empty strings; they are plain authored text, not executable code or presentation directives.

### Common participant fields

All three categories use the following closed common field set, plus exits for locations only.

| Field | Required | Type |
| --- | --- | --- |
| id | Yes | Unique world ID, not world |
| name | Yes | Nonblank string |
| description | No | String |
| initialContainment | For active only | Closed object with required parentId and relationship |
| initialLifecycle | No | active (default), inactive or destroyed |
| initialAssociations | No; active only | Dense array of closed objects with required targetId and relationship |
| physical | No | Closed object as defined in [physical properties](PHYSICAL_PROPERTIES.md) |
| initialProperties | No | Qualified property map; see [properties](PROPERTIES.md) |

See [world containment](WORLD_CONTAINMENT.md) for exact relationship vocabulary, hierarchy, reference, lifecycle and association invariants; see [physical properties](PHYSICAL_PROPERTIES.md) for defaults, field types and capacity semantics. Active participants have exactly one initialContainment; inactive and destroyed participants omit it and initialAssociations. World is automatically created, not an authored record. At least one active location and one active actor are required at initialization. Multiple actors are allowed without assuming a default player. Actor, location and entity IDs use the same reference space. No independent inventory, contents or current location field is permitted.

### Initial relationship properties

Each initialRelationships entry is a closed object with required from, to and initialProperties. Endpoints follow [runtime state](RUNTIME_STATE.md), reference authored participants or World (not runtime players), and have distinct ordered-pair identity across entries. initialProperties is a nonempty qualified map. No implicit reciprocal relationship or physical containment. Omitted collection means empty. Foundation supports core and game namespaces only; future registered extension namespaces require their own contracts. Initial property maps may contain any JSON value including null; the map itself cannot be null. Reserved engine keys are not allowed in these maps.

### Locations and exits

Locations additionally require exits, a dense array of closed objects with required direction (one of the twelve standard identifiers below) and destinationId (existing authored location ID, never world). Directions are unique per source. Exits are directed, self-loops and disconnected navigation graphs are permitted, and no reverse exit is implied. An exit may reference an inactive authored location, but movement to it is unavailable until active. Containment does not create exits. Foundation movement requires an immediate active location parent via in, updates containment to the destination and preserves descendants; vehicle boarding and other modes are deferred.

The standard navigation identifiers are north, south, east, west, northeast, northwest, southeast, southwest, up, down, in and out. Match exactly and case-sensitively. Parser abbreviations and aliases are not canonical identifiers. Definition validation and future movement share a domain-owned immutable standard vocabulary. Directions are semantic exit identifiers, not coordinates or containment relationships. No automatic inverse exit or geometric interpretation is implied. Custom identifiers require a future explicit registration and ownership contract; reject them in 3.2.0. Conditional availability, hidden exits, door-controlled traversal and state-dependent destinations remain future navigation capabilities; the current exit record retains a fixed destination.

## Definition and runtime boundary

Definitions remain immutable; initialization must not mutate caller data and later caller mutations must not affect instances. Independent instances must not share mutable state. Current containment, lifecycle, associations and mutable physical properties are engine-owned. Derived queries do not duplicate authoritative placement. [FND-04 state](RUNTIME_STATE.md), [properties](PROPERTIES.md) and [save data](SAVE_DATA.md) define override semantics, player control and snapshots; FND-05 validates and initializes. No turn counter, save state or session credentials belong in the definition.

## Validation and diagnostics

### Candidate mapping and invariant checks

The FND-05 GameDefinitionValidator orchestrates safe data inspection, structural/version validation, identity collection and reference resolution. The internal GameDefinitionMapper maps structurally valid data into isolated normalized candidate state, applying only defaults documented by this contract and [properties](PROPERTIES.md). Pure mapping functions may perform individual transformations. Reusable domain validators evaluate effective containment, lifecycle, associations, physical capacity and qualified property invariants against this candidate, not the authored JSON layout. The mapper must not silently repair data, mutate caller input, publish a game or decide domain validity.

Suppress checks whose prerequisites are invalid and continue independent safe checks where possible; never resolve ambiguous identities or invent missing required values during mapping. Orchestration retains sufficient source correspondence to translate domain findings into authored JSON Pointer paths. Both standalone validation and initialization use the same applicable mapping and invariant checks. Initialization additionally validates its configuration and finalizes the immutable baseline only after all required checks succeed. Invalid candidates are discarded; standalone validation publishes no game. See [runtime state](RUNTIME_STATE.md) and [ADR 0016](../decisions/0016-modular-architecture-and-design-patterns.md).

### Data and diagnostic requirements

Follow the common [error-handling contract](ERROR_HANDLING.md). Preserve the definition-specific diagnostic structure and code vocabulary below; aggregate independent findings safely and suppress dependent cascades. Unexpected internal failures are not authored-data diagnostics merely because they arise during validation.

FND-05 implements native ECMAScript validation with no external schema library or platform APIs. Validate the complete definition before initializing state. Reject malformed or unsupported input without exposing partially initialized state. Validate object/array shapes and allowed fields, version and scalar grammar, global identity uniqueness, references, containment cycles and ancestry, lifecycle, associations, physical field ranges and all applicable capacity invariants, game namespace, qualified initial property maps and directed relationship references. Identity collection precedes reference resolution so forward references are allowed.

Only JSON-compatible data is accepted: null, booleans, strings, finite numbers, dense arrays and plain data objects, subject to the narrower field rules above. For parsed JavaScript input reject functions, undefined, symbols, BigInt, nonfinite numbers, cycles, accessors, non-data objects and extra array properties; use own data properties rather than inherited values. Treat keys and IDs as data, not prototype mutation paths; use safe lookup structures such as Map or null-prototype records. No eval, code loading, host objects, network access or filesystem references. JSON text parsing is outside the object-validation contract: native JSON.parse discards repeated member names, so a validator receiving parsed data cannot detect those original repetitions. Authors must not write duplicate member names; this limitation does not relax duplicate world IDs or directions, which are explicit array data.

Return structured definition diagnostics, separate from gameplay action results. Each diagnostic has the following required fields:

| Field | Type and meaning |
| --- | --- |
| source | Required string, exactly `definition` for definition findings |
| code | Stable machine-readable string |
| severity | String, exactly error for Foundation |
| path | JSON Pointer relative to the identified source; empty string denotes its root |
| message | Nonblank human-readable string; not a stable machine contract |

Use zero-based array indices and JSON Pointer escaping (tilde becomes ~0, slash becomes ~1). For a missing required field use its expected path; for a duplicate ID or direction use the later occurrence. Avoid stack traces and unsafe object stringification. Multiple independent errors may be returned; suppress cascading reference errors when their prerequisites are invalid. Definition diagnostics have the same source and paths in standalone validation and initialization. Order findings by pipeline stage, documented schema field order, array index, ECMAScript code-unit order for unordered keys, and defined validator check order. Suppress identical duplicate findings. Initialization configuration findings use source options and follow definition findings in the same collection; see [error handling](ERROR_HANDLING.md).

| Initial code | Meaning |
| --- | --- |
| INVALID_DATA | Input is not plain JSON-compatible data |
| INVALID_TYPE | Field or collection has wrong type |
| REQUIRED_FIELD | Required field is absent |
| UNKNOWN_FIELD | Field not supported by this format |
| UNSUPPORTED_FORMAT_VERSION | Well-formed format version not supported |
| INVALID_VALUE | Invalid scalar, grammar, enum or collection cardinality |
| DUPLICATE_ID | World ID already defined |
| DUPLICATE_DIRECTION | Direction already defined at this location |
| UNKNOWN_REFERENCE | Referenced ID does not exist |
| INVALID_REFERENCE_KIND | Referenced ID exists but has wrong kind |
| INVALID_CONTAINMENT | Invalid parent, relationship, capability or root ancestry |
| CONTAINMENT_CYCLE | Direct or indirect cycle |
| INVALID_LIFECYCLE | Lifecycle/placement/association conflict |
| INVALID_ASSOCIATION | Invalid or duplicate association |
| CAPACITY_EXCEEDED | Individual or cumulative limit violated |
| UNKNOWN_MEASUREMENT | Required physical score unspecified |

Example (if the first Hallway exit references a missing location):

```json
{
  "source": "definition",
  "code": "UNKNOWN_REFERENCE",
  "severity": "error",
  "path": "/world/locations/1/exits/0/destinationId",
  "message": "Referenced location does not exist."
}
```

## Smallest representative game

This is a complete Foundation definition suitable for validation and initialization. Gameplay execution remains future work:

```json
{
  "formatVersion": "3.2.0",
  "game": {
    "id": "org.example.smallWorld",
    "namespace": "smallWorld",
    "version": "0.1.0",
    "title": "Small World"
  },
  "world": {
    "locations": [
      {
        "id": "room",
        "name": "Room",
        "initialContainment": {"parentId":"world","relationship":"in"},
        "exits": []
      }
    ],
    "actors": [
      {
        "id": "player",
        "name": "Explorer",
        "initialContainment": {"parentId":"room","relationship":"in"}
      }
    ],
    "entities": []
  }
}
```

The reusable [Lantern House fixture](../../tests/fixtures/games/minimal-foundation.json) has three locations, one actor and two entities. Entrance and Hallway have reciprocal east/west exits; Hallway has a one-way east exit to Library. A lantern starts in Entrance, and a notebook is carried by the actor. The [containment fixture](../../tests/fixtures/games/containment-foundation.json) adds nested locations, actors in vehicles, physical limits, spatial associations and inactive/destroyed entities. Both fixtures support the planned FND-05 validation, FND-07 containment/capacity and FND-09 integration checks.

## Action compatibility and future sections

The fixture supports the existing [action/result contract](ACTIONS_AND_RESULTS.md):

```json
{"actorId":"player","type":"move","args":{"direction":"east"}}
```

The actor ID resolves to an active actor, and the direction selects an authored exit from that actor's immediate active location parent. The destination is not caller-selected. Foundation move costs 1/0; unavailable exits are rejected with EXIT_UNAVAILABLE and zero committed turns. Dispatch and registry, not the definition, own execution and turn costs. See [action definitions](ACTION_DEFINITIONS.md), [standard catalog](STANDARD_ACTIONS.md), and [ADR 0006](../decisions/0006-atomic-action-execution-and-turn-progression.md).

Future conceptual root sections (names tentative, not accepted fields in 3.2.0):

| Section | Intended responsibility |
| --- | --- |
| vocabulary | Parser aliases, adjectives and contextual vocabulary |
| narrative | Choices, dialogue and sequences |
| rules | Safe declarative conditions and effects |
| events | Turn-based event definitions |
| actions | Registered action overrides and declarative action definitions |
| extensions | Optional capability requirements and configuration |
| time | Optional fictional clock/calendar configuration |

Future schema revisions define supported fields and compatibility explicitly. Do not add empty placeholders or arbitrary extension bags now. [Issue #16](https://github.com/ja-sanborn/asterweave/issues/16) defines standard overrides; [#17](https://github.com/ja-sanborn/asterweave/issues/17) defines declarative actions. Preserve existing action namespaces, trusted handler separation and independent success/failure costs under [ADR 0007](../decisions/0007-extensible-and-configurable-action-definitions.md). JSON must never select arbitrary executable code or replace trusted handlers. [Issue #18](https://github.com/ja-sanborn/asterweave/issues/18) owns optional time configuration under [ADR 0008](../decisions/0008-game-time-and-calendar-separation.md); committed turns remain authoritative.

No parser, narrative, rules, events, calendar, Creator, host or runtime validation is implemented by this specification. The future author guide ([FND-11](https://github.com/ja-sanborn/asterweave/issues/20)) will document verified usage after integrated Foundation testing.

The [state fixture](../../tests/fixtures/games/state-foundation.json) illustrates initial properties and relationships; its synthetic [save](../../tests/fixtures/saves/state-foundation.json) is a contract example, not executable save functionality.
