# Programming Language and Runtime Standards

## 1. Purpose and scope

This document is the authoritative reference for Asterweave's approved programming
language, runtime, portability, compatibility, validation and dependency policies.
It applies to human and AI contributors and to first-party engine, Creator,
host, test and development-tool code, with component-specific requirements as
described below.

The standards support an embeddable, platform-independent interactive fiction
engine for online and offline use, without prescribing a particular presentation
technology. They establish technical constraints, not implemented capabilities or
commitments to particular products, hosts, devices or distribution formats.
Changes to these standards require maintainer approval. Subsequent coding,
testing, documentation, security and tooling standards must conform to them.

## 2. Programming languages

Standard JavaScript (ECMAScript) is the exclusive first-party programming
language, including for the engine, Creator, official hosts, development
utilities and tests. TypeScript, C#, and other implementation languages must not
be introduced without an explicitly approved change to the technical standards.

Supporting markup, styling, data, documentation and configuration formats,
including HTML, CSS, JSON, Markdown, YAML and SVG, are permitted where
appropriate. These are not alternative application programming languages.

Independent developers may integrate Asterweave through its documented public API
using their own languages and technologies, provided their execution environments
are compatible. No external engine extensions are to be used in this project.
This restriction does not prohibit separately approved application libraries or
development dependencies.

## 3. Language standards and versions

The latest finalized edition of ECMA-262 is the authoritative language
specification. ECMAScript 2026 is the finalized edition at the establishment of
these standards. Publication of a new edition does not automatically raise
minimum runtime requirements.

- Use only features included in a finalized ECMAScript edition and supported
  by all applicable target runtime environments.
- Use native ECMAScript modules (ESM) and strict-mode semantics, which modules
  provide automatically.
- Do not use experimental proposals, nonstandard syntax, proprietary language
  extensions or TypeScript.
- Mandatory source transpilation is not required. Standard JavaScript source
  must remain compatible with its applicable execution environments.

Contributors must verify compatibility when adopting language features and defer
features that are unsupported in applicable environments. The living ECMAScript
specification may include changes not yet published in a finalized edition and
does not by itself establish eligibility.

## 4. Development runtime

Node.js 26.x LTS is the initial official development and verification runtime.
Use one approved LTS major version with current security and maintenance
updates within that version. Major-version upgrades require explicit review and
maintainer approval. Unsupported or end-of-life versions are prohibited for
official verification. Alternative runtime products are not official development
targets.

Human and AI contributors may develop and verify locally or in approved remote
environments. Windows, Linux and macOS are development-platform candidates, not
verified platform commitments. Local Node.js installation is not mandatory when
approved remote verification is available.

Node.js is a development and verification tool, not an inherent dependency of the
engine or its distributions. Development utilities may use Node.js-specific APIs
where appropriate. Engine code must not depend on them. Writing or editing
JavaScript source does not itself require Node.js.

Development and verification must be reproducible. Runtime installation and
version management, package management, testing tools, commands and continuous
integration configuration are established separately. Successful Node.js
verification alone does not establish application compatibility.

## 5. Application runtime

The engine requires a compatible ECMAScript execution environment. It must not
require a specific runtime product, browser, operating system, internet
connection or user interface. Platform-specific capabilities are provided
outside the engine.

Each host selects its applicable execution environment and integrates through the
documented public API. A server-side host may select Node.js, but this does not
make Node.js a requirement for the engine, Creator or other hosts.

Creator's execution environment is selected independently. A JavaScript-based
progressive web application (PWA) is a preferred future direction, not an
approved architecture or delivery commitment. Browser, mobile, desktop, Discord,
MUD and embedded integrations are possible target environments, not established
support commitments. Particular host technologies and distribution mechanisms
are subject to future design and verification.

## 6. Platform independence

The engine may depend on applicable standard ECMAScript facilities, native
ECMAScript modules and standard JSON operations.

The engine must not directly depend on:

- Browser DOM, browser storage or other host-specific APIs.
- Node.js-specific APIs or filesystem APIs.
- Network or operating-system APIs.
- Graphics, rendering, audio or video APIs.
- Platform-specific cryptography APIs.

Where applicable, these capabilities are provided outside the portable engine.
Compatibility workarounds must not compromise engine platform independence.
All UI/UX and network-originated interactions with the engine must pass through
its documented public API.

## 7. Compatibility and verification

Compatibility is capability-based rather than restricted to device brands,
operating systems, browser versions or only the latest environments. Publish the
language and execution capabilities required by applicable distributions. These
include support for the required language features and relevant module loading
and integration capabilities. ECMAScript conformance alone does not guarantee
distribution compatibility. Older environments are not automatically excluded.

Use the following support classifications:

| Classification | Meaning |
| --- | --- |
| Officially supported | Explicitly supported by Asterweave and verified against applicable requirements. |
| Potentially compatible | Capable of meeting published requirements but not officially verified by Asterweave. |
| Incompatible | Known to lack required capabilities or fail applicable compatibility requirements. |

Compatibility claims require appropriate evidence:

