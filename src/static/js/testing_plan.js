// ==========================================
// VARIABLES GLOBALES Y UTILIDADES
// ==========================================
const API_URL = '/edshira/api'; 
let currentTestCases = []; 
let currentTestPlanId = null;

// Funciones Auxiliares Globales (Disponibles para ambos archivos)
function mostrarDetalleCaso(caso, sufijo = '') {
    const titleId = sufijo ? `exec-detail-title` : `detail-title`;
    const descId = sufijo ? `exec-detail-desc` : `detail-desc`;
    const preId = sufijo ? `exec-detail-pre` : `detail-pre`;
    const resId = sufijo ? `exec-detail-res` : `detail-res`;

    document.getElementById(titleId).textContent = caso.nombre || caso.Titulo || 'Sin título';
    document.getElementById(descId).textContent = caso.descripcion || caso.Descripcion || '-';
    document.getElementById(preId).textContent = caso.precondiciones || '-';
    document.getElementById(resId).textContent = caso.resultado_esperado || '-';
}

function obtenerClaseBadge(estado) {
    const estNormalizado = estado.toUpperCase().trim();
    if (estNormalizado === 'APROBADO' || estNormalizado === 'PASS' || estNormalizado === 'PASSED') return 'badge-approved';
    if (estNormalizado === 'FAILED' || estNormalizado === 'FALLÓ') return 'badge-fail';
    if (estNormalizado === 'BORRADOR' || estNormalizado === 'DRAFT') return 'badge-draft';
    return 'badge-notrun';
}

// ==========================================
// INICIALIZACIÓN DE LA UI Y TEST PLAN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Configuración de UI Básica ---
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    }

    const userName = localStorage.getItem('userName') || 'Usuario';
    const projCode = localStorage.getItem('projectCode') || 'PROY';
    
    document.getElementById('nav-username').textContent = userName;
    document.getElementById('nav-avatar').textContent = userName.charAt(0).toUpperCase();
    document.getElementById('sidebar-project-name').textContent = `Proyecto ${projCode}`;

    // --- Lógica de Pestañas (Tabs) ---
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

    // --- Carga Inicial ---
    cargarCarpetas();

    // --- Lógica de Modales de Test Plan ---
    const createTestModal = document.getElementById('create-test-modal');
    const btnOpenCreateTest = document.querySelector('.btn-create-sm');
    const btnSubmitTest = document.getElementById('btn-submit-test');

    btnOpenCreateTest.addEventListener('click', () => {
        if (!currentTestPlanId) return alert("Por favor, seleccioná un Test Plan en el árbol de carpetas primero.");
        createTestModal.style.display = 'flex';
    });

    document.getElementById('close-create-test-modal').addEventListener('click', () => createTestModal.style.display = 'none');

    btnSubmitTest.addEventListener('click', async () => {
        const title = document.getElementById('create-test-title').value.trim();
        const desc = document.getElementById('create-test-desc').value.trim();
        const pre = document.getElementById('create-test-pre').value.trim();
        const res = document.getElementById('create-test-res').value.trim();

        if (!title) return alert("El título del caso es obligatorio.");

        const descripcionCombinada = `Descripcion: ${desc}\nPrecondiciones: ${pre}\nResultado Esperado: ${res}`;
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

            document.getElementById('create-test-title').value = '';
            document.getElementById('create-test-desc').value = '';
            document.getElementById('create-test-pre').value = '';
            document.getElementById('create-test-res').value = '';
            
            createTestModal.style.display = 'none';
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

    // --- Lógica de Carpetas y Test Plans ---
    const modalFolder = document.getElementById('create-folder-modal');
    const modalTestPlan = document.getElementById('create-testplan-modal');
    const folderSelect = document.getElementById('create-tp-folder');

    document.getElementById('btn-open-create-folder').addEventListener('click', () => modalFolder.style.display = 'flex');
    document.getElementById('close-folder-modal').addEventListener('click', () => modalFolder.style.display = 'none');

    document.getElementById('btn-open-create-testplan').addEventListener('click', async () => {
        modalTestPlan.style.display = 'flex';
        folderSelect.innerHTML = '<option value="">Cargando carpetas...</option>';
        try {
            const res = await fetch(`${API_URL}/testing/get_carpetas_plan`);
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
    
    document.getElementById('close-testplan-modal').addEventListener('click', () => modalTestPlan.style.display = 'none');

    document.getElementById('btn-submit-folder').addEventListener('click', async () => {
        const nombre = document.getElementById('create-folder-name').value.trim();
        if (!nombre) return alert("Ingrese un nombre");

        try {
            const res = await fetch(`${API_URL}/testing/crear_carpeta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Nombre: nombre, Padre: "", Origen: "Test Plan" })
            });
            if (res.ok) {
                document.getElementById('create-folder-name').value = '';
                modalFolder.style.display = 'none';
                cargarCarpetas(); 
            }
        } catch (e) {
            alert("Error al crear carpeta");
        }
    });

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
            const resPlan = await fetch(`${API_URL}/testing/crear_testplan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Nombre: nombre, Descripcion: desc,
                    idProyecto: parseInt(projectId), idUsuario: parseInt(userId)
                })
            });

            if (!resPlan.ok) throw new Error("Error al crear Test Plan");
            
            const dataPlan = await resPlan.json();
            const nuevoIdPlan = dataPlan.id || dataPlan.idTestPlan; 

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

            document.getElementById('create-tp-name').value = '';
            document.getElementById('create-tp-desc').value = '';
            modalTestPlan.style.display = 'none';
            cargarCarpetas(); 

        } catch (error) {
            alert("Ocurrió un error en el proceso");
        } finally {
            btn.disabled = false;
            btn.textContent = "Crear Test Plan";
        }
    });
});

