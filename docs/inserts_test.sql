-- 1. Tablas independientes (Sin Foreign Keys)

-- Insertamos algunos usuarios (Roles: 1 = Admin, 2 = QA, 3 = Dev, 4 = Consultor)
INSERT INTO Usuarios (Nombre, Pass, idRol) VALUES 
('Sebastian Silvera', 'hash_pass_123', 4),
('Ximena Bazan', 'hash_pass_456', 3),
('Ivan Tomir', 'hash_pass_789', 2);

-- Insertamos los tipos de tarea típicos en gestión ágil
INSERT INTO Tipo_Tarea (Nombre) VALUES 
('Bug'),
('User Story');

-- 2. Tablas de Nivel 1 (Dependen de Usuarios)

-- Creamos un par de proyectos (asignando un idUser como Project Manager)
INSERT INTO Proyecto (Nombre, Codigo, idUser) VALUES 
('Bibites_Maker', 'BBM', 1),
('Migración Oracle Fusion', 'MOF', 1);

INSERT INTO Usuario_Proyecto (idUsuario, idProyecto) VALUES 
(1, 1), -- Sebastian en Bibites_Maker
(2, 1), -- Ximena en Bibites_Maker
(3, 1), -- Ivan en Bibites_Maker
(1, 2); -- Sebastian en Migración Oracle Fusion

-- 3. Tablas de Nivel 2 (Dependen de Proyecto y Usuarios)

-- Sprints para los proyectos
INSERT INTO Proyecto_Sprint (idProyecto, NroSprint, Objetivo, Fecha_Inicio, Fecha_Fin, Abierto) VALUES 
(1, 1, 'Configurar Docker, FastAPI y armar el backend base', '2026-05-01', '2026-05-15', TRUE),
(2, 12, 'Pruebas de configuraciones impositivas y contabilidad', '2026-04-10', '2026-04-24', FALSE);

-- Planes de prueba (Test Plans)
INSERT INTO Test_Plans (Nombre, Descripcion, idProyecto, idUsuario) VALUES 
('Plan de Pruebas - Backend Auth', 'Cobertura de pruebas para la implementación de JWT y roles', 1, 3),
('Plan Regresión - Impuestos', 'Validación de IIBB Santa Fe e Impuestos Internos en Fusion', 2, 3);

-- Ciclos de prueba (Test Cycles)
INSERT INTO Test_Cycle (Nombre, idProyecto) VALUES 
('Ciclo 1: Smoke Test API', 1),
('Ciclo 3: UAT Finanzas', 2);

-- 4. Tablas de Nivel 3 (Dependen de Sprints, Test_Plans y Tipo_Tarea)

-- Tareas dentro de los sprints
INSERT INTO Tareas (Titulo, Descripcion, file, idResponsable, idTipo, idSprint) VALUES 
('Dockerizar aplicación', 'Armar el Dockerfile y docker-compose.yml', 'docker_reqs.pdf', 2, 2, 1),
('Configurar JWT', 'Implementar autenticación en los endpoints de FastAPI', NULL, 2, 2, 1),
('Corregir cálculo IIBB', 'El alícuota de Santa Fe está calculando mal en las facturas A', 'log_error.txt', 1, 1, 2);

-- Casos de prueba (Tests)
INSERT INTO Tests (Nombre, Descripcion, idTestPlan, idUsuario) VALUES 
('Validar login exitoso', 'Probar endpoint /token con credenciales válidas', 1, 3),
('Validar bloqueo JWT', 'Probar endpoint seguro sin token o con token expirado', 1, 3),
('Creación de Factura con IIBB', 'Generar factura de venta y verificar cálculo de IIBB Santa Fe', 2, 3);

-- 5. Tablas de Nivel 4 (Dependen de Tests, Test_Cycle y Tareas)

-- Ejecución de los casos de prueba dentro de un ciclo
INSERT INTO Test_Execution (idTestCycle, idTest, idUsuario, Estado) VALUES 
(1, 1, 3, 'Pass'),
(1, 2, 3, 'Fail'),
(2, 3, 3, 'In Progress');

-- Registro de defectos (Vincula un Test que falló con la Tarea tipo "Bug" que lo va a arreglar)
-- Acá vinculamos el Test 2 (que falló arriba) con una nueva tarea que sería para arreglar ese defecto.
-- Asumimos que la tarea id=3 es el bug correspondiente.
INSERT INTO Defectos_Test (idTest, idTarea) VALUES 
(2, 3);