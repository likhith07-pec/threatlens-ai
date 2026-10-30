from sqlalchemy import Column, String, DateTime, Enum, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from ..db.base import Base

class Investigation(Base):
    __tablename__ = "investigations"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cve_id = Column(String, nullable=False, index=True)
    status = Column(String, nullable=False, default="queued")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
