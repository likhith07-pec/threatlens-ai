import json
from typing import List, Optional
from datetime import datetime
from ..models.claim import Claim
from ..models.source import Source
from ..core.config import settings

# Helper to create Claim instances (not yet persisted)
def _make_claim(
    investigation_id: str,
    claim_type: str,
    subject: Optional[str] = None,
    value: Optional[str] = None,
    text: Optional[str] = None,
    evidence_id: Optional[str] = None,
) -> Claim:
    return Claim(
        investigation_id=investigation_id,
        claim_type=claim_type,
        subject=subject,
        value=value,
        text=text,
        evidence_id=evidence_id,
    )

# NVD extraction – expects the Source.metadata field to contain the raw NVD JSON string
def extract_nvd_claims(source: Source) -> List[Claim]:
    claims: List[Claim] = []
    if not source.metadata:
        return claims
    try:
        data = json.loads(source.metadata)
    except json.JSONDecodeError:
        return claims
    # The NVD 2.0 response structure
    vulnerabilities = data.get("vulnerabilities", [])
    if not vulnerabilities:
        return claims
    entry = vulnerabilities[0]
    cve = entry.get("cve", {})
    metrics = entry.get("metrics", {})
    # Description claim
    description = cve.get("description", {}).get("description_data", [{}])[0].get("value")
    if description:
        claims.append(_make_claim(
            investigation_id=source.investigation_id,
            claim_type="description",
            text=description,
            evidence_id=source.id,
        ))
    # CVSS claims (use CVSS v3.1 if present)
    cvss_data = None
    if "cvssMetricV31" in metrics:
        cvss_data = metrics["cvssMetricV31"][0].get("cvssData", {})
    elif "cvssMetricV30" in metrics:
        cvss_data = metrics["cvssMetricV30"][0].get("cvssData", {})
    if cvss_data:
        base_score = cvss_data.get("baseScore")
        vector = cvss_data.get("vectorString")
        if base_score is not None:
            claims.append(_make_claim(
                investigation_id=source.investigation_id,
                claim_type="cvss_score",
                value=str(base_score),
                evidence_id=source.id,
            ))
        if vector:
            claims.append(_make_claim(
                investigation_id=source.investigation_id,
                claim_type="cvss_vector",
                value=vector,
                evidence_id=source.id,
            ))
    # Affected products – iterate over configurations
    configurations = entry.get("configurations", [])
    for cfg in configurations:
        nodes = cfg.get("nodes", [])
        for node in nodes:
            cpe_match = node.get("cpeMatch", [])
            for match in cpe_match:
                cpe23Uri = match.get("cpe23Uri")
                vulnerable = match.get("vulnerable")
                if cpe23Uri and vulnerable:
                    # Simple parsing: split CPE into vendor/product/version
                    parts = cpe23Uri.split(":")
                    if len(parts) >= 5:
                        vendor = parts[3]
                        product = parts[4]
                        version = parts[5] if len(parts) > 5 else ""
                        subject = f"{vendor}:{product}"
                        claims.append(_make_claim(
                            investigation_id=source.investigation_id,
                            claim_type="affected_product",
                            subject=subject,
                            value=version,
                            evidence_id=source.id,
                        ))
    # References – each URL becomes a claim
    references = entry.get("references", [])
    for ref in references:
        url = ref.get("url")
        if url:
            claims.append(_make_claim(
                investigation_id=source.investigation_id,
                claim_type="reference",
                value=url,
                evidence_id=source.id,
            ))
    return claims

# CISA KEV extraction – expects Source.metadata to contain the CSV row as JSON string
def extract_kev_claims(source: Source) -> List[Claim]:
    claims: List[Claim] = []
    if not source.metadata:
        return claims
    try:
        row = json.loads(source.metadata)
    except json.JSONDecodeError:
        return claims
    cve_id = row.get("CVE_ID")
    if not cve_id:
        return claims
    # Title claim
    title = row.get("Title")
    if title:
        claims.append(_make_claim(
            investigation_id=source.investigation_id,
            claim_type="title",
            text=title,
            evidence_id=source.id,
        ))
    # Vendor/Product claim
    vendor = row.get("VendorProject")
    product = row.get("Product")
    if vendor and product:
        claims.append(_make_claim(
            investigation_id=source.investigation_id,
            claim_type="vendor_product",
            subject=vendor,
            value=product,
            evidence_id=source.id,
        ))
    # Exploit status claim
    exploit_status = row.get("ExploitationState") or row.get("ExploitationStatus")
    if exploit_status:
        claims.append(_make_claim(
            investigation_id=source.investigation_id,
            claim_type="exploit_status",
            value=exploit_status,
            evidence_id=source.id,
        ))
    return claims
