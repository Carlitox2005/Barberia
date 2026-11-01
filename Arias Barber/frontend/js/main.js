document.addEventListener('DOMContentLoaded', async () => {
    const usuarioId = localStorage.getItem('usuario_id');
    const usuarioRol = localStorage.getItem('usuario_rol');

    if (!usuarioId || usuarioRol !== 'cliente') {
        window.location.href = 'index.html';
        return;
    }

    // Aplicar el tema guardado al cargar la página del cliente
    const temaGuardado = localStorage.getItem('tema') || 'claro';
    if (temaGuardado === 'oscuro') {
        document.documentElement.setAttribute('data-theme', 'oscuro');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    // Manejar el clic en el botón de cambio de tema
    const btnToggleTheme = document.getElementById('btn-toggle-theme');
    if (btnToggleTheme) {
        btnToggleTheme.addEventListener('click', () => {
            const temaActual = document.documentElement.getAttribute('data-theme');
            const nuevoTema = temaActual === 'oscuro' ? 'claro' : 'oscuro';

            if (nuevoTema === 'oscuro') {
                document.documentElement.setAttribute('data-theme', 'oscuro');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            localStorage.setItem('tema', nuevoTema);
        });
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
        if (!hash) hash = '#inicio';
        
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

    const contenedorMensaje = document.getElementById('mensaje-bienvenida-cliente');
    const tituloBarberia = document.getElementById('titulo-barberia-cliente');
    
    if (contenedorMensaje || tituloBarberia) {
        try {
            const res = await fetch('http://localhost:3000/api/configuracion');
            const data = await res.json();
            
            if (data && !data.error) {
                const config = data.data || data[0] || data;
                
                if (config.mensaje_bienvenida && contenedorMensaje) {
                    contenedorMensaje.innerText = config.mensaje_bienvenida;
                }
                
                if (config.nombre_barberia && tituloBarberia) {
                    tituloBarberia.innerText = config.nombre_barberia;
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
});