import os
import httpx
from datetime import datetime
from ..models.source import Source
from ..core.config import settings

async def fetch_nvd_source(cve_id: str, investigation_id: str, db_session) -> Source | None:
    url = f"https://services.nvd.nist.gov/rest/json/cves/2.0?cveId={cve_id}"
    headers = {}
    if settings.NVD_API_KEY:
        headers["apiKey"] = settings.NVD_API_KEY
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url, headers=headers)
        if resp.status_code != 200:
            return None
        data = resp.json()
        vulns = data.get("vulnerabilities", [])
        if not vulns:
            return None
        entry = vulns[0]
        cve = entry.get("cve", {})
        metrics = entry.get("metrics", {})
        cvss_data = None
        if "cvssMetricV31" in metrics:
            cvss_data = metrics["cvssMetricV31"][0].get("cvssData", {})
        description = cve.get("description", {}).get("description_data", [{}])[0].get("value", "")
        published = entry.get("published")
        last_modified = entry.get("lastModified")
        source = Source(
            investigation_id=investigation_id,
            provider="nvd",
            url=f"https://nvd.nist.gov/vuln/detail/{cve_id}",
            title=f"NVD entry for {cve_id}",
            excerpt=description,
            retrieved_at=datetime.utcnow(),
            published_at=datetime.fromisoformat(published) if published else None,
            content_hash=None,
            metadata=str({"cvss": cvss_data.get("baseScore") if cvss_data else None, "vector": cvss_data.get("vectorString") if cvss_data else None})
        )
        return source
