# Future considerations

This document records nonbinding ideas and open questions. The [roadmap](ROADMAP.md) establishes priorities; [GitHub Issues](https://github.com/ja-sanborn/asterweave/issues) are the actionable development backlog. An entry here is not authorization to implement or create issues.

## Reference games and compatibility: original Zork trilogy

Evaluate recreating one or more of Zork I, II and III as future Asterweave reference games and a compatibility proof of concept. The scope (one game, the trilogy, or representative portions), fidelity, distribution and milestone decomposition are undecided. The work may comprise multiple independent compatibility and reference-game deliverables; no implementation scope is committed.

Objectives include vocabulary/synonyms, contextual object resolution, canonical and custom actions, puzzles, ownership, containers, doors, NPC interactions, configurable turn costs and timed events. Prefer reproducing gameplay through game definitions, vocabulary, rules and optional extensions rather than special-casing the core. Document genuinely general engine gaps as separate issues when scoped. Zork is a reference target, not a normative specification or runtime dependency.

Reference repositories: [Zork I](https://github.com/historicalsource/zork1), [Zork II](https://github.com/historicalsource/zork2), [Zork III](https://github.com/historicalsource/zork3). Selected Zork I world, syntax, action, global state, main and clock source files informed an initial compatibility review; no exhaustive verb-handler/puzzle compatibility audit or source port has been performed. Review applicable source and game-content licensing, attribution, and distribution rights before any recreation.

### Reference-game compatibility considerations

The intended reference is a native Asterweave recreation, not a Z-machine emulator or core dependency. The accepted twelve-direction vocabulary and expanded safe-integer physical ranges are already recorded in ADRs 0021–0022; do not reopen them merely for the reference game. The following are nonbinding requirements to evaluate as the applicable capabilities are designed, not current schema fields or implementation authorization.

| Area | Design consideration |
| --- | --- |
| Navigation | Evaluate conditional/hidden exits, door-controlled access, state-dependent destinations and special traversal; immutable definitions can describe conditions on effective state. Preserve directed exits and containment independence. |
| Movement outcomes | Distinguish malformed/unauthorized requests from valid blocked attempts that a game may resolve as completed failure with intentional consequences and cost. Foundation move remains 1/0 and unavailable exits rejected. Coordinate with configurable actions and future navigation rules. |
| Perception and parser scope | Shared scenery, doors visible from multiple rooms, global/local vocabulary and nonphysical references must not require duplicate object identities or multiple physical parents. Evaluate visibility/accessibility separately from containment. |
| Fictional death | Fictional death/resurrection is distinct from terminal structural destruction; use game-owned state where appropriate. |
| NPCs and events | Evaluate trusted NPC actions and ordered timed effects within a committed turn without accidentally advancing the shared turn twice. Coordinate atomicity, event scheduling and interruption. |
| Randomness | Own deterministic random state per game; include staged random/event changes in rollback and necessary state in future saves. |
| Parser | Evaluate synonyms, adjectives, indirect objects, pronouns, disambiguation, multi-object selections, NPC addressing, repetition and sequential commands; define action sequencing and required parser context separately. |
| Other gameplay | Lighting, fuel, scoring, puzzles, vehicles and combat should use generic rules, properties and trusted extensions rather than Zork-specific core types. |
| Reference game | Evaluate fidelity, scope, licensing/attribution and trademark/distribution rights before porting; preserve applicable notices and keep original game content separate from core. |

Search existing issues and obtain scope approval when these capabilities become actionable.
