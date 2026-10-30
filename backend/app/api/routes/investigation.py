from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from ..schemas.investigation import InvestigationCreate, InvestigationRead
from ..models.investigation import Investigation
from ..integrations.nvd import fetch_nvd_source
from ..integrations.cisa_kev import fetch_kev_source
from ..db.base import get_db
from typing import List

router = APIRouter()

@router.post("/investigations", response_model=InvestigationRead, status_code=status.HTTP_201_CREATED)
async def create_investigation(payload: InvestigationCreate, db: AsyncSession = Depends(get_db)):
    # Create investigation record
    inv = Investigation(cve_id=payload.cve_id, status="queued")
    db.add(inv)
    await db.commit()
    await db.refresh(inv)
    # Fetch external data
    try:
        nvd_source = await fetch_nvd_source(payload.cve_id, inv.id, db)
        if nvd_source:
            db.add(nvd_source)
    except Exception:
        pass
    try:
        kev_source = await fetch_kev_source(payload.cve_id, inv.id, db)
        if kev_source:
            db.add(kev_source)
    except Exception:
        pass
    # Update status
    inv.status = "completed"
    await db.commit()
    await db.refresh(inv)
    return InvestigationRead.from_orm(inv)

@router.get("/investigations", response_model=List[InvestigationRead])
async def list_investigations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT * FROM investigations"))
    rows = result.fetchall()
    return [InvestigationRead.from_orm(row) for row in rows]

@router.get("/investigations/{investigation_id}", response_model=InvestigationRead)
async def get_investigation(investigation_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT * FROM investigations WHERE id=:id"), {"id": investigation_id})
    inv = result.fetchone()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return InvestigationRead.from_orm(inv)
