from sqlalchemy import Column, String, DateTime, Text, Boolean, ForeignKey
from datetime import datetime
import uuid
from ..db.base import Base

class Source(Base):
    __tablename__ = "sources"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String, ForeignKey('investigations.id'), nullable=False)
    provider = Column(String, nullable=False)
    url = Column(String, nullable=False)
    title = Column(String, nullable=True)
    excerpt = Column(Text, nullable=True)
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)
    content_hash = Column(String, nullable=True)
    metadata = Column(Text, nullable=True)  # JSON string of provider‑specific metadata
