from fastapi import APIRouter, HTTPException
#from commons.querys import Querys

router = APIRouter(prefix="/edshira/api/admin")

@router.get("/get/")
async def get_func():
    return {"value": "Admin route funcionando"}
