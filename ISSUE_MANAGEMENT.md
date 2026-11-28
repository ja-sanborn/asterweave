# Issue Management

## Contents

1. [Purpose and Scope](#purpose-and-scope)
2. [Authority and Governing Principles](#authority-and-governing-principles)
3. [Issue Classification Model](#issue-classification-model)
4. [Identifier and Title Conventions](#identifier-and-title-conventions)
5. [Prefix Dictionary](#prefix-dictionary)
6. [Label Catalog and Assignment Rules](#label-catalog-and-assignment-rules)
7. [Epic and User Story Sizing](#epic-and-user-story-sizing)
8. [Canonical Issue Content and Templates](#canonical-issue-content-and-templates)
9. [Human and Programmatic Issue Creation](#human-and-programmatic-issue-creation)
10. [Community Submission and Promotion Principles](#community-submission-and-promotion-principles)
11. [Legacy Issue Classification](#legacy-issue-classification)
12. [Verification and Failure Handling](#verification-and-failure-handling)
13. [Maintenance and Evolution](#maintenance-and-evolution)

## Purpose and Scope

GitHub Issues are Asterweave's authoritative development backlog. This standard governs issue classification, identifiers, labels, sizing, canonical content and creation for maintainers and human and AI contributors. It establishes requirements for community submissions and permanent historical classification. Detailed lifecycle procedures and the project-wide Definition of Done are established separately.

## Authority and Governing Principles

| Source | Authority |
| --- | --- |
| [LICENSE](LICENSE) | Licensing |
| [README.md](README.md) | Project overview |
| [LANGUAGE_RUNTIME_STANDARDS.md](LANGUAGE_RUNTIME_STANDARDS.md) | Language, runtime, portability and dependencies |
| Issue Management | Issue management requirements |
| [AGENTS.md](AGENTS.md) | AI contributor instructions and navigation to authoritative references |
| GitHub Issues | Approved scope, acceptance criteria, decisions and implementation evidence |
| Native GitHub metadata | Actual issue identity, classification, status, closure and relationships |
| GitHub label configuration, forms and chooser settings | Operational implementation of this standard |

Apply explicitly approved supersession. Distinguish approved requirements, implemented behavior and verified results. Raise conflicting or ambiguous authority for maintainer resolution. A timestamp or individual issue cannot silently override an applicable standard.

Maintainer authorization is required for applicable issue creation, material amendments, implementation, pull requests, merge and closure. Explicit approval of a defined issue proposal covers that creation and agreed routine metadata and relationships. Acceptance, assignment, priority, status and form selection do not grant authority to implement or advance to another action.

## Issue Classification Model

Native GitHub issue types are authoritative for primary classification.

| Native type | Purpose |
| --- | --- |
| Epic | Major development objective that groups related, independently verifiable child deliverables |
| User Story | Cohesive, independently verifiable development deliverable with identifiable benefit, including technical enablers |
| Bug Report | Actual or suspected defect. It retains this type if confirmed and accepted for development. |
| Feature Request | Proposed capability or improvement awaiting evaluation. Acceptance may promote the original issue to a User Story or Epic. |

The development hierarchy consists of epics and stories. Development area, work characteristic, priority, disposition, workflow exceptions and historical provenance are independent attributes. Do not duplicate native classifications or ordinary lifecycle statuses with labels. Use native issue state, closure reasons, statuses and authorized relationships for their respective purposes. Native sub-issue relationships are the authoritative epic child inventory. Prefer native dependency relationships for issue prerequisites where available, with explanatory or external context in the body. Avoid independent duplicate dependency or child inventories.

## Identifier and Title Conventions

Use `[PREFIX-#####] Title` for assigned identifiers. A prefix contains three to five uppercase English letters A–Z. The five-digit decimal suffix is the GitHub issue number padded with leading zeroes. If an issue number exceeds 99999, stop and obtain approval for a revised convention. Never truncate, roll over, reserve numbers or maintain separate counters. Gaps are expected.

Create the issue first if GitHub has yet to assign its number. Then assign the approved identifier. Use one space after the closing bracket and a concise, descriptive, nonblank English title. Use sentence case for new titles while preserving proper nouns and acronyms. Prefer actionable verbs for stories, a clear objective for epics and the defect or correction for accepted bugs. Avoid unnecessary ending punctuation and embedded status, priority, assignee or milestone information.

Changes in status, priority, schedule, parent or reopening do not change an identifier. An authorized reclassification may change the prefix while preserving the GitHub number, suffix, URL, attribution and history. Reconcile active references and preserve historical comments. Each surviving issue keeps its own number through splits or combinations. Never reuse a historical identifier for another issue.

Initial Bug Reports and Feature Requests use descriptive titles without custom identifiers. This applies to suspected defects reported by maintainers as well. Assign custom identifiers only to maintainer-authorized development work and eligible retired historical issues.

## Prefix Dictionary

| Prefix | Principal deliverable or designation | Native type | Required corresponding label |
| --- | --- | --- | --- |
| EPIC | Major development objective | Epic | None |
| ARCH | Product architecture, technical foundations, development standards, project governance or supporting development infrastructure | User Story | `architecture` |
| DOC | Product requirements, design, architecture decisions recorded as documentation, contracts or other authoritative documentation | User Story | `documentation` |
| BUG | Confirmed defect accepted for development | Bug Report | None |
| OLD | Retired pre-greenfield historical issue | None | `legacy` exclusively |

Select the prefix according to the principal deliverable. For example, supporting documentation does not by itself make an architecture story a DOC story. Prefer a three-letter prefix when clear. Introduce a prefix only for a demonstrated need with an explicit maintainer decision that defines boundaries, native type mapping, and a corresponding label for any new development category. Labels may exist independently of prefixes. Retire obsolete prefixes without reusing identifiers.

## Label Catalog and Assignment Rules

| Name | Color | Description |
| --- | --- | --- |
| architecture | `#5319E7` | Product architecture, technical foundations, governance, and development standards. |
| documentation | `#0075CA` | Substantive documentation, requirements, contracts, and guidance deliverables. |
| testing | `#1D76DB` | Dedicated testing, verification, and quality assurance deliverables. |
| security | `#B60205` | Public security requirements, policies, hardening, and verification. |
| research | `#7057FF` | Substantive investigation, comparative analysis, or feasibility assessment. |
| legacy | `#6E7781` | Historical issue from Asterweave's retired pre-greenfield development backlog. |
| P0: critical | `#B60205` | Exceptional work requiring immediate attention due to serious impact or urgency. |
| P1: high | `#D93F0B` | Important work with significant development or product impact. |
| P2: normal | `#FBCA04` | Standard accepted development work; default priority. |
| P3: low | `#C5DEF5` | Work of comparatively lower importance or urgency. |
| disposition: accepted | `#0E8A16` | Explicitly accepted into the development backlog. |
| disposition: rejected | `#B60205` | Evaluated and explicitly declined for development. |
| disposition: duplicate | `#CFD3D7` | Substantially equivalent to another canonical issue. |
| disposition: deferred | `#FBCA04` | Consideration intentionally postponed for possible future evaluation. |
| disposition: canceled | `#6E7781` | Previously accepted development work subsequently discontinued. |
| decision required | `#D876E3` | A significant explicit maintainer decision remains outstanding. |
| blocked | `#D93F0B` | An unresolved impediment prevents meaningful progress. |
| needs information | `#0052CC` | Additional information is required from a reporter or contributor. |

- **Development and work characteristics** must follow the mandatory mappings in the prefix dictionary. Apply additional approved labels when the scope makes them materially relevant. Multiple labels may apply. Routine comments, testing, secure practices and investigation do not on their own qualify. Architecture and documentation each cover both the matching development category and relevant work under other categories. Do not inherit labels from a parent or dependency.
- **Historical provenance** must use the exclusive `legacy` label on OLD issues.
- **Priority** must be exactly one approved priority for an accepted story or confirmed and accepted defect. Use P2: normal unless the maintainer approves another priority. Epics may have zero or one priority. Do not prioritize unevaluated or unaccepted community submissions or retired issues. Priority changes require maintainer authorization. Priority expresses relative importance or urgency and does not replace severity, development order or dependencies.
- **Disposition** must be mutually exclusive. Use `disposition: accepted` for approved development and retain it on completion. Replace it with `disposition: canceled` when approved development is canceled, preserving the identifier and decision history. Provide a canonical issue reference for duplicates and explain rejection or deferral. An unevaluated submission may have no disposition. A provisional acceptance for defect investigation remains distinct from a confirmed defect accepted for development.
- **Workflow exceptions** may coexist where independently applicable. Remove each when resolved. Apply `blocked` to an actual impediment to meaningful progress. An unfinished prerequisite alone does not justify it.

Match the catalog's names, descriptions and colors in GitHub. Color aids recognition. Assign labels according to their approved meanings. Inspect usage across issues and pull requests before removing or replacing any label. Resolve assigned, conflicting or ambiguous labels before destructive changes.

## Epic and User Story Sizing

An epic must describe a coherent major objective, meaningful benefit and defined scope. Its required child outcomes determine completion under that scope. Epics do not have separate acceptance criteria or a Definition of Done. Avoid indefinite containers for whole development areas. Closing or canceling a child issue does not by itself establish that the epic's required outcome has been met.

A User Story must deliver one cohesive, independently verifiable outcome with meaningful benefit, defined scope, identifiable prerequisites, testable acceptance criteria and reviewable evidence. Technical enablers qualify. Independent verification may depend on completed prerequisites.

Consider decomposition when objectives are unrelated, deliverables have independent value, requirements need separate prior approval, prerequisites or schedules differ materially, or the criteria or evidence are too broad to review coherently. Keep implementation, documentation, testing, configuration and verification together when they support the same outcome. Size by engineering judgment, without numerical thresholds for duration, estimates, files, criteria, decisions or child stories. Reassess when material complexity emerges. Obtain approval before splitting work, adding issues, changing scope or removing criteria.

Prefer one cohesive pull request per implementation story. Work without repository changes may require no PR, and GitHub configuration may accompany a repository change separately. Multiple separately reviewable PRs are permitted when justified and authorized. Keep unrelated stories out of a shared PR.

## Canonical Issue Content and Templates

Use the required descriptive title field in each form. The tables define canonical Markdown body headings and their relative order for both forms and programmatic creation. Required sections must contain meaningful content. Include applicable optional sections and omit irrelevant ones. Material supplemental sections are permitted if they preserve canonical requirements and approved scope.

The four YAML forms may specify their corresponding native issue type where supported. An authorized creator must assign and verify the type if it cannot be set by the form. The forms must not prepopulate titles or assign labels, assignees, priorities, dispositions, milestones, projects or activation. The [chooser configuration](.github/ISSUE_TEMPLATE/config.yml) disables the ordinary blank option. GitHub may still expose it to maintainers or allow other creation paths. Add contact links only for approved, existing destinations.

### Epic

Use the [Epic form](.github/ISSUE_TEMPLATE/epic.yml) for authorized development work defining a major objective. Use a descriptive title. Authorized creation is followed by assigning EPIC, native Epic type, accepted disposition, applicable labels and authorized relationships. Priority is optional. Use the native sub-issue inventory and omit separate acceptance criteria and a Definition of Done.

| Heading | Required | Content |
| --- | --- | --- |
| Description | Yes | Context, purpose and major development area |
| Objective and Benefit | Yes | Intended major outcome and its value |
| Scope | Yes | Principal included capabilities or areas and boundaries |
| Out of Scope | No | Significant exclusions |
| Dependencies | No | Material prerequisites or external conditions |
| References | No | Relevant authoritative documents, decisions, issues or resources |

### User Story

Use the [User Story form](.github/ISSUE_TEMPLATE/user_story.yml) for authorized, independently verifiable development work. Prefer an action-oriented title. Use a single multiline User Story section with **As a / I want / So that**. Beneficiaries may be players, authors, developers, maintainers or other meaningful roles.

| Heading | Required | Content |
| --- | --- | --- |
| User Story | Yes | Beneficiary, desired capability or deliverable and benefit |
| Description | Yes | Context, purpose and intended outcome |
| Scope | Yes | Included work, deliverables and boundaries |
| Out of Scope | No | Significant exclusions |
| Requirements and Constraints | No | Applicable requirements and binding constraints, with links to governing standards where relevant |
| Dependencies | No | Prerequisite issues or external conditions and relevant rationale |
| Acceptance Criteria | Yes | Specific, objectively verifiable completion outcomes covering the approved scope |
| References | No | Authoritative documents, decisions, issues or supporting resources |

Acceptance criteria must use Markdown checklists, initially unchecked for new work. State outcomes. Describe implementation details only when they are themselves approved requirements. Evidence may include tests, documentation, configuration or architecture checks as appropriate. Use native parent relationships. The form has no separate parent, category, estimates, implementation plan or Definition of Done fields. After authorized creation, assign the applicable approved prefix and GitHub-derived suffix, User Story type, mandatory and materially relevant labels, one priority, accepted disposition and authorized relationships.

### Bug Report

Use the [Bug Report form](.github/ISSUE_TEMPLATE/bug_report.yml) to report an actual or suspected defect. Version is a single-line input. Other body fields use textareas. Unknown versions and intermittent problems can be described honestly.

| Heading | Required | Content |
| --- | --- | --- |
| Description | Yes | Problem and context |
| Version | Yes | Affected version, build, branch or commit, or an honest unknown |
| Steps to Reproduce | Yes | Actions and conditions leading to the problem, including intermittent circumstances when applicable |
| Expected Behavior | Yes | Reasonably expected result and relevant documented behavior |
| Actual Behavior | Yes | Observed result, relevant errors or unexpected behavior |
| Environment | No | Relevant host, operating system, browser, runtime or execution environment |
| Supporting Evidence | No | Sanitized diagnostics, screenshots, non-sensitive sample content or minimal reproduction |
| Additional Information | No | Frequency, regression, impact, workaround, related issues or context |

Reporters do not need to diagnose the issue, propose fixes or provide formal acceptance criteria. Initial reports retain a descriptive title and Bug Report type, pending evaluation.

### Feature Request

Use the [Feature Request form](.github/ISSUE_TEMPLATE/feature_request.yml) to propose a capability or improvement. Focus on the need, desired outcome and benefit. Contributors may suggest implementation ideas for evaluation.

| Heading | Required | Content |
| --- | --- | --- |
| Description | Yes | Concise overview of the proposed capability or improvement |
| Problem or Need | Yes | Limitation, problem or unmet need |
| Proposed Capability | Yes | Desired behavior, capability or outcome |
| Expected Benefit | Yes | Who benefits and why |
| Use Cases | No | Illustrative usage scenarios |
| Alternatives Considered | No | Known approaches, alternatives or workarounds |
| Additional Information | No | Context, examples, resources and related issues |

Initial requests retain a descriptive title and Feature Request type, pending evaluation. Reporters do not need to supply technical designs, approved scope, dependencies, development metadata or formal acceptance criteria.

Both community forms should encourage duplicate searching without a mandatory declaration. Request only necessary information. Instruct contributors to keep credentials, private content, personal information and sensitive security vulnerability details out of public submissions. Use applicable approved security reporting guidance when established. Maintainer-oriented forms should direct community proposals to Feature Request.

## Human and Programmatic Issue Creation

1. Establish the benefit, scope and requirements. Inspect relevant open and closed issues for duplicates or overlaps, applicable parent epics and prerequisites.
2. Propose the canonical body, classification, prefix where applicable, labels and relationships. Obtain explicit maintainer authorization for development issue creation and associated metadata. A defined batch may be approved together.
3. Create through the applicable form or an equivalent programmatic body. Use clear English Markdown for authoritative development issues. Preserve canonical headings and substantive content. Incidental GitHub-generated formatting may differ. Required sections must be complete and free of unresolved placeholders.
4. Assign the custom identifier after GitHub assigns the number, when applicable. Complete the approved native type, labels, priority, disposition and authorized relationships.
5. Independently retrieve, verify and report the result. Report actual identifiers, links and limitations.

Issue form validation checks presence. The creator must still ensure the submission is substantive. Community submissions remain descriptive and unprioritized pending evaluation, with applicable native types. Creation does not authorize activation or implementation.

## Community Submission and Promotion Principles

- **Feature requests.** Promote accepted work in place as a User Story for a cohesive deliverable or an Epic for a major objective. Preserve the original GitHub issue and URL, proposal, contributor attribution and discussion. If restructuring, keep the original material traceable and preserve the original descriptive title when substantially changed. Record approved reclassification and link related issues. For partial acceptance, document the portions excluded or deferred and use the target type's canonical content and approved metadata.
- **Defects.** Acceptance can authorize investigation. For a confirmed and accepted defect, verify the expected behavior against approved requirements, record findings as appropriate, add bounded resolution scope and verifiable acceptance criteria, and assign BUG, one priority, accepted disposition and materially relevant labels. Keep the Bug Report type and preserve the original submission, attribution and discussion. If investigation does not confirm a defect, close with an explanatory findings comment when authorized. No separate confirmation label applies.
- **Duplicates and decomposition.** Choose a canonical issue based on the suitability of its description, evidence and discussion. Apply duplicate disposition and reference that canonical issue on equivalent submissions. Distinct accepted requests under one initiative may be independently promoted and associated as native sub-issues of an approved epic. Create new issues only for genuinely distinct approved deliverables. Misclassified submissions may be reclassified in place. Departures from in-place promotion require explicit maintainer authorization.

## Legacy Issue Classification

Assign `[OLD-#####] Title` with the actual GitHub issue number, preserving the original descriptive title. Use `legacy` exclusively and leave the native type unassigned. Preserve identity, URL, issue body, existing comments, attribution, dates, assignees, milestones, relationships, closed state and closure reason. Retain traceability for changed identifiers in the applicable issue evidence.

Retirement is permanent. Historical issues are exempt from current form, native type, acceptance criteria, Definition of Done, development label, priority, workflow and retrospective epic or dependency requirements. Do not reopen or promote them. Newly approved greenfield work may reference relevant historical issues. Historical requirements and implementation do not carry forward automatically.

## Verification and Failure Handling

Independently retrieve the resulting issue and verify applicable identity, title, number, type, canonical content, acceptance criteria, label assignments, priority, disposition, relationships and absence of unintended metadata. For legacy work, apply the historical rules and verify preservation. Report successful checks and any missing evidence or unresolved metadata.

Creation, configuration and metadata changes may succeed independently. If a result is uncertain, inspect actual state before retrying. Preserve successfully created issues and valid completed changes when a later operation fails. Use an authorized supported mechanism to reconcile the existing issue. Request maintainer assistance where necessary. Native classification must remain authoritative when a tool cannot assign it. Do not create replacements for partial failures or claim conformity before verification.

Use native form validation, pre-creation review and independent verification. Confirm GitHub schema and live chooser behavior before claiming operational form conformity. Introduce no additional project dependencies, validation infrastructure or automation without approval.

## Maintenance and Evolution

ISSUE_MANAGEMENT.md is the authoritative living issue management standard. Native types, labels, forms and chooser configuration must conform. Material changes to classifications, identifiers, prefixes, label definitions, canonical content or other governing requirements require explicit maintainer approval and a documented rationale.

Assess effects on standards, [AGENTS.md](AGENTS.md), forms, configuration, active issue metadata, links and downstream work. Update only affected artifacts in scope. Maintain agent instructions incrementally through authoritative references and concise operational guidance. Reconcile supersession and surface conflicts, partial implementation and temporary discrepancies. Update and independently verify affected links on renaming, relocation or retirement.

Keep decision history, implementation evidence and material downstream handoffs in applicable issues. Subsequent work must inspect relevant predecessor requirements and handoffs. Independently verify affected documentation and configuration before claiming conformity. Report limitations and obtain approval before introducing additional governance tooling or automation.
