# Future considerations

This document records nonbinding ideas and open questions. The [roadmap](ROADMAP.md) establishes priorities; [GitHub Issues](https://github.com/ja-sanborn/asterweave/issues) are the actionable development backlog. An entry here is not authorization to implement or create issues.

## Reference games and compatibility: original Zork trilogy

Evaluate recreating one or more of Zork I, II and III as future Asterweave reference games and a compatibility proof of concept. The scope (one game, the trilogy, or representative portions), fidelity, distribution and milestone decomposition are undecided. Treat these as possible multi-story initiatives, not a single committed user story.

Objectives include vocabulary/synonyms, contextual object resolution, canonical and custom actions, puzzles, ownership, containers, doors, NPC interactions, configurable turn costs and timed events. Prefer reproducing gameplay through game definitions, vocabulary, rules and optional extensions rather than special-casing the core. Document genuinely general engine gaps as separate issues when scoped. Zork is a reference target, not a normative specification or runtime dependency.

Reference repositories: [Zork I](https://github.com/historicalsource/zork1), [Zork II](https://github.com/historicalsource/zork2), [Zork III](https://github.com/historicalsource/zork3). Their generic syntax definitions informed the initial vocabulary review; no verb-handler compatibility audit or source port has been performed. Review applicable source and game-content licensing, attribution, and distribution rights before any recreation. No recreation issues are created by FND-02.
