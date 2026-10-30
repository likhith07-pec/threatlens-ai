# ThreatLens AI — File-by-File Build Guide for Google Antigravity

This guide complements `THREATLENS_AI_IMPLEMENTATION_SPEC.md`.

**Purpose:** Tell Antigravity what to create or update in every planned file, what each file owns, which files it depends on, and how to verify it. The repository may already have some of these files. Inspect first, reuse existing code, and only create or change files that are actually needed.

## Instructions to Antigravity

1. Read this file and `THREATLENS_AI_IMPLEMENTATION_SPEC.md` completely.
2. Inspect the repository before making changes. Produce an inventory: existing file, purpose, status, planned action (`keep`, `modify`, `create`, or `remove`), and reason.
3. Do not create empty placeholder files merely to match the tree. Every created file must have a defined responsibility and working implementation, or be clearly marked as intentionally deferred.
4. Keep one canonical implementation for each responsibility. Do not create duplicate routers, duplicate API clients, duplicate database models, or competing configuration systems.
5. Implement in dependency order: configuration/database/schemas → provider clients → services → routes → frontend API/types → pages/components → tests/docs.
6. Use actual live provider results in the investigation path. Test providers with mocks in automated tests, but never display test fixtures as real investigation results.
7. Verify current TinyFish API documentation before coding the provider clients. Never guess endpoint contracts.
8. After each phase, run relevant tests and record results in `docs/IMPLEMENTATION_STATUS.md`.
9. If time or usage is running out, save code and status first. Document exact remaining tasks and next commands.
10. At completion, update `README.md`, all relevant docs, and `docs/IMPLEMENTATION_STATUS.md`.

---

# A. Root files

## `README.md`
**Purpose:** Main entry point for a developer or judge.

Must include:
- Project purpose and scope.
- Architecture summary.
- Prerequisites.
- Exact verified backend and frontend setup commands.
- Environment variable setup, without real secrets.
- How to run tests.
- How to start and poll a CVE investigation.
- Known limitations and current integration status.
- Link to detailed docs.

Do not claim live integrations work unless they were actually tested.

## `.gitignore`
Must exclude:
- `.env`, `.env.*` except `.env.example`
- Python virtual environments, `__pycache__`, `.pytest_cache`
- frontend `node_modules`, build output and local caches
- SQLite database files and local investigation artifacts where appropriate
- editor/OS temporary files

Check that no API key or local database is accidentally committed.

## `.env.example`
List required/optional environment variable names with safe placeholders only:
- `TINYFISH_API_KEY`
- `GEMINI_API_KEY` (optional)
- `DATABASE_URL`
- `NVD_API_KEY` (only if needed for chosen NVD usage)
- `FRONTEND_ORIGIN`
- `LOG_LEVEL`
- `RESEARCH_MAX_STEPS`
- `REQUEST_TIMEOUT_SECONDS`

Document each variable and safe default. Do not place actual keys here. Ensure configuration names match `backend/app/core/config.py`.

## `docs/IMPLEMENTATION_SPEC.md`
Copy or maintain the authoritative product and technical specification from `THREATLENS_AI_IMPLEMENTATION_SPEC.md`. Keep scope boundaries, architecture, data model, API contract, security requirements, test plan, and definition of done.

## `docs/ARCHITECTURE.md`
Document:
- Component responsibilities.
- Investigation sequence.
- Data flow between React, FastAPI, orchestration, provider adapters, verification, database, and report generation.
- Where errors and partial results are handled.
- A Mermaid diagram if helpful.
Keep the diagram consistent with actual code.

## `docs/API_CONTRACT.md`
Document each implemented endpoint:
- HTTP method and path.
- Request schema and example.
- Response schema and example.
- Status lifecycle.
- Error responses.
- Export behavior.
Generate examples from actual Pydantic schemas where possible. Do not document endpoints that do not exist as if implemented.

## `docs/DATA_MODEL.md`
Document actual tables/models, fields, relationships, nullable fields, indexes, timestamps, and data-retention decisions. Match the database implementation.

