### Gestion de testing

- Test plan
    - Crear carpetas [LISTO]
        /crear_carpeta -> idCarpeta
            - Nombre: str - Not Null - No Default
            - Padre: str - Nulleable - Default "Root"
            - Origen: str - "Plan" o "Execution"
    - Borrar carpetas
    - Listar testplans por Carpeta
        - /get_folders
            - idCarpeta
            - Origen
            - idTestPlan
            - NombreTestPlan

    - Crear testPlan [LISTO]
        - /crear_testplan -> idTestPlan
            - Nombre: str - Not Null
            - Usuario: str - Not Null
            - Descripcion: str - Nulleable
            - idProyecto: int - Not Null

        - Asignar carpeta al testPlan [LISTO]
            - /set_carpeta -> 201
                - idCarpeta
                - idTestSet

        - Crear casos dentro de testPlan -> idTest [LISTO]
            - /crear_test -> idTest
                - Nombre: str - not null
                - Descripcion: str - nulleable
                - idTestPlan: int - not null
                - idUsuario: int - not null
                - Estado: int - not null
            
            - /get_estado_caso -> APROBADO|BORRADOR [NO_MVP]
                - idCaso
                - Tengo que agregar columna a tabla de casos y tendria que agregar una forma de actualizarlo, no fue pensado desde el inicio. Lo dejo para mas adelante

            - /get_estado_ejecucion -> Trae estado de ultima ejecucion: PASS|FAIL|NOT RUN|etc.. [LISTO]
                - idCaso

            - /get_testplans [LISTO]
                - idProyecto
            
            - /get_cases_by_testplan [LISTO]
                - idTestPlan

- Test Execution
    - Crear carpeta dentro de Test Execution [LISTO]
        - /crear_carpeta -> idCarpeta 
        - Recibe Origen, que puede ser Test Plan o Test Execution
    - Listar carpetas [LISTO]
        - En el FE hay que filtrar por Test Execution
    - Crear test-cycle dentro de la carpeta [LISTO]
    - Listar test-cycles [LISTO]
    - Importar casos del testPlan al testCycle
        - /import_case
            - idTestCycle
            - idUsuario
            - tests[]
        - 
    - Cambiar estado de un caso en el test-cycle [LISTO]
    - Listar test por Test-Cycles
        - /get_cases_by_testplan/{idTestExecution}


Descripcion:

- En la pantalla Test Plan se escriben los casos, en Test Execution se ejecutan. 
- Un Test Plan va a tener Test asociados, un Test Plan se asocia a una Carpeta para facilitar su organización. A diferencia de ALM, cada Test Plan tiene Test, pero los Test NO TIENEN Test Config.
- En Test Execution, se crean Test Cycles y se asignan Test, quedan almacenados en la tabla test_execution para actualizar la ejecución desde ahi.


------------------------ CARPETA ------------------------ 
                            |
                            v
            Test Plan 1 | Test Plan 2 | Test Plan N
                |
                V
    Case 1| Case 2 | Caso N


Pendiente:
- Ver como armar una tabla en cache que tenga los posibles estados validos de los casos, cosa de no tener que levantarlos de la BD cada vez que se quiere crear un caso
- Agregar color a los estados de los casos
- Agregar accion a 'Crear historia' en Testing
- Agregar link para defectos-casos de prueba