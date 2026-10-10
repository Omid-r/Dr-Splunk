# Google AI Studio Build Prompt — Splunk Doctor UI Redesign

Use this file as the build brief for Google AI Studio. Work from the repository branch `feat/ai-studio-ui-redesign-brief`.

## Your role

Act as a senior enterprise UX architect, React/TypeScript engineer, Splunk architect, network observability engineer, and security-minded product designer.

## First: inspect the repository before editing

This repository is an existing Splunk Doctor application. Inspect at minimum:

- `src/App.tsx`
- `src/index.css`
- `src/main.tsx`
- `src/types.ts`
- `package.json`
- `server.ts`
- `scripts/build-rhel-package.js`

Map the current pages, navigation, shared components, API calls, loading/error states, and configuration/health functionality. Do not assume that a visible widget is connected to real telemetry. Do not remove or silently change any current API contract.

## Critical scope and safety boundaries

For the first design iteration, create an **isolated UI prototype** under `ui-redesign/` (or another clearly isolated prototype directory agreed by the developer). Keep the existing production application and backend intact.

- Do not edit `server.ts`, backend routes, deployment scripts, RHEL packaging, systemd definitions, or production configuration.
- Do not deploy, push changes to the running server, restart services, or modify real Splunk settings.
- Do not connect to private IP addresses, SSH, Docker, Kubernetes, Splunk REST endpoints, or real network services.
- Do not perform a network scan. Simulate discovery locally with clearly marked sample data.
- Do not include credentials, tokens, private keys, internal URLs, or real production host details in code or sample data.
- Do not represent mock data as real. Add a persistent “DEMO DATA / NOT CONNECTED” indicator to prototype screens.
- Do not use random numbers or random latency to simulate good health. Use a deterministic, shared mock dataset and explicit sample states.
- Preserve the original app so the prototype can be reviewed separately and later integrated carefully.
- Use the current repository’s React and TypeScript approach where practical. Keep dependencies minimal and reuse already installed packages where possible.

Before coding, provide a concise inventory of current pages/components and a mapping from the existing UI to the proposed workspaces. Then implement the prototype and verify its interactions.

## Product goal

Create a premium enterprise application for five connected tasks:

1. Discover an authorized network and identify neighbors, hosts, ports, and observable relationships.
2. Display the discovered environment and its current Splunk architecture in a dedicated topology page.
3. Design a separate target architecture by modifying a copy of the discovered diagram.
4. Inspect the actual Splunk Doctor / Splunk deployment’s current health, errors, configuration, and diagnostic-tool status.
5. Prepare secure, auditable installation and execution plans for hosts, Docker, and Kubernetes.

The product must always distinguish **Current Environment** from **Target Design**. Editing the target design must never alter the discovered/current graph.

## Design system

Build a coherent, polished infrastructure-management UI. Avoid generic admin templates and crowded tool dashboards.

- Default language: Persian, right-to-left (RTL); provide an English LTR toggle.
- Desktop-first and responsive down to tablet/mobile.
- Dark graphite/navy surfaces, restrained cyan/blue accents, subtle borders, crisp typography, deliberate spacing.
- Use the installed Vazirmatn font for Persian and appropriate Latin typography.
- Green means measured/verified healthy only; amber means warning; red means confirmed error; gray means unknown/unavailable/not checked.
- Include accessible focus states, semantic buttons, useful tooltips, consistent iconography, keyboard operation, readable tables, and sensible empty/loading/error/partial states.
- Use a real graph interaction library only if it is already installed or can be added cleanly; never sacrifice build reliability for visual effects.
- Avoid decorative gauges, invented compliance percentages, ungrounded “100% healthy” badges, or meaningless counters.

## Primary navigation

Use only these five primary destinations:

1. Network Discovery & Topology
2. Architecture Studio
3. Current Splunk Health
4. Installation & Execution
5. Reports & Audit History

Put secondary diagnostics inside the relevant workspace rather than in an oversized global sidebar.

## Workflow A — startup discovery

Make Network Discovery the first landing workspace. In the prototype, automatically play a short simulated startup scan; clearly disclose that it is a local UI simulation and sends no packets.

Show these stages and their status:

1. Identify the controller’s interfaces, IPs, routes, and gateways.
2. Identify potential neighbors using sample ARP/NDP/hostname/probe evidence.
3. Inspect a configured/approved set of TCP/UDP ports and service signatures.
4. collect observable connection evidence and configured Splunk relationships.
5. identify Splunk roles and create a topology model.

