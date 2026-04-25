import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from routes.admin_routes import router as admin_routes
from routes.projects_routes import router as projects_routes
from routes.testing_routes import router as testing_routes
from routes.static_routes import router as static_router
from dotenv import load_dotenv

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

app.include_router(admin_routes)
app.include_router(projects_routes)
app.include_router(testing_routes)
app.include_router(static_router)