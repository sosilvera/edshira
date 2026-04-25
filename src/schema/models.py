from sqlalchemy import Column, Integer, String, Text, Date, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# 1. Tablas independientes (Sin Foreign Keys)
class Usuario(Base):
    __tablename__ = 'Usuarios'
    
    idUsuario = Column(Integer, primary_key=True, autoincrement=True)
    Nombre = Column(String(255), nullable=False)
    Pass = Column(String(255), nullable=False)
    idRol = Column(Integer, nullable=False)

class TipoTarea(Base):
    __tablename__ = 'Tipo_Tarea'
    
    idTipo = Column(Integer, primary_key=True, autoincrement=True)
    Nombre = Column(String(255), nullable=False)

class EstadoTarea(Base):
    __tablename__ = 'Estado_Tarea'
    
    idEstado = Column(Integer, primary_key=True, autoincrement=True)
    Nombre = Column(String(50), nullable=False)

# 2. Tablas de Nivel 1 (Dependen de Usuarios)
class Proyecto(Base):
    __tablename__ = 'Proyecto'
    
    idProyecto = Column(Integer, primary_key=True, autoincrement=True)
    Nombre = Column(String(255), nullable=False)
    Codigo = Column(String(50), nullable=False)
    idUser = Column(Integer, ForeignKey('Usuarios.idUsuario', ondelete='SET NULL'), nullable=True)
    
    # Ejemplo de relationship: te permite acceder al objeto Usuario desde el Proyecto
    responsable = relationship("Usuario")


# 3. Tablas de Nivel 2 (Dependen de Proyecto y Usuarios)
class ProyectoSprint(Base):
    __tablename__ = 'Proyecto_Sprint'
    
    idProySprint = Column(Integer, primary_key=True, autoincrement=True)
    idProyecto = Column(Integer, ForeignKey('Proyecto.idProyecto', ondelete='CASCADE'), nullable=False)
    NroSprint = Column(Integer, nullable=False)
    Objetivo = Column(Text, nullable=True)
    Fecha_Inicio = Column(Date, nullable=True)
    Fecha_Fin = Column(Date, nullable=True)
    Abierto = Column(Boolean, default=True)

class TestPlan(Base):
    __tablename__ = 'Test_Plans'
    
    idTestPlan = Column(Integer, primary_key=True, autoincrement=True)
    Nombre = Column(String(255), nullable=False)
    Descripcion = Column(Text, nullable=True)
    idProyecto = Column(Integer, ForeignKey('Proyecto.idProyecto', ondelete='CASCADE'), nullable=False)
    idUsuario = Column(Integer, ForeignKey('Usuarios.idUsuario', ondelete='SET NULL'), nullable=True)

class TestCycle(Base):
    __tablename__ = 'Test_Cycle'
    
    idTestCycle = Column(Integer, primary_key=True, autoincrement=True)
    Nombre = Column(String(255), nullable=False)
    idProyecto = Column(Integer, ForeignKey('Proyecto.idProyecto', ondelete='CASCADE'), nullable=False)


# 4. Tablas de Nivel 3 (Dependen de Sprints, Test_Plans y Tipo_Tarea)
class Tarea(Base):
    __tablename__ = 'Tareas'
    
    idTarea = Column(Integer, primary_key=True, autoincrement=True)
    # Nueva columna vinculada directamente al Proyecto
    idProyecto = Column(Integer, ForeignKey('Proyecto.idProyecto', ondelete='CASCADE'), nullable=False)
    
    Codigo = Column(String(50), unique=True, nullable=True) 
    Titulo = Column(String(255), nullable=False)
    Descripcion = Column(Text, nullable=True)
    file = Column(String(255), nullable=True)
    
    UsuarioCreador = Column(Integer, ForeignKey('Usuarios.idUsuario', ondelete='SET NULL'), nullable=True)
    idResponsable = Column(Integer, ForeignKey('Usuarios.idUsuario', ondelete='SET NULL'), nullable=True)
    idTipo = Column(Integer, ForeignKey('Tipo_Tarea.idTipo', ondelete='SET NULL'), nullable=True)
    idEstadoTarea = Column(Integer, ForeignKey('Estado_Tarea.idEstado', ondelete='SET NULL'), nullable=True)
    
    # El idSprint ahora puede ser opcional (Backlog)
    idSprint = Column(Integer, ForeignKey('Proyecto_Sprint.idProySprint', ondelete='CASCADE'), nullable=True)

    # Relaciones para navegación fácil
    proyecto = relationship("Proyecto")
    sprint = relationship("ProyectoSprint")
    creador = relationship("Usuario", foreign_keys=[UsuarioCreador])
    asignado = relationship("Usuario", foreign_keys=[idResponsable])
    
class Test(Base):
    __tablename__ = 'Tests'
    
    idTest = Column(Integer, primary_key=True, autoincrement=True)
    Nombre = Column(String(255), nullable=False)
    Descripcion = Column(Text, nullable=True)
    idTestPlan = Column(Integer, ForeignKey('Test_Plans.idTestPlan', ondelete='CASCADE'), nullable=False)
    idUsuario = Column(Integer, ForeignKey('Usuarios.idUsuario', ondelete='SET NULL'), nullable=True)


# 5. Tablas de Nivel 4 (Tablas intermedias / Relacionales)
class TestExecution(Base):
    __tablename__ = 'Test_Execution'
    
    # Primary Key Compuesta
    idTestCycle = Column(Integer, ForeignKey('Test_Cycle.idTestCycle', ondelete='CASCADE'), primary_key=True)
    idTest = Column(Integer, ForeignKey('Tests.idTest', ondelete='CASCADE'), primary_key=True)
    
    idUsuario = Column(Integer, ForeignKey('Usuarios.idUsuario', ondelete='SET NULL'), nullable=True)
    Estado = Column(String(50), nullable=False)

class DefectoTest(Base):
    __tablename__ = 'Defectos_Test'
    
    idDefectoTest = Column(Integer, primary_key=True, autoincrement=True)
    idTest = Column(Integer, ForeignKey('Tests.idTest', ondelete='CASCADE'), nullable=False)
    idTarea = Column(Integer, ForeignKey('Tareas.idTarea', ondelete='CASCADE'), nullable=False)