## `docs/SECURITY.md`
Document:
- Secret handling.
- CORS configuration.
- SSRF protections and redirect handling.
- Prompt injection treatment.
- Safe rendering of external content.
- Timeouts, response-size caps, retries and research budgets.
- Logging restrictions.
- Known limitations.
Do not claim protections that have not been implemented.

## `docs/TEST_PLAN.md`
List unit, API, integration-mock, frontend and optional live-integration checks. Include the exact command to run each suite and the current result/date. Keep live API checks separate from deterministic tests.

## `docs/DEMO_RUNBOOK.md`
Provide a repeatable judge demo:
1. Start backend and frontend.
2. Check health.
3. Enter a selected known CVE.
4. Show investigation progress.
5. Open source evidence and verify URL/excerpt.
6. Show a real verification result or explain if evidence is insufficient.
7. Show a real contradiction if one exists; otherwise show a gap without fabricating a conflict.
8. Open graph and report.
9. Export Markdown and JSON.
10. Explain partial failures and limitations.
Include a fallback plan if a provider is unavailable, clearly labelled as a fallback and not a live demo.

## `docs/IMPLEMENTATION_STATUS.md`
This file is mandatory and must be maintained throughout development.

Include:
- Last updated timestamp.
- Current repository state.
- Completed phases.
- Files changed and why.
- Tests executed and exact outcomes.
- Live integrations actually verified.
- Missing environment variables or credentials, without exposing secret values.
- Known bugs and limitations.
- Remaining tasks in priority order.
- Exact next commands and the next file/task to work on.
A new session must be able to continue without repeating completed work.

---

# B. Backend package and application entry point

## `backend/pyproject.toml` OR `backend/requirements.txt`
Choose one primary dependency-management approach. Do not maintain conflicting lists.

Include only needed runtime/test dependencies, for example:
- FastAPI
- Uvicorn
- Pydantic/settings package as chosen
- HTTP client
- SQLite ORM/library as chosen
- Pytest and test client
- Any required schema validation or parsing library

Pin or constrain versions reasonably. Document installation commands. If `pyproject.toml` is used, define package/test configuration there.

## `backend/app/main.py`
Responsibilities:
- Create the FastAPI app.
- Register routers once.
- Configure CORS from environment configuration.
- Register startup/database initialization using the chosen persistence approach.
- Register consistent exception handlers.
- Expose a small root or health route only if useful.
- Avoid putting research logic in this file.

Acceptance:
- App starts using documented command.
- OpenAPI schema loads.
- Health route works.
- No secrets are printed.

## `backend/app/core/config.py`
Responsibilities:
- Read and validate environment variables.
- Provide safe defaults for local development.
- Represent optional integrations as optional.
- Validate numeric limits such as timeouts and maximum research steps.
- Never print secret values.
- Ensure `.env.example` names match this module.

## `backend/app/core/logging.py`
Responsibilities:
- Configure structured, useful logs.
- Include investigation ID and stage where practical.
- Redact authorization headers, API keys and sensitive configuration.
- Avoid logging full untrusted payloads by default.

## `backend/app/core/errors.py`
Responsibilities:
- Define application/provider error types.
- Normalize errors into safe API responses.
- Distinguish validation errors, provider unavailable, timeout, rate limit, and internal failure.
- Never expose stack traces or secret-bearing payloads to users.

---

# C. Backend API dependencies and routes

## `backend/app/api/deps.py`
Responsibilities:
- Provide shared database/session/service dependencies.
- Avoid global mutable request state.
- Keep dependency construction consistent across routes and tests.

## `backend/app/api/routes/health.py`
Responsibilities:
- Implement `GET /api/health`.
- Report app status and safe dependency/configuration status.
- Do not reveal key values or call expensive research APIs just to check health.

## `backend/app/api/routes/investigations.py`
Responsibilities:
- `POST /api/investigations`: validate CVE ID, create and start/queue investigation, return ID/status.
- `GET /api/investigations`: list persisted investigations with sensible bounds/pagination.
- `GET /api/investigations/{id}`: return status, progress, summary and safe errors.
- Delegate logic to services.
- Return 404 for unknown IDs.
- Do not perform all slow web research inline if it can exceed request limits.

