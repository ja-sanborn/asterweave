# 0001 — Platform-independent runtime

> **Archived — historical only.** Superseded by [ADR 0051](../0051-product-architecture.md). The original decision text below is not current authority.


Status: Accepted design principle

## Context
Standalone games must run offline, while future browser, CLI and Discord hosts should reuse the engine.

## Decision
Use standard ECMAScript with no third-party core runtime dependencies. Keep platform APIs outside the core in host adapters.

## Alternatives
Browser-specific engine or Node-specific runtime.

## Consequences
Headless testing and multiple hosts are possible; adapters and distribution packaging require separate work. See [architecture](../../ARCHITECTURE.md).