Create a discovery summary including discovered hosts, reachable hosts, ports checked, ports confirmed open, connections observed, relationships inferred, and unresolved items. Use one shared deterministic mock-data source.

Include a scope-review card and controls for scope, discovery profile, timeout/rate preset, start/retry/cancel, and result review. Do not suggest an unrestricted scan of every possible address and port is safe or complete. In the real product, scope must come from real interfaces/routes or explicit authorized approval. The local controller should be identifiable as the controller but excluded from the “neighbor” count so it is not counted as its own neighbor.

Every discovery result must show provenance and a timestamp or “not measured”. Distinguish:
- discovered host versus reachable host;
- confirmed open port versus filtered/unknown;
- locally observed socket versus network-wide flow observation;
- relationship extracted from Splunk configuration versus connection observed in telemetry;
- inferred versus verified relationship.

Do not claim that one server’s local socket table reveals all network traffic between all hosts. Network-wide connections require appropriate telemetry or agents/flow sources.

## Workflow B — discovered topology and current Splunk diagram

After the simulated startup scan, transition to a dedicated topology view. This is the product’s main visual workspace, not a small card inside a dashboard.

Provide tabs or layer selectors for:
- Network Topology
- Current Splunk Architecture
- Connections & Ports

Draw the controller, mock hosts, network devices, and Splunk roles (Indexer, Search Head, Heavy Forwarder, Universal Forwarder, Cluster Manager, Deployment Server, License Manager, HEC, etc.) only when the shared mock evidence contains them.

Graph requirements:
- zoom, pan, fit-to-screen, search by hostname/IP, filters, node selection, edge selection;
- type/role/status filters and optional grouping by subnet or environment;
- edges labeled with protocol/port where relevant;
- a detail inspector for each node and edge;
- table/list alternative for accessibility;
- export buttons shown as prototype interactions only;
- clear visual distinction between observed, configuration-derived, inferred, and unverified edges.

Selecting a node must show its IP/hostname, role, evidence source, last observed time, relevant ports/services, and confidence/status. Selecting an edge must show source, destination, protocol/port if known, relationship type, evidence, and verification state.

Below the graph, show exactly two prominent next-step cards:

### Choice 1: Develop Architecture

“Create a target architecture from a separate copy of the discovered topology. Add or remove components, configure OS, hardening, Splunk version, dependencies, and role-specific Splunk settings.”

### Choice 2: Current Splunk Health & Diagnostics

“Inspect the current installed environment: services, versions, errors, configuration findings, network connectivity, and all registered diagnostic tools.”

The two cards must open different workspaces. Do not mix them.

## Workflow C — Architecture Studio

Create a serious visual architecture editor with:
- left component palette;
- center graph canvas derived from a copy of the discovered topology;
- right contextual inspector for the selected node;
- a bottom panel or tabs for config previews, validation, diffs, and change history.

Support adding, selecting, moving, and removing prototype components. Suggested component types:
- Indexer / Indexer Cluster
- Search Head / Search Head Cluster
- Heavy Forwarder
- Universal Forwarder
- Cluster Manager
- Deployment Server
- License Manager
- Monitoring Console
- HEC / Syslog inputs
- Load balancer / storage
- Docker runtime
- Kubernetes cluster

Maintain links and stable node IDs as the design changes. Show a legend and allow relationship creation/removal in the prototype. Provide undo/reset-to-discovered-copy interactions where practical.

For each selected component, provide structured requirements:

**Operating system and host**
- Linux distribution and release/version.
- CPU, RAM, disk, storage/retention sizing.
- dependencies, system packages, service accounts, and runtime requirements.
- distinguish required, recommended, and optional fields.

**Security hardening**
- SELinux posture and policy considerations.
- firewall ports/rules.
- identity, account privileges, certificates and TLS.
- OS hardening profile and a visible rationale.
- validate each recommendation against an authoritative compatibility source in the future; mark current prototype values as sample/unverified.

**Splunk role and compatibility**
- component role and appropriate Splunk product;
- Splunk version selection;
- upstream/downstream dependencies and required ports;
- role-specific requirements, storage and data flow;
- compatibility status that can be “Not checked” in the prototype.

Never invent a supported product/OS/version combination or show it as certified. A sample value must be labeled as a sample.

### Splunk-like configuration workbench — high priority

Design the experience to feel close to Splunk Web and its CLI/configuration workflow, without copying protected branding beyond product names and conventional UI patterns.

Provide both:
1. structured forms for common settings and role-specific choices;
2. a readable/editable raw .conf editor with syntax-oriented presentation.

Include sample tabs for:
- server.conf
- inputs.conf
- outputs.conf
- indexes.conf
- props.conf
- transforms.conf
- web.conf
- relevant role-specific settings