- Use the approved Node.js runtime for official development verification.
- Verify browser compatibility before claiming browser support.
- Verify device compatibility before making device-specific support claims.
- Verify offline operation before claiming offline capability.
- Verify applicable compatibility requirements for both source and packaged
  engine distributions.
- Independent integrators verify compatibility with their chosen environments.

Use published language specifications, browser compatibility data and
runtime-specific documentation to assess feature support. Browser compatibility
data is informative and does not replace execution verification or establish
support for embedded or server-side environments. Specific supported
environment/version matrices and verification mechanisms are established when
the applicable application and distribution targets and testing infrastructure
are defined.

## 8. Runtime validation

Runtime type validation is mandatory at key boundaries, including the public
API, game configuration and saved game data. All UI/UX and network-originated
engine interactions must pass through the public API; network-originated input
is therefore subject to the same API validation requirements.

Standard JavaScript's dynamic typing does not eliminate the need for runtime
validation. Static analysis or documentation, if used, does not substitute for
validation of external data at these boundaries. Validation implementation,
detailed API contracts, configuration and save formats, and transport-specific
security requirements are established separately.

## 9. Third-party runtime dependencies

The engine must have zero third-party runtime dependencies and rely on approved
standard ECMAScript capabilities.

Creator and first-party hosts must prefer native language and platform
facilities. Application-specific third-party runtime dependencies are permitted
only when justified, evaluated under section 11 and explicitly approved by the
maintainer. They must not become mandatory engine dependencies or compromise
applicable portability and offline requirements. Independent integrators are
responsible for their own application dependencies.

Standard language facilities and platform-provided APIs are not third-party
libraries. Dependency classification is based on actual execution, not package
manager labels or packaging. For example, a minifier that executes inside Creator
is a Creator runtime dependency even if it is used to package games and is not
included in the resulting game. Bundling a third-party library into an
application does not exempt it from approval.

## 10. Third-party development dependencies

Prefer native capabilities provided by the approved development runtime and
applicable platform facilities. Third-party development dependencies are
permitted only when they provide a demonstrable benefit, native alternatives
have been considered, applicable evaluation requirements in section 11 have
been satisfied and the maintainer has explicitly approved adoption.

Development dependencies must:

- Support reproducible development and verification, with controlled,
  documented version management and maintained security updates.
- Comply with applicable licensing obligations.
- Preserve engine platform independence and not introduce prohibited runtime
  dependencies, including through tooling or generated output.
- Avoid redundant tooling, unnecessary external services and unnecessary
  contributor complexity.
- Be evaluated for accessibility to human and AI contributors.
- Be removed when no longer justified.

Tools used solely during development are development dependencies. Tools
executing within a distributed application, including Creator, are subject to
the runtime dependency policy in section 9. The zero-dependency engine runtime
requirement remains mandatory.

This policy permits incremental adoption of justified specialist tools rather
than requiring their implementation from scratch. It does not approve any
specific dependency, service, testing framework, package manager, bundler,
minifier or static-analysis tool.

## 11. Dependency evaluation and approval

Human and AI contributors must evaluate proposed third-party dependencies
against the following criteria before requesting maintainer approval.

| Criterion | Required consideration |
| --- | --- |
| Necessity and benefit | Demonstrate the need and expected benefit. |
| Alternatives | Consider native language or platform facilities first. |
| Security | Evaluate known risks and security and maintenance practices. |
| Licensing | Evaluate applicable licensing and distribution obligations. |
| Maintenance | Establish reasonable evidence of ongoing support and maintenance. |
| Portability | Verify compatibility with intended execution environments. |
| Performance and resources | Consider acceptable resource and distribution overhead. |
| Transitive dependencies | Evaluate additional dependencies, complexity and risk. |
| Offline operation | Preserve applicable offline requirements. |
| Approval | Obtain explicit maintainer approval before adoption. |

Development dependencies must additionally satisfy section 10. Maintain approved
dependencies, including applicable security updates, and reassess their
continued justification. Detailed dependency management, version pinning and
automated maintenance mechanisms are established separately.

## 12. Authoritative references

- [ECMA-262 — published ECMAScript language specification](https://262.ecma-international.org/):
  authoritative language semantics and finalized edition.
- [TC39 — living ECMAScript specification](https://tc39.es/ecma262/):
  evolving specification; not a substitute for finalized-edition status.
- [Node.js release lifecycle](https://nodejs.org/en/about/previous-releases):
  official runtime support and maintenance information.
- [Node.js 26.x API documentation](https://nodejs.org/download/release/latest-v26.x/docs/api/):
  official documentation for the approved development runtime.
- [MDN JavaScript reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript):
  informative language and browser compatibility reference.
- [MDN Browser Compatibility Data](https://github.com/mdn/browser-compat-data):
  informative browser feature support data.
- [Web Platform Baseline](https://web-platform-dx.github.io/baseline/):
  informative cross-browser feature availability.

Consult relevant runtime-specific documentation for embedded and alternative
execution environments. External compatibility references supplement, but do not
replace, applicable verification evidence. Project standards govern permitted
technology choices.
