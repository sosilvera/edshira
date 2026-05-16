const API_URL = 'http://localhost:30095/edshira/api/projects'; // Ajustar según entorno
const MAP_TYPES = {
    "Bug": 1,
    "HU": 2
};

// Caché en memoria para la lista de usuarios
let listaUsuariosGlobal = [];

document.addEventListener('DOMContentLoaded', () => {

    // --- VARIABLES GLOBALES DEL DOM ---
    const initModal = document.getElementById('init-modal');
    const loginSection = document.getElementById('login-section');
    const projectSection = document.getElementById('project-section');
    
    const createModal = document.getElementById('create-modal');
    const viewModal = document.getElementById('view-modal');

    // UI Superior
    const navUsername = document.getElementById('nav-username');
    const navAvatar = document.getElementById('nav-avatar');

    // Inicializar App
    runInitFlow();
    setupUI();

    // ==========================================
    // LÓGICA DE INICIALIZACIÓN
    // ==========================================

    async function runInitFlow() {
        let userId = localStorage.getItem('userId');
        let userName = localStorage.getItem('userName');
        let projectId = localStorage.getItem('projectId');
        let projectCode = localStorage.getItem('projectCode');

        // ESTADO 1: No hay usuario -> Mostrar Login y detener ejecución
        if (!userId) {
            initModal.style.display = 'flex';
            loginSection.style.display = 'block';
            projectSection.style.display = 'none';
            return; 
        }

        // Mostrar usuario en nav superior
        navUsername.textContent = userName;
        navAvatar.textContent = userName.charAt(0).toUpperCase();

        // ESTADO 2: Hay usuario, pero no hay proyecto válido asignado
        if (!projectId || isNaN(Number(projectId))) {
            // Limpiamos basura en caché por las dudas
            localStorage.removeItem('projectId');
            localStorage.removeItem('projectCode');
            projectId = null;
            
            try {
                // ÚNICA llamada para consultar los proyectos del usuario
                const res = await fetch(`${API_URL}/proyectos_usuario/${userId}`);
                const proyectosArray = await res.json();

                if (proyectosArray && proyectosArray.length > 0) {
                    // Tiene proyectos: Elegimos el primero y guardamos en caché
                    projectId = proyectosArray[0].idProyecto;
                    projectCode = proyectosArray[0].codigo;
                    localStorage.setItem('projectId', projectId);
                    localStorage.setItem('projectCode', projectCode);
                } else {
                    // No tiene proyectos: Mostrar listado para suscribir y detener ejecución
                    await loadProjectsForSubscription(userId);
                    return; 
                }
            } catch (error) {
                console.error("Error al validar proyectos del usuario:", error);
                return;
            }
        }

        // ESTADO 3: Todo en orden (Hay usuario y proyecto) -> Cargar el tablero
        initModal.style.display = 'none'; // Ocultamos el modal definitivamente
        fetchSprintActivo(projectId);
    }

    // --- Flujo de Login ---
    document.getElementById('btn-login').addEventListener('click', async () => {
        const username = document.getElementById('username-input').value.trim();
        if (!username) {
            document.getElementById('login-error').style.display = 'block';
            return;
        }

        try {
            const btnLogin = document.getElementById('btn-login');
            btnLogin.disabled = true;
            btnLogin.textContent = "Cargando...";
            let currentUserId;

            // 1. Obtener o crear usuario
            const getRes = await fetch(`${API_URL}/get_user_id/${username}`);
            if (getRes.ok) {
                const userData = await getRes.json();
                currentUserId = userData.id;
            } else {
                const createRes = await fetch(`${API_URL}/crear_usuario`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre: username })
                });
                const newUserData = await createRes.json();
                currentUserId = newUserData.idUsuario; // Asegurate de que tu API devuelva idUsuario acá
            }

            // 2. Guardar en caché
            localStorage.setItem('userId', currentUserId);
            localStorage.setItem('userName', username);

            // 3. Restaurar botón y AVANZAR AL SIGUIENTE ESTADO (sin recargar la página)
            btnLogin.disabled = false;
            btnLogin.textContent = "Ingresar";
            
            await runInitFlow(); // Llama a la función principal para que evalúe los proyectos

        } catch (error) {
            console.error("Error en login:", error);
            const btnLogin = document.getElementById('btn-login');
            btnLogin.disabled = false;
            btnLogin.textContent = "Ingresar";
            document.getElementById('login-error').textContent = "Error de conexión.";
            document.getElementById('login-error').style.display = 'block';
        }
    });

    // --- Flujo de Suscripción a Proyecto ---
    async function loadProjectsForSubscription(userId) {
        initModal.style.display = 'flex';
        loginSection.style.display = 'none';
        projectSection.style.display = 'block';

        const select = document.getElementById('project-select');
        try {
            const res = await fetch(`${API_URL}/get_proyectos`);
            const proyectos = await res.json();
            
            select.innerHTML = '<option value="">Seleccioná un proyecto...</option>';
            proyectos.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.idProyecto;
                opt.dataset.codigo = p.codigo || ''; // Guardamos el código temporalmente en el option
                opt.textContent = p.nombre;
                select.appendChild(opt);
            });
        } catch (error) {
            console.error("Error obteniendo proyectos globales:", error);
            select.innerHTML = '<option value="">Error al cargar</option>';
        }

        document.getElementById('btn-subscribe').onclick = async () => {
            const selectedProjId = select.value;
            const selectedOption = select.options[select.selectedIndex];
            const selectedCode = selectedOption.dataset.codigo;

            if (!selectedProjId) return;

            try {
                const btnSub = document.getElementById('btn-subscribe');
                btnSub.disabled = true;
                btnSub.textContent = "Asignando...";

                // 1. Asignar en la BD
                await fetch(`${API_URL}/asignar_proyecto`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idUsuario: parseInt(userId), idProyecto: parseInt(selectedProjId) })
                });
                
                // 2. Guardar el nuevo proyecto en caché
                localStorage.setItem('projectId', selectedProjId);
                if (selectedCode) localStorage.setItem('projectCode', selectedCode);
                
                // 3. Restaurar botón y AVANZAR (sin recargar)
                btnSub.disabled = false;
                btnSub.textContent = "Suscribirse";
                
                await runInitFlow(); // Carga el sprint automáticamente!
                
            } catch (error) {
                console.error("Error asignando proyecto:", error);
                document.getElementById('btn-subscribe').disabled = false;
                document.getElementById('btn-subscribe').textContent = "Suscribirse";
            }
        };
    }

    async function fetchSprintActivo(projectId) {
        try {
            const res = await fetch(`${API_URL}/sprintActivo/${projectId}`);
            if (res.ok) {
                const sprintData = await res.json();
                console.log("Sprint Activo cargado:", sprintData);
                
                // 1. Limpiamos todas las columnas por si recargamos la data
                document.querySelectorAll('.kanban-cards').forEach(col => col.innerHTML = '');

                // Opcional: Actualizar el título del Sprint en la UI
                const sprintTitle = document.getElementById('sprint-title-display');
                if (sprintTitle && sprintData.value.idSprint) {
                    sprintTitle.textContent = `Sprint ${sprintData.value.idSprint}`;
                }

                // 2. Extraer el array de tareas y renderizar una por una
                const tareas = sprintData.value.tareas || [];
                tareas.forEach(tarea => {
                    renderizarTarjeta(tarea);
                });
            }
        } catch (error) {
            console.error("Error al cargar el sprint:", error);
        }
    }

    // --- Nueva Función para crear e inyectar tarjetas ---
    function renderizarTarjeta(tarea) {
        // A. Diccionario para mapear el estado de la BD con el HTML
        const mapaEstados = {
            "To Do": ["todo", 1],
            "In Progress": ["inprogress", 2],
            "Testing": ["testing", 3],
            "Done": ["done", 4]
        };
        
        // Si el estado viene raro, lo mandamos a To Do por defecto
        const columnaStatus = mapaEstados[tarea.estado] || "todo"; 

        // B. Seleccionamos el contenedor de la columna correcta
        const contenedor = document.querySelector(`.kanban-column[data-status="${columnaStatus[0]}"] .kanban-cards`);
        if (!contenedor) return;

        // C. Definimos el color según el tipo
        const tipoClase = tarea.tipo === "Bug" ? "bug-card" : "story-card";

        // Creamos el elemento físico de la tarjeta
        const card = document.createElement('div');
        card.className = `card ${tipoClase}`;
        card.setAttribute('draggable', 'true');
        card.id = tarea.idTarea; // Usamos el idTarea como ID del elemento HTML

        // Armamos el interior (Podés sumar titulo y descripción si la API lo envío luego)
        card.innerHTML = `
            <div class="card-content">
                <h4 class="task-title">${tarea.titulo}</h4>
                <p class="task-desc" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${tarea.descripcion}</p>
            </div>
            <div class="card-footer">
                <span class="task-code">${tarea.codigo}</span>
            </div>
        `;

        // Le enseñamos a esta NUEVA tarjeta cómo arrastrarse
        card.addEventListener('dragstart', () => {
            card.classList.add('dragging');
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            const parentColumn = card.closest('.kanban-column');
            if (parentColumn) {
                const nuevoEstado = parentColumn.getAttribute('data-status');
                
                for (const [key, value] of Object.entries(mapaEstados)) {
                    if (value[0] === nuevoEstado) {
                        idEstado = value[1];
                        break;
                    }
                }
                console.log(`La tarea ${card.id} cambió a: ${nuevoEstado}`);
                fetch(`${API_URL}/actualizar_estado`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idTarea: card.id, idEstado: idEstado })
                });

            }
        });

        // G. La insertamos en la columna
        contenedor.appendChild(card);
    }

    // ==========================================
    // LÓGICA DE MODALES DE HISTORIA
    // ==========================================
    
    // --- Crear Historia ---
    document.getElementById('btn-open-create').addEventListener('click', () => {
        createModal.style.display = 'flex';
    });

    document.getElementById('close-create-modal').addEventListener('click', () => {
        createModal.style.display = 'none';
    });

    document.getElementById('btn-create-task').addEventListener('click', () => {
        const type = document.getElementById('create-type').value;
        const title = document.getElementById('create-title').value;
        const desc = document.getElementById('create-desc').value;
        const addToSprint = document.getElementById('create-in-sprint').checked;
        
        console.log("Nueva Tarea a enviar a API:", { type, title, desc });
        
        const idUser = localStorage.getItem('userId');
        const idProject = localStorage.getItem('projectId');
        const projectCode = localStorage.getItem('projectCode');

        res = fetch(`${API_URL}/crear_tarea`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                "codigoProyecto": projectCode,
                "titulo": title,
                "descripcion": desc,
                "idTipo": MAP_TYPES[type],
                "idUsuario": idUser,
                "idProyecto": idProject,
                "toSprint": addToSprint
            })
        });

        console.log("Respuesta de creación:", res);

        createModal.style.display = 'none';
        
        // Limpiar formulario
        document.getElementById('create-title').value = '';
        document.getElementById('create-desc').value = '';
    });

    // --- Visualizar Historia ---
    document.getElementById('close-view-modal').addEventListener('click', () => {
        viewModal.style.display = 'none';
    });

    // Evento delegado para abrir tarjetas haciendo clic en ellas
    document.querySelector('.kanban-board').addEventListener('click', async (e) => {
        const card = e.target.closest('.card');
        if (!card) return;

        const taskId = card.id;
        viewModal.style.display = 'flex';
        document.getElementById('view-desc').innerHTML = "Cargando datos...";

        try {
            // Llama a get_Tarea para los detalles de la tarea
            const res = await fetch(`${API_URL}/get_tarea/${taskId}`);
            const data = await res.json();

            // Volcar datos al modal
            document.getElementById('view-code').textContent = data.codigo;
            document.getElementById('view-title').textContent = data.titulo;
            document.getElementById('view-desc').textContent = data.descripcion;
            document.getElementById('view-type').textContent = data.tipo;
            document.getElementById('view-status').textContent = data.estado;
            document.getElementById('view-sprint').textContent = data.nroSprint || 'Backlog';
            document.getElementById('view-project').textContent = data.nombre_proyecto;
            document.getElementById('view-creator').textContent = data.creador;

            // --- NUEVA LÓGICA: CARGAR RESPONSABLES ---
            const ownerSelect = document.getElementById('view-owner-select');
            ownerSelect.innerHTML = '<option value="">Sin asignar</option>';
            ownerSelect.dataset.taskId = taskId; // Guardamos el ID de la tarea en el select
            
            // Si la lista de usuarios está vacía, llamamos a la API
            if (listaUsuariosGlobal.length === 0) {
                try {
                    const resUsers = await fetch(`${API_URL}/get_usuarios`);
                    if (resUsers.ok) {
                        listaUsuariosGlobal = await resUsers.json(); 
                    }
                } catch (error) {
                    console.error("Error obteniendo la lista de usuarios:", error);
                }
            }

            // Llenar el select con los usuarios
            listaUsuariosGlobal.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.idUsuario; // Asumiendo que tu BD devuelve "id"
                opt.textContent = u.Nombre; // Asumiendo que devuelve "nombre"
                
                // Si el nombre del responsable coincide, lo dejamos seleccionado por defecto
                // (Si tu API devuelve el ID del responsable, es mejor comparar por ID)
                if (u.Nombre === data.responsable) {
                    opt.selected = true;
                }
                ownerSelect.appendChild(opt);
            });

        } catch (error) {
            console.error("Error al cargar la tarea:", error);
            document.getElementById('view-desc').innerHTML = "<span class='error-text'>Error al cargar la información.</span>";
        }
    });

    // --- Guardar nuevo responsable ---
    document.getElementById('view-owner-select').addEventListener('change', async (e) => {
        const taskId = e.target.dataset.taskId;
        const newOwnerId = e.target.value; // Será vacío si eligieron "Sin asignar"

        try {
            // Deshabilitar temporalmente para evitar múltiples clics
            e.target.disabled = true;

            // Llamada POST a tu API
            await fetch(`${API_URL}/asignar_responsable`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idTarea: parseInt(taskId),
                    idResponsable: newOwnerId ? parseInt(newOwnerId) : null
                })
            });

            console.log(`[API CALL] Tarea ${taskId} asignada al usuario ${newOwnerId || 'Ninguno'}`);
            
            // Volver a habilitar
            e.target.disabled = false;
            
        } catch (error) {
            console.error("Error al asignar responsable:", error);
            alert("No se pudo asignar el responsable. Verificá la conexión.");
            e.target.disabled = false;
        }
    });
    // ==========================================
    // INTERFAZ GENERAL Y DRAG & DROP
    // ==========================================
    function setupUI() {
        const sidebar = document.getElementById('sidebar');
        const toggleSidebarBtn = document.getElementById('toggle-sidebar');

        toggleSidebarBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });

        const cards = document.querySelectorAll('.card');
        const columns = document.querySelectorAll('.kanban-cards');

        cards.forEach(card => {
            card.addEventListener('dragstart', () => { card.classList.add('dragging'); });
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                const parentColumn = card.closest('.kanban-column');
                if(parentColumn) {
                    const nuevoEstado = parentColumn.getAttribute('data-status');
                    fetch(`${API_URL}/actualizar_estado`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idTarea: card.id, idEstado: nuevoEstado })
                    });
                    console.log(`La tarea ${card.id} cambió a: ${nuevoEstado}`);
                }
            });
        });

        columns.forEach(column => {
            column.addEventListener('dragover', e => {
                e.preventDefault(); 
                column.classList.add('drag-over');
                const draggable = document.querySelector('.dragging');
                const afterElement = getDragAfterElement(column, e.clientY);
                if (afterElement == null) {
                    column.appendChild(draggable);
                } else {
                    column.insertBefore(draggable, afterElement);
                }
            });
            column.addEventListener('dragleave', () => column.classList.remove('drag-over'));
            column.addEventListener('drop', () => column.classList.remove('drag-over'));
        });

        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
    }
});