## `backend/app/api/routes/evidence.py`
Responsibilities:
- Implement `GET /api/investigations/{id}/evidence`.
- Return persisted sources, excerpts, claims, verification states and relationships.
- Verify the investigation exists.
- Support sensible sorting/pagination if the result can be large.
- Do not fetch new external pages just because this read endpoint is called.

## `backend/app/api/routes/graph.py`
Responsibilities:
- Implement `GET /api/investigations/{id}/graph`.
- Build graph nodes and edges from persisted sources, evidence and claims.
- Use stable node IDs and documented node/edge types.
- Return an empty graph when no graph relationships exist; do not insert sample nodes.
- Verify investigation ownership of every returned record.

## `backend/app/api/routes/reports.py`
Responsibilities:
- Implement structured report read and Markdown/JSON exports.
- Validate export format.
- Return appropriate content types and download filenames.
- Generate from saved investigation data.
- Return a clear not-ready/404 response if a report does not yet exist or the investigation is unknown.

---

# D. Backend schemas

## `backend/app/schemas/investigation.py`
Define validated request/response schemas for:
- CVE investigation creation.
- Investigation status/progress.
- Investigation list items.
- Investigation details.
- Error/partial-result summaries.

Validation:
- Accept a well-formed CVE identifier.
- Normalize case consistently.
- Reject malformed values with a clear validation message.

## `backend/app/schemas/source.py`
Define schemas for:
- Source metadata.
- Evidence excerpt.
- Retrieval/publication timestamps.
- Source type and retrieval status.
- Provider error/partial status where relevant.

Keep publication time nullable and separate from retrieval time.

## `backend/app/schemas/claim.py`
Define:
- Claim type, subject, value, text and optional affected-version scope.
- Verification enum: `supported`, `contradicted`, `insufficient_evidence`, `needs_review`.
- Rationale.
- Evidence references.
- Claim-to-evidence relationship schema.

Reject evidence IDs not validated by the service layer.

## `backend/app/schemas/contradiction.py`
Define:
- Competing claim IDs.
- Evidence IDs.
- Conflict type.
- Explanation/context.
- Review status.

A schema must not imply every difference is a confirmed contradiction.

## `backend/app/schemas/report.py`
Define:
- Report metadata.
- Executive summary.
- Findings and their evidence links.
- Severity/exploitation/remediation source details.
- Contradictions and evidence gaps.
- Recommendations.
- Source register.
- Limitations and partial failures.
- Schema/version metadata for JSON export.

---

# E. Database files

## `backend/app/db/session.py`
Responsibilities:
- Create database engine/connection and session factory using configuration.
- Handle SQLite connection requirements safely.
- Provide a dependency for request-scoped sessions.
- Support test database configuration.
- Avoid hardcoded machine-specific absolute paths.

## `backend/app/db/models.py`
Create models/tables for:
- Investigation
- Source
- Evidence
- Claim
- ClaimEvidence relationship
- Contradiction
- ResearchTask
- Report
- AuditEvent if useful

Requirements:
- Stable IDs and foreign keys.
- Appropriate indexes for CVE ID, investigation ID, status, and relationships.
- Correct nullable fields.
- Separate publication/retrieval timestamps.
- No fake seed investigation data in production.
- Keep model definitions consistent with `docs/DATA_MODEL.md`.

## `backend/app/db/migrations/`
Only create/use migrations if the chosen database setup supports them. Do not create an empty migrations folder solely to match the plan. If using a simple schema initializer for the prototype, document its limitations and keep initialization reproducible.

---

# F. Provider integration clients

Each integration module must own provider-specific HTTP requests, parsing, normalization, timeouts, and provider error handling. It must not decide final claim truth.

## `backend/app/integrations/base.py`
Define a small shared interface or typed result model for source providers:
- success/partial/failure status
- normalized source records
- safe error metadata
- retrieval timestamp
- provider identity
Avoid a large generic framework that makes individual providers harder to debug.

