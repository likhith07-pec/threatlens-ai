# ThreatLens AI — Implementation Specification for Google Antigravity

> **Purpose:** This file is the implementation source of truth for building ThreatLens AI. Read it before editing the repository. It describes what to implement, the target project structure, the required behavior, and how to verify completion.
>
> **Important:** This is a build specification, not evidence that the application already exists or that any external integration has been tested.

---

## 0. Instructions to the coding agent

Before changing files:

1. Inspect the entire current workspace and identify the existing frontend, backend, dependencies, run commands, and unfinished features.
2. Report the current project structure and a concise plan mapping existing files to the target structure below.
3. Preserve useful code. Do not replace the project blindly or create a second competing implementation.
4. Implement in small phases. Run relevant tests and build checks after each phase.
5. Never claim an integration works unless it has actually been exercised successfully.
6. Do not use hardcoded fixtures, fake evidence, fake citations, fabricated metrics, or hardcoded contradiction cards in the production investigation flow.
7. If credentials are missing, implement a clean adapter and an explicit “not configured” state. Continue testing non-live code paths.
8. Verify the current official TinyFish documentation for endpoint URLs, authentication, request schemas, response formats, streaming behavior, and quotas before implementing. Do not guess API contracts.
9. Keep secrets in backend environment variables only. Never expose secrets in frontend bundles, logs, screenshots, or committed files.
10. At the end, report changed files, completed features, commands, test results, live integrations actually verified, missing credentials, known limitations, and the exact demo procedure.

## 1. Product definition

**Name:** ThreatLens AI  
**Tagline:** Evidence-Driven Cyber Threat Intelligence Agent

ThreatLens investigates a CVE identifier using authoritative vulnerability sources and live web research. It collects source-backed evidence, extracts normalized claims, checks whether evidence supports those claims, identifies meaningful contradictions, conducts bounded follow-up research for unresolved questions, and generates explainable reports.

### Core scope

- CVE investigation
- NVD, CISA Known Exploited Vulnerabilities (KEV), CVE Program records, and relevant official vendor advisories
- TinyFish Search and Fetch; use TinyFish Agent only if it materially improves a bounded research task and the current API contract is verified
- Source provenance and saved excerpts
- Claim extraction and claim-to-evidence linking
- Evidence verification and contradiction detection
- Targeted follow-up research for evidence gaps
- Transparent risk indicators
- Evidence graph
- Markdown and JSON report exports
- Tests, logs, safe configuration, and partial-failure handling

### Explicitly out of scope for the core prototype

- Asset inventory or environment-aware prioritization
- SBOM ingestion/dependency inventory
- Automated exploitation or intrusive testing
- Automatic remediation actions
- Nonessential enterprise integrations
- Claims of guaranteed truth, guaranteed detection, or global novelty

### Product principle

A smaller end-to-end workflow using real sources is more valuable than a large dashboard backed by mock data.

## 2. Required user journey

1. Analyst enters a CVE ID, for example `CVE-2024-3094`.
2. Backend validates the identifier and creates a persistent investigation.
3. Official-source adapters retrieve available baseline information.
4. TinyFish Search finds relevant live sources and TinyFish Fetch retrieves page content, following current official API contracts.
5. The system saves actual URLs, titles, excerpts, retrieval times, available publication dates, and content hashes where practical.
6. Claim extraction creates normalized candidate claims tied to evidence IDs.
7. Verification logic assigns a state and rationale to each important claim.
8. Contradiction detection compares relevant claims, taking dates, affected product/version scope, severity metric/version, and meaning into account.
9. The orchestrator identifies important unresolved questions and performs bounded follow-up research where appropriate.
10. A report presents source-backed facts, system assessments, uncertainty, gaps, and defensive recommendations.
11. The frontend shows the saved results and allows Markdown and JSON exports.

## 3. Target architecture

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS or the existing styling system if already established
- React Flow or equivalent for an interactive evidence graph
- Typed API client; no provider keys in frontend code

### Backend

- Python
- FastAPI
- Pydantic
- SQLite for the prototype
- SQLAlchemy or another consistent persistence approach
- Pytest
- HTTP client with explicit timeouts

### External services

- TinyFish Search API
- TinyFish Fetch API
- TinyFish Agent API only if needed and verified
- NVD
- CISA KEV catalog
- CVE Program records
- Official vendor advisories
- Gemini API through a backend adapter if a separate valid API key/quota is configured

