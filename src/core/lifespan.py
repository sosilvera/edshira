from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import text
# Importamos el engine en lugar de get_db
from core.database import engine 

@asynccontextmanager
async def app_lifespan(app: FastAPI):
    # --- STARTUP ---
    try:
        # Abrimos una conexión cruda al engine para probar
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("[OK] Base de datos conectada correctamente.")
        
    except Exception as e:
        print(f"[ERROR CRITICO] Al iniciar: {e}")
        raise RuntimeError("Fallo en la conexión a la BD al arrancar") from e
    
    yield # Acá el servidor está vivo y recibiendo peticiones
    
    # --- SHUTDOWN ---
    print("[INFO] Servidor apagándose. Liberando recursos...")
    # Como ya importamos el engine arriba, esto ahora funciona perfecto
    engine.dispose()