## `backend/app/integrations/tinyfish_search.py`
Responsibilities:
- Implement TinyFish Search using the current official API contract.
- Use backend API key configuration.
- Encode queries correctly.
- Apply timeouts and response-size limits.
- Normalize returned URLs/titles/snippets without inventing fields.
- Handle HTTP errors, rate limits, malformed results and missing credentials.
- Include provider-level tests with mocked HTTP responses.

Do not guess endpoint, headers or response schema. Verify the current TinyFish docs first.

## `backend/app/integrations/tinyfish_fetch.py`
Responsibilities:
- Fetch URLs using the current official TinyFish Fetch contract.
- Validate URLs before sending them to the provider.
- Preserve the URL returned/fetched and available metadata.
- Extract or preserve actual page content/excerpts according to the response contract.
- Apply size and timeout limits.
- Handle blocked pages, redirects and empty content explicitly.
- Do not manufacture page text.

## `backend/app/integrations/tinyfish_agent.py`
Optional. Implement only if current docs are verified and agent execution adds clear value for bounded follow-up research.

If implemented:
- Use the documented request and response/SSE contract.
- Bound steps, runtime and cost where supported.
- Parse streaming termination/errors robustly.
- Treat page content as untrusted input.
- Do not let agent output replace evidence records without source URLs/excerpts.
- If it is not needed for the minimum viable workflow, document it as deferred rather than blocking core functionality.

## `backend/app/integrations/nvd.py`
Responsibilities:
- Retrieve CVE baseline details using the current NVD API contract.
- Normalize identifiers, descriptions, published/modified times, CVSS metrics and affected configurations where present.
- Preserve scoring version and source attribution.
- Handle pagination, empty results, rate limits and optional API-key configuration.
- Never invent absent fields.

## `backend/app/integrations/cisa_kev.py`
Responsibilities:
- Retrieve or read the official CISA KEV catalog using its current published format.
- Determine whether the target CVE is present based only on retrieved catalog data.
- Preserve relevant catalog fields and source attribution.
- Handle catalog fetch/parse errors explicitly.
- Do not infer KEV inclusion from a search snippet alone when authoritative data is available.

## `backend/app/integrations/cve_program.py`
Responsibilities:
- Retrieve official CVE Program record information where accessible.
- Normalize record identity, descriptions, references and timestamps.
- Handle unavailable records and schema changes gracefully.

## `backend/app/integrations/vendor_advisories.py`
Responsibilities:
- Provide a controlled adapter/helper for discovering and retrieving relevant official vendor advisories.
- Prefer official vendor domains and preserve the exact source URL.
- Do not pretend one generic parser can normalize every vendor's page perfectly.
- Mark extraction limitations and unsupported page structures.

## `backend/app/integrations/gemini.py`
Optional AI adapter:
- Call the Gemini API only when a valid backend credential is configured.
- Use the currently supported API contract/model configuration.
- Require structured output schemas for candidate claims and report drafts.
- Supply retrieved excerpts as untrusted data, not instructions.
- Require model outputs to cite evidence IDs supplied in the prompt.
- Validate all IDs and claims in backend code.
- Never allow model-generated citations or facts without retrieved evidence to enter the report as confirmed.
- Handle unavailable quota, timeout, malformed output and missing key.
- Deterministic backend paths must remain testable without Gemini.

---

# G. Security modules

## `backend/app/security/url_validation.py`
Responsibilities:
- Validate schemes and hostnames before outbound fetch.
- Reject localhost, private, link-local and prohibited destinations where appropriate.
- Revalidate redirect destinations or disable unsafe redirects.
- Avoid time-of-check/time-of-use gaps where feasible.
- Allow only necessary URL patterns and document residual limitations.
- Add tests for safe public URLs and prohibited destinations.

## `backend/app/security/untrusted_content.py`
Responsibilities:
- Treat page content and snippets as untrusted data.
- Provide safe wrappers/instructions for AI prompts.
- Remove or neutralize control-like content where useful, without pretending prompt injection can be perfectly solved.
- Ensure extracted page content cannot alter system/developer instructions.
- Ensure UI renders external text safely.

---

# H. Backend services

## `backend/app/services/investigation_service.py`
Responsibilities:
- Create, list, retrieve and update investigations.
- Enforce valid state transitions.
- Store progress, completion time, partial failures and safe error summaries.
- Avoid duplicate submissions where practical.
- Keep database operations transactional where appropriate.

