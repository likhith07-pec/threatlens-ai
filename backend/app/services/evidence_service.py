import hashlib
import urllib.parse
from datetime import datetime
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from ..models.source import Source
from ..core.config import settings

def _normalize_url(url: str) -> str:
    """Normalize URL for duplicate detection.
    - Lower‑case scheme and host
    - Strip trailing slash
    - Remove default ports
    """
    parsed = urllib.parse.urlparse(url.strip())
    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()
    # Remove default ports
    if (scheme == "http" and netloc.endswith(":80")) or (scheme == "https" and netloc.endswith(":443")):
        netloc = netloc.rsplit(":", 1)[0]
    path = parsed.path.rstrip('/')
    normalized = urllib.parse.urlunparse((scheme, netloc, path, "", "", ""))
    return normalized

async def save_source(
    db: AsyncSession,
    investigation_id: str,
    provider: str,
    url: str,
    title: Optional[str] = None,
    excerpt: Optional[str] = None,
    retrieved_at: Optional[datetime] = None,
    published_at: Optional[datetime] = None,
    metadata: Optional[str] = None,
) -> Source:
    """Persist a Source record, deduplicating on (investigation_id, provider, normalized_url).
    Returns the existing or newly created Source.
    """
    norm_url = _normalize_url(url)
    # Look for existing source (SELECT ... FOR UPDATE to avoid race conditions)
    stmt = select(Source).where(
        and_(
            Source.investigation_id == investigation_id,
            Source.provider == provider,
            func.lower(Source.url) == norm_url,
        )
    ).with_for_update()
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    if existing:
        return existing
    # Create new source
    source = Source(
        investigation_id=investigation_id,
        provider=provider,
        url=url,  # keep original URL for provenance
        title=title,
        excerpt=excerpt,
        retrieved_at=retrieved_at or datetime.utcnow(),
        published_at=published_at,
        metadata=metadata,
    )
    db.add(source)
    await db.flush()  # ensure id is generated
    return source
