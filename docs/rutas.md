# Rutas del Proyecto EdJira

## 1. RUTAS DE PROYECTOS (`/edshira/api/projects`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/get_user_id/{nombreUsuario}` | Obtiene el ID de un usuario por nombre |
| `GET` | `/proyectos_usuario/{idUsuario}` | Obtiene los proyectos de un usuario |
| `GET` | `/get_proyectos` | Obtiene todos los proyectos disponibles |
| `GET` | `/sprintActivo/{idProject}` | Obtiene el sprint activo de un proyecto |
| `POST` | `/crear_sprint` | Crea un nuevo sprint |
| `POST` | `/crear_tarea` | Crea una nueva tarea |
| `GET` | `/get_tarea/{idTarea}` | Obtiene los detalles de una tarea |
| `POST` | `/actualizar_estado` | Actualiza el estado de una tarea |
| `GET` | `/get_usuario_id/{nombreUsuario}` | Obtiene el ID de un usuario (alternativo) |
| `GET` | `/get_backlog/{idProyecto}` | Obtiene el backlog de un proyecto |
| `GET` | `/get_sprints/{idProyecto}` | Obtiene los sprints de un proyecto |
| `POST` | `/asignar_proyecto` | Asigna un proyecto a un usuario |
| `POST` | `/asignar_sprint` | Asigna una tarea a un sprint |
| `POST` | `/asignar_responsable` | Asigna un responsable a una tarea |
| `GET` | `/get_usuarios` | Obtiene la lista de usuarios |
| `POST` | `/crear_usuario` | Crea un nuevo usuario |

## 2. RUTAS DE TESTING (`/edshira/api/testing`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/get_cases_by_testplan/{idTestPlan}` | Obtiene los casos de prueba de un test plan |
| `GET` | `/get_testplans/{idProyecto}` | Obtiene los test plans de un proyecto |
| `POST` | `/crear_carpeta` | Crea una carpeta de test |
| `POST` | `/set_carpeta` | Asigna una carpeta a un test plan |
| `GET` | `/get_carpetas_plan` | Obtiene las carpetas de test plan |
| `GET` | `/get_carpetas_execution` | Obtiene las carpetas de test execution |
| `POST` | `/crear_testplan` | Crea un nuevo test plan |
| `POST` | `/crear_test` | Crea un nuevo caso de prueba |
| `GET` | `/get_execution_state/{idTest}` | Obtiene el estado de ejecución de un test |
| `POST` | `/crear_testcycle` | Crea un nuevo ciclo de prueba |
| `POST` | `/asignar_carpeta_testcycle` | Asigna una carpeta a un test cycle |
| `POST` | `/import_cases` | Importa casos de prueba |
| `POST` | `/execute_test` | Ejecuta una prueba |
| `GET` | `/get_cases_by_testexecution/{idTestCycle}` | Obtiene los casos de prueba por ciclo de ejecución |

## 3. RUTAS DE ADMIN (`/edshira/api/admin`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/get/` | Verifica que la ruta de admin funciona |

## 4. RUTAS ESTÁTICAS (`/edshira`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Sirve index.html (página principal) |
| `GET` | `/backlog` | Sirve backlog.html |
| `GET` | `/testing` | Sirve testing.html |
| `GET` | `/health` | Verifica el estado de la base de datos |

---

## Resumen

- **Total de rutas**: 43
- **Rutas GET**: 23
- **Rutas POST**: 20
- **Módulos**: 4 (Proyectos, Testing, Admin, Estáticas)
