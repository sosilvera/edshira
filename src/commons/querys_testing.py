from schema.models import (Base, Usuario, TipoTarea, EstadoTarea, Proyecto, ProyectoSprint, TestPlan, TestCycle, Tarea, Test, TestExecution, DefectoTest, UsuarioProyecto, Carpeta, CarpetaTestPlan, CarpetaTestExecution)
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

    def asignar_carpeta_a_testcycle(self, idCarpeta: int, idTestCycle: int):
        try:
            carpeta_testcycle = CarpetaTestExecution(idCarpeta=idCarpeta, idTestCycle=idTestCycle)
            self.session.add(carpeta_testcycle)
            self.session.commit()
            self.session.refresh(carpeta_testcycle)
            return carpeta_testcycle
        except Exception as e:
            self.session.rollback()
            print(f"Error al asignar carpeta al TestCycle: {str(e)}")
            raise

    def insertar_testplan(self, nombre: str, descripcion: str, idProyecto: int, idUsuario: int):
        try:
            nuevo_testplan = TestPlan(Nombre=nombre, Descripcion=descripcion, idProyecto=idProyecto, idUsuario=idUsuario)
            self.session.add(nuevo_testplan)
            self.session.commit()
            self.session.refresh(nuevo_testplan)
            return nuevo_testplan
        except Exception as e:
            self.session.rollback()
            print(f"Error al insertar TestPlan: {str(e)}")
            raise

    def insertar_test(self, nombre: str, descripcion: str, idTestPlan: int, idUsuario: int):
        try:
            nuevo_test = Test(Nombre=nombre, Descripcion=descripcion, idTestPlan=idTestPlan, idUsuario=idUsuario)
            self.session.add(nuevo_test)
            self.session.commit()
            self.session.refresh(nuevo_test)
            return nuevo_test
        except Exception as e:
            self.session.rollback()
            print(f"Error al insertar Test: {str(e)}")
            raise

    def getEstadoEjecucion(self, idTest: int):
        try:
            estado = self.session.query(TestExecution).filter(TestExecution.idTest == idTest).order_by(TestExecution.FechaEjecucion.desc()).first()
            return {"idTest": estado.idTest, "idTestCycle": estado.idTestCycle, "estado": estado.Estado, "fechaEjecucion": estado.FechaEjecucion} if estado else "Not Run"
        except Exception as e:
            print(f"Error al obtener el estado de ejecución del caso: {str(e)}")
            return None

    def getCarpetasPlan(self):
        try:
            carpetas = self.session.query(Carpeta).filter(Carpeta.Origen == "Test Plan").all()
            result = []

            for c in carpetas:
                test_plans = self.session.query(
                    CarpetaTestPlan.idTestPlan,
                    TestPlan.Nombre
                ).join(
                    TestPlan, TestPlan.idTestPlan == CarpetaTestPlan.idTestPlan
                ).filter(
                    CarpetaTestPlan.idCarpeta == c.idCarpeta
                ).all()

                result.append({
                    "idCarpeta": c.idCarpeta,
                    "Nombre": c.Nombre,
                    "Origen": c.Origen,
                    "TestPlans": [{"idTestPlan": tp.idTestPlan, "Nombre": tp.Nombre} for tp in test_plans] if test_plans else []
                })
            
            return result if result else None
        except Exception as e:
            print(f"Error al obtener las carpetas: {str(e)}")
            return None
    
    def getCarpetasExec(self):
        try:
            carpetas = self.session.query(Carpeta).filter(Carpeta.Origen == "Test Execution").all()
            result = []

            for c in carpetas:
                test_plans = self.session.query(
                    CarpetaTestExecution.idTestCycle,
                    TestCycle.Nombre
                ).join(
                    TestCycle, TestCycle.idTestCycle == CarpetaTestExecution.idTestCycle
                ).filter(
                    CarpetaTestExecution.idCarpeta == c.idCarpeta
                ).all()

                result.append({
                    "idCarpeta": c.idCarpeta,
                    "Nombre": c.Nombre,
                    "Origen": c.Origen,
                    "TestCycles": [{"idTestCycle": tp.idTestCycle, "Nombre": tp.Nombre} for tp in test_plans] if test_plans else []
                })
            
            return result if result else None
        except Exception as e:
            print(f"Error al obtener las carpetas: {str(e)}")
            return None

    def getCasesByTestExecution(self, idTestCycle: int):
        try:
            cases = self.session.query(
                TestExecution.idTestCycle,
                TestExecution.idTest,
                Test.Nombre,
                Test.Descripcion,
                TestExecution.Estado,
                TestExecution.FechaEjecucion
            ).join(
                Test, Test.idTest == TestExecution.idTest
            ).filter(
                TestExecution.idTestCycle == idTestCycle
            ).all()

            return [{"idTest": case.idTest, "idTestCycle": case.idTestCycle, "nombre": case.Nombre, "descripcion": case.Descripcion, "estado": case.Estado, "fechaEjecucion": case.FechaEjecucion} for case in cases] if cases else None
        except Exception as e:
            print(f"Error al obtener los casos por ciclo de prueba: {str(e)}")
            return None

    def insertar_testcycle(self, nombre: str, descripcion: str, idProyecto: int, idUsuario: int):
        try:
            nuevo_testcycle = TestCycle(Nombre=nombre, idProyecto=idProyecto)
            self.session.add(nuevo_testcycle)
            self.session.commit()
            self.session.refresh(nuevo_testcycle)
            return nuevo_testcycle
        except Exception as e:
            self.session.rollback()
            print(f"Error al insertar TestCycle: {str(e)}")
            raise

    def import_cases(self, idTestCycle: int, idUsuario: int, cases: list):
        try:
            for case in cases:
                nuevo_test = TestExecution(idTestCycle=idTestCycle, idTest=case, idUsuario=idUsuario, Estado="Not Run", FechaEjecucion=None)
                self.session.add(nuevo_test)
            self.session.commit()
            
            return len(cases)
        except Exception as e:
            self.session.rollback()
            print(f"Error al importar casos: {str(e)}")
            raise

    def execute_test(self, idTest: int, idTestCycle: int, estado: str, fechaEjecucion: str, idUsuario: int):
        try:
            test_execution = self.session.query(TestExecution).filter(
                TestExecution.idTest == idTest,
                TestExecution.idTestCycle == idTestCycle
            ).first()

            if not test_execution:
                raise Exception("No se encontró la ejecución del test especificado.")


            test_execution.Estado = estado
            test_execution.FechaEjecucion = datetime.strptime(fechaEjecucion, "%d/%m/%Y")
            test_execution.idUsuario = idUsuario

            self.session.commit()
            self.session.refresh(test_execution)
            return test_execution
        except Exception as e:
            self.session.rollback()
            print(f"Error al ejecutar el test: {str(e)}")
            raise