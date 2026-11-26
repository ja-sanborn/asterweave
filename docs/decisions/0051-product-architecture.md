# ADR 0051 — Product architecture and component boundaries

Status: Accepted

## Context

Asterweave requires a coherent first-party modular architecture, with independently usable gameplay execution and declarative game content.

## Decision

Asterweave is an integrated interactive fiction development environment comprising Engine, Tools and Creator. The independently usable Engine uses standard ECMAScript ES modules, runs offline and has no DOM, storage, network, filesystem, graphics or Node-specific dependency. Tools are independently usable; Creator uses Engine and Tools rather than duplicating them. Finished games exclude Creator and development tools.

Organize source under five sibling boundaries: src/engine (mandatory infrastructure and facade), src/modules (optional first-party gameplay capabilities), src/interaction (parser, visual novel and other interaction capabilities), src/creator and src/tools. Mirror these boundaries in tests and component documentation; shared fixtures, infrastructure and architecture tests remain separate. Centralize documentation under docs, with active decisions, historical archive and guides as appropriate. Samples contains reference games and demonstrations, distinct from test fixtures. No mandatory independent host product or hosts directory; presentation and platform integration remain separate responsibilities. Introduce directories only when justified.

UI/UX handles presentation and input; interaction modules translate and coordinate interactions via supported engine interfaces; the engine owns gameplay consequences and state. Direct engine submission and multiple interaction modes are supported architectural directions. Foundation is a development milestone, not synonymous with mandatory runtime infrastructure. Its planned deliverables include a functional headless JSON-authored game through an authored conclusion, reusable standard actions, configurable engine actions and declarative behavior, observation/access, authorized non-player execution, rules, ordered events, deterministic randomness, persistence and initial standalone distribution. Parser, visual novel and fictional calendar are later planned capabilities. Specialized mechanics and NPC policies remain authored wherever practical; promote reusable functionality only when justified. Lantern House and Zork I are samples, not engine specifications. Future authoring language, generated interfaces and delivery targets require separate design. No planned capability is thereby implemented.

Active ADRs are self-contained current authority; historical records live in decisions/archive and point forward to replacements. Current architecture and normative contracts govern requirements; issues govern actionable scope, roadmap priorities, source and actual tests implementation evidence. See [architecture](../ARCHITECTURE.md).

## Alternatives and consequences

Prefer explicit cohesive responsibilities and reviewed contracts over speculative generalized frameworks. Preserve applicable existing behavior, security and verification; accepted design does not establish implementation or authorize new feature scope.