// ==========================================
// FUNCIONES DE API: TEST PLAN
// ==========================================
async function cargarCarpetas() {
    const treeContainer = document.getElementById('folder-tree-container');
    try {
        const res = await fetch(`${API_URL}/testing/get_carpetas_plan`); 
        if (!res.ok) throw new Error("Error en la respuesta");
        
        const carpetas = await res.json();
        treeContainer.innerHTML = ''; 

        // Filtrar opcionalmente si necesitás separar visualmente
        carpetas.forEach(carpeta => {
            const folderLi = document.createElement('li');
            folderLi.className = 'tree-node';
            
            const hasPlans = carpeta.TestPlans && carpeta.TestPlans.length > 0;
            const toggleIcon = hasPlans ? '▶' : '📁';

            folderLi.innerHTML = `<span class="tree-toggle">${toggleIcon}</span> ${carpeta.Nombre}`;

            if (hasPlans) {
                const subList = document.createElement('ul');
                subList.className = 'tree-sublist';

                carpeta.TestPlans.forEach(plan => {
                    const planLi = document.createElement('li');
                    planLi.className = 'tree-leaf';
                    planLi.textContent = plan.Nombre;

                    planLi.addEventListener('click', (e) => {
                        e.stopPropagation(); 
                        document.querySelectorAll('#folder-tree-container .tree-leaf').forEach(l => l.classList.remove('active'));
                        planLi.classList.add('active');
                        cargarCasosTestPlan(plan.idTestPlan, plan.Nombre);
                    });

                    subList.appendChild(planLi);
                });
                folderLi.appendChild(subList);
            }

            folderLi.addEventListener('click', (e) => {
                if (e.target.classList.contains('tree-leaf')) return;
                folderLi.classList.toggle('expanded');
                const icon = folderLi.querySelector('.tree-toggle');
                if (hasPlans && icon) icon.textContent = folderLi.classList.contains('expanded') ? '▼' : '▶';
            });
            
            treeContainer.appendChild(folderLi);
        });
    } catch (error) {
        treeContainer.innerHTML = '<li class="tree-leaf" style="color: #ef4444;">Error al cargar carpetas</li>';
    }
}

async function cargarCasosTestPlan(idTestPlan, nombreTestPlan) {
    currentTestPlanId = idTestPlan;
    document.getElementById('cases-section-title').textContent = nombreTestPlan;
    const listContainer = document.getElementById('cases-list-container');
    listContainer.innerHTML = '<div class="loading-text" style="padding: 20px;">Cargando casos...</div>';
    
    try {
        const res = await fetch(`${API_URL}/testing/get_cases_by_testplan/${idTestPlan}`);
        if (!res.ok) throw new Error("No se pudieron obtener los casos");
        
        currentTestCases = await res.json();
        listContainer.innerHTML = '';

        if (currentTestCases.length === 0) {
            listContainer.innerHTML = '<div class="loading-text" style="padding: 20px;">Esta carpeta no tiene casos asignados.</div>';
            return;
        }

        for (const caso of currentTestCases) {
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
                // Silenciamos error visual
            }

            const caseRow = document.createElement('div');
            caseRow.className = 'case-row';
            caseRow.innerHTML = `
                <span class="case-icon">📄</span>
                <span class="case-title">${caso.nombre || caso.Titulo}</span>
                <div class="case-badges">${badgeHTML}</div>
            `;
            
            caseRow.addEventListener('click', () => {
                document.querySelectorAll('.case-row').forEach(r => r.classList.remove('active'));
                caseRow.classList.add('active');
                mostrarDetalleCaso(caso);
            });

            listContainer.appendChild(caseRow);
        }
    } catch (error) {
        listContainer.innerHTML = '<div class="loading-text" style="color: #ef4444;">Error al cargar los casos.</div>';
    }
}