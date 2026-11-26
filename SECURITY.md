# Security Policy

## Supported Versions

Asterweave Interactive Fiction Engine is currently in initial development and has no supported production releases. Security fixes will be considered for the current development branch on a best-effort basis. A release support policy will be established when stable releases become available.

## Reporting a Vulnerability

Please do not open public GitHub issues for security vulnerabilities.

Use [GitHub Private Vulnerability Reporting](https://github.com/ja-sanborn/asterweave/security/advisories/new) to report suspected vulnerabilities privately. Include a description, reproduction steps, affected versions or commit IDs, potential impact, and suggested mitigations if available. Do not include credentials or unrelated personal data.

## Security Scope

The technical [security model](docs/contracts/SECURITY_MODEL.md) and [ADR 0066](docs/decisions/0066-security-and-trust.md) define engine and host trust boundaries, data safety and resource ownership. This policy governs vulnerability reporting and supported-version policy.

Relevant concerns include unsafe handling of game definitions and save files, unintended execution of untrusted content, state validation failures with security impact, and security issues in hosts, authoring tools and extensions maintained by this project.

Executable JavaScript extensions are trusted code, not sandboxed data. Offline game packages and saves are not designed to prevent players from inspecting or modifying their own local content. Future online hosts must enforce authentication, authorization, server-authoritative state and appropriate message privacy.

## Response Process

- As a sole maintainer, I aim to acknowledge reports within 48 hours, but responses may take up to a week or longer.
- Confirmed vulnerabilities will be assessed and fixes prioritized according to impact and available resources.
- Disclosure and any public advisory will be coordinated with the reporter where appropriate. No fixed remediation deadline is guaranteed.

Thank you for helping keep Asterweave safe for everyone.
