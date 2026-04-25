from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from commons.querys import Querys
from schema.database import get_db
from models.models import CreateSprintRequest, CreateTaskRequest, UpdateEstadoRequest, AssignResponsibleRequest

router = APIRouter(prefix="/edshira/api/projects")


@router.get("/sprintActivo/{idProject}")
async def get_sprint_activo(db: Session = Depends(get_db), idProject: int = None):
    q = Querys(db)
    result = q.getSprintActivo(idProject)

    return result


@router.post("/crear_sprint")
async def crear_sprint(payload: CreateSprintRequest, db: Session = Depends(get_db)):
    q = Querys(db)
    activo = q.getSprintActivo(payload.idProyecto)
    if activo:
        raise HTTPException(status_code=400, detail="Ya existe un sprint activo en este proyecto")

    result = q.createSprint(
        idProyecto=payload.idProyecto,
        fechaInicio=payload.fechaInicio,
        fechaCierre=payload.fechaCierre,
        tareas=payload.tareas,
        objetivo=payload.objetivo
    )

    return result


@router.post("/crear_tarea")
async def crear_tarea(payload: CreateTaskRequest, db: Session = Depends(get_db)):
    q = Querys(db)
    if payload.idSprint:
        # Devuelve todo el sprint
        sprint = q.getSprintById(payload.idSprint)
        if not sprint:
            raise HTTPException(status_code=404, detail="Sprint no encontrado")
        if sprint.idProyecto != payload.idProyecto: # Compara el idProyecto del sprint con el idProyecto de la tarea
            raise HTTPException(status_code=400, detail="El idProyecto debe ser el mismo que el del sprint")
            
    result = q.createTarea(payload)

    return result


@router.get("/get_tarea/{idTarea}")
async def get_tarea(idTarea: int, db: Session = Depends(get_db)):
    q = Querys(db)
    tarea = q.getTarea(idTarea)
    if not tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    return tarea


@router.post("/actualizar_estado")
async def actualizar_estado(payload: UpdateEstadoRequest, db: Session = Depends(get_db)):
    q = Querys(db)
    result = q.updateEstado(payload.idTarea, payload.idEstado)

    return result


@router.post("/asignar_responsable")
async def asignar_responsable(payload: AssignResponsibleRequest, db: Session = Depends(get_db)):
    q = Querys(db)
    result = q.assignResponsable(payload.idTarea, payload.idResponsable)

    return result

