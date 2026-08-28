# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EdJira** is a project management and testing platform built with FastAPI. It provides two main modules:
1. **Project Management** (sprints, tasks, backlog)
2. **Testing Management** (test plans, test cycles, test execution)

The application runs as a FastAPI backend with a MySQL database (hosted on Aiven Cloud).

## Tech Stack

- **Backend**: FastAPI + Uvicorn
- **ORM**: SQLAlchemy 2.0+
- **Database**: MySQL (PyMySQL driver)
- **Python Version**: 3.11
- **Authentication**: Role-based (idRol field in Usuario table)

## Directory Structure

### `/src` - Application Code

- **`main.py`** - FastAPI application entry point. Registers routers, configures CORS, mounts static files.
- **`routes/`** - API endpoint definitions
  - `projects_routes.py` - Project/sprint/task management endpoints
  - `testing_routes.py` - Testing management endpoints (test plans, cycles, execution)
  - `admin_routes.py` - Admin functionality
  - `static_routes.py` - Static file serving
- **`core/`** - Core configuration
  - `database.py` - SQLAlchemy engine setup, session management, SSL configuration for Aiven Cloud
  - `lifespan.py` - FastAPI lifespan events (startup/shutdown)
- **`schema/`** - Database models
  - `models.py` - SQLAlchemy ORM models (Usuario, Proyecto, Tarea, TestPlan, etc.)
- **`models/`** - Pydantic request/response schemas
  - `models.py` - Pydantic models (CreateTaskRequest, CreateSprintRequest, etc.)
- **`commons/`** - Shared business logic
  - `querys.py` - Main database query class with CRUD operations
  - `querys_testing.py` - Testing-related queries
  - `system_querys.py` - System utilities
- **`static/`** - Static assets

## Database Architecture

### Schema Hierarchy

1. **Independent Tables** (no dependencies)
   - `Usuarios` (users with roles)
   - `Tipo_Tarea` (task types: Epic, User Story, Defect)
   - `Estado_Tarea` (task states)
   - `Carpeta` (folders)

2. **Level 1** (depend on Usuarios or Proyecto)
   - `Proyecto` (projects with code prefix)
   - `Usuario_Proyecto` (user-project assignments)

3. **Level 2** (depend on Proyecto)
   - `Proyecto_Sprint` (sprints with Abierto=true/false flag)
   - `Test_Plans` (test plan containers)
   - `Test_Cycle` (test execution cycles)

4. **Level 3** (depend on Sprints and Task Types)
   - `Tareas` (tasks with auto-generated Codigo like "PROJ-1", "PROJ-2")
   - `Test` (individual test cases)
   - `TestExecution` (test execution records)

### Key Patterns

- **Project Code**: Each Proyecto has a `Codigo` (e.g., "PROJ") used as prefix for task codes
- **Task Codes**: Generated as `{codigoProyecto}-{counter}` (e.g., "PROJ-1") - now fetched from DB to ensure correctness
- **Active Sprint**: ProyectoSprint.Abierto=true indicates the active sprint for a project
- **Foreign Keys**: Use CASCADE delete for cleanup

## Running the Application

### Setup Environment

```bash
# Create Python virtual environment
python -m venv env

# Activate environment
# On Windows:
.\env\Scripts\activate
# On Unix:
source env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create .env file with:
# DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DIALECT
```

### Run Development Server

```bash
cd src
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

The app will start on `http://localhost:8080` with auto-reload enabled.

### Database Connection

- Configured via environment variables (see `.env`)
- SSL context is automatically configured for Aiven Cloud (certificates validation disabled for self-signed certs)
- Connection pooling handled by SQLAlchemy engine
- Session management via dependency injection in routes

## Common Operations

### Create a Task

**Route**: `POST /edshira/api/projects/crear_tarea`

The endpoint now:
1. Fetches project code from database (via `getCodigoProyecto()`)
2. Generates task code automatically
3. Handles sprint assignment if `toSprint=true`

**Request Model**: `CreateTaskRequest`
- `codigoProyecto` - Project code (fetched from DB, not required in request)
- `titulo` - Task title
- `descripcion` - Task description
- `idTipo` - Task type ID
- `toSprint` - Boolean: assign to active sprint
- `idProyecto` - Project ID
- `idUsuario` - Creator user ID

### Create a Sprint

**Route**: `POST /edshira/api/projects/crear_sprint`

- Validates no active sprint exists for project
- Creates sprint with start/end dates and objectives

### Get Backlog

**Route**: `GET /edshira/api/projects/get_backlog/{idProyecto}`

Returns tasks not assigned to any sprint.

### Get Active Sprint

**Route**: `GET /edshira/api/projects/sprintActivo/{idProject}`

Returns the active sprint (Abierto=true) with all its tasks.

## Query Class (`Querys`)

Main database query interface in `commons/querys.py`. Key methods:

- `createTarea(payload)` - Create task with auto-generated code
- `getCodigoProyecto(idProyecto)` - Get project code from DB
- `getSprintActivo(idProject)` - Get active sprint
- `getTarea(idTarea)` - Get task with full details (joins Usuario, TipoTarea, EstadoTarea, etc.)
- `updateEstado(idTarea, idEstado)` - Update task state
- `assignResponsable(idTarea, idResponsable)` - Assign task to user
- `getBacklog(idProyecto)` - Get tasks without sprint

## Important Notes

### Production Issue (Fixed)

Task codes were not being generated correctly in production when the client didn't send `codigoProyecto`. 

**Fix**: The `crear_tarea` endpoint now queries the project code from the database instead of relying on the client, ensuring consistency.

### Database & Deployment

- MySQL database hosted on Aiven Cloud with SSL context configured in `core/database.py`
- Docker support: Dockerfile builds the app and runs uvicorn on port 8080
- Environment variables must be set before deployment

### CORS Configuration

Currently allows all origins (`"*"`) for development. Update in `main.py` for production.

## Debugging Tips

1. **Database Connection Issues**: Check lifespan startup logs, SSL context may need adjustment
2. **Task Code Generation**: Verify project code exists in `Proyecto.Codigo` field
3. **Active Sprint Logic**: Look for `Abierto=true` in `Proyecto_Sprint` table
4. **Session Management**: All routes use dependency injection with `Depends(get_db)`
