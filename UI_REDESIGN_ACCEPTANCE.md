# UI Redesign Acceptance Checklist

This is the review checklist for the Google AI Studio prototype. Do not edit production code to satisfy this checklist during the first iteration.

## Safety / isolation
- [ ] Prototype is in an isolated directory; existing production app remains unchanged.
- [ ] No edits to server.ts, systemd, packaging, deployment scripts, or real Splunk configuration.
- [ ] No real IP targets, secrets, keys, tokens, or API calls.
- [ ] Persistent “DEMO DATA / NOT CONNECTED” indicator appears in the prototype.
- [ ] Every scan/install/CLI action is local simulation only.

## Workflow and navigation
- [ ] Discovery is the first landing page and simulates startup discovery.
- [ ] Controller is shown separately and excluded from the neighbor count.
- [ ] Topology is a dedicated page after the discovery sequence.
- [ ] Exactly two primary topology next steps are visible: Develop Architecture and Current Splunk Health & Diagnostics.
- [ ] Current Environment and Target Design have separate graph/state models.
- [ ] Five primary navigation sections are consistent and functional.

## Discovery evidence
- [ ] Scope is visible and reviewable before a real implementation would scan.
- [ ] Hosts, reachable hosts, open ports, observed connections, config-derived links, inferred links, and unknown items are distinct.
- [ ] Every edge exposes source/provenance and verification state.
- [ ] No claim of full-network connection visibility based solely on one host’s local sockets.
- [ ] Loading, partial, error, cancellation, retry, and empty states exist.

## Architecture Studio
- [ ] Component palette supports adding/selecting/removing sample components.
- [ ] OS/release, sizing, hardening, Splunk role/version, dependencies, and ports have fields or a clear extension point.
- [ ] Conf editor has structured forms and raw config preview.
- [ ] CLI commands are preview-only.
- [ ] Sample compatibility and sizing data is labeled and not falsely certified.
- [ ] Target design changes do not mutate the discovered/current topology.
- [ ] Diff, validation, unsaved-change, and local-save states exist.

## Current Splunk Health
- [ ] Separate tabs for overview, services/versions, configuration audit, logs/errors, network/connections, tool health, reports/history.
- [ ] Missing data, API failures, and insufficient permission never show green/healthy.
- [ ] Every finding can expose evidence/source and next action.
- [ ] No random latency, fabricated success, or ungrounded compliance score.

## Installation & execution
- [ ] Target inventory and preflight steps are visible.
- [ ] Authentication, least privilege, RBAC, permitted network scope, and audit are represented.
- [ ] Docker/Kubernetes operations are planned, not executed.
- [ ] Dry-run, approval, backup/rollback, progress/logs, and audit states exist.
- [ ] No unauthenticated shell or Docker API pattern is suggested.
- [ ] Privileged-looking actions require an explicit confirmation UI and remain simulated.

## Quality
- [ ] Persian RTL and English LTR modes work.
- [ ] Desktop/tablet responsiveness is acceptable.
- [ ] Buttons, tabs, filters, dialogs, and navigation work.
- [ ] Mock UI derives from one typed data source.
- [ ] Build/lint checks run where available, and remaining limitations are documented.
