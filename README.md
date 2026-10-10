# Splunk Doctor — AI Studio UI redesign branch

This branch prepares the existing Splunk Doctor React/TypeScript repository for a **separate UI-only design prototype** in Google AI Studio.

## Start here

1. Read [AI_STUDIO_UI_REDESIGN_PROMPT.md](./AI_STUDIO_UI_REDESIGN_PROMPT.md).
2. Open Google AI Studio Build mode and provide this repository as context.
3. Paste the full prompt from that file into the build request.
4. Ask AI Studio to create an isolated `ui-redesign/` prototype. Keep the current app and backend unchanged.
5. Review the result against [UI_REDESIGN_ACCEPTANCE.md](./UI_REDESIGN_ACCEPTANCE.md).

## Repository context

- Existing frontend entry: `src/main.tsx`
- Existing application UI: `src/App.tsx`
- Existing styles: `src/index.css`
- Existing types: `src/types.ts`
- Existing backend/API implementation: `server.ts`
- RHEL packaging: `scripts/build-rhel-package.js`

The existing app is a Vite/React/TypeScript application. This branch adds design guidance only; it does not replace the existing UI or alter server routes, production configuration, or the deployed Pilot.

## Prototype boundary

Use deterministic mock data only. Do not scan real networks, call production APIs, connect to Splunk, SSH, Docker, or Kubernetes, or run deployments. Keep the prototype visually labeled as demo data. Integration with actual endpoints should be a separately reviewed follow-up.

## Main user flows

1. Network discovery and evidence-labelled topology.
2. Develop architecture from a separate copy of the discovered topology.
3. Current Splunk health and diagnostics.
4. Secure installation/execution planning for authorized hosts, Docker, and Kubernetes.
5. Reports and audit history.

See the main prompt and acceptance checklist for the complete specification.
