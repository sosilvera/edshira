document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DE LA BARRA LATERAL ---
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');

    // Con una sola función alternamos la clase, el CSS se encarga de la animación
    toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // --- LÓGICA DE DRAG & DROP ---
    const cards = document.querySelectorAll('.card');
    const columns = document.querySelectorAll('.kanban-cards');

    cards.forEach(card => {
        card.addEventListener('dragstart', () => {
            card.classList.add('dragging');
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            
            const parentColumn = card.closest('.kanban-column');
            if(parentColumn) {
                const nuevoEstado = parentColumn.getAttribute('data-status');
                const idTarea = card.getAttribute('id');
                console.log(`[API CALL SIMULADA] La tarea ${idTarea} ha cambiado al estado: ${nuevoEstado}`);
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

        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', () => {
            column.classList.remove('drag-over');
        });
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
});