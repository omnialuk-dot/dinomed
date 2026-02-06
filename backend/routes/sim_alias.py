from fastapi import APIRouter, Request
from .simulazioni import StartPayload, start as start_sim

router = APIRouter(prefix="/api/sim", tags=["sim"])

@router.post("/start")
def start_alias(payload: StartPayload, request: Request):
    return start_sim(payload, request)