Provide a CLI preview panel with commands such as btool/check or role-relevant inspection commands, but label them “preview only — not executed”. Do not render unsafe commands for immediate execution.

The workbench needs:
- node/role context;
- field-level help and valid-value guidance;
- validation messages (never claim validation passed unless it actually ran);
- a before/after diff;
- missing/conflicting setting warnings;
- unsaved-change state;
- local save in prototype state;
- generated configuration preview for the selected component;
- a clear separation between current config (read-only sample) and target config (editable sample).

No configuration may be sent to Splunk or written to any host by the prototype.

## Workflow D — Current Splunk Health & Diagnostics

This is operational inspection of the **existing installed environment**, separate from Architecture Studio.

Create tabs:
1. Overview
2. Services & Versions
3. Configuration Audit
4. Logs & Errors
5. Network & Connections
6. Tool Health
7. Reports & History

Provide:
- service and API availability;
- product/version/install-path details when available;
- health-check results with source and observation time;
- config/btool findings;
- log events grouped by severity;
- CPU, memory, disk, uptime, and network measures when available;
- listening ports and configured Splunk destinations;
- health state for each diagnostic tool;
- evidence details, next actions, and report history.

Use realistic states: Healthy, Warning, Error, Unknown, Unavailable, Permission Required, and Partial. Missing telemetry or API errors must never become a green success status. No fake random latency and no fabricated success fallback.

In this UI-only prototype, sample historical values may be included but must be marked “Mock data — not live”. Keep space for real API source, last-updated time, and HTTP/error details.

## Workflow E — Installation & Execution

Build a controlled orchestration planning UI for future access to authorized hosts, Docker, and Kubernetes.

Include:
- discovered target inventory and selection;
- per-target identity/access status;
- readiness/preflight checks;
- OS and hardening plan;
- Splunk install and component configuration stages;
- Docker/Kubernetes target and namespace/cluster view;
- required network path/port previews;
- dry-run, validation, backup and rollback plans;
- operation approval, progress timeline, logs, and audit trail.

Secure networking requirements:
- do not expose an unauthenticated general-purpose shell endpoint;
- do not use an unauthenticated Docker remote API;
- prefer mTLS or equivalent authenticated identity, least privilege, target allow-lists, role-based access, scoped Kubernetes ServiceAccounts/RBAC, credential rotation, and auditable actions;
- show the designated agent/control-plane port and permitted source addresses as configuration concepts, but do not assume one open port automatically grants safe or complete network access;
- separate read-only discovery/diagnostics from privileged write operations;
- require an explicit review/confirmation step for any eventual privileged operation.

Prototype actions must stay local and simulated. No actual install, restart, firewall modification, or cluster command may run.

## Workflow F — Reports & Audit History

Build a searchable/filterable history view for:
- discovery runs and their scope;
- discovered topology versions;
- architecture design versions;
- validation results;
- deployment plans and approvals;
- diagnostic reports and health observations.

Include status, timestamp, source, actor placeholder, target, evidence link/summary, and an ID. Make it obvious these are sample records. Provide prototype-only export/copy interactions.

## Shared data model

Use a single typed mock dataset shared across all prototype pages. Derive all graph nodes, graph edges, counts, detail panels, tables, and reports from this source rather than generating fake data independently per component. Prefer explicit TypeScript types for Host, Interface, PortObservation, ConnectionEvidence, SplunkComponent, Relationship, DiscoveryRun, ArchitectureNode, ConfigDocument, Finding, ToolStatus, and DeploymentPlan.

Add a provenance field to relationships, e.g. observed, config-derived, inferred, or unverified. Add verification state and observedAt/source fields where applicable. Distinguish “not observed” from “no connection exists”.

## Completion criteria

Before finishing:
- run the project’s available frontend lint/build checks for the isolated prototype;
- test all five navigation destinations;
- test discovery simulation transitions and cancellation/retry states;
- test graph layer switching, search/filter, node and edge inspection;
- test adding/selecting components and editing configuration preview;
- verify the Current Environment graph cannot be mutated through Architecture Studio;
- test diagnostic tabs, filters, error/unknown/partial states;
- test simulated deployment workflow and confirmation gate;
- check browser console and responsive layout;
- test RTL Persian and LTR English mode;
- document how to run the prototype.

Do not modify the existing backend or production bundle. Do not claim the real network was scanned, real health was measured, or a real deployment was validated. Deliver a reviewable prototype in the isolated directory plus a short implementation summary and list of remaining integration work.
