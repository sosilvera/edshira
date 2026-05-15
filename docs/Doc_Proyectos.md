### Gestion de proyecto

- Proyecto
    - Traer proyectos de un usuario: /proyectosUsuario/{idUsuario} [LISTO]
    - Asignar usuario a un proyecto: /asignar_proyecto [LISTO]
    - Listar proyectos: /get_proyectos [LISTO]
    - Crear proyecto: /crear_proyecto [PENDIENTE]
- Sprint
    - Crear sprint [PENDIENTE]
    - Cerrar sprint [PENDIENTE]
    - Listar sprints pasados [PENDIENTE]
    - Gestionar backlog
        - Listar backlog [LISTO]
        - Asignar tareas a sprints [PENDIENTE]
- Tareas
    - Crear tarea [LISTO]
        - Tipos de tarea: Epica, Historia de Usuario, Defecto
        - Resumen
        - Creador
        - Sprint actual (no obligatorio)
        - Epica (no obligatorio)
    - Visualizar tarea [EN_PROCESO]
    - Modificar tareas [PENDIENTE]

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
GET /sprint_activo:  [LISTO]
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
POST /crear_tarea [LISTO]
    Se va a mandar:
        - Titulo
        - Descripcion
        - idSprint
        - idUsuario
        - idProyecto -> Tiene que ser el mismo que el del sprint. Se agrega por si idSprint viene vacio (va al backlog)

GET /get_tarea/{idTarea} [LISTO]
    Devuelve:
        - idTarea
        - Codigo
        - tipoTarea
        - Titulo
        - Descripcion
        - Estado
        
POST /modificar_tarea/{idTarea}
POST /asignar_responsable [LISTO]
POST /actualizar_estado [LISTO]
    - Viene idEstado e idTarea en el body, lo actualiza en la tabla

### Flujo Web
Cuando carga la página:

- Revisar en CACHE si hay un usuario logueado
	- Si NO hay usuario:
		- Mostrar modal para que ingrese usuario
        - Llama a la API /get_usuario/{nombre usuario}
        - Si devuelve el ID, guardarlo en CACHE, si no, crear el usuario con /crear_usuario y guardar el id en Cache
		- Llamar a la API /proyectosUsuario/{idUsuario}, el cual devuelve un array de idProyectos
			- Elegir el primer elemento del array
			- Guardarlo en cache
		- Recargar pagina

- Validar si el usuario tiene un proyecto asignado: revisar si tiene un idProyecto en la cache, 
	- Si no tiene:
		- Llamar a la API /proyectosUsuario/{idUsuario}, el cual devuelve un array de idProyectos
		- Elegir el primer elemento del array
		- Guardarlo en cache
	- Si /proyectoUsuario devuelve vacio, debe mostrar un listado de proyectos a suscribir, mediante el llamado a /get_proyectos
		- Con el idProyecto, llamar la api POST /asignar_proyecto con el idUsuario e idProyecto

- Llamar API /sprintActivo/{idProject} con el idProject que tiene el usuario en la cache