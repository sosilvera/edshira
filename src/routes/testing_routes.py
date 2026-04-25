from fastapi import APIRouter, HTTPException
from commons.querys import Querys

router = APIRouter(prefix="/edshira/api/testing")

# Obtiene una SIM dado un sistema, y la pasa a Lockeado
@router.get("/get/")
async def get_func():

    return {"value": "Testing route funcionando"}
