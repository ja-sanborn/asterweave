# 0005 — Development and testing tooling

Status: Accepted

## Context

[FND-01 (issue #3)](https://github.com/ja-sanborn/asterweave/issues/3)
requires consistent development and automated testing without engine behavior.
[ADR 0001](0001-platform-independent-runtime.md) requires an independent runtime.

## Decision

Use Node.js 26 LTS with bundled npm, ES modules, a private package at version
0.0.0, and a committed npm lockfile. Use native node:test and node:assert/strict
with no third-party runtime or development npm dependencies. Use EditorConfig
and documented conventions instead of additional formatting or lint tooling.
Run Linux GitHub Actions CI on pull requests targeting main and pushes to main,
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
the core or standalone games. Test coverage and runtime interfaces are deferred.
