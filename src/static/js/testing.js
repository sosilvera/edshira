document.addEventListener('DOMContentLoaded', () => {

    // --- Configuración básica de Sidebar y Navbar ---
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

    // --- Lógica de Pestañas (Tabs) ---
    const tabs = document.querySelectorAll('.testing-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // 1. Quitar activo de todos los tabs
            tabs.forEach(t => t.classList.remove('active'));
            // 2. Activar el clickeado
            e.target.classList.add('active');
            
            // 3. Ocultar todas las vistas
            document.querySelectorAll('.testing-layout').forEach(view => {
                view.style.display = 'none';
            });
            
            // 4. Mostrar la vista correspondiente
            const targetId = e.target.getAttribute('data-target');
            document.getElementById(targetId).style.display = 'flex';
        });
    });

    // --- Lógica Visual de Filas de Casos ---
    // Agrega la clase 'active' a la fila seleccionada y simula cambiar el detalle
    const caseRows = document.querySelectorAll('.case-row');
    
    caseRows.forEach(row => {
        row.addEventListener('click', (e) => {
            // Quitar clase active a los hermanos dentro del mismo contenedor
            const parentList = row.closest('.cases-list');
            parentList.querySelectorAll('.case-row').forEach(r => r.classList.remove('active'));
            
            // Activar la fila actual
            row.classList.add('active');
        });
    });

    // --- Lógica del Árbol de carpetas (Tree View) ---
    const treeNodes = document.querySelectorAll('.tree-node');
    
    treeNodes.forEach(node => {
        // Al hacer clic en el texto o la flechita, expandir/colapsar
        node.addEventListener('click', (e) => {
            // Evitar que el clic en un hijo colapse al padre
            if (e.target.classList.contains('tree-leaf')) return;
            
            node.classList.toggle('expanded');
            
            // Cambiar la flechita visualmente
            const toggleIcon = node.querySelector('.tree-toggle');
            if(toggleIcon) {
                toggleIcon.textContent = node.classList.contains('expanded') ? '▼' : '▶';
            }
        });
    });

    // Selección de carpetas (tree-leaf)
    const treeLeaves = document.querySelectorAll('.tree-leaf');
    treeLeaves.forEach(leaf => {
        leaf.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que el click burbujee y cierre la carpeta
            
            // Quitar selección a todas las carpetas
            document.querySelectorAll('.tree-leaf').forEach(l => l.classList.remove('active'));
            
            // Activar la clickeada
            leaf.classList.add('active');
            
            // A FUTURO: Acá llamarías a la API fetchTestCasesByFolder(leaf.id)
            console.log(`Carpeta seleccionada: ${leaf.textContent}`);
        });
    });

});

// Función simulada para cuando se hace click en un caso del Test Plan
// A futuro esto hará un fetch() a tu API para traer la data real.
window.mostrarDetalleCaso = function(idCaso) {
    console.log(`Consultando detalles del caso ${idCaso}...`);
    // Acá buscarías en tu JSON el objeto correspondiente e inyectarías la info:
    // document.getElementById('detail-title').textContent = data.titulo;
}