AI is optional for deterministic paths. If Gemini is unavailable, structured source retrieval, validation, persistence, and basic deterministic checks must still work. Semantic extraction can be marked unavailable rather than faked.

## 4. Proposed repository structure

Use this as the target structure if starting fresh. If a project already exists, map its files to these responsibilities and avoid unnecessary rewrites.

```text
threatlens-ai/
├── README.md
├── .gitignore
├── .env.example
├── docs/
│   ├── IMPLEMENTATION_SPEC.md
│   ├── ARCHITECTURE.md
│   ├── API_CONTRACT.md
│   ├── DATA_MODEL.md
│   ├── SECURITY.md
│   ├── TEST_PLAN.md
│   └── DEMO_RUNBOOK.md
├── backend/
│   ├── pyproject.toml                  # or requirements.txt, choose one
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── logging.py
│   │   │   └── errors.py
│   │   ├── api/
│   │   │   ├── deps.py
│   │   │   └── routes/
│   │   │       ├── health.py
│   │   │       ├── investigations.py
│   │   │       ├── evidence.py
│   │   │       ├── graph.py
│   │   │       └── reports.py
│   │   ├── schemas/
│   │   │   ├── investigation.py
│   │   │   ├── source.py
│   │   │   ├── claim.py
│   │   │   ├── contradiction.py
│   │   │   └── report.py
│   │   ├── db/
│   │   │   ├── session.py
│   │   │   ├── models.py
│   │   │   └── migrations/             # only if migrations are adopted
│   │   ├── services/
│   │   │   ├── investigation_service.py
│   │   │   ├── orchestration_service.py
│   │   │   ├── evidence_service.py
│   │   │   ├── claim_service.py
│   │   │   ├── verification_service.py
│   │   │   ├── contradiction_service.py
│   │   │   ├── risk_service.py
│   │   │   └── report_service.py
│   │   ├── integrations/
│   │   │   ├── base.py
│   │   │   ├── tinyfish_search.py
│   │   │   ├── tinyfish_fetch.py
│   │   │   ├── tinyfish_agent.py
│   │   │   ├── nvd.py
│   │   │   ├── cisa_kev.py
│   │   │   ├── cve_program.py
│   │   │   ├── vendor_advisories.py
│   │   │   └── gemini.py
│   │   ├── security/
│   │   │   ├── url_validation.py
│   │   │   └── untrusted_content.py
│   │   └── utils/
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── api/
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── api/
        │   ├── client.ts
        │   ├── investigations.ts
        │   └── reports.ts
        ├── components/
        │   ├── layout/
        │   ├── common/
        │   ├── evidence/
        │   ├── graph/
        │   └── investigation/
        ├── pages/
        │   ├── DashboardPage.tsx
        │   ├── InvestigationsPage.tsx
        │   ├── NewInvestigationPage.tsx
        │   ├── InvestigationDetailPage.tsx
        │   ├── EvidencePage.tsx
        │   ├── GraphPage.tsx
        │   ├── ContradictionsPage.tsx
        │   ├── RiskPage.tsx
        │   ├── ReportPage.tsx
        │   └── SettingsPage.tsx
        ├── hooks/
        ├── types/
        ├── utils/
        └── styles/
    └── tests/
```

## 5. Backend module responsibilities

- `integrations/`: provider-specific HTTP calls, parsing, normalization, timeouts, and provider errors. Must not decide whether an overall claim is true.
- `evidence_service.py`: persist source metadata and excerpts, maintain provenance, and validate evidence references.
- `claim_service.py`: normalize candidate claims and link them to evidence.
- `verification_service.py`: evaluate support using evidence references and deterministic rules where possible.
- `contradiction_service.py`: compare relevant claims and explain context.
- `orchestration_service.py`: coordinate stages, progress, bounded retries, research budgets, and partial results.
- `risk_service.py`: present official values separately from clearly labelled derived indicators.
- `report_service.py`: generate Markdown/JSON from persisted findings only.
- API routes: validate requests and return typed response models; keep business logic out of route handlers.
- Frontend: render API data and honest states; never fabricate live results.

## 6. Data model

Implement persistent entities with stable IDs, timestamps, foreign keys, and useful indexes.

### Investigation
- `id`
- `cve_id`
- `status` (`queued`, `running`, `completed`, `partial`, `failed`)
- `created_at`, `updated_at`, `completed_at`
- `progress_stage` or equivalent
- `error_summary` where applicable

