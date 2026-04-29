from schema.models import (Base, Usuario, TipoTarea, EstadoTarea, Proyecto, ProyectoSprint, TestPlan, TestCycle, Tarea, Test, TestExecution, DefectoTest, UsuarioProyecto)
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

    def getUserByName(self, nombreUsuario: str):
        try:
            user = self.session.query(Usuario.idUsuario).filter(Usuario.Nombre == nombreUsuario).first()
            return {"id": user[0]} if user else None
        except Exception as e:
            print(f"Error al obtener el usuario por nombre: {str(e)}")
            return None

    def getProyectosUsuario(self, idUsuario: int):
        try:
            proyectos = self.session.query(Proyecto.idProyecto, Proyecto.Nombre).join(UsuarioProyecto, UsuarioProyecto.idProyecto == Proyecto.idProyecto).filter(UsuarioProyecto.idUsuario == idUsuario).all()
            return [{"idProyecto": p[0], "nombre": p[1]} for p in proyectos]
        except Exception as e:
            print(f"Error al obtener los proyectos del usuario: {str(e)}")
            return []

    def getProyectos(self):
        try:
            proyectos = self.session.query(Proyecto.idProyecto, Proyecto.Nombre).all()
            return [{"idProyecto": p[0], "nombre": p[1]} for p in proyectos]
        except Exception as e:
            print(f"Error al obtener los proyectos: {str(e)}")
            return []

    def assignProject(self, idUsuario: int, idProyecto: int):
        try:
            # Verificar si el proyecto existe
            proyecto = self.session.query(Proyecto).filter(Proyecto.idProyecto == idProyecto).first()
            if not proyecto:
                return {"value": "Proyecto no encontrado"}

            # Verificar si el usuario existe
            usuario = self.session.query(Usuario).filter(Usuario.idUsuario == idUsuario).first()
            if not usuario:
                return {"value": "Usuario no encontrado"}

            # Verificar si la asignación ya existe
            asignacion_existente = self.session.query(UsuarioProyecto).filter(
                UsuarioProyecto.idUsuario == idUsuario,
                UsuarioProyecto.idProyecto == idProyecto
            ).first()

            if asignacion_existente:
                return {"value": "El usuario ya está asignado a este proyecto"}

            # Crear la nueva asignación
            nueva_asignacion = UsuarioProyecto(idUsuario=idUsuario, idProyecto=idProyecto)
            self.session.add(nueva_asignacion)
            self.session.commit()

            return {"value": "Usuario asignado al proyecto exitosamente"}
        except Exception as e:
            self.session.rollback()
            print(f"Error al asignar el proyecto: {str(e)}")
            return {"value": "Error al asignar el proyecto"}

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
            result = self.session.query(ProyectoSprint).filter(ProyectoSprint.idProySprint == idSprint).first()
        
            return result
        except Exception as e:
            print(f"Error al obtener el sprint por ID: {str(e)}")
            return None

    def countTareasProyecto(self, idProyecto: int):
        print("IdProyecto:", idProyecto)
        
        counter = self.session.query(func.count(Tarea.idTarea)).\
            join(ProyectoSprint, ProyectoSprint.idProySprint == Tarea.idSprint, isouter=True).\
            join(Proyecto, Proyecto.idProyecto == ProyectoSprint.idProyecto).\
            filter(Proyecto.idProyecto == idProyecto).group_by(Proyecto.idProyecto).scalar()
        
        print("Counter:", counter)
        return counter

    def createTarea(self, payload):
        try:
            # Obtener el código del proyecto
            project_code = self.session.query(Proyecto.Codigo).filter(Proyecto.idProyecto == payload.idProyecto).scalar()

            # Contar las tareas en los sprints del proyecto
            count_tareas = self.countTareasProyecto(payload.idProyecto)

            print("Cantidad de tareas en el proyecto:", count_tareas)

            # Generar el código
            codigo = f"{project_code}-{count_tareas + 1}"
            print("Código generado:", codigo)
            
            nueva_tarea = Tarea(
                Titulo=payload.titulo,
                Descripcion=payload.descripcion,
                idTipo=payload.idTipo,
                idEstadoTarea=1,
                idSprint=payload.idSprint,
                UsuarioCreador=payload.idUsuario,
                idProyecto=payload.idProyecto,
                Codigo=codigo
            )
            self.session.add(nueva_tarea)
            self.session.commit()

            return {"value": f"Tarea creada: {nueva_tarea.Codigo}"}
        except Exception as e:
            self.session.rollback()
            print(f"Error al crear la tarea: {str(e)}")
            return {"value": None}

    def getTarea(self, idTarea: int):
        try:
            creador = aliased(Usuario)
            responsable = aliased(Usuario)
            result = self.session.query(
                Tarea.idTarea,
                Tarea.Codigo,
                TipoTarea.Nombre.label('Tipo'),
                EstadoTarea.Nombre.label('Estado'),
                Tarea.Titulo,
                Tarea.Descripcion,
                ProyectoSprint.NroSprint,
                Proyecto.Nombre.label('nombre_proyecto'),
                creador.Nombre.label('creador'),
                responsable.Nombre.label('responsable')
            ).join(TipoTarea, TipoTarea.idTipo == Tarea.idTipo)\
            .join(EstadoTarea, EstadoTarea.idEstado == Tarea.idEstadoTarea)\
            .join(Proyecto, Proyecto.idProyecto == Tarea.idProyecto)\
            .join(creador, creador.idUsuario == Tarea.UsuarioCreador)\
            .outerjoin(ProyectoSprint, ProyectoSprint.idProySprint == Tarea.idSprint)\
            .outerjoin(responsable, responsable.idUsuario == Tarea.idResponsable)\
            .filter(Tarea.idTarea == idTarea).first()
            if result:
                return {
                    "idTarea": result[0],
                    "codigo": result[1],
                    "tipo": result[2],
                    "estado": result[3],
                    "titulo": result[4],
                    "descripcion": result[5],
                    "nroSprint": result[6],
                    "nombre_proyecto": result[7],
                    "creador": result[8],
                    "responsable": result[9]
                }
            else:
                return None
        except Exception as e:
            print(f"Error al obtener la tarea: {str(e)}")
            return None

    def updateEstado(self, idTarea: int, idEstado: int):
        try:
            tarea = self.session.query(Tarea).filter(Tarea.idTarea == idTarea).first()
            if not tarea:
                return {"value": "Tarea no encontrada"}

            tarea.idEstadoTarea = idEstado
            self.session.commit()

            return {"value": "Estado actualizado exitosamente"}
        except Exception as e:
            self.session.rollback()
            print(f"Error al actualizar el estado: {str(e)}")
            return {"value": "Error al actualizar el estado"}

    def assignResponsable(self, idTarea: int, idResponsable: int):
        try:
            tarea = self.session.query(Tarea).filter(Tarea.idTarea == idTarea).first()
            if not tarea:
                return {"value": "Tarea no encontrada"}

            tarea.idResponsable = idResponsable
            self.session.commit()

            return {"value": "Responsable asignado exitosamente"}
        except Exception as e:
            self.session.rollback()
            print(f"Error al asignar el responsable: {str(e)}")
            return {"value": "Error al asignar el responsable"}