from fastapi import APIRouter,Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from core.database import get_db
from commons.system_querys import Querys

router = APIRouter(prefix="/edshira")

@router.get("/")
async def read_root():
    return FileResponse("static/index.html")

@router.get("/backlog")
async def read_backlog():
    return FileResponse("static/backlog.html")

@router.get("/testing")
async def read_testing():
    return FileResponse("static/testing.html")

@router.get("/health", tags=["Sistema"])
async def health_check(db: Session = Depends(get_db)):
    try:
        # Realiza una consulta simple para verificar la conexión a la base de datos
        q = Querys(db)
        status = q.getDBStatus()

        if status["status"] != "ok":
            raise HTTPException(status_code=503, detail="Fallo en la conexión a la base de datos")
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=503, detail="Fallo en la conexión a la base de datos: " + str(e))