### Source
- `id`, `investigation_id`
- `url`, `domain`, `title`, `source_type`
- `published_at` (nullable)
- `retrieved_at`
- `content_hash` where practical
- provider metadata that is safe and useful

### Evidence
- `id`, `source_id`
- exact relevant `excerpt`
- optional locator/section metadata
- extraction method and timestamp

### Claim
- `id`, `investigation_id`
- `claim_type`, `subject`, `value`, `text`
- affected product/version fields when relevant
- verification status and rationale

### ClaimEvidence relationship
- `claim_id`, `evidence_id`
- relationship (`supports`, `challenges`, `context`)
- rationale

### Contradiction
- `id`, `investigation_id`
- `claim_a_id`, `claim_b_id`
- type, explanation, review status

### ResearchTask
- `id`, `investigation_id`
- question, query, status, attempts, timestamps
- bounded budget/cost metadata if available

### Report
- `id`, `investigation_id`
- format/schema version, generated time, structured report data

### Data integrity rules

- Publication time and retrieval time are distinct. Never invent publication dates.
- Save the actual excerpt used for analysis and enough metadata to trace it.
- Validate that evidence IDs exist and belong to the relevant investigation.
- Preserve retrieval records or hashes where practical so changes can be audited.
- Reports and graph data must come from persisted entities, not UI-only objects.

## 7. API contract

Implement these endpoints with typed request/response models and consistent error responses.

| Method | Endpoint | Behavior |
|---|---|---|
| `GET` | `/api/health` | Health and non-secret dependency status |
| `POST` | `/api/investigations` | Validate CVE, create investigation, return ID/status |
| `GET` | `/api/investigations` | List persisted investigations |
| `GET` | `/api/investigations/{id}` | Status, progress, summary and errors |
| `GET` | `/api/investigations/{id}/evidence` | Sources, excerpts, claims and evidence links |
| `GET` | `/api/investigations/{id}/graph` | Nodes/edges from persisted records |
| `GET` | `/api/investigations/{id}/report` | Structured report |
| `GET` | `/api/investigations/{id}/export?format=markdown` | Markdown download |
| `GET` | `/api/investigations/{id}/export?format=json` | JSON download |

Implementation requirements:

- Do not keep a long investigation running inside an HTTP request indefinitely. Return an investigation ID and expose progress by polling or another simple reliable mechanism.
- Handle unknown investigation IDs with `404`.
- Use suitable status codes for validation errors and provider failures.
- Make repeated submissions reasonably safe and avoid accidental duplicate runs where possible.
- Keep the frontend API base URL configurable.
- Document actual request and response schemas in `docs/API_CONTRACT.md` or through the generated OpenAPI schema.

## 8. Evidence verification

Use these states:

- `supported`: available evidence directly supports the claim within its scope.
- `contradicted`: relevant evidence materially conflicts with the claim.
- `insufficient_evidence`: retrieved material does not establish the claim.
- `needs_review`: evidence is ambiguous, incomplete, or requires human judgment.

Rules:

1. A source being official does not mean it supports every claim extracted from it.
2. An LLM may propose a support classification but must cite evidence IDs supplied to it.
3. Backend code must validate every cited evidence ID.
4. Use deterministic checks for structured facts such as CVE identifiers, dates, score versions, and version ranges where feasible.
5. Semantic judgments must include a rationale and must not be presented as guaranteed truth.
6. Missing excerpts mean the claim cannot be labelled supported.
7. A claim may have multiple sources and both supporting and challenging evidence.
8. Preserve the original claim text and the system's normalized representation.

## 9. Contradiction detection

Compare claims using:
- claim meaning/type and subject
- CVE and affected product/version
- source publication date and retrieval date
- severity metric and scoring version
- exploitation statements and their time scope
- patch/remediation status and relevant product versions

Do not treat all differences as contradictions. Different CVSS versions, vendor-specific scoring, affected-version scope, or an older advisory may explain apparent disagreement.

For each detected contradiction, store:
- the two or more claim IDs
- linked evidence IDs
- conflict category
- explanation
- context considered
- review status

If evidence cannot resolve a disagreement, use `needs_review` or an equivalent qualified state instead of asserting certainty. Do not create a contradiction merely to fill a UI card.

## 10. Follow-up research and budgets

