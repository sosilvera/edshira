const API_URL = '/edshira/api/projects'; // Ajustar según tu entorno

document.addEventListener('DOMContentLoaded', () => {
    
    // --- UI Compartida (Sidebar y Navbar) ---
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    const userName = localStorage.getItem('userName') || 'Usuario';
    document.getElementById('nav-username').textContent = userName;
    document.getElementById('nav-avatar').textContent = userName.charAt(0).toUpperCase();

    const projectId = localStorage.getItem('projectId');
    if (!projectId) {
        // Si no hay proyecto, lo mandamos al index para que haga el flujo inicial
        window.location.href = '/edshira';
        return;
    }

    // --- LÓGICA PRINCIPAL DE BACKLOG ---
    inicializarBacklog(projectId);
});

async function inicializarBacklog(projectId) {
    try {
        // 1. Ejecutar ambas llamadas a la API en paralelo para mayor velocidad
        const [sprintsRes, backlogRes] = await Promise.all([
            fetch(`${API_URL}/get_sprints/${projectId}`),
            fetch(`${API_URL}/get_backlog/${projectId}`)
        ]);

        let sprints = [];
        let backlogTasks = [];

        // Parseo de Sprints
        if (sprintsRes.ok) {
            sprints = await sprintsRes.json();
        } else {
            console.warn("Fallo API sprints");
            alert("No se pudieron cargar los sprints. Intenta recargar la página.");
        }

        // Parseo de Backlog
        if (backlogRes.ok) {
            backlogTasks = await backlogRes.json();
        } else {
            console.warn("Fallo API backlog");
            alert("No se pudieron cargar las tareas del backlog. Intenta recargar la página.");
        }

        renderizarBacklog(backlogTasks, sprints);

    } catch (error) {
        console.error("Error inicializando la vista de backlog:", error);
        document.getElementById('backlog-list').innerHTML = `<p class="error-text">Error al cargar los datos del servidor.</p>`;
    }
}

function renderizarBacklog(tasks, sprints) {
    const contenedor = document.getElementById('backlog-list');
    contenedor.innerHTML = ''; // Limpiamos el "Cargando..."

    if (tasks.length === 0) {
        contenedor.innerHTML = `<p class="loading-text">El backlog está vacío. ¡Todo al día!</p>`;
        return;
    }

    // Pre-armar las opciones del select de sprints
    let opcionesSprints = `<option value="">Seleccionar Sprint</option>`;
    sprints.forEach(sprint => {
        console.log("Sprint disponible:", sprint);
        opcionesSprints += `<option value="${sprint.NroSprint}">Sprint ${sprint.NroSprint}</option>`;
    });

    // Iterar sobre las tareas y crear las filas
    tasks.forEach(tarea => {
        const row = document.createElement('div');
        const isBug = tarea.tipo.toLowerCase() === 'bug';
        row.className = `backlog-row ${isBug ? 'bug-row' : 'story-row'}`;
        
        // Obtener iniciales del responsable (ej: "Sebastian Silvera" -> "SS")
        const iniciales = obtenerIniciales(tarea.creador);

        row.innerHTML = `
            <span class="row-code">${tarea.codigo}</span>
            <span class="row-title">${tarea.titulo}</span>
            <div class="row-assignee" title="${tarea.creador || 'Sin asignar'}">${iniciales}</div>
            <select class="row-sprint-select" data-tarea-id="${tarea.idTarea}">
                ${opcionesSprints}
            </select>
        `;

        contenedor.appendChild(row);
    });

    // Escuchar cambios en los selects para asignar al sprint
    document.querySelectorAll('.row-sprint-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const idTarea = e.target.getAttribute('data-tarea-id');
            const idSprint = e.target.value;
            
            if (!idSprint) return;

            try {
                // Deshabilitar temporalmente mientras hace la llamada
                e.target.disabled = true;
                
                // Llamada a tu API para guardar la asignación
                console.log(`Asignando tarea ${idTarea} al sprint ${idSprint}`);
                // Descomentar cuando la API esté lista:
                await fetch(`${API_URL}/asignar_sprint`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idTarea: parseInt(idTarea), idSprint: parseInt(idSprint) })
                });
                
                
                // Si la asignación es exitosa, removemos la fila del DOM
                // porque ya no pertenece al Backlog sin asignar
                e.target.closest('.backlog-row').remove();

            } catch (error) {
                console.error("Error al asignar tarea al sprint:", error);
                e.target.disabled = false;
                alert("Error al asignar la tarea al sprint.");
            }
        });
    });
}

// Función auxiliar para sacar las iniciales de un nombre
function obtenerIniciales(nombreCompleto) {
    if (!nombreCompleto) return '--';
    const partes = nombreCompleto.trim().split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
}