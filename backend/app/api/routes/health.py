from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health():
    return {"status": "ok", "integrations": {"tinyfish": "missing", "nvd": "ok", "cisa_kev": "ok"}}
