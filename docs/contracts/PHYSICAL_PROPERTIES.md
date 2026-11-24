# Physical characteristics and capacity

Status: Accepted design; implementation pending. Origin: [FND-12, issue #23](https://github.com/ja-sanborn/asterweave/issues/23). See [ADR 0012](../decisions/0012-physical-properties-and-capacity.md) and [containment](WORLD_CONTAINMENT.md).

Physical characteristics are abstract gameplay points, not dimensions, kilograms or a physics simulation. Size and weight are independent author-defined integer classifications.

| Value | Size | Weight |
| --- | --- | --- |
| 1 | X-Small (ring, key) | X-Light (coin, key) |
| 2 | Small (notebook, laptop) | Light (notebook, laptop) |
| 3 | Medium (clothing, backpack) | Average (brick, stone) |
| 4 | Large (human-scale furniture/person) | Heavy (ordinarily movable, not carried) |
| 5 | X-Large (vehicle, building) | X-Heavy (ordinarily immovable) |

These descriptions guide authors, not hardcoded action restrictions. Mobility, strength, access, dimensions and genre-specific mechanics are later game rules/extensions; physical scores do not themselves authorize an action.

## Physical object

Every authored location, actor or entity may have an optional closed physical object, containing any of these optional fields. World is exempt and has no authored physical record.

| Field | Type | Omitted behavior |
| --- | --- | --- |
| isContainer | Boolean | true for locations, false for actors/entities |
| size | Integer 1–5 | Unspecified |
| weight | Integer 1–5 | Unspecified |
| maxItemSize | Integer 0–5 | No individual size restriction |
| maxItemWeight | Integer 0–5 | No individual weight restriction |
| sizeCapacity | Nonnegative safe integer | Unlimited |
| weightCapacity | Nonnegative safe integer | Unlimited |

Unlimited is represented by omission, not null, Infinity or a special string. Zero is a genuine restriction; a zero limit admits no child requiring a positive score. Explicit false is respected. Only in requires container capability; e.g. a table can support on and an actor can support carried without being a container. Other relationship eligibility is game-specific. No physical property is inferred from name or description. Simple games can omit all restrictions.

```json
{"isContainer":true,"size":3,"weight":2,"maxItemSize":2,"maxItemWeight":3,"sizeCapacity":5,"weightCapacity":6}
```

## Capacity invariants

For every non-root active parent, all direct children (all containment relationships) must meet any finite individual size/weight limits using each child's own external size and intrinsic weight classification. The total size is the sum of direct children's external sizes; nested contents do not enlarge a container. The total weight is the sum of intrinsic weights of all descendants, each counted once, excluding the parent itself. A loaded child's intrinsic weight remains a 1–5 classification; its recursive weight may exceed 5 and contributes to the cumulative weight capacity, not the individual class limit. Authors should set cumulative limits to control loaded weight. There is no geometry or automatic packing simulation.

If an applicable finite limit needs a missing size/weight value, reject the definition or proposed transition, rather than treating unknown as zero. A zero individual or cumulative limit rejects any direct child (even if its score is unspecified). No calculation is required for an absent limit; derived loads with unknown inputs are unspecified, not zero. Check safe-integer arithmetic without overflow (reject when a required finite-limit comparison cannot be satisfied; do not silently round). Empty contents contribute zero. Explicitly validate every affected ancestor on candidate state, including when a descendant changes physical values; never double-count a subtree moved between branches of the same ancestor. All limits are inclusive. World is exempt, but its descendants' own limits still apply.

Example: backpack size 3, weight 2 contains a notebook size 2, weight 2. Its direct contents use size 2 and weight 2; the actor carrying it uses size 3 and weight 4. Adding a weight-5 item fails the backpack's maxItemWeight 3 regardless of spare total capacity. If an actor's remaining cumulative weight is insufficient, adding a small object to the backpack also fails atomically. A car with maxItemSize 4 and total size capacity 30 cannot accept a size-5 vehicle even when empty.

## Scope

Initial values live in the canonical definition; FND-04 defines which values can change and how to preserve them. FND-05 validates initial values and all finite limits; FND-07 enforces them during internal containment transfers and derives loads. FND-09 verifies integration. No capacity-related action, physics, detailed geometry, inventory UI, dynamic lifecycle implementation or new dependency is introduced by this design. See [fixture](../../tests/fixtures/games/containment-foundation.json).

FND-04 maps authored structural values to reserved asterweave properties and stores only current differences, including explicit removal of containment when an active participant leaves World. See [properties](PROPERTIES.md), [runtime state](RUNTIME_STATE.md) and [save data](SAVE_DATA.md). No duplicate authoritative values; core validation remains mandatory.
