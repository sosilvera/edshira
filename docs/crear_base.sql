CREATE DATABASE edshira;
USE edshira;

-- ========================================================
-- 1. Tablas independientes (Sin Foreign Keys)
-- ========================================================
CREATE TABLE Usuarios (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(255) NOT NULL,
    Pass VARCHAR(255) NOT NULL,
    idRol INT NOT NULL
);

CREATE TABLE Tipo_Tarea (
    idTipo INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(255) NOT NULL
);

CREATE TABLE Estado_Tarea (
    idEstado INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL
);

CREATE TABLE Carpeta (
    idCarpeta INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(255) NOT NULL,
    Origen VARCHAR(255) NOT NULL
);

-- ========================================================
-- 2. Tablas de Nivel 1 (Dependen de Usuarios)
-- ========================================================
CREATE TABLE Proyecto (
    idProyecto INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(255) NOT NULL,
    Codigo VARCHAR(50) NOT NULL,
    idUser INT,
    FOREIGN KEY (idUser) REFERENCES Usuarios(idUsuario) ON DELETE SET NULL
);

CREATE TABLE Usuario_Proyecto (
    idUsuarioProyecto INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    idProyecto INT NOT NULL,
    FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE CASCADE,
    FOREIGN KEY (idProyecto) REFERENCES Proyecto(idProyecto) ON DELETE CASCADE
);

-- ========================================================
-- 3. Tablas de Nivel 2 (Dependen de Proyecto y Usuarios)
-- ========================================================
CREATE TABLE Proyecto_Sprint (
    idProySprint INT AUTO_INCREMENT PRIMARY KEY,
    idProyecto INT NOT NULL,
    NroSprint INT NOT NULL,
    Objetivo TEXT,
    Fecha_Inicio DATE,
    Fecha_Fin DATE,
    Abierto BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (idProyecto) REFERENCES Proyecto(idProyecto) ON DELETE CASCADE
);

CREATE TABLE Test_Plans (
    idTestPlan INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(255) NOT NULL,
    Descripcion TEXT,
    idProyecto INT NOT NULL,
    idUsuario INT,
    FOREIGN KEY (idProyecto) REFERENCES Proyecto(idProyecto) ON DELETE CASCADE,
    FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE SET NULL
);

CREATE TABLE Test_Cycle (
    idTestCycle INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(255) NOT NULL,
    idProyecto INT NOT NULL,
    FOREIGN KEY (idProyecto) REFERENCES Proyecto(idProyecto) ON DELETE CASCADE
);

-- ========================================================
-- 4. Tablas de Nivel 3 (Dependen de Sprints, Test_Plans, etc.)
-- ========================================================
CREATE TABLE Tareas (
    idTarea INT AUTO_INCREMENT PRIMARY KEY,
    idProyecto INT NOT NULL, -- Agregado
    codigo VARCHAR(50) UNIQUE, -- Modificado a NULL y UNIQUE
    Titulo VARCHAR(255) NOT NULL,
    Descripcion TEXT,
    file VARCHAR(255),
    UsuarioCreador INT, -- Agregado
    idResponsable INT,
    idTipo INT,
    idEstadoTarea INT, -- Agregado
    idSprint INT,
    FOREIGN KEY (idProyecto) REFERENCES Proyecto(idProyecto) ON DELETE CASCADE,
    FOREIGN KEY (UsuarioCreador) REFERENCES Usuarios(idUsuario) ON DELETE SET NULL,
    FOREIGN KEY (idResponsable) REFERENCES Usuarios(idUsuario) ON DELETE SET NULL,
    FOREIGN KEY (idTipo) REFERENCES Tipo_Tarea(idTipo) ON DELETE SET NULL,
    FOREIGN KEY (idEstadoTarea) REFERENCES Estado_Tarea(idEstado) ON DELETE SET NULL,
    FOREIGN KEY (idSprint) REFERENCES Proyecto_Sprint(idProySprint) ON DELETE CASCADE
);

CREATE TABLE Tests (
    idTest INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(255) NOT NULL,
    Descripcion TEXT,
    idTestPlan INT NOT NULL,
    idUsuario INT,
    FOREIGN KEY (idTestPlan) REFERENCES Test_Plans(idTestPlan) ON DELETE CASCADE,
    FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE SET NULL
);

-- ========================================================
-- 5. Tablas de Nivel 4 (Tablas intermedias / Relacionales)
-- ========================================================
CREATE TABLE Test_Execution (
    idTestCycle INT NOT NULL,
    idTest INT NOT NULL,
    idUsuario INT,
    Estado VARCHAR(50) NOT NULL, 
    FechaEjecucion DATE, -- Agregado
    PRIMARY KEY (idTestCycle, idTest),
    FOREIGN KEY (idTestCycle) REFERENCES Test_Cycle(idTestCycle) ON DELETE CASCADE,
    FOREIGN KEY (idTest) REFERENCES Tests(idTest) ON DELETE CASCADE,
    FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario) ON DELETE SET NULL
);

CREATE TABLE Defectos_Test (
    idDefectoTest INT AUTO_INCREMENT PRIMARY KEY,
    idTest INT NOT NULL,
    idTarea INT NOT NULL,
    FOREIGN KEY (idTest) REFERENCES Tests(idTest) ON DELETE CASCADE,
    FOREIGN KEY (idTarea) REFERENCES Tareas(idTarea) ON DELETE CASCADE
);

CREATE TABLE Carpeta_TestPlan (
    idCarpetaTarea INT AUTO_INCREMENT PRIMARY KEY,
    idCarpeta INT NOT NULL,
    idTestPlan INT NOT NULL,
    FOREIGN KEY (idCarpeta) REFERENCES Carpeta(idCarpeta) ON DELETE CASCADE,
    FOREIGN KEY (idTestPlan) REFERENCES Test_Plans(idTestPlan) ON DELETE CASCADE
);

CREATE TABLE Carpeta_TestExecution (
    idCarpetaTarea INT AUTO_INCREMENT PRIMARY KEY,
    idCarpeta INT NOT NULL,
    idTestCycle INT NOT NULL,
    FOREIGN KEY (idCarpeta) REFERENCES Carpeta(idCarpeta) ON DELETE CASCADE,
    FOREIGN KEY (idTestCycle) REFERENCES Test_Cycle(idTestCycle) ON DELETE CASCADE
);