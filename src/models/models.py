from pydantic import BaseModel
from typing import Optional

# Modelos Pydantic para las solicitudes y respuestas
class CreateSprintRequest(BaseModel):
    idProyecto: int
    fechaInicio: str
    fechaCierre: str
    tareas: List[int]
    objetivo: str

class CreateTaskRequest(BaseModel):
    codigoProyecto: str
    titulo: str
    descripcion: str
    idTipo: int
    toSprint: bool
    idSprint: Optional[int] = None
    idUsuario: int
    idProyecto: int

CreateTaskRequest.model_rebuild()

class UpdateEstadoRequest(BaseModel):
    idTarea: int
    idEstado: int

class AssignResponsibleRequest(BaseModel):
    idTarea: int
    idResponsable: int

class AssignProjectRequest(BaseModel):
    idUsuario: int
    idProyecto: int

class AssignSprintRequest(BaseModel):
    idTarea: int
    idSprint: int

class CreateUsuarioRequest(BaseModel):
    nombre: str

class Carpeta(BaseModel):
    Nombre: str
    Padre: str
    Origen: str

class CarpetaTestPlan(BaseModel):
    idCarpeta: int
    idTestPlan: int