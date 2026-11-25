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

## Subsequent decisions

The [coding standards](../CODE_STYLE.md) and [testing strategy](../../tests/README.md) elaborate development and verification requirements without changing the toolchain. [ADR 0018](0018-public-api-and-compatibility.md) establishes public API and release compatibility principles; concrete runtime interfaces remain implementation-story decisions.

The approved FND-05 remote development workflow extends CI push triggers to feature/**, fix/**, refactor/** and docs/** in addition to main. Existing pull request checks targeting main and all tooling/security settings remain unchanged. When local execution is unavailable, focused branch commits containing applicable tests may be verified by CI after commit; verify the exact SHA and successful test job before advancing. This supersedes only the original trigger restriction and does not relax testing or repository authorization requirements. See [contributing](../../CONTRIBUTING.md) and [testing strategy](../../tests/README.md).