## `backend/app/services/orchestration_service.py`
Responsibilities:
- Coordinate the full pipeline in explicit stages:
  1. validate/create investigation
  2. fetch official baseline sources
  3. TinyFish search/fetch
  4. persist source evidence
  5. extract candidate claims
  6. verify claims
  7. detect contradictions
  8. identify gaps and run bounded follow-up
  9. calculate transparent indicators
  10. generate/persist report
- Record progress and stage errors.
- Preserve successful source results if another source fails.
- Enforce max research steps, retries, response size and runtime.
- Stop safely when credentials are missing or budgets are exhausted.
- Never mark a run completed if required stages failed silently.

## `backend/app/services/evidence_service.py`
Responsibilities:
- Store source and evidence records.
- Normalize whitespace while preserving meaningful quoted text.
- Validate URL, source metadata and excerpt length.
- Deduplicate carefully using URL/content hash where appropriate.
- Maintain publication time separately from retrieval time.
- Return evidence records for claim/graph/report services.

## `backend/app/services/claim_service.py`
Responsibilities:
- Normalize candidate claim data.
- Validate required fields and claim type.
- Validate evidence IDs belong to the current investigation.
- Store claim-to-evidence relationships.
- Reject claims that cite nonexistent evidence.
- Preserve source wording and normalized fields separately.

## `backend/app/services/verification_service.py`
Responsibilities:
- Apply deterministic checks for CVE IDs, dates, CVSS metadata and version fields where feasible.
- Use semantic classification only as a bounded, evidence-grounded candidate assessment.
- Return one of the documented states and a concise rationale.
- Require evidence links for `supported` and `contradicted`.
- Use `insufficient_evidence` or `needs_review` when support is unclear.
- Do not treat source reputation alone as proof of claim support.

## `backend/app/services/contradiction_service.py`
Responsibilities:
- Compare claims with compatible subjects/types/scopes.
- Consider publication date, product/version, metric version and statement meaning.
- Detect potential material conflicts, not just different text.
- Explain why two claims may conflict and which context was considered.
- Distinguish confirmed conflicts from possible conflicts requiring review.
- Save only contradictions derived from actual persisted claims.

## `backend/app/services/risk_service.py`
Responsibilities:
- Present official CVSS/KEV/exploitation/remediation data with provenance.
- Keep evidence quality/freshness separate from vulnerability severity.
- Calculate derived indicators only with documented rules.
- Label any derived ranking as a ThreatLens assessment.
- Never create a made-up CVSS score or unsupported exploitation claim.

## `backend/app/services/report_service.py`
Responsibilities:
- Compile report sections from persisted claims, sources, evidence, contradictions and risk data.
- Preserve citations and source URLs.
- Include unresolved gaps and partial failures.
- Generate valid Markdown and JSON.
- Validate JSON against the report schema.
- Avoid writing unsupported facts into the executive summary.
- Ensure report generation is deterministic enough to test.

---

# I. Backend tests

Create tests with mocked HTTP clients; normal test runs must not require live external credentials.

## `backend/tests/unit/`
Cover:
- CVE validation
- source parser normalization
- evidence/claim relationship validation
- verification state logic
- contradiction logic, including false-positive cases
- risk indicator calculations
- report Markdown/JSON generation
- URL validation and untrusted content handling

## `backend/tests/integration/`
Cover:
- source adapters with mocked responses
- orchestration with successful and failed providers
- database persistence and retrieval
- partial results when one provider fails
- research-budget exhaustion

## `backend/tests/api/`
Cover:
- health endpoint
- create/list/get investigation
- malformed CVE request
- unknown investigation
- evidence and graph response schemas
- report/export endpoints
- consistent error response behavior

Tests should not assert implementation details unnecessarily. Add fixtures only for tests and label them as test fixtures. Never connect test fixture data to the production UI as live results.

---

# J. Frontend files

The exact component decomposition can follow the existing frontend conventions. Avoid creating a separate component file for every tiny visual element if that adds no value.

