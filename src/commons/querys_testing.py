from schema.models import (Base, Usuario, TipoTarea, EstadoTarea, Proyecto, ProyectoSprint, TestPlan, TestCycle, Tarea, Test, TestExecution, DefectoTest, UsuarioProyecto, Carpeta, CarpetaTestPlan)
from sqlalchemy import create_engine, func, and_, or_, update
from sqlalchemy.orm import sessionmaker, aliased
from datetime import datetime

class Querys():
    def __init__(self, db: SessionLocal):
        self.session = db

    def getCasesByTestPlan(self, idTestPlan: int):
        try:
            cases = self.session.query(Test).filter(Test.idTestPlan == idTestPlan).all()
            return [{"id": case.idTest, "nombre": case.Nombre, "descripcion": case.Descripcion} for case in cases] if cases else None
        except Exception as e:
            print(f"Error al obtener los casos por plan de prueba: {str(e)}")
            return None

    def getTestPlansByProyecto(self, idProyecto: int):
        try:
            testplans = self.session.query(TestPlan).filter(TestPlan.idProyecto == idProyecto).all()
            return [{"id": tp.idTestPlan, "nombre": tp.Nombre, "descripcion": tp.Descripcion} for tp in testplans] if testplans else None
        except Exception as e:
            print(f"Error al obtener los planes de prueba por proyecto: {str(e)}")
            return None

    def insertar_carpeta(self, nombre: str, padre: str, origen: str):
        try:
            # TO DO: ME OLVIDE DE AGREGAR EL PADRE EN LA TABLA, REVISAR Y MODIFICAR LOGICA DE ARBOL
            nueva_carpeta = Carpeta(Nombre=nombre, Origen=origen)
            self.session.add(nueva_carpeta)
            self.session.commit()
            self.session.refresh(nueva_carpeta)
            return nueva_carpeta
        except Exception as e:
            self.session.rollback()
            print(f"Error al insertar carpeta: {str(e)}")
            raise

    def asignar_carpeta_a_testplan(self, idCarpeta: int, idTestPlan: int):
        try:
            carpeta_testplan = CarpetaTestPlan(idCarpeta=idCarpeta, idTestPlan=idTestPlan)
            self.session.add(carpeta_testplan)
            self.session.commit()
            self.session.refresh(carpeta_testplan)
            return carpeta_testplan
        except Exception as e:
            self.session.rollback()
            print(f"Error al asignar carpeta al TestPlan: {str(e)}")
            raise