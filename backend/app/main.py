
from app.services.cdc_service import fetch_latest_cdc_surveillance
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.services.who_service import fetch_who_outbreaks

app = FastAPI(
    title="Pulse 19 API",
    description="Global infectious disease outbreak intelligence",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
   allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://aditya090908.github.io",
],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "application": "Pulse 19 API",
        "status": "running",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/api/v1/outbreaks")
async def get_outbreaks(
    limit: int = Query(default=20, ge=1, le=100)
):
    try:
        reports = await fetch_who_outbreaks(limit)

        return {
            "meta": {
                "source": "WHO",
                "simulated": False,
                "record_type": "outbreak_reports",
                "count": len(reports),
            },
            "data": reports,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"WHO data retrieval failed: {str(exc)}",
        ) from exc

@app.get("/api/v1/surveillance/cdc/latest")
async def get_latest_cdc_surveillance():
    try:
        result = await fetch_latest_cdc_surveillance()
        return result

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"CDC data retrieval failed: {str(exc)}",
        ) from exc