## `frontend/package.json`
- Define actual start/build/test/lint scripts.
- Include only dependencies used by the application.
- Do not add a graph library unless the graph page uses it.
- Ensure scripts work and are documented.

## `frontend/vite.config.ts`
- Configure Vite and any required development proxy.
- Do not embed secret environment variables.
- Keep API routing consistent with `frontend/src/api/client.ts`.

## `frontend/src/main.tsx`
- Mount the React application.
- Import global styles once.
- Set up any required router/provider.
- Keep business logic out of this file.

## `frontend/src/App.tsx`
- Define app-level layout and routing.
- Use the existing router if present.
- Ensure all navigation targets resolve.
- Do not implement every page's logic inside this file.

## `frontend/src/api/client.ts`
- Define the single typed HTTP client.
- Configure base URL.
- Normalize API errors.
- Support JSON and file-download responses.
- Do not contain API keys or provider credentials.
- Avoid duplicate fetch logic across pages.

## `frontend/src/api/investigations.ts`
- Implement typed methods for creating, listing and retrieving investigations.
- Implement evidence and graph retrieval if those endpoints are grouped here.
- Match actual backend request/response schemas.

## `frontend/src/api/reports.ts`
- Implement report retrieval and Markdown/JSON export.
- Handle download failures and non-2xx responses.
- Use filenames returned by the server where safe, or documented defaults.

## `frontend/src/types/`
- Define frontend types matching backend response schemas.
- Prefer generated/shared schema types if the project adopts them.
- Do not silently diverge from backend enum names or optional fields.

## `frontend/src/pages/DashboardPage.tsx`
- Fetch real summary/list data.
- Show recent investigations and actual counts.
- Provide a clear new-investigation action.
- Show empty/loading/error states.
- No fake KPI cards or fabricated sample investigations.

## `frontend/src/pages/InvestigationsPage.tsx`
- Fetch persisted investigation list.
- Display CVE ID, status, created/updated time, and summary.
- Support opening an investigation.
- Show empty/loading/error states.

## `frontend/src/pages/NewInvestigationPage.tsx`
- Validate CVE ID before submission.
- Submit to backend and navigate to the returned investigation.
- Prevent accidental repeated submissions while a request is in progress.
- Show clear validation and provider/configuration errors.

## `frontend/src/pages/InvestigationDetailPage.tsx`
- Fetch investigation status/details.
- Poll or refresh progress using a bounded, documented strategy.
- Show source coverage, claims, important findings and partial failures.
- Do not display success until the backend reports it.

## `frontend/src/pages/EvidencePage.tsx`
- Fetch evidence from the API.
- Show source title/domain, exact URL, retrieved time, known publication time, excerpt and related claims.
- Open external source links safely in a new tab with appropriate protections.
- Clearly label missing/partial excerpts.

## `frontend/src/pages/GraphPage.tsx`
- Fetch persisted graph nodes/edges.
- Render actual claim/source relationships.
- Make node selection open details or navigate to the evidence viewer.
- Show a genuine empty state when no graph is available.
- Never inject sample nodes to make the graph look populated.

## `frontend/src/pages/ContradictionsPage.tsx`
- Fetch actual contradiction records.
- Show the competing statements, source excerpts, dates, scope, explanation and review state.
- If no contradiction exists, say none was detected in the available evidence.
- Distinguish “none found” from “analysis unavailable.”

## `frontend/src/pages/RiskPage.tsx`
- Display official severity and exploitation data with citations.
- Display derived indicators separately and explain their inputs.
- Show missing fields as unavailable, not as zero or a guessed value.

## `frontend/src/pages/ReportPage.tsx`
- Fetch and render the structured report.
- Provide working Markdown and JSON export controls.
- Show report status, limitations and partial failures.
- Never generate report claims in the browser that disagree with backend data.

## `frontend/src/pages/SettingsPage.tsx`
- Show whether backend integrations are configured using safe status endpoints.
- Never request users to paste keys into ordinary UI fields unless a secure backend configuration mechanism is explicitly designed.
- Never reveal key values.
- Explain which server-side environment variable is missing, by name only.

