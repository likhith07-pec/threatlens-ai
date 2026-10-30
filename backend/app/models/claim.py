from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Text
import uuid
from datetime import datetime
from ..db.base import Base

class Claim(Base):
    __tablename__ = "claims"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String, ForeignKey('investigations.id'), nullable=False)
    claim_type = Column(String, nullable=False)
    subject = Column(String, nullable=True)
    value = Column(String, nullable=True)
    text = Column(Text, nullable=True)
    verification_state = Column(String, nullable=False, default="needs_review")
    verification_rationale = Column(Text, nullable=True)
    evidence_id = Column(String, ForeignKey('sources.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
