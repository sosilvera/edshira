// ==========================================
// VARIABLES: TEST EXECUTION
// ==========================================
let currentTestCycleId = null;
let currentExecuteTestId = null;

// ==========================================
// INICIALIZACIÓN DE TEST EXECUTION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // Carga inicial del árbol de ejecución
    cargarCarpetasEjecucion();

    // --- Lógica del Modal: Crear Ciclo ---
    const modalCycle = document.getElementById('create-cycle-modal');
    const cycleFolderSelect = document.getElementById('create-cycle-folder');

    document.getElementById('btn-open-create-cycle').addEventListener('click', async () => {
        modalCycle.style.display = 'flex';
        cycleFolderSelect.innerHTML = '<option value="">Cargando carpetas...</option>';
        try {
            const res = await fetch(`${API_URL}/testing/get_carpetas_execution`);
            const carpetas = await res.json();
            cycleFolderSelect.innerHTML = '<option value="">Seleccione una carpeta...</option>';
            carpetas.filter(c => c.Origen === "Test Execution").forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.idCarpeta;
                opt.textContent = c.Nombre;
                cycleFolderSelect.appendChild(opt);
            });
        } catch (e) {
            cycleFolderSelect.innerHTML = '<option value="">Error al cargar carpetas</option>';
        }
    });
    
    document.getElementById('close-cycle-modal').addEventListener('click', () => modalCycle.style.display = 'none');

    document.getElementById('btn-submit-cycle').addEventListener('click', async (e) => {
        const nombre = document.getElementById('create-cycle-name').value.trim();
        const idCarpeta = cycleFolderSelect.value;
        
        if (!nombre || !idCarpeta) return alert("Completá todos los campos.");

        const userId = localStorage.getItem('userId') || 1;
        const projectId = localStorage.getItem('projectId') || 2; 

        e.target.disabled = true;
        e.target.textContent = "Creando...";

        try {
            const resCycle = await fetch(`${API_URL}/testing/crear_testcycle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Nombre: nombre, idProyecto: parseInt(projectId), idUsuario: parseInt(userId) })
            });
            
            const dataCycle = await resCycle.json();
            const nuevoIdCycle = dataCycle.id || dataCycle.idTestCycle; 

            if (nuevoIdCycle) {
                await fetch(`${API_URL}/testing/asignar_carpeta_testcycle`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        idCarpeta: parseInt(idCarpeta),
                        idTestCycle: parseInt(nuevoIdCycle)
                    })
                });
            }

            document.getElementById('create-cycle-name').value = '';
            modalCycle.style.display = 'none';
            cargarCarpetasEjecucion(); 

        } catch (error) {
            alert("Ocurrió un error al crear el ciclo");
        } finally {
            e.target.disabled = false;
            e.target.textContent = "Crear Ciclo";
        }
    });

    // --- Lógica del Modal: Importar Casos ---
    const modalImport = document.getElementById('import-cases-modal');
    
    document.getElementById('btn-open-import').addEventListener('click', async () => {
        if (!currentTestCycleId) return alert("Seleccioná un Test Cycle primero.");
        
        modalImport.style.display = 'flex';
        
        const treeContainer = document.getElementById('import-folder-tree');
        const casesContainer = document.getElementById('import-cases-list');
        document.getElementById('import-cases-title').textContent = 'Casos del Test Plan (0)';
        
        casesContainer.innerHTML = '<div class="loading-text" style="font-size: 0.85rem;">Seleccioná un Test Plan arriba.</div>';
        treeContainer.innerHTML = '<li class="loading-text">Cargando carpetas...</li>';

        try {
            // Llamamos a la API de los planes
            const res = await fetch(`${API_URL}/testing/get_carpetas_plan`);
            let carpetas = await res.json();
            
            // Filtramos las carpetas que NO tienen planes para no ensuciar la vista
            carpetas = carpetas.filter(c => c.TestPlans && c.TestPlans.length > 0);
            treeContainer.innerHTML = '';
            
            if(carpetas.length === 0) {
                 treeContainer.innerHTML = '<li class="loading-text">No hay Test Plans disponibles.</li>';
                 return;
            }

            carpetas.forEach(carpeta => {
                const folderLi = document.createElement('li');
                folderLi.className = 'tree-node';
                folderLi.innerHTML = `<span class="tree-toggle">▶</span> ${carpeta.Nombre || carpeta.nombre}`;
                
                const subList = document.createElement('ul');
                subList.className = 'tree-sublist';
                
                carpeta.TestPlans.forEach(plan => {
                    const planLi = document.createElement('li');
                    planLi.className = 'tree-leaf';
                    planLi.textContent = plan.Nombre || plan.nombre;
                    
                    // Evento al hacer clic en el Test Plan dentro del modal
                    planLi.addEventListener('click', (e) => {
                        e.stopPropagation();
                        // Resetear clases activas solo dentro del modal
                        document.querySelectorAll('#import-folder-tree .tree-leaf').forEach(l => l.classList.remove('active'));
                        planLi.classList.add('active');
                        
                        // Llamar a los casos
                        cargarCasosParaImportar(plan.idTestPlan, plan.Nombre || plan.nombre);
                    });
                    
                    subList.appendChild(planLi);
                });
                
                folderLi.appendChild(subList);
                
                folderLi.addEventListener('click', (e) => {
                    if (e.target.classList.contains('tree-leaf')) return;
                    folderLi.classList.toggle('expanded');
                    const icon = folderLi.querySelector('.tree-toggle');
                    if (icon) icon.textContent = folderLi.classList.contains('expanded') ? '▼' : '▶';
                });
                
                treeContainer.appendChild(folderLi);
            });
        } catch (error) {
            console.error(error);
            treeContainer.innerHTML = '<li style="color:#ef4444;">Error al cargar carpetas</li>';
        }
    });

    document.getElementById('close-import-modal').addEventListener('click', () => modalImport.style.display = 'none');

    // Función auxiliar para traer y dibujar los casos con checkbox
    async function cargarCasosParaImportar(idTestPlan, nombrePlan) {
        const casesContainer = document.getElementById('import-cases-list');
        const titleLabel = document.getElementById('import-cases-title');
        
        casesContainer.innerHTML = '<div class="loading-text" style="font-size: 0.85rem;">Cargando casos...</div>';
        
        try {
            const res = await fetch(`${API_URL}/testing/get_cases_by_testplan/${idTestPlan}`);
            const casos = await res.json();
            
            titleLabel.textContent = `Casos de: ${nombrePlan} (${casos.length})`;
            casesContainer.innerHTML = '';
            
            if (casos.length === 0) {
                casesContainer.innerHTML = '<div class="loading-text" style="font-size: 0.85rem;">Este Test Plan no tiene casos.</div>';
                return;
            }
            
            // Botón "Seleccionar Todos" (Excelente práctica de UX)
            const selectAllDiv = document.createElement('div');
            selectAllDiv.style.marginBottom = '12px';
            selectAllDiv.style.borderBottom = '1px solid #334155';
            selectAllDiv.style.paddingBottom = '12px';
            selectAllDiv.innerHTML = `
                <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="import-select-all"> <strong>Seleccionar Todos</strong>
                </label>
            `;
            casesContainer.appendChild(selectAllDiv);
            
            // Renderizado de la lista de casos
            casos.forEach(caso => {
                const casoDiv = document.createElement('div');
                const idCaso = caso.idTest || caso.id;
                casoDiv.innerHTML = `
                    <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; padding: 6px 0; cursor: pointer;">
                        <input type="checkbox" class="import-case-cb" value="${idCaso}">
                        <span style="font-size: 0.9rem;">${caso.nombre || caso.Titulo}</span>
                    </label>
                `;
                casesContainer.appendChild(casoDiv);
            });
            
            // Evento de "Seleccionar Todos"
            document.getElementById('import-select-all').addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.import-case-cb');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
            });
            
        } catch (error) {
            casesContainer.innerHTML = '<div style="color:#ef4444; font-size: 0.85rem;">Error al cargar casos</div>';
        }
    }

    // Submit de importación
    document.getElementById('btn-submit-import').addEventListener('click', async (e) => {
        // Obtenemos todos los checkboxes que estén marcados
        const checkboxes = document.querySelectorAll('.import-case-cb:checked');
        const testsArray = Array.from(checkboxes).map(cb => parseInt(cb.value));
        
        if (testsArray.length === 0) {
            return alert("Seleccioná al menos un caso de prueba para importar.");
        }
        
        const userId = localStorage.getItem('userId') || 1;
        e.target.textContent = "Importando...";
        e.target.disabled = true;

        try {
            await fetch(`${API_URL}/testing/import_cases`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idTestCycle: parseInt(currentTestCycleId),
                    idUsuario: parseInt(userId),
                    tests: testsArray // Mandamos la lista final filtrada a la API
                })
            });
            
            modalImport.style.display = 'none';
            
            // Recargamos la grilla maestra para ver los nuevos casos en el ciclo
            const nombreCiclo = document.getElementById('exec-section-title').textContent;
            cargarCasosTestCycle(currentTestCycleId, nombreCiclo);
        } catch (error) {
            alert("Error al importar casos");
        } finally {
            e.target.textContent = "Importar Seleccionados";
            e.target.disabled = false;
        }
    });

    // --- Lógica del Modal: Ejecutar Caso ---
    const modalExecute = document.getElementById('execute-test-modal');
    document.getElementById('close-execute-modal').addEventListener('click', () => modalExecute.style.display = 'none');

    document.getElementById('btn-submit-execute').addEventListener('click', async (e) => {
        const estado = document.getElementById('execute-status-select').value;
        const userId = localStorage.getItem('userId') || 1;
        
        const today = new Date();
        const fechaEjecucion = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

        e.target.textContent = "Guardando...";
        e.target.disabled = true;

        try {
            await fetch(`${API_URL}/testing/execute_test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idTest: parseInt(currentExecuteTestId),
                    idTestCycle: parseInt(currentTestCycleId),
                    Estado: estado,
                    FechaEjecucion: fechaEjecucion,
                    idUsuario: parseInt(userId)
                })
            });
            
            modalExecute.style.display = 'none';
            
            const nombreCiclo = document.getElementById('exec-section-title').textContent;
            cargarCasosTestCycle(currentTestCycleId, nombreCiclo);
        } catch (error) {
            alert("Error al ejecutar caso");
        } finally {
            e.target.textContent = "Guardar Ejecución";
            e.target.disabled = false;
        }
    });

    // --- Lógica del Modal: Crear Carpeta (Test Execution) ---
    const modalExecFolder = document.getElementById('create-exec-folder-modal');
    
    document.getElementById('btn-open-create-exec-folder').addEventListener('click', () => {
        modalExecFolder.style.display = 'flex';
    });
    
    document.getElementById('close-exec-folder-modal').addEventListener('click', () => {
        modalExecFolder.style.display = 'none';
    });

    document.getElementById('btn-submit-exec-folder').addEventListener('click', async (e) => {
        const nombre = document.getElementById('create-exec-folder-name').value.trim();
        if (!nombre) return alert("Ingrese un nombre para la carpeta");

        const btn = e.target;
        btn.disabled = true;
        btn.textContent = "Creando...";

        try {
            const res = await fetch(`${API_URL}/testing/crear_carpeta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // ACA ESTÁ LA MAGIA: Le decimos a la base de datos que esta carpeta es de Ejecución
                body: JSON.stringify({ Nombre: nombre, Padre: "null", Origen: "Test Execution" }) 
            });
            
            if (res.ok) {
                document.getElementById('create-exec-folder-name').value = '';
                modalExecFolder.style.display = 'none';
                
                // Recargamos el árbol de ciclos para que aparezca la nueva carpeta
                cargarCarpetasEjecucion(); 
            } else {
                throw new Error("Fallo al crear la carpeta en el servidor");
            }
        } catch (error) {
            console.error(error);
            alert("Error al crear la carpeta de ejecución");
        } finally {
            btn.disabled = false;
            btn.textContent = "Crear Carpeta";
        }
    });

});

// ==========================================
// FUNCIONES DE API: TEST EXECUTION
// ==========================================
async function cargarCarpetasEjecucion() {
    const treeContainer = document.getElementById('exec-folder-tree-container');
    try {
        const res = await fetch(`${API_URL}/testing/get_carpetas_execution`); 
        if (!res.ok) throw new Error("Error en la respuesta");
        
        const carpetas = await res.json();
        treeContainer.innerHTML = ''; 

        const carpetasExec = carpetas.filter(c => c.Origen === "Test Execution");

        carpetasExec.forEach(carpeta => {
            const folderLi = document.createElement('li');
            folderLi.className = 'tree-node';
            
            const ciclos = carpeta.TestCycles || carpeta.TestPlans || [];
            const hasCycles = ciclos.length > 0;
            const toggleIcon = hasCycles ? '▶' : '📁';

            folderLi.innerHTML = `<span class="tree-toggle">${toggleIcon}</span> ${carpeta.Nombre}`;

            if (hasCycles) {
                const subList = document.createElement('ul');
                subList.className = 'tree-sublist';

                ciclos.forEach(ciclo => {
                    const cicloLi = document.createElement('li');
                    cicloLi.className = 'tree-leaf';
                    cicloLi.textContent = ciclo.Nombre;

                    cicloLi.addEventListener('click', (e) => {
                        e.stopPropagation(); 
                        document.querySelectorAll('#exec-folder-tree-container .tree-leaf').forEach(l => l.classList.remove('active'));
                        cicloLi.classList.add('active');
                        
                        const idCiclo = ciclo.idTestCycle || ciclo.idTestPlan;
                        cargarCasosTestCycle(idCiclo, ciclo.Nombre);
                    });
                    subList.appendChild(cicloLi);
                });
                folderLi.appendChild(subList);
            }

            folderLi.addEventListener('click', (e) => {
                if (e.target.classList.contains('tree-leaf')) return;
                folderLi.classList.toggle('expanded');
                const icon = folderLi.querySelector('.tree-toggle');
                if (hasCycles && icon) icon.textContent = folderLi.classList.contains('expanded') ? '▼' : '▶';
            });
            
            treeContainer.appendChild(folderLi);
        });
    } catch (error) {
        treeContainer.innerHTML = '<li class="tree-leaf" style="color: #ef4444;">Error al cargar</li>';
    }
}

async function cargarCasosTestCycle(idTestCycle, nombreCiclo) {
    currentTestCycleId = idTestCycle;
    document.getElementById('exec-section-title').textContent = nombreCiclo;
    const listContainer = document.getElementById('exec-cases-list-container');
    listContainer.innerHTML = '<div class="loading-text">Cargando casos...</div>';
    
    try {
        const res = await fetch(`${API_URL}/testing/get_cases_by_testexecution/${idTestCycle}`);
        if (!res.ok) throw new Error("No se pudieron obtener los casos");
        
        const casos = await res.json();
        listContainer.innerHTML = '';

        if (casos.length === 0) {
            listContainer.innerHTML = '<div class="loading-text">No hay casos importados en este ciclo.</div>';
            return;
        }

        casos.forEach(caso => {
            const caseRow = document.createElement('div');
            caseRow.className = 'exec-row';
            caseRow.innerHTML = `
                <div class="col-title" style="display:flex; align-items:center; gap:8px;">
                    <span class="case-icon">▶</span>
                    <span class="case-title">${caso.nombre}</span>
                </div>
                <div class="col-status">
                    <span class="text-status">${caso.estado}</span>
                </div>
                <div class="col-evidencia">
                    <button class="btn-run-status">Ejecutar</button>
                </div>
            `;
            
            caseRow.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-run-status')) {
                    abrirModalEjecucion(caso.idTest);
                    return;
                }
                
                document.querySelectorAll('.exec-row').forEach(r => r.classList.remove('active'));
                caseRow.classList.add('active');
                
                // Usamos la función global con el sufijo 'exec-'
                mostrarDetalleCaso(caso, 'exec');
            });

            listContainer.appendChild(caseRow);
        });
    } catch (error) {
        listContainer.innerHTML = '<div class="loading-text" style="color: #ef4444;">Error al cargar ejecución.</div>';
    }
}

function abrirModalEjecucion(idTest) {
    currentExecuteTestId = idTest;
    document.getElementById('execute-test-modal').style.display = 'flex';
}