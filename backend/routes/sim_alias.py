from fastapi import APIRouter, Request
from . import simulazioni as sim_mod

# Alias endpoints to support older frontend URLs:
# /api/simulation/* and /api/simulations/*

router = APIRouter(prefix="/api/simulation", tags=["simulazioni-alias"])
router2 = APIRouter(prefix="/api/simulations", tags=["simulazioni-alias"])

# Reuse the same callables from routes/simulazioni.py
@router.post("/start")
def start(payload: sim_mod.StartPayload, request: Request):
    return sim_mod.start(payload, request)

@router.post("/{session_id}/submit")
def submit(session_id: str, payload: sim_mod.SubmitPayload, request: Request):
    # request param unused in original submit; keep signature compatible
    return sim_mod.submit(session_id, payload)

@router2.post("/start")
def start2(payload: sim_mod.StartPayload, request: Request):
    return sim_mod.start(payload, request)

@router2.post("/{session_id}/submit")
def submit2(session_id: str, payload: sim_mod.SubmitPayload, request: Request):
    return sim_mod.submit(session_id, payload)
