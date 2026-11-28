# Asterweave AI Contributor Instructions

## Project Overview

Asterweave is an open-source interactive fiction engine. Stories woven. Worlds imagined.

JA Sanborn created [Asterweave](https://github.com/ja-sanborn/asterweave). The project is licensed under MPL-2.0. Distinguish proposed capabilities, approved requirements, implemented behavior and verified results when describing the project.

## Authority and Required Reading

Before proposing or performing work, inspect the current repository, applicable GitHub issues and relevant authoritative documentation.

- [README.md](README.md) provides the project overview.
- [LICENSE](LICENSE) governs licensing.
- [LANGUAGE_RUNTIME_STANDARDS.md](LANGUAGE_RUNTIME_STANDARDS.md) governs language, runtime, portability and dependencies.
- [ISSUE_MANAGEMENT.md](ISSUE_MANAGEMENT.md) governs issue management, workflow, closure and the [Definition of Done](ISSUE_MANAGEMENT.md#definition-of-done).

GitHub Issues are the authoritative backlog. Applicable issues establish approved scope, requirements, acceptance criteria, approved decisions and evidence. Follow current approved requirements and explicit supersession. Treat historical implementation, retired documentation and unapproved proposals as context. Surface missing, ambiguous or conflicting requirements and seek maintainer resolution when necessary.

## Maintainer Authorization

Inspect, research, discuss and propose within read-only scope. Obtain explicit approval for development issue creation, community disposition, defect investigation, promotion or material reclassification, activation, material changes to metadata, priorities, relationships, scope or criteria, significant requirements or architectural decisions, repository or configuration implementation, PR creation, merge, cancellation, reopening and closure.

A defined batch can authorize routine steps, reporting, decision recording and verification. Stay within its scope and follow repository protections. Acceptance, assignment, priority, disposition or native status confers no implementation authority. Obtain distinct authorization for implementation, PR creation, merge and closure.

## Programming Language and Runtime

Follow the authoritative [language and runtime standards](LANGUAGE_RUNTIME_STANDARDS.md).

- Use standard ECMAScript and native ES modules.
- Use only finalized language features supported by applicable target environments.
- Use the approved Node.js development runtime for official verification without introducing Node.js dependencies into the engine.
- Preserve engine platform independence and validate external inputs at the required boundaries.
- Do not introduce third-party engine runtime dependencies.
- Obtain explicit maintainer approval before introducing permitted application or development dependencies.
- Do not claim compatibility without appropriate verification evidence.

## Issue Management

Follow [Issue Management](ISSUE_MANAGEMENT.md). Check for duplicates and overlaps. Use approved native classifications, identifiers, labels, canonical content and sizing. Preserve issue identity, history and attribution during triage and in-place promotion. Keep sensitive vulnerability details out of public issues and distinguish investigation from corrective development acceptance.

Before activation, verify approved scope, applicable criteria, prerequisite outcomes, development sequence, parent, metadata and predecessor handoffs. After authorized activation, verify native In progress status and confirm the issue and applicable parent appear in the shared Active work view. GitHub can change statuses automatically. Maintainer authorization governs whether work may proceed. Use native sub-issues and direct dependencies. Record prerequisite rationale and external context where needed. Apply priority, dispositions and workflow exceptions under their approved rules. Seek approval before adding planning structures.

## Working Practices

Inspect repository state, applicable requirements, existing changes and dependencies before making changes. Stay within approved scope, prefer cohesive reviewable work and preserve unrelated files, configuration and work. Surface material assumptions, risks, dependencies and newly discovered requirements. Preserve applicable licensing notices and creator attribution. Obtain maintainer approval before adding new architecture, dependencies, tooling or requirements.

Record critical and final approved decisions, supersession and material handoffs in the relevant issue. Assess impacts and obtain approval before materially amending requirements, criteria or scope. Reconcile approved changes and independently verify them.

## Verification and Reporting

Independently retrieve and verify issue mutations, branch changes, configuration and outcomes. Report significant progress, material blockers, partial failures, checks and actual results in the issue. Link supporting evidence and disclose limitations. Preserve valid changes when a later operation fails and use authorized recovery.

Check acceptance criteria only after verified satisfaction. Apply the [Definition of Done](ISSUE_MANAGEMENT.md#definition-of-done) to accepted stories and defects and the [epic closure requirements](ISSUE_MANAGEMENT.md#epic-completion-and-closure) to epics. Verify applicable requirements in the intended target, record final evidence and obtain explicit closure authorization. Independently verify authorized closure. Use closing keywords only within approved closure authority.

## Maintaining These Instructions

When approved standards change, assess effects on these instructions, the Definition of Done, authoritative references and downstream work. Update affected guidance within scope using concise instructions and links. Verify changes and affected references. Keep issue-specific decisions, evidence and handoffs in the applicable GitHub issues.
