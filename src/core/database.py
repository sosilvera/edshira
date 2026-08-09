# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# El engine maneja el pool de conexiones. Se crea UNA sola vez.
load_dotenv()
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_username = os.getenv("DB_USERNAME")
db_password = os.getenv("DB_PASSWORD")
db_name = os.getenv("DB_NAME")

connect_args = {}
if "aivencloud.com" in DATABASE_URL:
    # Esta ruta de certificados viene por defecto en el contenedor de Python de Cloud Run
    connect_args = {"ssl": {"ca": "/etc/ssl/certs/ca-certificates.crt"}}
    
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{db_username}:{db_password}@{db_host}:{db_port}/{db_name}"
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Fábrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Generador de base de datos para inyectar en las rutas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() # GARANTIZA que la conexión siempre se cierre