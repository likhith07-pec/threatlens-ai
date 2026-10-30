# Risk Scoring Design

## Goal
Separate raw CVSS severity from the derived ThreatLens risk score while keeping full provenance for each signal.

## Signals Used
| Signal | Source | Type | Description |
|--------|--------|------|-------------|
| **CVSS Severity** | NVD (CVE API 2.0) | Numeric (0‑10) | Raw CVSS base score, version, vector string. Stored verbatim; never altered. |
| **KEV Inclusion** | CISA KEV catalog | Boolean | `True` if the CVE appears in the KEV list, otherwise `False`. |
| **Evidence Confidence** | Internal verification state | Enum (`verified`, `partially_supported`, `contradicted`, `insufficient_evidence`, `needs_review`) | Maps to confidence levels: `verified` = high, `partially_supported` = medium, `contradicted` = low, others = very low. |
| **Verified Threat Info** | Provider adapters (vendor advisories, exploitation statements) | Categorical | Flags such as `exploitation_confirmed`, `patch_available`, `remediation_advisory`. |

## Derivation Formula (example)
```
risk_score = (
    cvss_weight * cvss_normalized +
    kev_weight * (1 if kev_included else 0) +
    evidence_confidence_weight * confidence_factor +
    threat_info_weight * threat_info_factor
)
```
- `cvss_normalized` = `cvss_score / 10`
- `confidence_factor` = 1.0 for `verified`, 0.6 for `partially_supported`, 0.3 for `contradicted`, 0.0 otherwise
- `threat_info_factor` = 1.0 if any verified threat flag is true, else 0.0
- **Default Weights** (can be overridden via env vars):
  - `RISK_CVSS_WEIGHT` = 0.5
  - `RISK_KEV_WEIGHT` = 0.2
  - `RISK_EVIDENCE_CONFIDENCE_WEIGHT` = 0.2
  - `RISK_THREAT_INFO_WEIGHT` = 0.1

## Missing‑Data Behavior
If any required signal cannot be obtained (e.g., NVD request fails and no CVSS is available, or the KEV catalog is unavailable), the derived `risk_score` is **omitted** and the UI displays “insufficient data”. Individual signals that are missing are simply excluded from the formula; the remaining weighted components are still applied.

## Output Model (`backend/app/schemas/risk.py`)
```python
class RiskScore(BaseModel):
    cvss_score: float
    cvss_version: str
    kev_included: bool
    evidence_confidence: str  # one of the verification states
    threat_flags: List[str]    # e.g., ["exploitation_confirmed", "patch_available"]
    derived_score: float       # 0‑1 normalized
    explanation: str           # human‑readable rationale
```

## Presentation
- Frontend receives the `RiskScore` object alongside investigation details.
- UI shows **raw CVSS** in a distinct field (e.g., red badge) and **ThreatLens risk** as a separate green badge with a tooltip explaining the contributing signals.
- No signal is hidden; every component is listed in the tooltip for transparency.

## Safety Guarantees
- The system never fabricates a CVSS value; it is always taken from NVD.
- KEV flag is only set when the official catalog contains the CVE.
- Evidence confidence is derived from the verification state defined in `EVIDENCE_VERIFICATION_DESIGN.md`.
- If any required signal is missing (e.g., no CVSS because NVD failed), the derived score is omitted and the UI displays “insufficient data”.

---
*This design will be implemented after the API contract and integration adapters are in place.*
