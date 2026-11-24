# Contributing to Asterweave

Asterweave is in its initial design phase. Discuss substantial changes through GitHub issues before implementation.

## Development principles

- Keep runtime code in standard JavaScript without third-party core runtime dependencies.
- Isolate platform-specific APIs in hosts and adapters.
- Keep graphics and authoring tools outside the runtime core.
- Prefer deterministic behavior, explicit contracts and testable modules.
- Include tests and update documentation when behavior changes.
- Do not commit credentials, private game content or generated distributions.

## Workflow

After initial repository setup, use focused branches and pull requests targeting main. Keep commits coherent and reviewable. Follow the project's established tests and checks once available.

## Licensing

Contributions to covered project files are made under MPL 2.0. Preserve applicable copyright and license notices. New covered source files should include the MPL Exhibit A notice and an SPDX-License-Identifier: MPL-2.0 identifier. Only contribute material you have the right to license.
