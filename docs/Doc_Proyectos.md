### Gestion de proyecto

- Sprint
    - Crear sprint
    - Cerrar sprint
    - Listar sprints pasados
    - Gestionar backlog
- Tareas
    - Crear tarea
        - Tipos de tarea: Epica, Historia de Usuario, Defecto
        - Resumen
        - Creador
        - Sprint actual (no obligatorio)
        - Epica (no obligatorio)
    - Visualizar tarea
    - Modificar tareas

### Sprint

Los sprints se pueden crear en el marco de un proyecto. Al crear un sprint, se va a tomar el numero del sprint anterior y se va a incrementar en 1. El sprint se va a poder cerrar en cualquier momento, pero una vez cerrado, no se puede reabrir.
Al momento de abrir, se va a asignar la fecha de cierre, asi poder contabilizar cuantos dias quedan. Va a tener una opcion para tildar si el sprint es de 15 dias o 3 semanas, asi hace el conteo aumatico de la fecha de cierre, y solo se tiene que aceptar. Al crear un sprint tambien se puede poner un objetivo.

Para poder cerrar un sprint, todas las tareas del sprint anterior tienen que estar cerradas, o pueden pasar al sprint siguiente, para poder crear un sprint, el anterior debe estar cerrado.

Crear sprint sera una pantalla en donde se pueda:
- Asignar HU al sprint
- Asignar defectos al sprint
- Crear HU en el sprint
- Asignar fecha de cierre
- Asignar objetivo

#### APIs
GET /sprint_activo:  [EN_PROCESO]
    - Trae el idSprint que se encuentra activo, la fecha de cierre y una lista de tareas, junto con su estado
    - Esta API se usara para cargar la pantalla principal de la pagina, y asi poder ubicar las tareas en su correspondiente columna

POST /crear_sprint: [EN_PROCESO]
    - Crea un nuevo sprint
    - Se envia:
        - idProyecto
        - Fecha de Inicio
        - Fecha de Cierre
        - Lista de tareas
        - Objetivo
    - Valida que no haya ningun otro sprint activo en el proyecto
    - Valida que el usuario que lo esté creando sea PO -> [HACER?]

### Tareas
Las tareas van a ser de tipo:
    - Epica [HACER?]
    - Historia de usuario
    - Defecto

Para crear una historia se va a mandar:
    - Tipo
    - Titulo
    - Resumen
    - Imagen/Documentos
    - Creador
    - Parent/Epica
    - idSprint
    - idProyecto

Las tareas pueden estar en backlog del proyecto, por lo que idSprint es opcional
A las tareas se le pueden asignar responsables

#### APIs
POST /crear_tarea [EN_PROCESO]
    Se va a mandar:
        - Titulo
        - Descripcion
        - idSprint
        - idUsuario
        - idProyecto -> Tiene que ser el mismo que el del sprint. Se agrega por si idSprint viene vacio (va al backlog)

GET /get_tarea/{idTarea} [EN_PROCESO]
    Devuelve:
        - idTarea
        - Codigo
        - tipoTarea
        - Titulo
        - Descripcion
        - Estado
        
POST /modificar_tarea/{idTarea}
POST /asignar_responsable
POST /actualizar_estado