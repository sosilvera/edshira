import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from routes.api_routes import router as api_router
from routes.static_routes import router as static_router
from dotenv import load_dotenv

load_dotenv()
var_env1 = os.getenv("VAR_ENV1")

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# Configurar CORS para desarrollo
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(static_router)