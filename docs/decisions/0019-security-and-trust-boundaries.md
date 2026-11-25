# 0019 — Security and trust boundaries

Status: Accepted

## Context

Asterweave processes externally supplied definitions, action requests, saves and configuration, and may later support imported packages and online hosts. Offline JavaScript runs in an environment controlled by its operator. Existing contracts require safe data validation, authorized transitions, state isolation and atomicity. [FND-05 (#7)](https://github.com/ja-sanborn/asterweave/issues/7) needs consistent technical security principles before implementation.

## Decision

Use explicit trust boundaries and defense in depth. Treat external data as untrusted until validated against the appropriate contract. Engine-owned state is isolated, encapsulated and changed only through authorized validated operations. Validate actor control independently of actor identifiers. Hosts establish trusted caller identity and enforce authentication, delivery authorization, transport, storage, filesystem and presentation security when applicable.

Executable JavaScript extensions are trusted code selected by the implementing developer; do not promise sandboxing. Data must not select arbitrary executable code. Offline content protection is optional and is not DRM, tamper-proofing or secrecy from the device operator (ADR 0010). JavaScript encapsulation is not a hostile-code isolation boundary.

Use safe algorithms, cycle detection, safe arithmetic, explicit resource ownership and bounded or managed growth where applicable. Do not introduce arbitrary global semantic limits. Hosts/loaders may impose operational limits; concrete engine budgets are designed when justified, especially before remote untrusted workloads. Resource lifecycle and cleanup follow ownership; introduce a disposal interface only when a capability requires it. Do not depend on garbage-collection timing.

Preserve safe diagnostics, fail-closed integrity and host-owned logging under ADR 0017. The normative [security model](../contracts/SECURITY_MODEL.md) defines responsibilities; [SECURITY.md](../../SECURITY.md) remains the vulnerability-reporting policy.

## Alternatives

- Ad hoc validation without a common trust model: inconsistent protection and unclear ownership.
- Mandatory Foundation sandboxing or offline anti-tamper guarantees: incompatible with current scope and trust assumptions.
- Fixed global limits or mandatory disposal interface now: speculative restrictions before workloads and resource requirements are known.
- Delegate all validation to hosts: compromises authoritative engine invariants.

## Consequences

Validate at applicable boundaries, test malformed data and unauthorized operations, avoid unsafe presentation assumptions and review resource consumption. Hosts must impose deployment-specific protections. Authentication, sandboxing, quotas, cryptographic package protection and disposal APIs are not implemented or designed in detail by this record. Existing schemas and accepted contracts are preserved.
