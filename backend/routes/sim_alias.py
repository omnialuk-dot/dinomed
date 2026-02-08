from fastapi import APIRouter, Request, HTTPException
from pydantic import ValidationError

from .simulazioni import StartPayload, start as start_simulazioni, SubmitPayload, submit as submit_simulazioni

router = APIRouter(prefix="/api/sim", tags=["sim"])

@router.post("/start")
async def start(request: Request):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="JSON non valido")
    try:
        payload = StartPayload.model_validate(body)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=f"Payload non valido: {e.errors()}")
    # Call existing handler (sync)
    return start_simulazioni(payload, request)

@router.post("/{session_id}/submit")
async def submit(session_id: str, request: Request):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="JSON non valido")
    try:
        payload = SubmitPayload.model_validate(body)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=f"Payload non valido: {e.errors()}")
    return submit_simulazioni(session_id, payload, request)
