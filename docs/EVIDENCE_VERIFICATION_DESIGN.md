# Evidence Verification Design

## Verification States
| State | Meaning |
|-------|---------|
| `verified` | Evidence directly supports the claim (full match). |
| `partially_supported` | Evidence supports part of the claim (e.g., overlapping version range). |
| `contradicted` | Evidence materially conflicts with the claim. |
| `insufficient_evidence` | No evidence found that can support or refute the claim. |
| `needs_review` | Ambiguous or incomplete evidence; human judgment required. |

## Persisted Evidence Record
```python
class EvidenceRecord(BaseModel):
    id: UUID
    source_id: UUID
    excerpt: str
    retrieved_at: datetime
    published_at: Optional[datetime]
    verification_state: str  # one of the states above
    provenance: Dict[str, Any]  # provider, metadata, content_hash, etc.
```
- **URL** and **title** are stored in the related `Source` record.
- **content_hash** helps deduplication.
- **provenance** includes provider name (`nvd`, `tinyfish`, `cisa_kev`, `vendor`) and any raw fields needed for audit.

## Contradiction Rules
1. Compare claims only when they share the same **subject** and **claim_type**.
2. Evaluate **affected product/version** overlap:
   - If versions intersect, a conflict may be material.
   - If one claim refers to a newer version and the other to an older version, treat as a version‑scope difference, not a contradiction.
3. Consider **temporal context**:
   - Use `published_at` of the source; newer advisories can supersede older statements.
   - CVSS version differences are handled separately (not a contradiction).
4. Only create a `ContradictionRecord` when the conflict cannot be resolved by version or date differences.

## Service Flow
1. Evidence adapters persist `Source` and `EvidenceRecord`.
2. `claim_service` links claims to evidence IDs.
3. `verification_service` assigns a verification state based on the linked evidence.
4. `contradiction_service` runs after verification and generates contradictions following the rules above.

---
*All states are stored verbatim; the UI will display the state label and a short rationale.*
