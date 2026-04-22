from fastapi import APIRouter, HTTPException
from models.models import (Table)
from commons.querys import Querys

router = APIRouter(prefix="/edshira/api/projects")
q = Querys()


# Obtiene una SIM dado un sistema, y la pasa a Lockeado
@router.get("/get/")
async def get_func():
    result = q.get()

    return result

@router.post("/insert")
async def insert_func(value: ValueObject):
    result = q.insert(value.id, value.value)
    return result

@router.post("/update")
async def change_sim(v: ValueObject):
    id = q.update(v.id, v.value)

    return id

@router.post("/delete")
async def delete_func(value: ValueObject):
    result = q.delete(value.value)
    return result

