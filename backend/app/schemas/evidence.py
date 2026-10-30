from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class EvidenceRead(BaseModel):
    id: str = Field(..., description="Evidence record UUID")
    provider: str = Field(..., description="Source provider (e.g., nvd, cisa_kev)")
    url: str = Field(..., description="Original source URL")
    title: Optional[str] = Field(None, description="Title of the source document")
    excerpt: Optional[str] = Field(None, description="Short excerpt or description")
    retrieved_at: datetime = Field(..., description="Timestamp when the source was fetched")
    published_at: Optional[datetime] = Field(None, description="Original publication timestamp if available")
    metadata: Optional[str] = Field(None, description="JSON string with provider‑specific metadata")

    class Config:
        orm_mode = True
