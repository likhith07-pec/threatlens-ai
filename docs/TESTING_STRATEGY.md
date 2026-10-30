# Testing Strategy

## Overview
The test suite is divided into three distinct layers to keep live‑integration checks separate from pure unit logic.

| Layer | Purpose | Tools | Execution |
|-------|---------|-------|-----------|
| **Unit** | Pure Python logic – models, services, verification rules. | `pytest`, `pytest-asyncio` | `pytest tests/unit -q` |
| **Integration – Mocked** | Provider adapters exercised with mocked HTTP responses. | `respx` (or `responses`), `httpx` | `pytest tests/integration/mocked -q` |
| **Integration – Live** | Optional sanity‑check against real external APIs (NVD, TinyFish). | `httpx`, real credentials from env vars | `pytest tests/integration/live -q` (skipped if required env vars missing) |

### Mocked Integration Tests
- Use `respx.mock` to stub NVD, TinyFish, and CISA KEV endpoints.
- Verify that adapters correctly parse the official 2.0 NVD schema and produce a `SourceRecord`.
- Confirm proper error handling for 404, 429, and timeout scenarios.
- Ensure the orchestration service proceeds when one provider fails (partial result).

### Live Integration Tests
- Guarded by `@pytest.mark.skipif` that checks for `TINYFISH_API_KEY` and `NVD_API_KEY`.
- Perform a single real request for a known CVE (e.g., `CVE-2024-3094`).
- Assert that the returned `SourceRecord` contains a non‑empty `url`, `title`, and `excerpt`.
- Record the actual HTTP status; if the call fails, the test reports **"not executed"** rather than a false success.
- No live test will be marked as passed unless the real HTTP call succeeds.

### CI Expectations
- All **unit** and **mocked integration** tests must pass (`exit code 0`).
- **Live** tests are optional; CI should report them as **skipped** when credentials are absent.
- Coverage target: **≥ 80 %** for core services (`services/`, `integrations/`).

### Reporting
- Test run output includes a summary table indicating how many live tests were executed vs. skipped.
- The `IMPLEMENTATION_STATUS.md` file will be updated after each test run with exact pass/fail counts and any live‑integration observations.

---
*The strategy ensures reproducible automated testing while respecting external‑API rate limits and credential availability.*
