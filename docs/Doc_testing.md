### Gestion de testing

- Test plan
    - Crear carpetas [LISTO]
        /crear_carpeta -> idCarpeta
            - Nombre: str - Not Null - No Default
            - Padre: str - Nulleable - Default "Root"
            - Origen: str - "Plan" o "Execution"
    - Borrar carpetas
    - Crear testPlan
        - /crear_testplan -> idTestPlan
            - Nombre: str - Not Null
            - Usuario: str - Not Null
            - Descripcion: str - Nulleable
            - idProyecto: int - Not Null

        - Asignar carpeta al testPlan
            - /set_carpeta -> 201
                - idCarpeta
                - idTestSet

        - Crear casos dentro de testPlan -> idTest
            - /crear_test -> idTest
                - Nombre: str - not null
                - Descripcion: str - nulleable
                - idTestPlan: int - not null
                - idUsuario: int - not null
                - Estado: int - not null
            
            - /get_estado_caso
            - /get_estado_ejecucion
                - idCaso
            - /get_testplans [LISTO]
                - idProyecto
            - /get_cases_by_testplan [LISTO]
                - idTestPlan

- Test Execution
    - Crear carpeta dentro de Test Execution
    - Crear test-cycle dentro de la carpeta
        - Importar casos del testPlan
        - Cambiar estado de un caso en el test-cycle


Descripcion:

- En la pantalla Test Plan se escriben los casos, en Test Execution se ejecutan. Un Test Plan va a tener Test asociados, un Test Plan se asocia a una Carpeta para facilitar su organización. A diferencia de ALM, cada Test Plan tiene Test, pero los Test NO TIENEN Test Config.
- En Test Execution, se crean Test Cycles y se asignan Test, quedan almacenados en la tabla test_execution para actualizar la ejecución desde ahi.