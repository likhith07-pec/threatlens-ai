# Integrations Design

## Overview
This document details the external provider adapters used by ThreatLens AI. Each adapter implements a thin, typed interface that returns a unified `SourceRecord` dataclass containing provenance information.

## Unified SourceRecord
```python
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Dict

@dataclass
class SourceRecord:
    provider: str               # e.g. "nvd", "tinyfish", "cisa_kev"
    url: str                    # original URL of the source
    title: Optional[str]
    excerpt: Optional[str]
    retrieved_at: datetime
    published_at: Optional[datetime]
    content_hash: Optional[str]
    metadata: Dict[str, str]   # provider‑specific fields (e.g. cvss, kev_status)
```

## NVD CVE API 2.0 (`integrations/nvd.py`)
- **Endpoint**: `GET https://services.nvd.nist.gov/rest/json/cves/2.0?cveId={CVE_ID}`
- **Headers**: `apiKey: <NVD_API_KEY>` when the environment variable is set.
- **Response schema** (excerpt of the official 2.0 JSON):
  ```json
  {
    "vulnerabilities": [
      {
        "cve": {"id": "CVE-2024-1234", "description": {...}},
        "metrics": {"cvssMetricV31": [{"cvssData": {"baseScore": 7.5, "vectorString": "..."}}]},
        "published": "2024-09-30T00:00:00.000",
        "lastModified": "2024-10-01T12:34:56.000"
      }
    ]
  }
  ```
- **Parsing**: Extract the first element of `vulnerabilities` (index 0) and pull:
  - `cve.id`
  - `description` (English text)
  - `metrics.cvssMetricV31[0].cvssData` for CVSS severity
  - `published` and `lastModified` timestamps
- **Returned SourceRecord** example:
  ```python
  SourceRecord(
      provider="nvd",
      url=f"https://nvd.nist.gov/vuln/detail/{cve_id}",
      title=f"NVD entry for {cve_id}",
      excerpt=description,
      retrieved_at=datetime.utcnow(),
      published_at=datetime.fromisoformat(published),
      content_hash=None,
      metadata={"cvss": str(base_score), "vector": vector_string}
  )
  ```
- **Error handling**:
  - 404 → `ProviderNotFound`
  - 429 → `RateLimited`
  - Other non‑2xx → `ProviderError`
  - Network timeout → raise `ProviderTimeout`

## TinyFish Search & Fetch (`integrations/tinyfish_search.py`, `tinyfish_fetch.py`)
- **Status**: Official TinyFish API documentation has not been verified yet. We therefore provide a **stub interface** that raises `ProviderNotConfigured` until documentation and credentials are confirmed.
- **Interface contract** (defined in `integrations/base.py`):
  ```python
  class TinyFishAdapter(Protocol):
      async def search(self, query: str) -> List[SourceRecord]: ...
      async def fetch(self, url: str) -> SourceRecord: ...
  ```
- **Implementation note**: Concrete authentication headers, endpoints, and payload formats will be added once the official TinyFish API documentation is verified.
- **Fallback**: The orchestrator will treat TinyFish as *not configured* and continue with other providers.

## CISA KEV (`integrations/cisa_kev.py`)
- **Catalog source**: Public CSV/JSON published by CISA (e.g., `https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.csv`).
- **Process**:
  1. Download the catalog on first start (cached locally under `data/kev.csv`).
  2. Parse rows into a dict `{cve_id: {dateAdded, sourceURL, ...}}`.
  3. Lookup the target CVE; if present, create a `SourceRecord` with `provider="cisa_kev"` and include the catalog fields in `metadata`.
- **Error handling**: If the download fails, raise `ProviderUnavailable` and mark the KEV status as `missing` in the health endpoint.

## Vendor Advisories (`integrations/vendor_advisories.py`)
- **Discovery**: Simple URL construction based on known vendor domains (e.g., `https://security.vendor.com/advisories/{cve_id}`).
- **Validation**: Use `url_validation` utilities to reject private or localhost URLs.
- **Fetching**: Re‑use the TinyFish fetch contract if TinyFish is configured; otherwise perform a plain `httpx.get` with the same timeout rules.
- **Normalization**: Extract title and a short excerpt (first 300 characters) and store as `SourceRecord`.
- **Graceful degradation**: If a vendor page cannot be reached, record the failure in the investigation’s `partial` state but do not abort the whole pipeline.

## Adapter Return Type
All adapters return a **list of `SourceRecord`** (search) or a **single `SourceRecord`** (fetch). The orchestration service aggregates these lists, deduplicates by URL/content hash, and persists them.

---
*The design ensures that live integration code can be added later without changing the surrounding services.*surrounding services.*surrounding services.*surrounding services.*surrounding services.*surrounding services.
