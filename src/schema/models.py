from sqlalchemy import Boolean, Column , ForeignKey
from sqlalchemy import DateTime, Integer, String, Text, Float, DATE
from sqlalchemy.types import DECIMAL
from sqlalchemy.orm import relationship
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Table1(Base):
    __tablename__ = 'Table1'
    id1 = Column(Integer, primary_key=True)
    value = Column(String(10))
    bool_example = Column(Boolean)

class Sims(Base):
    __tablename__ = 'Sims'
    id2 = Column(String(20), primary_key=True)
    id1 = Column(Integer, ForeignKey('Table1.id1'))
    Fecha_Actualizacion = Column(DateTime)
    table1 = relationship('Table1', backref='table2')
