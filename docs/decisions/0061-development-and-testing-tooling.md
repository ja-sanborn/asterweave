# ADR 0061 — Development and testing tooling

Status: Accepted

## Context

Foundation development requires consistent development and automated testing without engine behavior.
[ADR 0051](0051-product-architecture.md) requires an independent runtime.

## Decision

Use Node.js 26 LTS with bundled npm, ES modules, a private package at version
0.0.0, and a committed npm lockfile. Use native node:test and node:assert/strict
with no third-party runtime or development npm dependencies. Use EditorConfig
and documented conventions instead of additional formatting or lint tooling.
Run Linux GitHub Actions CI on pull requests targeting main and pushes to main, feature/**, fix/**, refactor/** and docs/**,
with official actions pinned to full commit SHAs, read-only contents permission,
no persisted checkout credentials and no dependency caching. Dependabot monitors
GitHub Actions and npm weekly.

## Alternatives

Node.js 24 LTS; multiple Node.js and OS versions; external test frameworks;
version-tag action references; lint and formatting dependencies.

## Consequences

Contributors use one supported Node.js major version and a shared test command.
Additional platforms and tooling can be evaluated when needed. Node.js remains
development tooling (and an option for compatible hosts), not a requirement for
the core or standalone games. Apply component-oriented testing boundaries under the testing strategy; concrete runtime interfaces require approved design.

## Subsequent decisions

The [coding standards](../CODE_STYLE.md) and [testing strategy](../../tests/README.md) elaborate development and verification requirements without changing the toolchain. [ADR 0057](0057-engine-interface-and-compatibility.md) establishes public API and release compatibility principles; concrete runtime interfaces require explicit design and review.

When local execution is unavailable, focused branch commits containing applicable tests may be verified by CI after commit; verify the exact SHA and successful test job before advancing. See [contributing](../../CONTRIBUTING.md) and [testing strategy](../../tests/README.md).