## `frontend/src/components/layout/`
- Implement app shell, navigation, header and responsive layout.
- Ensure active route and navigation work.
- Avoid decorative links that do nothing.

## `frontend/src/components/common/`
- Shared loading, empty, error, status, confirmation and badge components.
- Keep these components reusable and accessible.
- Verification states must include text, not color alone.

## `frontend/src/components/evidence/`
- Source card, excerpt view, claim/evidence links and provenance details.
- Reuse the backend's source and evidence types.
- Escape external content; never render arbitrary source HTML.

## `frontend/src/components/graph/`
- Graph wrapper, node rendering and selection behavior.
- Use actual graph API data and stable IDs.
- Keep visual complexity appropriate for a hackathon demo.

## `frontend/src/components/investigation/`
- Investigation form, status timeline, summary panel, claim list and other reusable investigation-specific components.
- Avoid duplicating API calls already handled by page-level hooks/services.

## `frontend/src/hooks/`
- Reusable hooks for investigation queries/progress only when needed.
- Ensure polling stops when an investigation is terminal or a page unmounts.
- Handle cancellation and errors safely.

## `frontend/src/utils/`
- Formatting for dates, status labels and source URLs.
- Keep formatting logic pure and tested where useful.
- Do not invent missing values.

## `frontend/src/styles/`
- Define the shared theme, responsive styles and accessible states.
- Visual direction: midnight navy, restrained green for supported, amber for uncertain/review, red for critical/error.
- Use text labels and accessible contrast.

## `frontend/tests/`
- Test critical form validation and submission states.
- Test loading/empty/partial/error/completed UI states.
- Test report export controls and graph empty/selection behavior where practical.
- Use mocked API responses only in tests, never as hidden production fallback data.

---

# K. Required implementation order

### Stage 1 — Inspect and plan
- Inventory all existing files.
- Identify app entry points and current run commands.
- Map existing files to the responsibilities above.
- Write `docs/IMPLEMENTATION_STATUS.md`.
- Do not yet perform a broad rewrite.

### Stage 2 — Foundation
Implement config, database, models, schemas, health route, investigation CRUD and frontend API client. Prove frontend/backend communication works.

### Stage 3 — Real integrations
Implement official source adapters and TinyFish Search/Fetch using current docs. Test with mocks, then perform a live check if credentials are available. Persist retrieved source evidence.

### Stage 4 — Evidence intelligence
Implement claim normalization, claim-evidence linking, verification, contradiction detection, research gaps and bounded follow-up.

### Stage 5 — UI integration
Connect all pages to real API results. Add progress, evidence viewer, graph, contradiction review, risk and report pages. Remove any production mock data.

### Stage 6 — Exports, hardening and tests
Finish Markdown/JSON exports, security checks, test suite, runbook and README. Run a complete end-to-end investigation.

After each stage, update `docs/IMPLEMENTATION_STATUS.md` with completed work, test commands/results and next tasks.

---

# L. Final acceptance checklist

- [ ] Workspace was inspected before edits.
- [ ] File inventory and implementation status exist.
- [ ] Frontend and backend start with documented commands.
- [ ] A CVE investigation can be created and retrieved.
- [ ] Real TinyFish calls are verified when credentials are available.
- [ ] Real source URLs/excerpts are saved and displayed.
- [ ] Claims cite valid persisted evidence or are marked insufficient.
- [ ] Contradictions come from actual claims and include context.
- [ ] Follow-up research has explicit bounds and persisted task status.
- [ ] Graph reflects actual saved entities.
- [ ] Markdown and JSON exports work.
- [ ] Missing keys/provider errors are honest and safe.
- [ ] Tests pass or failures are documented exactly.
- [ ] No fake production metrics, fake evidence or fake citations remain.
- [ ] README, architecture/API/data/security/test/demo docs match actual implementation.
- [ ] `docs/IMPLEMENTATION_STATUS.md` enables another session to continue without starting over.

## Required final status response

At the end, summarize:
1. What was present before implementation.
2. What changed and why.
3. Which features work.
4. Which external APIs were actually tested live.
5. Commands to run the app and tests.
6. Test results.
7. Missing credentials and known limitations.
8. The next task, if incomplete.
