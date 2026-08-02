from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from commons.querys_testing import Querys
from core.database import get_db
from models.models import Carpeta, CarpetaTestPlan

router = APIRouter(prefix="/edshira/api/testing")

# Obtengo los casos de prueba asociados a un idTestPlan
@router.get("/get_cases_by_testplan/{idTestPlan}")
async def get_cases_by_testplan(idTestPlan: int, db: Session = Depends(get_db)):
    q = Querys(db)
    cases = q.getCasesByTestPlan(idTestPlan)
    if not cases:
        raise HTTPException(status_code=404, detail="Casos no encontrados")
    return cases

# Obtengo los planes de prueba asociados a un idProyecto
@router.get("/get_testplans/{idProyecto}")
async def get_testplans(idProyecto: int, db: Session = Depends(get_db)):
    q = Querys(db)
    testplans = q.getTestPlansByProyecto(idProyecto)
    if not testplans:
        raise HTTPException(status_code=404, detail="Planes de prueba no encontrados")
    return testplans

@router.post("/crear_carpeta")
async def crear_carpeta(carpeta: Carpeta, db: Session = Depends(get_db)):
    try:
        q = Querys(db)
        if carpeta.Padre == "":
            carpeta.Padre = "Root"
        nueva_carpeta = q.insertar_carpeta(carpeta.Nombre, carpeta.Padre, carpeta.Origen)
        return {"id": nueva_carpeta.idCarpeta}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear carpeta: {str(e)}")

@router.post("/set_carpeta")
async def set_carpeta(CarpetaTest: CarpetaTestPlan, db: Session = Depends(get_db)):
    try:
        q = Querys(db)
        idCarpetaTest = q.asignar_carpeta_a_testplan(CarpetaTest.idCarpeta, CarpetaTest.idTestPlan)
        return {"message": "Carpeta asignada al TestPlan correctamente", "id": idCarpetaTest}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al asignar carpeta al TestPlan: {str(e)}")