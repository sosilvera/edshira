const API_URL = 'http://localhost:30095/edshira/api/projects'; // Ajustar según entorno

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
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName');
        let projectId = localStorage.getItem('projectId');

        // 1. Revisar si hay usuario logueado
        if (!userId) {
            initModal.style.display = 'flex';
            loginSection.style.display = 'block';
            projectSection.style.display = 'none';
            return; // Espera a que el usuario complete el login
        }

        // Mostrar usuario en nav
        navUsername.textContent = userName;
        navAvatar.textContent = userName.charAt(0).toUpperCase();

        // 2. Validar si tiene proyecto asignado
        if (!projectId) {
            try {
                const res = await fetch(`${API_URL}/proyectosUsuario/${userId}`);
                const proyectosArray = await res.json();

                if (proyectosArray && proyectosArray.length > 0) {
                    // Elegir el primero y guardar en caché
                    projectId = proyectosArray[0];
                    localStorage.setItem('projectId', projectId);
                } else {
                    // Mostrar listado de proyectos a suscribir
                    await loadProjectsForSubscription(userId);
                    return; // Espera a que el usuario se suscriba
                }
            } catch (error) {
                console.error("Error al validar proyectos del usuario:", error);
                return;
            }
        }

        // 3. Llamar API Sprint Activo
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
            document.getElementById('btn-login').disabled = true;
            let currentUserId;

            // Llamar a /get_usuario
            const getRes = await fetch(`${API_URL}/get_user_id/${username}`);
            if (getRes.ok) {
                const userData = await getRes.json();
                currentUserId = userData.id;
            } else {
                // Crear usuario si no existe
                const createRes = await fetch(`${API_URL}/crear_usuario`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre: username })
                });
                const newUserData = await createRes.json();
                currentUserId = newUserData.id;
            }

            // Guardar en cache
            localStorage.setItem('userId', currentUserId);
            localStorage.setItem('userName', username);

            // Llamar a /proyectosUsuario
            const projRes = await fetch(`${API_URL}/proyectosUsuario/${currentUserId}`);
            const projArray = await projRes.json();

            if (projArray && projArray.length > 0) {
                localStorage.setItem('projectId', projArray[0]);
            }
            
            // Recargar página
            window.location.reload();

        } catch (error) {
            console.error("Error en login:", error);
            document.getElementById('btn-login').disabled = false;
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
                opt.value = p.id;
                opt.textContent = p.nombre;
                select.appendChild(opt);
            });
        } catch (error) {
            console.error("Error obteniendo proyectos globales:", error);
            select.innerHTML = '<option value="">Error al cargar</option>';
        }

        document.getElementById('btn-subscribe').onclick = async () => {
            const selectedProjId = select.value;
            if (!selectedProjId) return;

            try {
                document.getElementById('btn-subscribe').disabled = true;
                await fetch(`${API_URL}/asignar_proyecto`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idUsuario: parseInt(userId), idProyecto: parseInt(selectedProjId) })
                });
                
                localStorage.setItem('projectId', selectedProjId);
                window.location.reload();
            } catch (error) {
                console.error("Error asignando proyecto:", error);
                document.getElementById('btn-subscribe').disabled = false;
            }
        };
    }

    async function fetchSprintActivo(projectId) {
        try {
            const res = await fetch(`${API_URL}/sprintActivo/${projectId}`);
            if (res.ok) {
                const sprintData = await res.json();
                console.log("Sprint Activo cargado:", sprintData);
                // Aquí renderizarías las tarjetas dinámicamente en un futuro
            }
        } catch (error) {
            console.error("Error al cargar el sprint:", error);
        }
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
        
        console.log("Nueva Tarea a enviar a API:", { type, title, desc });
        // Simulación: fetch POST a /crear_tarea
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
            // Llamada a la API que pediste (Simulada para que no falle si no tenes el backend aún)
            // const res = await fetch(`${API_URL}/tarea/${taskId}`);
            // const data = await res.json();
            
            // Reemplazo temporal simulando el JSON que pasaste:
            const data = {
                "idTarea": taskId,
                "codigo": "BBM-5",
                "tipo": "Bug",
                "estado": "To Do",
                "titulo": "Crear bibite da error 2",
                "descripcion": "Al cargar el archivo y ejecutar procesar, da error",
                "nroSprint": null,
                "nombre_proyecto": "Bibites_Maker",
                "creador": "Sebastian Silvera",
                "responsable": "Ivan Tomir"
            };

            // Volcar datos al modal
            document.getElementById('view-code').textContent = data.codigo;
            document.getElementById('view-title').textContent = data.titulo;
            document.getElementById('view-desc').textContent = data.descripcion;
            document.getElementById('view-type').textContent = data.tipo;
            document.getElementById('view-status').textContent = data.estado;
            document.getElementById('view-sprint').textContent = data.nroSprint || 'Backlog';
            document.getElementById('view-project').textContent = data.nombre_proyecto;
            document.getElementById('view-creator').textContent = data.creador;
            document.getElementById('view-owner').textContent = data.responsable;

        } catch (error) {
            console.error("Error al cargar la tarea:", error);
            document.getElementById('view-desc').innerHTML = "<span class='error-text'>Error al cargar la información.</span>";
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