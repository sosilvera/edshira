from pydantic import BaseModel

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
    idSprint: Optional[int] = None
    idUsuario: int
    idProyecto: int