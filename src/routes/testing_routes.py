from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from commons.querys_testing import Querys
from core.database import get_db
from models.models import Carpeta, CarpetaTestPlan, TestPlan, Test, TestCycle, CarpetaTestCycle, CasesList, TestExecution

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

@router.get("/get_carpetas")
async def get_carpetas(db: Session = Depends(get_db)):
    q = Querys(db)
    carpetas = q.getCarpetas()
    if not carpetas:
        raise HTTPException(status_code=404, detail="Carpetas no encontradas")
    return carpetas

@router.post("/crear_testplan")
async def crear_testplan(testplan: TestPlan, db: Session = Depends(get_db)):
    try:
        q = Querys(db)
        nueva_testplan = q.insertar_testplan(testplan.Nombre, testplan.Descripcion, testplan.idProyecto, testplan.idUsuario)
        return {"id": nueva_testplan.idTestPlan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear TestPlan: {str(e)}")

@router.post("/crear_test")
async def crear_test(test: Test, db: Session = Depends(get_db)):
    try:
        q = Querys(db)
        nuevo_test = q.insertar_test(test.Nombre, test.Descripcion, test.idTestPlan, test.idUsuario)
        return {"id": nuevo_test.idTest}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear Test: {str(e)}")

@router.get("/get_execution_state/{idTest}")
async def get_execution_state(idTest: int, db: Session = Depends(get_db)):
    q = Querys(db)
    estado = q.getEstadoEjecucion(idTest)
    if not estado:
        raise HTTPException(status_code=404, detail="Estado de ejecución no encontrado")
    return estado

@router.post("/crear_testcycle")
async def crear_testcycle(testcycle: TestCycle, db: Session = Depends(get_db)):
    try:
        q = Querys(db)
        nuevo_testcycle = q.insertar_testcycle(testcycle.Nombre, testcycle.Descripcion, testcycle.idProyecto, testcycle.idUsuario)
        return {"id": nuevo_testcycle.idTestCycle}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear TestCycle: {str(e)}")

@router.post("/asignar_carpeta_testcycle")
async def asignar_carpeta_testcycle(carpeta_testcycle: CarpetaTestCycle, db: Session = Depends(get_db)):
    try:
        q = Querys(db)
        idCarpetaTestCycle = q.asignar_carpeta_a_testcycle(carpeta_testcycle.idCarpeta, carpeta_testcycle.idTestCycle)
        return {"message": "Carpeta asignada al TestCycle correctamente", "id": idCarpetaTestCycle}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al asignar carpeta al TestCycle: {str(e)}")


@router.post("/import_cases")
async def import_cases(cases: CasesList, db: Session = Depends(get_db)):
    try:
        q = Querys(db)
        imported_cases = q.import_cases(cases.idTestCycle, cases.idUsuario, cases.tests)
        print(cases.tests)
        return {"message": "Casos importados correctamente", "cantidad_importada": imported_cases}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al importar casos: {str(e)}")
        
@router.post("/execute_test")
async def execute_test(test_execution: TestExecution, db: Session = Depends(get_db)):
    try:
        q = Querys(db)
        executed_test = q.execute_test(test_execution.idTest, test_execution.idTestCycle, test_execution.Estado, test_execution.FechaEjecucion. test_execution.idUsuario)
        return {"message": "Test ejecutado correctamente", "id": executed_test}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al ejecutar test: {str(e)}")