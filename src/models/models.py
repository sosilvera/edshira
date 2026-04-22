from pydantic import BaseModel

# Modelos Pydantic para las solicitudes y respuestas
class responseModel(BaseModel):
    value1: str
    value2: str