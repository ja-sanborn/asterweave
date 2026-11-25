# Standard action catalog

Status: Accepted reference design; catalog entries do not establish runtime availability.

This extensible reference catalog contains 82 canonical standard action types. It is not exhaustive and does not require a game to include all actions. Foundation plans 25 reusable standard handlers; other entries remain reference designs. A game need not enable or use every Foundation action. The planned status does not establish implemented behavior. The internal registry recognizes these catalog identifiers; only move has reusable definition metadata, and no production action handler is registered yet. Names and individual default costs establish the design baseline, not a guarantee of availability. Costs apply only to completed gameplay outcomes; rejected and error results always cost zero. See [definitions](ACTION_DEFINITIONS.md) and [results](ACTIONS_AND_RESULTS.md).

Argument column describes proposed semantic keys, not final schemas for future handlers. Unmarked keys are expected; ? denotes optional; alternatives must be specified when implemented. IDs reference stable game entities, actors or authored data as appropriate. none means an empty args object. direction and relation use canonical values, text is data, and action in command is a proposed nested intent whose execution/authorization rules are deferred (no direct bypass or recursive dispatch guarantee). Foundation move requires a canonical direction string from the twelve standard identifiers in [canonical definitions](GAME_DEFINITIONS.md#locations-and-exits); its actual exit validation belongs to the world handler. The shared domain-owned vocabulary is used by definition validation and movement. Parser synonyms and prepositions are not canonical action types. See [world containment](WORLD_CONTAINMENT.md) for standard containment and spatial associations and [physical properties](PHYSICAL_PROPERTIES.md) for capacity semantics. Planned Foundation handlers are marked in the catalog. Generic domain operations remain independent of particular action names; specialized mechanics may use game-defined or extension actions.

## Exploration and movement

| Type | Purpose | Arguments | turnCostSuccess | turnCostFail | Status |
| --- | --- | --- | ---: | ---: | --- |
| move | Move actor through a directional exit | direction (required) | 1 | 0 | Metadata implemented; handler planned |
| enter | Enter a location or entity | targetId | 1 | 0 | Foundation planned |
| exit | Leave a location or entity | targetId? | 1 | 0 | Foundation planned |
| climb | Climb a target | targetId, direction? | 1 | 0 | Reference only |
| jump | Leap or jump | targetId?, destinationId? | 1 | 0 | Reference only |
| swim | Move by swimming | destinationId?, direction? | 1 | 0 | Reference only |
| cross | Cross a feature | targetId | 1 | 0 | Reference only |
| follow | Follow an actor | targetId | 1 | 0 | Reference only |
| board | Board transport | targetId | 1 | 0 | Reference only |
| disembark | Leave transport | targetId? | 1 | 0 | Reference only |

## Observation and senses

| Type | Purpose | Arguments | turnCostSuccess | turnCostFail | Status |
| --- | --- | --- | ---: | ---: | --- |
| look | Observe surroundings | none | 0 | 0 | Foundation planned |
| examine | Inspect a target or relation | targetId, relation? | 0 | 0 | Foundation planned |
| search | Actively investigate | targetId | 1 | 1 | Foundation planned |
| find | Attempt to locate a target | targetId | 1 | 1 | Reference only |
| read | Read authored content | targetId | 0 | 0 | Foundation planned |
| listen | Listen to surroundings or target | targetId? | 0 | 0 | Reference only |
| smell | Observe scent | targetId? | 0 | 0 | Reference only |
| touch | Observe tactile properties | targetId | 0 | 0 | Reference only |
| taste | Observe flavor | targetId | 0 | 0 | Reference only |
| count | Count relevant items | targetId | 0 | 0 | Reference only |

## Inventory and containment

| Type | Purpose | Arguments | turnCostSuccess | turnCostFail | Status |
| --- | --- | --- | ---: | ---: | --- |
| inventory | Inspect holdings | none | 0 | 0 | Foundation planned |
| take | Acquire an item | objectId | 1 | 0 | Foundation planned |
| drop | Release an item | objectId | 1 | 0 | Foundation planned |
| put | Place an item relative to target | objectId, targetId, relation | 1 | 0 | Foundation planned |
| give | Transfer an item to actor | objectId, recipientId | 1 | 0 | Foundation planned |
| wear | Wear an item | objectId | 1 | 0 | Foundation planned |
| remove | Remove worn item | objectId | 1 | 0 | Foundation planned |
| throw | Throw an item | objectId, targetId? | 1 | 1 | Reference only |

## Mechanical interaction

| Type | Purpose | Arguments | turnCostSuccess | turnCostFail | Status |
| --- | --- | --- | ---: | ---: | --- |
| open | Open target | targetId | 1 | 0 | Foundation planned |
| close | Close target | targetId | 1 | 0 | Foundation planned |
| lock | Lock target | targetId, instrumentId? | 1 | 0 | Foundation planned |
| unlock | Unlock target | targetId, instrumentId? | 1 | 0 | Foundation planned |
| activate | Activate target | targetId | 1 | 0 | Foundation planned |
| deactivate | Deactivate target | targetId | 1 | 0 | Foundation planned |
| push | Push target | targetId, destinationId? | 1 | 1 | Reference only |
| pull | Pull target | targetId, destinationId? | 1 | 1 | Reference only |
| turn | Rotate or adjust target | targetId, direction?, instrumentId? | 1 | 1 | Reference only |
| raise | Raise target | targetId | 1 | 1 | Reference only |
| lower | Lower target | targetId | 1 | 1 | Reference only |
| wind | Wind mechanism | targetId | 1 | 1 | Reference only |
| plug | Connect item | objectId, targetId | 1 | 0 | Reference only |
| unplug | Disconnect item | objectId, targetId? | 1 | 0 | Reference only |

## Physical manipulation

| Type | Purpose | Arguments | turnCostSuccess | turnCostFail | Status |
| --- | --- | --- | ---: | ---: | --- |
| use | Use item | objectId, targetId? | 1 | 1 | Foundation planned |
| cut | Cut target | targetId, instrumentId? | 1 | 1 | Reference only |
| break | Break target | targetId, instrumentId? | 1 | 1 | Reference only |
| dig | Dig at target | targetId, instrumentId? | 1 | 1 | Reference only |
| tie | Tie item to target | objectId, targetId | 1 | 1 | Reference only |
| untie | Untie target | targetId | 1 | 1 | Reference only |
| fill | Fill container | targetId, objectId? | 1 | 0 | Reference only |
| empty | Empty container | targetId, destinationId? | 1 | 0 | Reference only |
| pour | Pour contents | objectId, targetId? | 1 | 0 | Reference only |
| shake | Shake target | targetId | 1 | 1 | Reference only |
| rub | Rub target | targetId, instrumentId? | 1 | 1 | Reference only |
| squeeze | Squeeze target | targetId | 1 | 1 | Reference only |
| clean | Clean target | targetId, instrumentId? | 1 | 1 | Reference only |
| burn | Ignite or burn target | targetId, instrumentId? | 1 | 1 | Reference only |
| extinguish | Extinguish target | targetId, instrumentId? | 1 | 1 | Reference only |
| inflate | Inflate target | targetId, instrumentId? | 1 | 1 | Reference only |
| deflate | Deflate target | targetId | 1 | 1 | Reference only |
| spray | Spray substance | objectId, targetId | 1 | 1 | Reference only |

## Actor activities

| Type | Purpose | Arguments | turnCostSuccess | turnCostFail | Status |
| --- | --- | --- | ---: | ---: | --- |
| eat | Consume food | objectId | 1 | 0 | Reference only |
| drink | Consume drink | objectId | 1 | 0 | Reference only |
| sit | Sit down | targetId? | 1 | 0 | Reference only |
| stand | Stand up | none | 1 | 0 | Reference only |
| lieDown | Lie down | targetId? | 1 | 0 | Reference only |
| sleep | Sleep | none | 1 | 0 | Reference only |
| wake | Wake actor | targetId? | 1 | 1 | Reference only |
| rest | Rest | none | 1 | 0 | Reference only |
| wait | Wait for progression | none | 1 | 0 | Foundation planned |

## Social and narrative

| Type | Purpose | Arguments | turnCostSuccess | turnCostFail | Status |
| --- | --- | --- | ---: | ---: | --- |
| talk | Initiate conversation | targetId | 1 | 1 | Foundation planned |
| ask | Ask actor about topic | targetId, topicId | 1 | 1 | Reference only |
| tell | Tell actor about topic | targetId, topicId | 1 | 1 | Reference only |
| answer | Respond to prompt | choiceId or topicId | 1 | 1 | Reference only |
| say | Speak authored or literal content | topicId or text | 1 | 1 | Foundation planned |
| shout | Speak loudly | topicId or text | 1 | 1 | Reference only |
| greet | Greet actor | targetId? | 1 | 1 | Reference only |
| signal | Signal actor or target | targetId?, topicId? | 1 | 1 | Reference only |
| command | Request another actor act | targetId, action | 1 | 1 | Reference only |
| knock | Knock on target | targetId | 1 | 1 | Reference only |
| choose | Select authored choice | choiceId | 0 | 0 | Reference only |
| continue | Advance narrative sequence | none | 0 | 0 | Reference only |
| interact | Contextual interaction | targetId | 1 | 1 | Foundation planned |

## Boundaries

Combat, magic, commerce, crafting, character progression and other specialized mechanics are optional extension actions (e.g. combat.attack). Game-specific actions use the game namespace. Host/session operations such as quit, save, restore, restart, transcript and presentation preferences are not ordinary gameplay dispatch; parser history (again) is input processing. Scoring and clock queries may be optional module capabilities.

Vocabulary may map many different words to the same canonical action, e.g. pick up to take, look at to examine, and switch on to activate. A game can add vocabulary and custom actions without requiring the runtime to adopt any particular parser.
