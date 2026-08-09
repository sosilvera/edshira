# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
import ssl # <-- Importamos la librería nativa SSL

# El engine maneja el pool de conexiones. Se crea UNA sola vez.
load_dotenv()
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_username = os.getenv("DB_USERNAME")
db_password = os.getenv("DB_PASSWORD")
db_name = os.getenv("DB_NAME")

connect_args = {}
if db_host and "aivencloud.com" in db_host:
    # Creamos un contexto SSL que encripte los datos pero ignore la verificación estricta del certificado autofirmado
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    connect_args = {"ssl": ssl_context}

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{db_username}:{db_password}@{db_host}:{db_port}/{db_name}"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

# Fábrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Generador de base de datos para inyectar en las rutas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() # GARANTIZA que la conexión siempre se cierre