const API_URL = 'http://localhost:30095/edshira/api'; // Ajustá la URL según tu entorno

// Variable global para almacenar los casos y no tener que llamar a la API al ver detalles
let currentTestCases = []; 

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