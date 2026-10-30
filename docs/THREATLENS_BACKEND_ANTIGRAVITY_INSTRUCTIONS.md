# ThreatLens AI --- Backend & AI Intelligence Build Instructions

**Owner:** Member 1 (Likhith)\
**Git branch:** `backend-dev`\
**Workspace:** `D:\THREATLENS_AI`\
**Primary ownership:** `backend/`, backend tests, and agreed API
documentation.

## 1. Read the shared project documents first

Before coding, read both files in the repository:

1.  `THREATLENS_AI_IMPLEMENTATION_SPEC.md`
2.  `THREATLENS_AI_FILE_BY_FILE_BUILD_GUIDE.md`

Treat those as the shared source of truth for product scope,
architecture, data model, API requirements, and acceptance criteria. If
this role guide conflicts with either shared document, stop and report
the conflict rather than silently choosing.

## 2. Your role

Build the backend and intelligence pipeline for ThreatLens AI, an
evidence-driven CVE investigation platform.

Own: - FastAPI application and API routing. - CVE baseline retrieval
from NVD and CISA KEV, plus official vendor/CVE sources as specified in
the shared documents. - TinyFish integration using the actual current
API documentation and verified credentials. - Evidence extraction with
source URL, retrieved timestamp, relevant excerpt, and provenance. -
Claim-to-source support checks and evidence verification. - Meaningful
contradiction detection that considers context such as affected
product/version, dates, CVSS version, and scope. - Transparent,
explainable risk indicators/scoring. - SQLite persistence and backend
tests.

Do not expand scope into asset inventory, environment-specific
prioritization, or SBOM analysis unless the shared specification
explicitly says otherwise.

## 3. Work boundaries

-   Work primarily inside `backend/` and backend test directories.
-   Do not modify `frontend/` or overwrite the frontend developer's
    work.
-   Do not invent evidence, CVEs, citations, source excerpts, API
    responses, or test results.
-   Do not hardcode demo contradictions or pretend a mock response came
    from TinyFish.
-   Keep API keys server-side in environment variables. Never commit
    `.env`, tokens, or secrets.
-   Use mocks only in clearly labelled tests; distinguish them from live
    integration results.
-   If TinyFish credentials or API limits are unavailable, implement a
    clean adapter/configuration boundary and report the limitation
    honestly. Do not fake a successful live integration.

## 4. First task --- inspect and plan, do not code yet

1.  Inspect the repository and current Git branch.
2.  Read both shared documents completely.
3.  Check whether `backend/` already contains work. Preserve existing
    work.
4.  Create or update `docs/IMPLEMENTATION_STATUS.md` with completed
    work, actual test commands/results, outstanding work, blockers/API
    credentials needed, and the next exact task.
5.  Propose the backend directory structure and dependency list.
6.  List required environment variables by name only; never ask the user
    to paste secret values into chat.
7.  Draft the API contract needed by the frontend developer, including
    request/response examples and error states.
8.  Report the plan and wait for approval before implementing.

## 5. API coordination with frontend

Coordinate with Member 2 before finalizing endpoints or response
schemas. Agree on CVE investigation request shape, investigation
status/IDs, CVE summary and risk fields, evidence item fields and
provenance, contradiction fields and supporting evidence references,
error/partial-result behavior, and export formats/endpoints if required.

Do not assume the frontend's schema. Share the proposed contract with
the teammate and agree on it before integration.

## 6. Implementation sequence

After approval, implement in small vertical slices: 1. Backend skeleton,
configuration, health endpoint, and tests. 2. CVE baseline-source
adapters. 3. TinyFish adapter using verified API contract. 4. Evidence
model, storage, and provenance. 5. Extraction and claim-to-source
verification. 6. Context-aware contradiction analysis. 7. Explainable
risk calculation. 8. Investigation orchestration and API response. 9.
Integration tests and documentation.

Follow the exact priorities and acceptance criteria in the shared
specification.

## 7. Git workflow

Before work:

``` bash
git checkout backend-dev
git pull origin backend-dev
```

After a tested, coherent change:

``` bash
git status
git add backend docs tests
git commit -m "Implement <specific backend capability>"
git push origin backend-dev
```

Do not force-push. Do not commit secrets or local databases. Coordinate
shared-file changes before editing them.

## 8. Definition of done

A feature is not complete merely because code was generated. It must run
locally, have relevant tests, report actual test results, handle
failures and missing sources honestly, preserve provenance, be
documented, and be committed to `backend-dev`.

## 9. First response required from Antigravity

Return architecture understanding, existing repository state, proposed
backend tree, dependencies, required environment-variable names,
proposed API contract for Member 2, phased implementation plan,
risks/blockers, and the first testable milestone.

**Wait for approval before writing implementation code.**
