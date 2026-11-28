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
10. [Issue Intake and Triage](#issue-intake-and-triage)
11. [Community Submission and Promotion Principles](#community-submission-and-promotion-principles)
12. [Issue Lifecycle and Native Statuses](#issue-lifecycle-and-native-statuses)
13. [Activation and Backlog Management](#activation-and-backlog-management)
14. [Prioritization](#prioritization)
15. [Epic Relationships, Dependencies and Sequencing](#epic-relationships-dependencies-and-sequencing)
16. [Milestones and Projects](#milestones-and-projects)
17. [Progress Reporting and Verification Evidence](#progress-reporting-and-verification-evidence)
18. [Critical Decisions and Scope Amendments](#critical-decisions-and-scope-amendments)
19. [Definition of Done](#definition-of-done)
20. [Story Completion, Cancellation and Reopening](#story-completion-cancellation-and-reopening)
21. [Epic Completion and Closure](#epic-completion-and-closure)
22. [Legacy Issue Classification](#legacy-issue-classification)
23. [Verification and Failure Handling](#verification-and-failure-handling)
24. [Maintenance and Evolution](#maintenance-and-evolution)

## Purpose and Scope

GitHub Issues are Asterweave's authoritative development backlog. This standard governs issue classification, identifiers, labels, sizing, canonical content, creation, lifecycle, workflow and completion for maintainers and human and AI contributors. It covers community submissions, accepted development work and permanent historical classification.

## Authority and Governing Principles

| Source | Authority |
| --- | --- |
| [LICENSE](LICENSE) | Licensing |
| [README.md](README.md) | Project overview |
| [LANGUAGE_RUNTIME_STANDARDS.md](LANGUAGE_RUNTIME_STANDARDS.md) | Language, runtime, portability and dependencies |
| Issue Management | Issue management, lifecycle, workflow and completion |
| [AGENTS.md](AGENTS.md) | AI contributor instructions and navigation to authoritative references |
| GitHub Issues | Approved scope, acceptance criteria, decisions and implementation evidence |
| Native GitHub metadata | Actual issue identity, classification, state, status, closure reason and relationships |
| GitHub label configuration, forms and chooser settings | Operational implementation of this standard |

Apply explicitly approved supersession. Distinguish approved requirements, implemented behavior and verified results. Raise conflicting or ambiguous authority for maintainer resolution. A timestamp or individual issue cannot silently override an applicable standard.

Human and AI contributors may inspect, research, discuss and propose work without separate approval. Maintainers retain approval authority. Obtain explicit maintainer authorization for development issue creation, community disposition, defect investigation, promotion or material reclassification, activation, material changes to priorities, scope, criteria or relationships, significant requirements or architectural decisions, repository or configuration implementation, PR creation, merge, cancellation, reopening and closure.

A maintainer may authorize a defined batch, including agreed metadata and relationships. Routine execution, approved decision recording, reporting, verification and checking criteria actually verified under that authorization require no repeated approval. Surface material discoveries, risks or conflicts before exceeding scope. Acceptance, assignment, priority, disposition, status and form selection confer no implementation authority. Activation may begin design. Design approval, implementation, PR creation, merge and closure are distinct authorization gates.

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

## Issue Intake and Triage

Use the approved type and creation path. Approved major objectives enter as Epics and cohesive development deliverables as User Stories. Actual or suspected defects enter as Bug Reports and proposed capabilities or improvements as Feature Requests, regardless of reporter. Maintainer-directed approved work needs no redundant community triage.

For unevaluated submissions, consider classification, information sufficiency, duplicates among open and closed issues, project alignment, benefit and impact, feasibility, material constraints and dependencies, sensitive information and proposed disposition. A maintainer or authorized contributor may triage. The maintainer approves final disposition. Record material findings and rationale, preserve attribution and link the canonical issue for duplicates. A submission may remain without a disposition until evaluated. Assign priority only to eligible work and obtain separate activation authorization.

Use `needs information` for missing information and `decision required` for a significant outstanding maintainer decision. Remove these independent exceptions when resolved. Follow approved security reporting guidance when available. Escalate sensitive information to the maintainer and keep sensitive vulnerability details out of public requests and reports.

## Community Submission and Promotion Principles

### Feature evaluation and promotion

Evaluate need, beneficiaries and benefit, project objectives and approved architecture, feasibility, constraints, prerequisites, scope and overlap. Technical solutions from reporters are optional. Obtain approval for the development scope, requirements, target classification and metadata before promotion. Promote accepted requests in place to User Story for a cohesive deliverable or Epic for a coherent major objective. For partial acceptance, record excluded or deferred functionality. Rejected and deferred requests retain Feature Request classification and a recorded rationale. Link a duplicate to the canonical issue selected for its description, evidence and discussion.

Before restructuring, preserve the substantive proposal in a traceable body section or comment and preserve the original descriptive title when substantially changed. Keep the issue number, URL, attribution and discussion. Apply the target type's canonical content, approved prefix and number-derived suffix, accepted disposition, relevant labels, applicable relationships and priority rules. Stories require testable acceptance criteria. Obtain separate activation authorization. Add issues only for genuinely distinct approved deliverables. Departures from in-place promotion require explicit approval.

Independently verify identity and preserved history, approved scope, native type, identifier, canonical content, applicable criteria and metadata, and absence of unintended activation. Reconcile partial changes on the existing issue.

### Defect investigation and development acceptance

Use the existing Bug Report for investigation and correction. Suspected defects have descriptive titles without BUG identifiers or development priority. Investigation requires explicit authorization and may have provisional acceptance. Obtain separate approval for corrective development after confirmation.

Compare observed behavior with approved requirements and clarify ambiguous expectations. Review version, branch or commit, runtime and environment, reproduction or credible diagnostics, impact, regression, related defects and sensitive information. Sufficient credible evidence can confirm intermittent defects. Failure to reproduce alone does not disprove a report. Record severity as impact in findings, independently of development priority.

Record findings and rationale for acceptance, deferral or rejection. Request evidence, defer or propose closure when inconclusive. Explain expected behavior, link canonical duplicates and seek authorization for in-place reclassification if the report is an enhancement. For unconfirmed closure, record evidence, checks, limitations and rationale. Represent correction as complete only with verified correction evidence.

On corrective development acceptance, retain Bug Report type and the original report, attribution and discussion. Apply BUG and the GitHub-derived suffix, findings, bounded corrective scope, verifiable criteria, accepted disposition, one approved priority, materially relevant labels and applicable relationships. Apply the [Definition of Done](#definition-of-done). Obtain separate activation and implementation authorization. Independently verify preservation, findings, approved scope, criteria and metadata. Use the original issue to reconcile partial failures.

## Issue Lifecycle and Native Statuses

Native status records workflow stage, issue state records whether an issue is open or closed, closure reason describes why it closed, and disposition records the maintainer's evaluation or development decision.

| Managed native status | Meaning |
| --- | --- |
| Backlog | Open and awaiting evaluation, activation or resumption. |
| In progress | Open and undergoing authorized investigation, design, implementation or verification. |
| Done | Closed after verified successful completion and explicit authorization. |
| Not planned | Closed without successful development completion. |

New issues enter Backlog. Authorized activation or resumption moves an issue to In progress. Authorized suspension returns it to Backlog. Successful authorized closure moves In progress to Done and retains accepted disposition. Apply the approved closure reason and status for authorized non-completion closure. Authorized reopening returns a closed issue to Open / Backlog. Issues may skip stages where appropriate. Independently verify automatically applied status and closure metadata. Follow [closure and reopening rules](#story-completion-cancellation-and-reopening).

The `blocked`, `decision required` and `needs information` labels are independent exceptions. Routine interruptions, blockers or pending decisions do not move active issues to Backlog. Active epics remain In progress during child delivery and intervals between stories, subject to explicit suspension or closure.

GitHub also exposes Todo for queued work, In review for active review and Duplicate as a native closure outcome. GitHub can change an issue's native status automatically, including through assignment or pull request linking. A native status or automatic transition conveys no maintainer authorization. Apply the approved [closure and reopening rules](#story-completion-cancellation-and-reopening) and report any mismatch with native behavior.

Use the shared repository Issues view [Active work](https://github.com/ja-sanborn/asterweave/issues/views/MDQ6VmlldzM0NTQ2) with `is:issue is:open category:started`. It includes In progress and In review across classifications, priorities and workflow exceptions. GitHub's built-in Active tab also includes Todo. Verify the shared view's saved query and results. Report a discrepancy for maintainer resolution before changing configuration. Avoid duplicate status labels and project workflow automation.

## Activation and Backlog Management

Accepted Epics, User Stories and confirmed and accepted Bug Reports constitute accepted development work. Investigation-only Bug Reports and unevaluated or deferred submissions remain outside that development backlog. Keep GitHub Issues as the authoritative backlog.

Before development activation, verify open and accepted state, classification, identifier and metadata, sufficient objective and scope, applicable criteria, satisfied prerequisites, approved sequence, relevant predecessor decisions and handoffs, material blockers or conflicts and the applicable open, appropriately active parent. For investigation activation, verify investigation authorization and relevant prerequisites without treating it as corrective development acceptance. Obtain explicit activation authorization, set In progress, and activate the parent if required and authorized. Independently verify the issue and applicable parent in the shared Active work view before beginning authorized work. Record material exceptions, decisions or order changes. Routine activation may be evidenced by native metadata.

Prefer focused sequential work, especially during foundation development. Authorized independent parallel work, urgent defect interruptions and investigations alongside development are permitted. Evaluate alternatives when active work is blocked. Assignment is optional and identifies coordination or performance responsibility. No fixed work-in-progress limit, sprint target or mandatory assignment applies.

For authorized suspension, return to Backlog and record the reason, completed and outstanding work, relevant branches or artifacts and resumption conditions. Preserve scope, criteria and evidence. Review intervening changes and prerequisites before authorized resumption. Report tooling limits and use an authorized native mechanism or ask the maintainer for assistance.

## Prioritization

Use the approved priority meanings and eligibility in the [label catalog](#label-catalog-and-assignment-rules). P2 is the default for eligible work requiring a priority. Investigation-only defects, unaccepted submissions and retired issues receive no priority. Do not inherit priority from a parent or prerequisite.

Evaluate impact, urgency, consequences of delay, project alignment, enabled work, security, reliability, integrity and development risk, workarounds and applicable commitments. Use qualitative judgment. Priority describes importance or urgency. Dependencies establish prerequisites, sequence records execution order, severity describes defect impact, status records workflow stage and authorization controls what may proceed. Escalate conflicts and trade-offs to the maintainer. Higher-priority dependent work cannot override prerequisites.

Reassess after material changes in risk, requirements, impact, dependencies or objectives. Obtain approval, replace the previous label, record material rationale and sequencing consequences, and independently verify the result. Priority changes do not automatically activate, suspend or reorder work. P0 warrants prompt maintainer attention and possible interruption of scheduled work while retaining prerequisites, authorization and completion requirements. Apply sensitive issue handling where applicable.

## Epic Relationships, Dependencies and Sequencing

Use native sub-issues as the authoritative inventory of work contributing to an epic's approved objective and scope. Standalone stories and accepted defects are permitted. Obtain approval for material additions, removals or reassignments. Preserve historical relationships and decision evidence. Common parentage implies no dependency.

Use native **Blocked by** and **Blocking** for genuine direct issue prerequisites, including cross-epic or epic prerequisites where supported. Document meaningful rationale, external conditions and prerequisites the native relationship cannot represent. Avoid parallel inventories, transitive duplication and dependencies based solely on preferred order. Prohibit self-dependencies and cycles. Retain completed links for traceability. Verify successful prerequisite completion or an explicitly approved alternative meeting the dependent requirements. Use `blocked` only for an actual impediment to meaningful progress.

Record significant approved sequence and revisions in applicable issue comments. Keep relative priority, prerequisites and chosen execution order distinct. Obtain approval for material dependency changes. Verify endpoints, direction, completeness, consistency with the approved order and absence of unintended edges or cycles. Reconcile written prerequisites only after separately verifying the corresponding native links. Retain written information for unresolved links and report the limitation.

## Milestones and Projects

Native issues, epics, relationships, statuses, views, priorities, approved sequencing and acceptance criteria meet current foundation planning needs. Defer new milestones, assignments, Projects, custom planning fields, iterations and planning automation. Preserve existing configuration and Projects availability.

Milestones may group work around a release, time-bound commitment or delivery checkpoint across epics. Projects may supplement cross-repository planning, multi-contributor coordination, roadmap visualization or complex views. Reconsider adoption when a demonstrable need arises, assess effects on this standard and obtain explicit approval. GitHub Issues govern the backlog, requirements, decisions and evidence. Milestone or Project progress does not establish acceptance, Definition of Done conformity or epic closure.

## Progress Reporting and Verification Evidence

The issue body records approved requirements, scope and criteria. Use issue comments for significant progress, approved decisions, evidence and final outcomes. Use native metadata for actual issue state and relationships, commits for version-controlled changes, PRs for proposals and review, and automated runs for available execution evidence. Link to existing evidence. Keep critical decisions and outcomes in GitHub Issues.

Report significant milestones, blockers or partial failures, verification, implementation references, PR creation and checks, merge and resulting state, post-merge verification, final acceptance and suspension or cancellation. Consolidate related events. Include applicable deliverables, branch or configuration, criteria addressed, actual checks and results, evidence, limitations and unresolved deviations. Keep credentials, sensitive vulnerability details and unauthorized private information out of public records.

Match evidence to the deliverable. Review documentation and links, independently retrieve native metadata and configuration, verify operational behavior, exercise source and architecture requirements, test defect corrections and regressions, verify compatibility in applicable environments and record research findings and limitations as appropriate. Preserve reproducibility evidence. Distinguish proposed, approved, implemented, verified, merged and completed work.

| Result | Meaning |
| --- | --- |
| Passed | Sufficient evidence shows successful verification. |
| Failed | The check or requirement did not succeed. |
| Incomplete | Partial evidence is insufficient. |
| Not performed | An applicable check was not executed. |
| Not applicable | The requirement genuinely falls outside the deliverable or scope. |

Independently retrieve resulting state after a mutation and compare it with approved requirements. Use separate evidence and follow any additional applicable independence requirements. Check criteria only when satisfied and verified within authorized scope. Leave insufficiently verified criteria unchecked. Document invalidated evidence and correct affected completion tracking with applicable authorization.

## Critical Decisions and Scope Amendments

Record critical or final approved decisions affecting requirements, architecture, standards, significant technical choices or dependencies, repository configuration, scope or criteria, sequencing, community disposition, cancellation or reopening, approved exceptions or final acceptance. Routine choices, editorial work and tentative discussion do not require separate records.

Identify the decision, authority, constraints, alternatives, risks and trade-offs. Obtain explicit approval, including conditions, and record the approved outcome, relevant rationale, affected requirements, supersession, handoffs and authorization boundaries in the applicable issue. Independently verify the record. Assess affected artifacts and downstream work before separately authorized implementation. Preserve superseded decisions and link the approved replacement. Reconcile the current issue, standards and configuration within scope. Until approved ADR conventions exist, retain architectural decisions in applicable issues and incorporate approved requirements into authoritative documents when authorized.

Editorial corrections and ordinary choices within approved constraints may proceed. For material changes to deliverables, behavior, criteria, constraints, prerequisites or disposition of approved work, assess effects on risks, dependencies, completed work and criteria. Obtain explicit approval, record rationale, reconcile current artifacts and independently verify. Address necessary in-scope corrections. Raise missing requirements, conflicting authority, unrelated suspected defects, independent improvements or future prerequisites for maintainer resolution before expanding work or creating issues. Never weaken criteria to claim completion.

## Definition of Done

Apply all applicable obligations to accepted User Stories and confirmed and accepted Bug Reports. Story acceptance criteria, applicable authoritative standards and this Definition of Done all apply without duplicating them in issue bodies or templates. Epics follow [epic closure requirements](#epic-completion-and-closure). Investigation-only reports and unevaluated submissions follow intake, investigation and disposition rules. Retired OLD issues are exempt.

1. **Authorization and scope.** Work stays within explicit authorization. Material requirements, decisions, amendments and exceptions are approved and recorded.
2. **Deliverable completion.** Complete every approved deliverable. Obtain approval and reconcile any change to requirements or deferral.
3. **Acceptance criteria.** Satisfy and independently verify applicable story criteria and accurately record completion.
4. **Standards conformity.** Meet applicable approved policies, requirements, architectural constraints and technical standards.
5. **Quality and verification.** Perform applicable verification successfully with sufficient evidence for the deliverable and scope.
6. **Documentation and instructions.** Review affected authoritative documentation, references and contributor instructions and update them as required.
7. **Licensing and attribution.** Preserve applicable licensing requirements, copyright notices and creator and contributor attribution.
8. **Security and information protection.** Satisfy approved applicable security requirements and protect credentials, sensitive information and unauthorized private content from introduction or disclosure.
9. **Repository and configuration integrity.** Verify authorized changes in the intended repository, branch or configuration and preserve unrelated files, settings, protections and work.
10. **Evidence and traceability.** Record significant progress, approved decisions, applicable implementation references and verification results in the relevant issue.
11. **Limitations and exceptions.** Disclose applicable exceptions and limitations and resolve any requirement or verification failure that prevents completion.
12. **Final acceptance and closure readiness.** Independently review and evidence final completion requirements before requesting explicit closure authorization.

Apply this standard, the project [license](LICENSE), the [language and runtime standards](LANGUAGE_RUNTIME_STANDARDS.md), [AI contributor instructions](AGENTS.md) where applicable, and approved issue records. Applicable technical work follows standard ECMAScript and native ESM, finalized features supported by the applicable environments, the approved Node.js 26.x LTS development runtime, engine platform independence, boundary runtime validation, zero third-party engine runtime dependencies, explicit approval of permitted application or development dependencies, and evidence-backed compatibility claims. Use existing approved standards for applicable work.

Match verification to the deliverable. Documentation requires content and reference checks. Research may require neither a commit nor a PR. Source, testing, licensing, repository and PR checks apply as relevant. Disclose limitations. Required Failed, Incomplete and Not performed checks prevent successful completion. Use Not applicable only for checks genuinely outside applicable scope. For an exception within maintainer authority, record the approved requirement, rationale, consequences, alternative or conditions, and any required follow-up. Obtain explicit approval and formally reconcile affected standards, scope or criteria where needed. Exceptions cannot waive licensing or obligations outside maintainer authority or substitute for evidence.

Review this section and its references as governing requirements evolve. Preserve valid historical completions. Separately authorize any retrospective conformity work. Verify final readiness and record evidence before requesting closure.

## Story Completion, Cancellation and Reopening

Successful completion requires all approved deliverables, applicable criteria, standards and the [Definition of Done](#definition-of-done), with required changes incorporated in the intended target. Independently verify, record final acceptance evidence and limitations, and obtain explicit closure authorization. Close as Completed, retain accepted disposition and independently verify Closed / Completed / Done. A checked checklist, passed tests, merge or closing keyword cannot substitute for closure authorization.

| Authorized closure outcome | Closure reason | Approved status | Disposition |
| --- | --- | --- | --- |
| Successful development | Completed | Done | accepted |
| Canceled accepted work | Not planned | Not planned | canceled |
| Rejected community submission | Not planned | Not planned | rejected |
| Duplicate with canonical reference, where native Duplicate closure is supported | Duplicate | Duplicate | duplicate |
| Duplicate with canonical reference, where native Duplicate closure is unavailable | Not planned | Not planned | duplicate |
| Closed deferred community submission | Not planned | Not planned | deferred |
| Concluded unconfirmed investigation or expected behavior | Not planned | Not planned | rejected |

For a concluded investigation, rejection records nonacceptance for corrective development. Independently verify the closure reason, native status and disposition. For duplicates, verify the canonical issue reference and the native relationship where supported. Surface discrepancies for maintainer resolution. Close only with explicit authorization.

Before cancellation, assess rationale, completed and outstanding deliverables, branches or PRs, dependent work, parent objectives and reassignment. Record the approved decision, retain the identifier, classification, historical evidence and criteria, and leave unfinished criteria unchecked. Continued accepted work may be suspended in Open / Backlog / accepted. A deferred community proposal may remain Open / Backlog or close as Not planned as approved, retaining deferred disposition.

When work is partial, obtain approval to continue, suspend, amend scope, split distinct remaining work with reconciled dependencies, or cancel while preserving evidence. Successful completion after an amendment requires formal scope reconciliation and verification of the revised requirements.

Consider reopening if prior completion was invalid, canceled work is reconsidered, new evidence or changed requirements warrant reevaluation or investigation, or a duplicate is materially distinct. Review prior closure, evidence, requirements, dependencies and parent. Compare with creating a new issue. Prefer a new Bug Report for a later regression, a new Feature Request or authorized story for a new capability, and separately authorized conformity work for later standards. Retired OLD issues remain closed.

Before reopening, obtain explicit authorization and record rationale and approved changes. Restore Open / Backlog and reconcile disposition and applicable metadata. Preserve identifier, attribution and history, reassess criteria and correct invalidated evidence. Independently verify the result. Obtain separate activation and implementation authorization. For canceled or reopened prerequisites, reassess dependent work, prior evidence and parent outcomes. Obtain applicable approval before modifying related issues.

## Epic Completion and Closure

Epics define objectives, benefit, scope and dependencies. Use native child relationships to identify contributing work. Detailed acceptance criteria and the Definition of Done apply to eligible child development work. Epics use these five closure requirements.

1. All required child stories and accepted defects satisfy applicable completion requirements and are closed as Completed.
2. Canceled, deferred, superseded or reassigned child work has explicit maintainer-approved disposition and leaves no required epic outcome unsatisfied.
3. Verified collective outcomes achieve the approved objective, benefit and scope, including approved amendments.
4. No outstanding prerequisite, missing required deliverable or material unresolved issue prevents the objective from being achieved.
5. Final completion evidence is reviewed and recorded, and the maintainer explicitly authorizes closure.

Independently retrieve native child relationships, verify child outcomes and dispositions, and assess scope, dependencies and objectives. Use actual outcomes as evidence. Assess missing outcomes after cancellation, treat suspended required work as outstanding, reconcile approved deferral, verify replacement outcomes, assess reassignment effects and revisit prior evidence when work reopens. Native child completion percentages indicate progress.

Record achieved objectives and scope, verified child outcomes, approved non-completion dispositions, satisfied dependencies, limitations and their impact, and readiness. Reference child evidence. After explicit authorization, close as Completed, retain accepted disposition and independently verify Done.

Apply the story rules for cancellation, suspension and reopening and assess effects on the objective and child work. Evaluate continuation, cancellation or reassignment of children during epic cancellation, active children during suspension, and required child outcomes when scope changes. Reassess prior epic completion when the epic or a child reopens. Obtain applicable authorization before changing related issues.

## Legacy Issue Classification

Assign `[OLD-#####] Title` with the actual GitHub issue number, preserving the original descriptive title. Use `legacy` exclusively and leave the native type unassigned. Preserve identity, URL, issue body, existing comments, attribution, dates, assignees, milestones, relationships, closed state and closure reason. Retain traceability for changed identifiers in the applicable issue evidence.

Retirement is permanent. Historical issues are exempt from current form, native type, acceptance criteria, Definition of Done, development label, priority, workflow and retrospective epic or dependency requirements. Do not reopen or promote them. Newly approved greenfield work may reference relevant historical issues. Historical requirements and implementation do not carry forward automatically.

## Verification and Failure Handling

Independently retrieve the resulting issue and verify applicable identity, title, number, type, canonical content, acceptance criteria, label assignments, priority, disposition, relationships and absence of unintended metadata. For legacy work, apply the historical rules and verify preservation. Report successful checks and any missing evidence or unresolved metadata.

Creation, configuration and metadata changes may succeed independently. If a result is uncertain, inspect actual state before retrying. Preserve successfully created issues and valid completed changes when a later operation fails. Use an authorized supported mechanism to reconcile the existing issue. Request maintainer assistance where necessary. Native classification must remain authoritative when a tool cannot assign it. Do not create replacements for partial failures or claim conformity before verification.

Use native form validation, pre-creation review and independent verification. Confirm GitHub schema and live chooser behavior before claiming operational form conformity. Introduce no additional project dependencies, validation infrastructure or automation without approval.

For workflow changes, capture the baseline and approved requirements. Verify documentation and references on the working branch, independently retrieve native relationships and verify corresponding written reconciliation, and check actual native configuration and operational behavior. Compare the scope, settings, protections, histories, forms and metadata to baseline. Verify the proposed change set before merge and independently check the target and persisted metadata after authorized merge. Record acceptance evidence and applicable completion requirements before seeking closure.

Use existing operational evidence where sufficient. Obtain explicit approval for any necessary controlled lifecycle test and preserve legitimate issues and historical development outcomes. Report inaccessible configuration, gaps and partial results using the [verification result terms](#progress-reporting-and-verification-evidence).

## Maintenance and Evolution

ISSUE_MANAGEMENT.md is the authoritative living issue management, workflow and completion standard. Native metadata, label configuration, forms and chooser settings must conform. Obtain explicit maintainer approval and record rationale for material changes to classifications, identifiers, labels, content, workflow, completion or other governing requirements.

When approved governing requirements are established or revised, assess effects on authoritative standards, lifecycle, the [Definition of Done](#definition-of-done), [AGENTS.md](AGENTS.md), contributor guidance, forms, configuration, issue metadata, index and references, and downstream work and dependencies. Update only affected artifacts within scope. Use concise agent instructions and authoritative references. A reference may be sufficient for a new standard. Update and independently verify affected links on renaming, relocation or retirement. Reconcile approved supersession and report temporary discrepancies or partial implementation.

Record material handoffs, approved decisions and implementation evidence in the originating issue. Inspect relevant predecessor requirements and handoffs before subsequent work. Any material receiving-scope amendment requires authorization. Maintain the Definition of Done in this document. A central index provides navigation when established. Independently verify documentation and configuration before claiming conformity. Obtain approval before introducing governance tooling or automation.
