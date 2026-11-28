# Asterweave AI Contributor Instructions

## Project Overview

Asterweave is an open-source interactive fiction engine. Stories woven. Worlds imagined.

JA Sanborn created [Asterweave](https://github.com/ja-sanborn/asterweave). The project is licensed under MPL-2.0. Distinguish proposed capabilities, approved requirements, implemented behavior and verified results when describing the project.

## Authority and Required Reading

Before proposing or performing work, inspect the current repository, applicable GitHub issues and relevant authoritative documentation.

- [README.md](README.md) provides the project overview.
- [LICENSE](LICENSE) governs licensing.
- [LANGUAGE_RUNTIME_STANDARDS.md](LANGUAGE_RUNTIME_STANDARDS.md) governs language, runtime, portability and dependencies.
- [ISSUE_MANAGEMENT.md](ISSUE_MANAGEMENT.md) governs issue management.

GitHub Issues are the authoritative backlog. Applicable issues establish approved scope, requirements and acceptance criteria. Follow current approved requirements and explicit supersession. Treat historical implementation, retired documentation and unapproved proposals as context. Surface missing, ambiguous or conflicting requirements and seek maintainer resolution when necessary.

## Maintainer Authorization

Obtain explicit maintainer authorization for the applicable action before creating or materially modifying issues, implementing repository or configuration changes, creating pull requests, merging or closing issues. Discussion, research, recommendations, decision approval and issue metadata do not confer implementation authority. Follow the approved scope and repository protections.

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

Follow [Issue Management](ISSUE_MANAGEMENT.md). Inspect existing issues for duplicates, overlaps, applicable parents and prerequisites. Use the approved native classifications and relationships, identifier and prefix rules, labels, sizing and canonical content.

Create only authorized issues and associated metadata. Independently verify creation and authorized metadata changes. Preserve issue identity, history and contributor attribution. Distinguish community submissions from accepted development work. Report partial failures and unresolved metadata and reconcile the existing issue when possible.

## Working Practices

Inspect repository state, applicable requirements, existing changes and dependencies before making changes. Stay within approved scope, prefer cohesive reviewable work and preserve unrelated files, configuration and work. Surface material assumptions, risks, dependencies and newly discovered requirements. Discuss significant scope changes before proceeding. Preserve applicable licensing notices and creator attribution. Obtain maintainer approval before adding new architecture, dependencies, tooling or requirements.

## Verification and Reporting

Verify work against applicable requirements and acceptance criteria. Report actual changes, checks, evidence and limitations. Base claims of implementation, compliance, compatibility and completion on verification. Preserve valid completed operations after a partial failure, report unresolved conditions and follow authorized recovery procedures.

## Maintaining These Instructions

Maintain these instructions incrementally as authoritative standards are established or revised. Use references and concise operational instructions. Revise affected instructions and links when approved requirements change. Keep temporary issue-specific instructions and implementation records in the applicable GitHub issues.
