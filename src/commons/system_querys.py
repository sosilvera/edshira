from schema.models import (Base, Usuario)
from sqlalchemy import create_engine, func, and_, or_, update, text
from sqlalchemy.orm import sessionmaker, aliased
from datetime import datetime

class Querys():
    def __init__(self, db: SessionLocal):
        self.session = db

    def getDBStatus(self):
        try:
            self.session.execute(text("SELECT 1"))
            return {"status": "ok"}
        except Exception as e:
            print(f"Error al verificar el estado de la base de datos: {str(e)}")
            return {"status": "error", "message": str(e)}