import os
import csv
import httpx
from datetime import datetime
from ..models.source import Source
from ..core.config import settings

async def fetch_kev_source(cve_id: str, investigation_id: str, db_session) -> Source | None:
    # Download KEV CSV if not cached locally
    cache_path = os.path.join(os.path.dirname(__file__), "..", "data", "kev.csv")
    if not os.path.exists(cache_path):
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(settings.CISA_KEV_URL)
            if resp.status_code != 200:
                return None
            os.makedirs(os.path.dirname(cache_path), exist_ok=True)
            with open(cache_path, "wb") as f:
                f.write(resp.content)
    # Parse CSV
    with open(cache_path, newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row.get("CVE_ID") == cve_id:
                published = row.get("DateAdded")
                source = Source(
                    investigation_id=investigation_id,
                    provider="cisa_kev",
                    url=row.get("SourceURL", ""),
                    title=f"CISA KEV entry for {cve_id}",
                    excerpt=row.get("Title", ""),
                    retrieved_at=datetime.utcnow(),
                    published_at=datetime.fromisoformat(published) if published else None,
                    content_hash=None,
                    metadata=str({"vendor": row.get("VendorProject"), "product": row.get("Product"), "vulnerable_configuration": row.get("VulnerableConfiguration")})
                )
                return source
    return None
