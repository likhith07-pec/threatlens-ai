from pydantic import BaseModel, Field, validator
import re
from typing import Optional

class InvestigationCreate(BaseModel):
    cve_id: str = Field(..., description="CVE identifier, e.g., CVE-2024-1234")

    @validator('cve_id')
    def validate_cve(cls, v):
        pattern = r'^CVE-\d{4}-\d+$'
        if not re.match(pattern, v):
            raise ValueError('Invalid CVE format')
        return v

class InvestigationRead(BaseModel):
    id: str
    cve_id: str
    status: str
    created_at: Optional[str]
    updated_at: Optional[str]
    completed_at: Optional[str]

    class Config:
        orm_mode = True