The orchestrator should identify concrete questions from evidence gaps, for example:
- Is the affected-version range confirmed by an official vendor advisory?
- Is there a patch, and which versions does it cover?
- Is exploitation confirmed by an authoritative source?
- Are two severity values based on different scoring versions?

Run targeted follow-up searches only when they can improve an important unresolved claim. Set conservative configurable limits for:
- total research steps
- retries per source
- wall-clock runtime
- response size
- agent steps/cost if applicable

Persist each research task and its result. When the budget is exhausted, stop and report unresolved gaps. Do not loop indefinitely.

## 11. Risk assessment

Keep authoritative severity separate from ThreatLens-generated assessments.

- Show published CVSS score, scoring version, vector, and source when available.
- Show CISA KEV inclusion only when confirmed from retrieved authoritative data.
- Show exploitation and patch statements only with source evidence.
- Display evidence coverage, freshness, and unresolved questions separately from vulnerability severity.
- If deriving a ranking, document its rules and inputs and label it `ThreatLens assessment`.
- Never invent a score, exploitation status, patch availability, or numerical confidence.

## 12. Report format

Reports should include:

1. Investigation metadata and status.
2. Executive summary separating facts from uncertainty.
3. Vulnerability overview and affected products/versions with citations.
4. Published severity and exploitation information with source attribution.
5. Claims and verification states, each linked to relevant evidence.
6. Contradictions and contextual explanations.
7. Unresolved gaps and follow-up attempts.
8. Defensive recommendations grounded in official guidance.
9. Source register with URLs, titles, retrieval times and known publication dates.
10. Partial failures, limitations, and report generation metadata.

Exports must be generated from persisted investigation data. Markdown must preserve readable source links. JSON must follow a documented schema and validate before download.

## 13. Frontend pages

Build these pages and make all navigation and controls functional:

1. **Dashboard:** real saved investigation counts, recent runs, status summary.
2. **Investigations:** list and open prior investigations.
3. **New Investigation:** CVE input and submit action.
4. **Investigation Detail:** summary, progress, findings, source failures.
5. **Evidence Viewer:** URLs, excerpts, dates, claim relationships, verification rationale.
6. **Evidence Graph:** actual persisted claim/source nodes and edges; click nodes to inspect.
7. **Contradiction Review:** competing claims, sources, dates, scope, explanation and review state.
8. **Risk Assessment:** published metrics and clearly labelled derived indicators.
9. **Report:** full report and Markdown/JSON exports.
10. **Settings/Integration Status:** whether services are configured, without revealing key values.

### UI states

Implement loading, empty, completed, partial, failed, and not-configured states. The UI must distinguish “no contradiction found” from “contradiction analysis unavailable.” Use text labels as well as colors.

Visual style: dark SOC-inspired interface, midnight navy base, restrained green for supported evidence, amber for uncertainty/review, and red for critical severity or errors. Do not prioritize visual polish over functionality.

## 14. Security and reliability requirements

- Store API keys only on the backend; add `.env` to `.gitignore`.
- Provide `.env.example` with variable names and placeholder values only.
- Validate outbound URLs and redirects to reduce SSRF risk; block localhost/private/link-local and prohibited destinations where appropriate.
- Treat web pages, snippets and advisories as untrusted data, not instructions.
- Mitigate prompt injection by separating retrieved content from system instructions and constraining outputs to schemas.
- Render external text safely; do not inject untrusted HTML.
- Apply connect/read timeouts, response-size caps, bounded retries and research budgets.
- Avoid logging keys, authorization headers, or unnecessary sensitive data.
- Preserve partial results and report unavailable sources explicitly.
- Do not execute exploit code or perform intrusive testing.

## 15. Testing requirements

Tests should use mocked HTTP responses and should not require live external services.

### Unit tests
- CVE ID validation
- NVD/CISA/CVE/vendor response parsing
- evidence normalization and reference integrity
- verification states and rationales
- contradiction cases and context-sensitive false positives
- risk calculation/labeling rules
- report generation

### Integration/API tests
- create/list/get investigation
- unknown investigation returns 404
- malformed request returns a clear validation error
- persisted data survives app/database reinitialization as appropriate
- graph output references actual saved entities
- Markdown and JSON exports validate

### Failure-path tests
- TinyFish timeout
- provider HTTP error/rate limit
- malformed or empty response
- blocked or inaccessible source
- missing API key
- research budget exhaustion
- one source fails while other sources succeed
- invalid evidence ID supplied by AI output
- export with optional fields missing

