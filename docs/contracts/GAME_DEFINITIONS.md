# Canonical JSON game definitions

Status: Accepted design; validation and runtime implementation pending. Origin: [FND-03, issue #5](https://github.com/ja-sanborn/asterweave/issues/5).

This contract elaborates [ADR 0003](../decisions/0003-canonical-json-game-format.md) and [ADR 0009](../decisions/0009-canonical-game-definition-contract.md). Authors and future Creator tools produce the same JSON document. The runtime consumes data independently of Creator, hosts and distribution packaging.

## Authoring and distribution boundary

Canonical JSON is the readable, unencrypted authoring and interchange format, whether written manually or compiled by Creator. A distributed game package may wrap that data in an optional content-protection representation; package versions, encoding, encryption and keys are not canonical definition fields. Unprotected distribution remains the default. Packaging must not modify the author's source definition or require Creator.

Packaging/export and the host/package loader are outside the runtime core. The loader unpacks and, when applicable, decodes or decrypts the package, then passes canonical data through definition validation before runtime initialization. Both distribution modes must support offline play and yield equivalent definitions. Client-side protection discourages casual inspection and spoilers; it cannot guarantee secrecy when the client has everything needed to unlock the content. No mandatory DRM, online activation or embedded credentials.

See [ADR 0010](../decisions/0010-game-packaging-and-content-protection.md) and [issue #22](https://github.com/ja-sanborn/asterweave/issues/22). Package format, protection algorithms, key management and implementation are deferred to Phase 2; the Foundation schema and fixture are unchanged.

## Document and versioning

A definition is one UTF-8 JSON object. JSON member order is not semantic; array order is preserved. Use standard JSON (double-quoted keys and strings, no comments or trailing commas). Duplicate member names are prohibited at every level. All objects have closed field sets for the declared format; reject unknown fields and missing required fields. Optional fields are omitted, not null. No implicit coercion, trimming or defaulting of required fields.

| Field | Required | Type and constraints |
| --- | --- | --- |
| formatVersion | Yes | String, exactly `1.0.0` for Foundation |
| game | Yes | Game identity object |
| world | Yes | Initial world object |

Format and content versions use three nonnegative decimal integer components separated by dots, with no leading zero except zero itself, no prefix, suffix or whitespace (grammar: `(0\|[1-9][0-9]*)\.(0\|[1-9][0-9]*)\.(0\|[1-9][0-9]*)`, matched against the entire string). Format major revisions represent breaking interpretation changes; minor revisions represent compatible additions for newer readers; patch revisions represent compatible corrections. This does not promise forward compatibility: Foundation recognizes exactly 1.0.0. Future readers must explicitly identify supported versions and reject unsupported versions clearly; migration is not required in Foundation. Content versions are author-managed release identifiers; authors should increment them when changing released definitions. Neither version is the engine package version. Save compatibility and migration policy belong to [FND-04](https://github.com/ja-sanborn/asterweave/issues/6).

## Game identity

| Field | Required | Type and constraints |
| --- | --- | --- |
| id | Yes | Stable reverse-domain-style identifier, at least two dot-separated segments |
| version | Yes | Content version string using the version grammar above |
| title | Yes | Nonblank Unicode string |

Each game ID segment and every world ID starts with a lowercase ASCII letter followed by zero or more ASCII letters or digits (segment grammar: `[a-z][A-Za-z0-9]*`, matched against the entire segment). Use lower camel case for world IDs. IDs are case-sensitive and matched exactly; do not normalize or trim them. Authors manage global game identity, e.g. `org.example.lanternHouse`; no domain ownership check or network lookup is required. Retain game identity across releases and retain world IDs for identities that persist. Do not recycle an ID for an unrelated identity in a compatible content release.

Locations, actors and entities share one game-local ID namespace: each ID is unique across all three arrays and distinct from the game ID. The dotted game ID is a separate structural scope. Display names need not be unique and are not references. Action identifiers and future authored vocabulary/narrative identifiers are separate contracts; do not infer their grammar from world IDs.

## World

| Field | Required | Type and constraints |
| --- | --- | --- |
| locations | Yes | Array of location objects, at least one |
| actors | Yes | Array of actor objects, at least one |
| entities | Yes | Array of entity objects, may be empty |

Arrays are dense; no null entries, holes or extra properties. Definitions identify individual initial instances, not reusable templates. Multiple actor definitions are allowed; Foundation does not imply multiplayer, actor authentication, NPC behavior or a default player. The caller supplies actor identity explicitly.

All required names and titles must be strings containing at least one non-whitespace character; preserve authored text as provided. Optional descriptions are Unicode strings, including empty strings; they are plain authored text, not executable code or presentation directives.

### Locations and exits

| Location field | Required | Type and constraints |
| --- | --- | --- |
| id | Yes | Unique world ID |
| name | Yes | Nonblank string |
| description | No | String |
| exits | Yes | Array of exit objects, may be empty |

| Exit field | Required | Type and constraints |
| --- | --- | --- |
| direction | Yes | Exactly north, south, east or west |
| destinationId | Yes | ID of an existing location |

Each direction occurs at most once in a location's exits. Directions are canonical values, not parser aliases. An exit is directed; a reverse exit exists only if separately authored. Multiple different directions may lead to the same location. Self-loops, disconnected locations and locations without exits are valid; no reachability or geometry constraint is imposed. Foundation has no doors, conditional exits, diagonal or vertical directions. The exit array provides room for later structured fields without changing its shape.

### Actors

| Field | Required | Type and constraints |
| --- | --- | --- |
| id | Yes | Unique world ID |
| name | Yes | Nonblank string |
| initialLocationId | Yes | ID of an existing location |

Each actor starts at exactly one location. Actors are not placeable entities in this format; they do not have inventory arrays or initialPlacement fields. More than one actor may start at the same location.

### Entities and placement

| Field | Required | Type and constraints |
| --- | --- | --- |
| id | Yes | Unique world ID |
| name | Yes | Nonblank string |
| description | No | String |
| initialPlacement | Yes | Placement object |

| Placement field | Required | Type and constraints |
| --- | --- | --- |
| kind | Yes | Exactly location or actor |
| id | Yes | Existing ID of the corresponding kind |

Each entity has exactly one initial placement. A location placement refers directly to a location; an actor placement represents ownership by that actor, not a duplicate location reference. Multiple entities may share a placement. Reject dangling references and wrong-kind references even if an ID exists. No unplaced entities, containers, entity-as-owner references or duplicate authoritative inventory/location contents lists are supported. Ownership is independent of display names. Future containment and dynamic creation require separate contracts.

## Definition and runtime boundary

The definition is immutable during play. Initial locations and placements seed engine-owned mutable state; they are not live state. Initialization must not mutate the caller's data, and subsequent caller mutations must not affect initialized instances. Independent instances must not share mutable state. Runtime state holds the single authoritative current placement for each entity and current location for each actor. Inventory and location contents are derived queries, not second authoritative lists. Runtime representation, snapshots, save envelopes and initial turn policy belong to [FND-04](https://github.com/ja-sanborn/asterweave/issues/6) and implementation to [FND-05](https://github.com/ja-sanborn/asterweave/issues/7). The definition contains no turn counter, save state or session credentials.

## Validation and diagnostics

FND-05 implements native ECMAScript validation with no external schema library or platform APIs. Validate the complete definition before initializing state. Reject malformed or unsupported input without exposing partially initialized state. Validate object/array shapes and allowed fields, version and scalar grammar, global identity uniqueness, and typed references and placement invariants. Identity collection precedes reference resolution so forward references are allowed.

Only JSON-compatible data is accepted: null, booleans, strings, finite numbers, dense arrays and plain data objects, subject to the narrower field rules above. For parsed JavaScript input reject functions, undefined, symbols, BigInt, nonfinite numbers, cycles, accessors, non-data objects and extra array properties; use own data properties rather than inherited values. Treat keys and IDs as data, not prototype mutation paths; use safe lookup structures such as Map or null-prototype records. No eval, code loading, host objects, network access or filesystem references. JSON text parsing is outside the object-validation contract: native JSON.parse discards repeated member names, so a validator receiving parsed data cannot detect those original repetitions. Authors must not write duplicate member names; this limitation does not relax duplicate world IDs or directions, which are explicit array data.

Return structured definition diagnostics, separate from gameplay action results. Each diagnostic has the following required fields:

| Field | Type and meaning |
| --- | --- |
| code | Stable machine-readable string |
| severity | String, exactly error for Foundation |
| path | JSON Pointer to the offending field or object; empty string denotes the document root |
| message | Nonblank human-readable string; not a stable machine contract |

Use zero-based array indices and JSON Pointer escaping (tilde becomes ~0, slash becomes ~1). For a missing required field use its expected path; for a duplicate ID or direction use the later occurrence. Avoid stack traces and unsafe object stringification. Multiple independent errors may be returned; suppress cascading reference errors when their prerequisites are invalid. Diagnostic order should be deterministic for equivalent inputs; exact aggregation and public validation API belong to FND-05.

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

Example (if the first Hallway exit references a missing location):

```json
{
  "code": "UNKNOWN_REFERENCE",
  "severity": "error",
  "path": "/world/locations/1/exits/0/destinationId",
  "message": "Referenced location does not exist."
}
```

## Smallest representative game

This is a complete valid Foundation definition, although not yet executable:

```json
{
  "formatVersion": "1.0.0",
  "game": {
    "id": "org.example.smallWorld",
    "version": "0.1.0",
    "title": "Small World"
  },
  "world": {
    "locations": [
      {
        "id": "room",
        "name": "Room",
        "exits": []
      }
    ],
    "actors": [
      {
        "id": "player",
        "name": "Explorer",
        "initialLocationId": "room"
      }
    ],
    "entities": []
  }
}
```

The reusable [Lantern House fixture](../../tests/fixtures/games/minimal-foundation.json) has three locations, one actor and two entities. Entrance and Hallway have reciprocal east/west exits; Hallway has a one-way east exit to Library. A lantern starts at Entrance, and a notebook belongs to the actor. It supports the planned FND-05 validation, FND-07 ownership and FND-09 integration checks.

## Action compatibility and future sections

The fixture supports the existing [action/result contract](ACTIONS_AND_RESULTS.md):

```json
{"actorId":"player","type":"move","args":{"direction":"east"}}
```

The actor ID resolves to an actor, and the direction selects an authored exit from that actor's current location. The destination is not caller-selected. Foundation move costs 1/0; unavailable exits are rejected with EXIT_UNAVAILABLE and zero committed turns. Dispatch and registry, not the definition, own execution and turn costs. See [action definitions](ACTION_DEFINITIONS.md), [standard catalog](STANDARD_ACTIONS.md), and [ADR 0006](../decisions/0006-atomic-action-execution-and-turn-progression.md).

Future conceptual root sections (names tentative, not accepted fields in 1.0.0):

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
