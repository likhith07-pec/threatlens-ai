# Architecture Overview

This document describes the high‑level architecture of the ThreatLens AI backend after the approved revisions.

## Core Components

- **FastAPI Application** – entry point (`backend/app/main.py`).
- **Configuration** – `backend/app/core/config.py` reads environment variables.
- **Database** – SQLite via SQLAlchemy; models defined in `backend/app/db/models.py`.
- **Integrations** – adapters for external data sources:
  - **NVD CVE API 2.0** – fetches baseline vulnerability data.
  - **TinyFish Search & Fetch** – stubbed until official docs are verified.
  - **CISA KEV** – catalog lookup.
  - **Vendor Advisories** – generic fetch with URL validation.
- **Services** – orchestration, evidence handling, claim verification, contradiction detection, risk scoring, and report generation.
- **Security Utilities** – URL validation and untrusted content handling.
- **API Layer** – typed routes exposing the contract to the frontend.

## Data Flow
1. Frontend calls `POST /api/investigations` with a CVE ID.
2. Orchestration service creates an investigation record and queues stages.
3. Integrations retrieve data (NVD 2.0, TinyFish, KEV, vendor sources).
4. Evidence is persisted with provenance (URL, timestamps, excerpt).
5. Claims are extracted, linked to evidence, and verified (`verified`, `partially_supported`, `contradicted`, `insufficient_evidence`, `needs_review`).
6. Contradiction service analyses claim pairs, respecting product/version and temporal context.
7. Risk service builds a ThreatLens risk score from separate signals (CVSS, KEV flag, evidence confidence, verified threat info).
8. Report service compiles a Markdown/JSON report.
9. Frontend polls status endpoints and displays persisted data.

## Diagram (Mermaid)
```mermaid
flowchart TD
    FE[Frontend] -->|API Calls| BE[FastAPI Backend]
    BE --> DB[(SQLite DB)]
    BE --> NVD[NVD CVE API 2.0]
    BE --> TF[TinyFish (stub)]
    BE --> KEV[CISA KEV Catalog]
    BE --> VA[Vendor Advisories]
    DB -->|Persist| Evidence[Evidence Records]
    DB -->|Persist| Claims[Claim Records]
    DB -->|Persist| Contradictions[Contradiction Records]
    DB -->|Persist| Risk[Risk Indicators]
    DB -->|Persist| Report[Report Records]
```

The architecture aligns with the revised implementation plan and will be realized without creating any backend code at this stage.
