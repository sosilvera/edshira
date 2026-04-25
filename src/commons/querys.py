from schema.models import (Base, Usuario, TipoTarea, EstadoTarea, Proyecto, ProyectoSprint, TestPlan, TestCycle, Tarea, Test, TestExecution, DefectoTest)
from sqlalchemy import create_engine, func, and_, or_, update
from sqlalchemy.orm import sessionmaker, aliased
from datetime import datetime

class Querys():
    def __init__(self, db: SessionLocal):
        # Ruta relativa o absoluta de la base de datos SQLite3
        # ruta_db = "nombre.db"

        # Crear la conexión a la base de datos SQLite3
        #engine = create_engine(f"sqlite:///{ruta_db}")
        #Base.metadata.create_all(engine)
        #Session = sessionmaker(bind=engine)

        #self.session = Session()

        self.session = db



    def getSprintActivo(self, idProject: int):
        try:
            sprint = self.session.query(ProyectoSprint).filter(ProyectoSprint.idProyecto == idProject, ProyectoSprint.Abierto == True).first()
            print(sprint)
            if not sprint:
                return {"value": None}
            
            tareas = self.session.query(Tarea.idTarea, Tarea.Codigo, TipoTarea.Nombre, EstadoTarea.Nombre).join(TipoTarea, TipoTarea.idTipo == Tarea.idTipo).join(EstadoTarea, EstadoTarea.idEstado == Tarea.idEstadoTarea).filter(Tarea.idSprint == sprint.idProySprint).all()
            
            tareas_list = [{"idTarea": t[0], "codigo": t[1], "tipo": t[2], "estado": t[3]} for t in tareas]
            
            return {
                "value": {
                    "idSprint": sprint.idProySprint,
                    "fechaCierre": sprint.Fecha_Fin,
                    "tareas": tareas_list
                }
            }
        except Exception as e:
            print(f"Error al obtener el sprint activo: {str(e)}")
            return {"value": None}

    def createSprint(self, idProyecto: int, fechaInicio: str, fechaCierre: str, tareas: list[int], objetivo: str):
        try:
            # Obtener el número del próximo sprint
            max_sprint = self.session.query(func.max(ProyectoSprint.NroSprint)).filter(ProyectoSprint.idProyecto == idProyecto).scalar()
            next_sprint_number = (max_sprint or 0) + 1

            nuevo_sprint = ProyectoSprint(
                idProyecto=idProyecto,
                NroSprint=next_sprint_number,
                Objetivo=objetivo,
                Fecha_Inicio=datetime.strptime(fechaInicio, "%Y-%m-%d").date(),
                Fecha_Fin=datetime.strptime(fechaCierre, "%Y-%m-%d").date(),
                Abierto=True
            )
            self.session.add(nuevo_sprint)
            self.session.commit()

            # Aquí podrías agregar lógica para asociar las tareas al sprint si es necesario

            return {"value": "Sprint creado exitosamente"}
        except Exception as e:
            self.session.rollback()
            return {"value": f"Error al crear el sprint: {str(e)}"}

    def getSprintById(self, idSprint: int):
        try:
            result = self.session.query(ProyectoSprint).filter(ProyectoSprint.idSprint == idSprint).first()
        
            return result
        except Exception as e:
            return None

    def createTarea(self, payload):
        try:
            # Obtener el código del proyecto
            project_code = self.session.query(Proyecto.Codigo).filter(Proyecto.idProyecto == payload.idProyecto).scalar()
            
            # Contar las tareas en los sprints del proyecto
            count_tareas = self.session.query(func.count(Tarea.idTarea)).join(Proyecto, Proyecto.idProyecto == ProyectoSprint.idProyecto).join(ProyectoSprint, ProyectoSprint.idSprint == Tarea.idSprint, isouter=True).filter(Proyecto.idProyecto == payload.idProyecto).group_by(Proyecto.idProyecto).scalar()
            
            # Generar el código
            codigo = f"{project_code}-{count_tareas + 1}"
            
            nueva_tarea = Tarea(
                Titulo=payload.titulo,
                Descripcion=payload.descripcion,
                idSprint=payload.idSprint,
                idUsuario=payload.idUsuario,
                idProyecto=payload.idProyecto,
                Codigo=codigo
            )
            self.session.add(nueva_tarea)
            self.session.commit()

            return {"value": "Tarea creada exitosamente"}
        except Exception as e:
            self.session.rollback()
            return {"value": f"Error al crear la tarea: {str(e)}"}