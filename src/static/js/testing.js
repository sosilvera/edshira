const API_URL = 'http://localhost:30095/edshira/api'; // Ajustá la URL según tu entorno

// Variable global para almacenar los casos y no tener que llamar a la API al ver detalles
let currentTestCases = []; 
let currentTestPlanId = null;

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. CONFIGURACIÓN DE UI BÁSICA
    // ==========================================
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    const userName = localStorage.getItem('userName') || 'Usuario';
    const projCode = localStorage.getItem('projectCode') || 'PROY';
    
    document.getElementById('nav-username').textContent = userName;
    document.getElementById('nav-avatar').textContent = userName.charAt(0).toUpperCase();
    document.getElementById('sidebar-project-name').textContent = `Proyecto ${projCode}`;

    // Lógica de Pestañas (Tabs)
    const tabs = document.querySelectorAll('.testing-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            document.querySelectorAll('.testing-layout').forEach(view => {
                view.style.display = 'none';
            });
            
            const targetId = e.target.getAttribute('data-target');
            document.getElementById(targetId).style.display = 'flex';
        });
    });

    // ==========================================
    // 2. INICIALIZAR DATOS DINÁMICOS
    // ==========================================
    cargarCarpetas();
    
    // ==========================================
    // LÓGICA MODAL CREAR CASO DE PRUEBA
    // ==========================================
    const createTestModal = document.getElementById('create-test-modal');
    const btnOpenCreateTest = document.querySelector('.btn-create-sm'); // El botón "+ Crear Caso"
    const btnCloseCreateTest = document.getElementById('close-create-test-modal');
    const btnSubmitTest = document.getElementById('btn-submit-test');

    // Abrir Modal
    btnOpenCreateTest.addEventListener('click', () => {
        // Validamos que haya seleccionado un Test Plan antes de crear el caso
        if (!currentTestPlanId) {
            alert("Por favor, seleccioná un Test Plan en el árbol de carpetas primero.");
            return;
        }
        createTestModal.style.display = 'flex';
    });

    // Cerrar Modal
    btnCloseCreateTest.addEventListener('click', () => {
        createTestModal.style.display = 'none';
    });

    // Enviar a la API
    btnSubmitTest.addEventListener('click', async () => {
        const title = document.getElementById('create-test-title').value.trim();
        const desc = document.getElementById('create-test-desc').value.trim();
        const pre = document.getElementById('create-test-pre').value.trim();
        const res = document.getElementById('create-test-res').value.trim();

        if (!title) {
            alert("El título del caso es obligatorio.");
            return;
        }

        // Armamos el texto gigante concatenado que espera tu API
        const descripcionCombinada = `Descripcion: ${desc}\nPrecondiciones: ${pre}\nResultado Esperado: ${res}`;
        
        // Agarramos el usuario logueado de la caché
        const userId = localStorage.getItem('userId');

        btnSubmitTest.disabled = true;
        btnSubmitTest.textContent = "Guardando...";

        try {
            const response = await fetch(`${API_URL}/testing/crear_test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Nombre: title,
                    Descripcion: descripcionCombinada,
                    idTestPlan: parseInt(currentTestPlanId),
                    idUsuario: parseInt(userId)
                })
            });

            if (!response.ok) throw new Error("Fallo al guardar en la API");

            // Limpiamos los inputs
            document.getElementById('create-test-title').value = '';
            document.getElementById('create-test-desc').value = '';
            document.getElementById('create-test-pre').value = '';
            document.getElementById('create-test-res').value = '';
            
            // Ocultamos el modal
            createTestModal.style.display = 'none';
            
            // Recargamos silenciosamente los casos para que aparezca el nuevo
            const nombreTestPlan = document.getElementById('cases-section-title').textContent;
            cargarCasosTestPlan(currentTestPlanId, nombreTestPlan);

        } catch (error) {
            console.error("Error al crear el caso de prueba:", error);
            alert("Hubo un error al crear el caso.");
        } finally {
            btnSubmitTest.disabled = false;
            btnSubmitTest.textContent = "Crear Caso";
        }
    });

    // ==========================================
    // LÓGICA: CREAR CARPETA Y TEST PLAN
    // ==========================================
    const modalFolder = document.getElementById('create-folder-modal');
    const modalTestPlan = document.getElementById('create-testplan-modal');
    const folderSelect = document.getElementById('create-tp-folder');

    // --- Abrir / Cerrar Modal Carpeta ---
    document.getElementById('btn-open-create-folder').addEventListener('click', () => {
        modalFolder.style.display = 'flex';
    });
    document.getElementById('close-folder-modal').addEventListener('click', () => {
        modalFolder.style.display = 'none';
    });

    // --- Abrir / Cerrar Modal Test Plan ---
    document.getElementById('btn-open-create-testplan').addEventListener('click', async () => {
        modalTestPlan.style.display = 'flex';
        // Llenar el select con las carpetas actuales
        folderSelect.innerHTML = '<option value="">Cargando carpetas...</option>';
        try {
            const res = await fetch(`${API_URL}/testing/get_carpetas`);
            const carpetas = await res.json();
            folderSelect.innerHTML = '<option value="">Seleccione una carpeta...</option>';
            carpetas.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.idCarpeta;
                opt.textContent = c.Nombre || c.nombre;
                folderSelect.appendChild(opt);
            });
        } catch (e) {
            folderSelect.innerHTML = '<option value="">Error al cargar carpetas</option>';
        }
    });
    document.getElementById('close-testplan-modal').addEventListener('click', () => {
        modalTestPlan.style.display = 'none';
    });

    // --- SUBMIT: Crear Carpeta ---
    document.getElementById('btn-submit-folder').addEventListener('click', async () => {
        const nombre = document.getElementById('create-folder-name').value.trim();
        if (!nombre) return alert("Ingrese un nombre");

        try {
            // Asumiendo que tenés un endpoint crear_carpeta
            const res = await fetch(`${API_URL}/testing/crear_carpeta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Nombre: nombre, Origen: "Test Plan" })
            });
            if (res.ok) {
                document.getElementById('create-folder-name').value = '';
                modalFolder.style.display = 'none';
                cargarCarpetas(); // Refrescar el árbol
            }
        } catch (e) {
            console.error(e);
            alert("Error al crear carpeta");
        }
    });

    // --- SUBMIT: Crear Test Plan + Asociar a Carpeta ---
    document.getElementById('btn-submit-testplan').addEventListener('click', async (e) => {
        const nombre = document.getElementById('create-tp-name').value.trim();
        const desc = document.getElementById('create-tp-desc').value.trim();
        const idCarpeta = folderSelect.value;
        const btn = e.target;

        if (!nombre) return alert("El nombre es obligatorio");
        if (!idCarpeta) return alert("Debe seleccionar una carpeta de destino");

        const userId = localStorage.getItem('userId') || 1;
        const projectId = localStorage.getItem('projectId') || 2; 

        btn.disabled = true;
        btn.textContent = "Creando...";

        try {
            // 1. Crear el Test Plan
            const resPlan = await fetch(`${API_URL}/testing/crear_testplan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Nombre: nombre,
                    Descripcion: desc,
                    idProyecto: parseInt(projectId),
                    idUsuario: parseInt(userId)
                })
            });

            if (!resPlan.ok) throw new Error("Error al crear Test Plan");
            
            // Supongamos que tu API devuelve el ID del plan recién creado en "id" o "idTestPlan"
            const dataPlan = await resPlan.json();
            const nuevoIdPlan = dataPlan.id || dataPlan.idTestPlan; 

            // 2. Asociarlo a la carpeta seleccionada (Usando el endpoint set_carpeta)
            if (nuevoIdPlan) {
                await fetch(`${API_URL}/testing/set_carpeta`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        idCarpeta: parseInt(idCarpeta),
                        idTestPlan: parseInt(nuevoIdPlan)
                    })
                });
            }

            // 3. Limpiar y refrescar
            document.getElementById('create-tp-name').value = '';
            document.getElementById('create-tp-desc').value = '';
            modalTestPlan.style.display = 'none';
            cargarCarpetas(); // Recargar el árbol para ver los cambios

        } catch (error) {
            console.error(error);
            alert("Ocurrió un error en el proceso");
        } finally {
            btn.disabled = false;
            btn.textContent = "Crear Test Plan";
        }
    });
});

// ==========================================
// 3. FUNCIONES DE CONEXIÓN A API
// ==========================================

async function cargarCarpetas() {
    const treeContainer = document.getElementById('folder-tree-container');
    
    try {
        const res = await fetch(`${API_URL}/testing/get_carpetas`); 
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        
        const carpetas = await res.json();
        treeContainer.innerHTML = ''; // Limpiamos el "Cargando..."

        carpetas.forEach(carpeta => {
            // 1. Crear el nodo de la Carpeta Padre
            const folderLi = document.createElement('li');
            folderLi.className = 'tree-node';
            
            // Verificamos si tiene planes adentro para ponerle la flechita
            const hasPlans = carpeta.TestPlans && carpeta.TestPlans.length > 0;
            const toggleIcon = hasPlans ? '▶' : '📁';

            folderLi.innerHTML = `<span class="tree-toggle">${toggleIcon}</span> ${carpeta.Nombre}`;

            // 2. Si tiene TestPlans, armamos la sublista
            if (hasPlans) {
                const subList = document.createElement('ul');
                subList.className = 'tree-sublist';

                carpeta.TestPlans.forEach(plan => {
                    const planLi = document.createElement('li');
                    planLi.className = 'tree-leaf';
                    planLi.textContent = plan.Nombre;

                    // Evento al hacer click EN EL TEST PLAN (Hoja del árbol)
                    planLi.addEventListener('click', (e) => {
                        e.stopPropagation(); // Evitar que el clic cierre la carpeta padre
                        
                        // Resaltar visualmente el plan seleccionado
                        document.querySelectorAll('.tree-leaf').forEach(l => l.classList.remove('active'));
                        planLi.classList.add('active');
                        
                        // Disparar la carga de casos enviando el ID del Test Plan
                        cargarCasosTestPlan(plan.idTestPlan, plan.Nombre);
                    });

                    subList.appendChild(planLi);
                });
                
                // Agregar la sublista adentro de la carpeta
                folderLi.appendChild(subList);
            }

            // 3. Evento para Expandir/Colapsar la Carpeta
            folderLi.addEventListener('click', (e) => {
                // Si el clic fue adentro de un TestPlan (hijo), ignoramos esto para no cerrar la carpeta
                if (e.target.classList.contains('tree-leaf')) return;
                
                folderLi.classList.toggle('expanded');
                
                // Cambiar la flechita visualmente si tiene hijos
                const icon = folderLi.querySelector('.tree-toggle');
                if (hasPlans && icon) {
                    icon.textContent = folderLi.classList.contains('expanded') ? '▼' : '▶';
                }
            });
            
            // Insertar la carpeta terminada en el contenedor principal
            treeContainer.appendChild(folderLi);
        });
        
    } catch (error) {
        console.error("Error al cargar las carpetas:", error);
        treeContainer.innerHTML = '<li class="tree-leaf" style="color: #ef4444;">Error al cargar carpetas</li>';
    }
}

async function cargarCasosTestPlan(idTestPlan, nombreTestPlan) {
    currentTestPlanId = idTestPlan;
    document.getElementById('cases-section-title').textContent = nombreTestPlan;
    const listContainer = document.getElementById('cases-list-container');
    listContainer.innerHTML = '<div class="loading-text" style="padding: 20px;">Cargando casos...</div>';
    
    try {
        // Llamada para obtener los casos del TestPlan
        const res = await fetch(`${API_URL}/testing/get_cases_by_testplan/${idTestPlan}`);
        if (!res.ok) throw new Error("No se pudieron obtener los casos");
        
        currentTestCases = await res.json();
        listContainer.innerHTML = '';

        if (currentTestCases.length === 0) {
            listContainer.innerHTML = '<div class="loading-text" style="padding: 20px;">Esta carpeta no tiene casos asignados.</div>';
            return;
        }

        // Iterar sobre cada caso para renderizarlo
        for (const caso of currentTestCases) {
            
            // Sub-llamada para obtener el estado de ejecución de este caso específico
            let badgeHTML = '<span class="badge badge-notrun">NOT RUN</span>';
            try {
                const statusRes = await fetch(`${API_URL}/testing/get_execution_state/${caso.id}`);
                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    const estado = statusData.estado || 'NOT RUN';
                    const badgeClass = obtenerClaseBadge(estado);
                    badgeHTML = `<span class="badge ${badgeClass}">${estado}</span>`;
                }
            } catch (error) {
                console.warn(`No se pudo obtener estado para el test ${caso.idTest}`, error);
            }

            // Crear la fila del caso
            const caseRow = document.createElement('div');
            caseRow.className = 'case-row';
            caseRow.innerHTML = `
                <span class="case-icon">📄</span>
                <span class="case-title">${caso.nombre || caso.Titulo}</span>
                <div class="case-badges">
                    ${badgeHTML}
                </div>
            `;
            
            // Evento para ver detalles
            caseRow.addEventListener('click', () => {
                document.querySelectorAll('.case-row').forEach(r => r.classList.remove('active'));
                caseRow.classList.add('active');
                mostrarDetalleCaso(caso);
            });

            listContainer.appendChild(caseRow);
        }
    } catch (error) {
        console.error("Error al cargar casos:", error);
        listContainer.innerHTML = '<div class="loading-text" style="padding: 20px; color: #ef4444;">Error al cargar los casos del TestPlan.</div>';
    }
}

// ==========================================
// 4. FUNCIONES AUXILIARES
// ==========================================

function mostrarDetalleCaso(caso) {
    // Inyecta la información del caso seleccionado en el panel inferior
    document.getElementById('detail-title').textContent = caso.nombre || caso.Titulo || 'Sin título';
    document.getElementById('detail-desc').textContent = caso.descripcion || caso.Descripcion || 'No se proporcionó descripción.';
    
    // Si tu API devuelve precondiciones y resultados en la misma tabla o relacionadas, las mapeamos acá
    document.getElementById('detail-pre').textContent = caso.precondiciones || 'N/A';
    document.getElementById('detail-res').textContent = caso.resultado_esperado || 'N/A';
}

function obtenerClaseBadge(estado) {
    // Normaliza el estado para aplicar el color correcto definido en tu CSS
    const estNormalizado = estado.toUpperCase().trim();
    if (estNormalizado === 'APROBADO' || estNormalizado === 'PASS') return 'badge-approved';
    if (estNormalizado === 'FAILED' || estNormalizado === 'FALLÓ') return 'badge-fail';
    if (estNormalizado === 'BORRADOR' || estNormalizado === 'DRAFT') return 'badge-draft';
    return 'badge-notrun';
}