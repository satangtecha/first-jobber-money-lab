# Base44 Dev Environment

## What this app is
A static, local-first financial-literacy learning app for Thai first-jobbers ("First Jobber Money Lab"). Plain HTML + ES modules + CSS — no build step, no framework, no backend required to run.

## How it runs here
Served by `nginx:alpine` (in `docker-compose.base44.yml`) on host port 3000, with the repo root bind-mounted read-only into the nginx web root. Because nginx reads files from disk on each request, edits to any `.js`/`.css`/`.html`/asset file appear immediately in the preview without a rebuild or reload — just refresh the browser.

## No backend / no secrets
The repo's `api-client.js` calls `/api/...` endpoints, but the app is local-first: every API call is wrapped in try/catch and the UI keeps working with localStorage state when no backend is present. No external-service credentials are needed. If a backend is added later, expose it on its own port and wire the client through the existing `api-client.js` boundary.

## Verification
- `curl -sf -H "Host: external.preview.example" http://localhost:3000/` returns the HTML document.
- The app boots into the learning dashboard with no console errors about missing modules.

## Key contracts (do not break)
- Calculation results of `rules.js`, `debt-engine.js`, `payoff-engine.js`, `tax-lab.js`, `investment-sim.js` must not change.
- Preserve `data-action`, `data-screen`, input IDs, and delegated event behavior in `app.js`.
