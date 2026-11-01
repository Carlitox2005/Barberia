document.addEventListener('DOMContentLoaded', () => {
    const usuarioRol = localStorage.getItem('usuario_rol');

    if (usuarioRol !== 'administrador') {
        window.location.href = 'index.html';
        return;
    }

    document.querySelector('.user-profile span').addEventListener('click', () => {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro de que deseas salir del sistema?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d4af37',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                window.location.href = 'index.html';
            }
        });
    });

    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');

    const activarPestana = (hash) => {
        if (!hash) hash = '#dashboard';
        
        sections.forEach(sec => sec.style.display = 'none');
        navItems.forEach(nav => nav.classList.remove('active'));

        const targetSection = document.querySelector(hash);
        const targetNav = document.querySelector(`.nav-item[href="${hash}"]`);

        if (targetSection) targetSection.style.display = 'block';
        if (targetNav) targetNav.classList.add('active');
    };

    activarPestana(window.location.hash);

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href');
            history.pushState(null, null, targetId);
            activarPestana(targetId);
        });
    });

    window.addEventListener('popstate', () => activarPestana(window.location.hash));
});

// Filtro universal en tiempo real para cualquier lista, tarjeta o historial administrativo
window.habilitarFiltroUniversal = function(inputId, contenedorId, claseItem) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const items = document.querySelectorAll(`#${contenedorId} .${claseItem}`);

        items.forEach(item => {
            const texto = item.innerText.toLowerCase();
            if (texto.includes(query)) {
                item.style.display = 'grid'; 
            } else {
                item.style.display = 'none';
            }
        });
    });
};