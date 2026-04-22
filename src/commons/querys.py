from schema.models import (Table, Base, Users)
from sqlalchemy import create_engine, func, and_, or_, update
from sqlalchemy.orm import sessionmaker, aliased
from datetime import datetime
import commons.env as env

class Querys():
    def __init__(self):
        # Ruta relativa o absoluta de la base de datos SQLite3
        ruta_db = "nombre.db"

        # Crear la conexión a la base de datos SQLite3
        engine = create_engine(f"sqlite:///{ruta_db}")
        Base.metadata.create_all(engine)
        Session = sessionmaker(bind=engine)

        self.session = Session()


    def get(self, value):
        try:
            result = self.session.query(Table.column).filter(and_(Table.Column1 == value, Table.Column2 == 'value')).first()
        
            return {"value": result[0]}
        except Exception as e:
            return {"value": None}

    def update(self, value, id):
        try:
            change = update(Table).\
                where(Table.Column1 == id).\
                values(Estado=value, Fecha_Actualizacion=datetime.now())
            
            self.session.execute(change)
            self.session.commit()
            
            return 1
        except Exception as e:
            return "Ocurrio un error: " + str(e)

    def insert(self, value):
        reg = Table(Column1 = value, Column2 = 'test')
        self.session.add(reg)
        self.session.commit()

        return "OK"
    
    def delete(self, value):
        result = self.session.query(Table).filter_by(id = value).first()
        self.session.delete(result)

        return "OK"

    # Cierro la sesion de la base
    def sessionClose(self):
        self.session.close()
