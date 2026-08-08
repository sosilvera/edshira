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

class TestPlan(BaseModel):
    Nombre: str
    Descripcion: Optional[str] = None
    idProyecto: int
    idUsuario: int

class Test(BaseModel):
    Nombre: str
    Descripcion: Optional[str] = None
    idTestPlan: int
    idUsuario: int

class TestCycle(BaseModel):
    Nombre: str
    Descripcion: Optional[str] = None
    idProyecto: int
    idUsuario: int

class CarpetaTestCycle(BaseModel):
    idCarpeta: int
    idTestCycle: int

class CasesList(BaseModel):
    idTestCycle: int
    idUsuario: int
    tests: list

class TestExecution(BaseModel):
    idTest: int
    idTestCycle: int
    Estado: str
    FechaEjecucion: str
    idUsuario: int