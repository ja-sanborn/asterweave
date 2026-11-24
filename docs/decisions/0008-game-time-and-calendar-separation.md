# 0008 — Game time and calendar separation

Status: Accepted

## Context

[FND-02 (issue #4)](https://github.com/ja-sanborn/asterweave/issues/4) defines turn progression. Stories differ in how fictional dates, clocks and durations work.

## Decision

Committed turns advance abstract game time; the turn counter is authoritative. Zero-turn outcomes do not advance abstract time. Turn-based rules can operate without a calendar. An optional game clock/calendar module may translate committed turns into configured fictional durations and dates, support custom calendars, and persist its state with the game. It must be deterministic, independent of real-world clocks and absent from games that do not need it. Intermediate turns cannot be silently skipped; event ordering and interruption design remain future work. No second independently advancing gameplay clock is introduced by the core.

## Alternatives

Wall-clock-driven core; mandatory Gregorian calendar; unrelated turn and fictional-time counters.

## Consequences

Foundation requires turn progression only. [Issue #18](https://github.com/ja-sanborn/asterweave/issues/18) tracks optional clock/calendar support, with rules/events and persistence dependencies. See [ADR 0006](0006-atomic-action-execution-and-turn-progression.md). This record accepts architecture, not implementation.