Keep real API checks separate from the deterministic automated test suite.

## 16. Implementation phases and exit criteria

### Phase 0 — Workspace inspection
Deliver: current file map, existing dependencies, existing run commands, gaps, and planned file changes.
Exit: no destructive edits have been made before inspection.

### Phase 1 — Application foundation
Deliver: FastAPI app, React app, configuration, SQLite schema, health endpoint, typed API client, basic investigation persistence.
Exit: frontend and backend run; a test investigation can be created and retrieved.

### Phase 2 — Real source retrieval
Deliver: official source adapters and TinyFish Search/Fetch clients based on current official docs.
Exit: at least one real CVE produces persisted, traceable source material. If credentials are missing, report the limitation and test the adapter with mocks without claiming live success.

### Phase 3 — Evidence pipeline
Deliver: normalized sources, excerpts, claims, claim-evidence links, verification states.
Exit: tests prove invalid/missing evidence cannot be labelled supported.

### Phase 4 — Contradictions and follow-up
Deliver: contextual comparison, research gap generation, bounded follow-up, partial-failure handling.
Exit: test cases distinguish a genuine conflict from differences in dates/scope/scoring version.

### Phase 5 — Frontend
Deliver: investigation pages, evidence viewer, graph, contradiction review, risk view.
Exit: UI displays persisted API results and all key states; no production fake data.

### Phase 6 — Reports
Deliver: Markdown/JSON report generation and exports.
Exit: exports preserve source links, uncertainty, and partial failures.

### Phase 7 — Hardening and demo
Deliver: security checks, tests, runbook, verified live demo.
Exit: a repeatable real CVE investigation completes, or the exact missing external dependency is clearly documented.

Phases are dependency-ordered, not time estimates. For a short hackathon, defer nonessential polish before sacrificing live integration or evidence integrity.

## 17. Environment variables

Use `.env.example` for names and safe placeholders only. Confirm actual names and requirements from current official docs.

- `TINYFISH_API_KEY` — TinyFish credentials if required by the current API
- `GEMINI_API_KEY` — optional Gemini API credentials
- `DATABASE_URL` — local SQLite configuration
- `NVD_API_KEY` — optional if required for the intended NVD usage
- `FRONTEND_ORIGIN` — allowed CORS origin
- `LOG_LEVEL` — logging verbosity
- `RESEARCH_MAX_STEPS` — maximum research/follow-up steps
- `REQUEST_TIMEOUT_SECONDS` — external request timeout

Do not assume a consumer AI subscription includes API credits. The application must display missing configuration safely.

## 18. Local development and verification

Antigravity must document commands that match the actual files it creates. A conventional example is:

```bash
# Backend
cd backend
python -m venv .venv
# Windows PowerShell activation:
.venv\\Scripts\\Activate.ps1
pip install -e .
uvicorn app.main:app --reload

# Frontend in a second terminal
cd frontend
npm install
npm run dev

# Backend tests
cd backend
pytest
```

If the repository uses `requirements.txt`, a different package manager, or another entry point, use that instead and update `README.md`.

## 19. Definition of done

Do not declare the project complete until:
- [ ] Frontend and backend start with documented commands.
- [ ] A CVE investigation can be created and retrieved.
- [ ] TinyFish has been tested against the live API when credentials are available.
- [ ] Actual URLs and excerpts are persisted and shown.
- [ ] Claims link to evidence or are explicitly marked insufficiently supported.
- [ ] Contradictions derive from actual claims and include context.
- [ ] Follow-up research is bounded and persisted.
- [ ] Graph uses saved relationships.
- [ ] Markdown and JSON exports work.
- [ ] Missing credentials and provider failures are handled honestly.
- [ ] Automated tests run and results are reported.
- [ ] A repeatable end-to-end demo is documented.
- [ ] Known limitations are explicit; no untested feature is claimed to work.

## 20. Final response required from Antigravity

When implementation is complete or the available work window ends, report:

1. Existing workspace summary before edits.
2. Files created and changed.
3. Features implemented versus incomplete.
4. Exact frontend/backend run commands.
5. Required environment variables and which integrations are configured.
6. Automated tests run and exact results.
7. Live APIs actually verified (do not infer this from code alone).
8. Known limitations and remaining work.
9. Exact steps to run one real CVE investigation and demonstrate evidence provenance.
