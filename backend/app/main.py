from fastapi import FastAPI
from .api.routes import investigation, health
from .db.base import engine, Base

app = FastAPI(title="ThreatLens AI MVP")

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(health.router, prefix="/api")
app.include_router(investigation.router, prefix="/api")
