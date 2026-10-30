# API Contract

## Overview
The backend exposes a **RESTful JSON API** consumed by the React frontend. All request and response bodies are defined as Pydantic models; the OpenAPI schema is generated automatically by FastAPI.

## Common Models
```python
from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional

class InvestigationStatus(str, Enum):
    queued = "queued"
    running = "running"
    completed = "completed"
    partial = "partial"
    failed = "failed"
    cancelled = "cancelled"

class VerificationState(str, Enum):
    verified = "verified"
    partially_supported = "partially_supported"
    contradicted = "contradicted"
    insufficient_evidence = "insufficient_evidence"
    needs_review = "needs_review"

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1, description="Page number (1‑based)")
    size: int = Field(20, ge=1, le=100, description="Items per page")

class ErrorResponse(BaseModel):
    detail: str
    code: str
```

## Endpoints
### Health
```http
GET /api/health
Response 200:
{
  "status": "ok",
  "integrations": {
    "tinyfish": "configured | missing",
    "nvd": "ok | missing",
    "cisa_kev": "ok"
  }
}
```

### Investigation CRUD
#### Create Investigation
```http
POST /api/investigations
Request:
{ "cve_id": "CVE-2024-1234" }
Response 201:
{ "id": "<uuid>", "status": "queued" }
Errors:
- 400 – invalid CVE format (`ErrorResponse` with code `INVALID_CVE`)
- 422 – validation error
```

#### List Investigations
```http
GET /api/investigations?page=1&size=20
Response 200:
{ "items": [ {"id": "<uuid>", "cve_id": "CVE-2024-1234", "status": "completed", "created_at": "..."} ], "total": 42 }
```

#### Get Investigation Detail
```http
GET /api/investigations/{id}
Response 200:
{ "id": "<uuid>", "cve_id": "CVE-2024-1234", "status": "running", "progress_stage": "fetching_sources", "error_summary": null, "created_at": "...", "updated_at": "...", "completed_at": null }
```

### Evidence Endpoint
```http
GET /api/investigations/{id}/evidence
Response 200:
{
  "sources": [
    {"id": "<uuid>", "url": "https://example.com/advisory", "title": "Vendor Advisory", "source_type": "vendor", "retrieved_at": "2024-10-01T12:34:56Z", "published_at": "2024-09-30T00:00:00Z", "excerpt": "...", "content_hash": "..."}
  ],
  "evidence": [
    {"id": "<uuid>", "source_id": "<uuid>", "excerpt": "...", "retrieved_at": "...", "verification_state": VerificationState.verified, "provenance": {"provider": "nvd", "metadata": {"cvss": "7.5"}}}
  ],
  "claims": [
    {"id": "<uuid>", "claim_type": "impact", "subject": "productX", "value": "v1.2", "text": "ProductX v1.2 is vulnerable", "verification_state": VerificationState.partially_supported, "evidence_ids": ["<uuid>"]}
  ]
}
```

### Graph Endpoint
```http
GET /api/investigations/{id}/graph
Response 200:
{ "nodes": [ {"id": "<uuid>", "type": "claim", "label": "..."}, {"id": "<uuid>", "type": "source", "label": "..."} ], "edges": [ {"source": "<claim-id>", "target": "<source-id>", "relationship": "supported"} ] }
```

### Report & Export
```http
GET /api/investigations/{id}/report
Response 200:
{ "id": "<uuid>", "generated_at": "...", "format_version": "1.0", "content": {"markdown": "...", "json": {"...": "..."}} }

GET /api/investigations/{id}/export?format=markdown|json
Response 200:
Content‑Disposition: attachment; filename="report.<ext>"
Content-Type: text/markdown or application/json
<file body>
```
Errors for report endpoints: 404 if report not yet generated, 400 for unsupported format.

## Pagination & Errors
All list endpoints accept `page` and `size` query parameters (see `PaginationParams`). Errors always follow the `ErrorResponse` schema with a machine‑readable `code`.

---
*This contract is frontend‑compatible and will be kept in sync with generated OpenAPI docs.*
