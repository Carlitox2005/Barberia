document.addEventListener('DOMContentLoaded', () => {
    const usuarioRol = localStorage.getItem('usuario_rol');
    const token = localStorage.getItem('token');
    if (usuarioRol !== 'administrador' || !token) return;

    const headersAutenticados = {
        'Authorization': `Bearer ${token}`
    };

    const formConfig = document.getElementById('form-configuracion');
    const btnToggleTheme = document.getElementById('btn-toggle-theme');

    window.cargarConfiguracion = async () => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/configuracion`, { headers: headersAutenticados });
            const data = await res.json();
            
            if (data && !data.error) {
                const config = data.data || data[0] || data;
                
                if(document.getElementById('conf-nombre')) document.getElementById('conf-nombre').value = config.nombre_barberia || '';
                if(document.getElementById('conf-mensaje')) document.getElementById('conf-mensaje').value = config.mensaje_bienvenida || '';
                if(document.getElementById('conf-tolerancia')) document.getElementById('conf-tolerancia').value = config.tiempo_tolerancia_cita || 15;
                if(document.getElementById('conf-tema')) document.getElementById('conf-tema').value = config.tema || 'claro';
                
                const brandName = document.querySelector('.brand span');
                if(brandName && config.nombre_barberia) brandName.innerText = config.nombre_barberia;

                const temaActual = config.tema || 'claro';
                if (temaActual === 'oscuro') {
                    document.documentElement.setAttribute('data-theme', 'oscuro');
                } else {
                    document.documentElement.removeAttribute('data-theme');
                }
                localStorage.setItem('tema', temaActual);

                const brandContainer = document.querySelector('.brand');
                if (config.logo_url && brandContainer) {
                    let logoContainer = document.querySelector('.brand-logo-container');
                    if (!logoContainer) {
                        logoContainer = document.createElement('div');
                        logoContainer.className = 'brand-logo-container';
                        const logoImg = document.createElement('img');
                        logoContainer.appendChild(logoImg);
                        brandContainer.insertBefore(logoContainer, brandContainer.firstChild);
                    }
                    const logoRuta = config.logo_url.startsWith('/') ? config.logo_url : `/${config.logo_url}`;
                    logoContainer.querySelector('img').src = `${CONFIG.API_URL.replace('/api', '')}${logoRuta}`;
                }
            }
        } catch (error) {}
    };

    if (btnToggleTheme) {
        btnToggleTheme.addEventListener('click', async () => {
            const temaActual = document.documentElement.getAttribute('data-theme');
            const nuevoTema = temaActual === 'oscuro' ? 'claro' : 'oscuro';

            if (nuevoTema === 'oscuro') {
                document.documentElement.setAttribute('data-theme', 'oscuro');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            localStorage.setItem('tema', nuevoTema);

            if(document.getElementById('conf-tema')) {
                document.getElementById('conf-tema').value = nuevoTema;
            }

            const nombre_barberia = document.getElementById('conf-nombre')?.value || '';
            const mensaje_bienvenida = document.getElementById('conf-mensaje')?.value || '';
            const tiempo_tolerancia_cita = document.getElementById('conf-tolerancia')?.value || 15;

            const formData = new FormData();
            formData.append('nombre_barberia', nombre_barberia);
            formData.append('mensaje_bienvenida', mensaje_bienvenida);
            formData.append('tiempo_tolerancia_cita', tiempo_tolerancia_cita);
            formData.append('tema', nuevoTema);

            try {
                await fetch(`${CONFIG.API_URL}/configuracion`, {
                    method: 'PUT',
                    headers: headersAutenticados,
                    body: formData
                });
            } catch (error) {}
        });
    }

    if (formConfig) {
        formConfig.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const formData = new FormData();
            formData.append('nombre_barberia', document.getElementById('conf-nombre').value);
            formData.append('mensaje_bienvenida', document.getElementById('conf-mensaje').value);
            formData.append('tiempo_tolerancia_cita', document.getElementById('conf-tolerancia').value);
            formData.append('tema', document.getElementById('conf-tema').value);
            
            const logoFile = document.getElementById('conf-logo').files[0];
            if (logoFile) {
                formData.append('imagen', logoFile);
            }

            try {
                const res = await fetch(`${CONFIG.API_URL}/configuracion`, {
                    method: 'PUT',
                    headers: headersAutenticados,
                    body: formData
                });
                
                const data = await res.json();
                
                if (data.success) {
                    Swal.fire({ 
                        icon: 'success', 
                        title: '¡Guardado!', 
                        text: 'Configuración global actualizada correctamente', 
                        confirmButtonColor: '#c5a059' 
                    });
                    
                    window.cargarConfiguracion();
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'No se pudo guardar.' });
                }
            } catch (error) {}
        });
    }

    window.cargarConfiguracion();
});