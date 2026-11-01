document.addEventListener('DOMContentLoaded', () => {
    const usuarioRol = localStorage.getItem('usuario_rol');
    const token = localStorage.getItem('token');
    if (usuarioRol !== 'administrador' || !token) return;

    const headersAutenticados = {
        'Authorization': `Bearer ${token}`
    };

    window.serviciosRegistrados = [];

    window.cargarServicios = async () => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/servicios`, { headers: headersAutenticados });
            window.serviciosRegistrados = await res.json();
            const lista = document.getElementById('lista-servicios');
            const gridVisual = document.getElementById('grid-vista-catalogo');
            
            if(!lista || !gridVisual) return;

            lista.innerHTML = '';
            gridVisual.innerHTML = '';

            window.serviciosRegistrados.forEach(s => {
                lista.innerHTML += `
                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 2fr; gap: 1rem; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                        <span>${s.nombre}</span>
                        <span>$${s.precio}</span>
                        <span>${s.duracion_minutos} min</span>
                        <span style="color: var(--accent-gold); font-weight: bold;">${s.puntos_otorgados} pts</span>
                        <div style="display: flex; gap: 0.5rem;">
                            <button onclick="prepararEdicionServicio(${s.id})" class="btn-primary" style="padding: 0.5rem; font-size: 0.8rem; background-color: #f59e0b; border: none; color: black;">Editar</button>
                            <button onclick="eliminarServicio(${s.id})" class="btn-primary" style="padding: 0.5rem; font-size: 0.8rem; background-color: #ef4444; border: none; color: white;">Eliminar</button>
                        </div>
                    </div>
                `;

                gridVisual.innerHTML += `
                    <div class="card">
                        <img src="${s.imagen_url ? CONFIG.API_URL.replace('/api', '') + s.imagen_url : ''}" style="width:100%; border-radius:8px; margin-bottom:1rem; height:200px; object-fit:cover;" onerror="this.style.display='none'">
                        <h3>${s.nombre}</h3>
                        <span class="badge">$${s.precio}</span>
                        <p style="color:var(--text-muted); font-size:0.8rem; margin-top:0.5rem;">+${s.puntos_otorgados} Puntos</p>
                    </div>
                `;
            });
        } catch (error) { console.error("Error cargando servicios"); }
    };

    window.prepararEdicionServicio = (id) => {
        const servicio = window.serviciosRegistrados.find(s => s.id === id);
        if(servicio) {
            document.getElementById('servicio-id').value = servicio.id;
            document.getElementById('serv-nombre').value = servicio.nombre;
            document.getElementById('serv-precio').value = servicio.precio;
            document.getElementById('serv-duracion').value = servicio.duracion_minutos;
            document.getElementById('serv-puntos').value = servicio.puntos_otorgados;
            document.getElementById('serv-imagen').required = false; 

            document.getElementById('titulo-form-servicio').innerText = 'Editar Servicio';
            document.getElementById('btn-submit-servicio').innerText = 'Actualizar Servicio';
            document.getElementById('btn-cancelar-servicio').style.display = 'block';

            window.scrollTo({ top: document.getElementById('form-nuevo-servicio').offsetTop - 100, behavior: 'smooth' });
        }
    };

    const btnCancelarServicio = document.getElementById('btn-cancelar-servicio');
    if(btnCancelarServicio) {
        btnCancelarServicio.addEventListener('click', () => {
            document.getElementById('form-nuevo-servicio').reset();
            document.getElementById('servicio-id').value = '';
            document.getElementById('serv-imagen').required = true;
            document.getElementById('titulo-form-servicio').innerText = 'Agregar Nuevo Servicio';
            document.getElementById('btn-submit-servicio').innerText = 'Guardar en Catálogo';
            document.getElementById('btn-cancelar-servicio').style.display = 'none';
        });
    }

    window.eliminarServicio = async (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará el servicio del catálogo.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d4af37',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`${CONFIG.API_URL}/servicios/${id}`, { 
                        method: 'DELETE',
                        headers: headersAutenticados
                    });
                    const data = await res.json();
                    if(data.success) {
                        Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Servicio removido con éxito.', confirmButtonColor: '#d4af37' });
                        window.cargarServicios();
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error', text: data.error });
                    }
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Error de conexión.' });
                }
            }
        });
    };

    const formServicio = document.getElementById('form-nuevo-servicio');
    if(formServicio) {
        formServicio.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('servicio-id').value;
            const method = id ? 'PUT' : 'POST';
            const url = id ? `${CONFIG.API_URL}/servicios/${id}` : `${CONFIG.API_URL}/servicios`;

            const formData = new FormData();
            formData.append('nombre', document.getElementById('serv-nombre').value);
            formData.append('precio', document.getElementById('serv-precio').value);
            formData.append('duracion_minutos', document.getElementById('serv-duracion').value);
            formData.append('puntos_otorgados', document.getElementById('serv-puntos').value);
            
            const imagenInput = document.getElementById('serv-imagen');
            if (imagenInput.files.length > 0) {
                formData.append('imagen', imagenInput.files[0]);
            }

            try {
                const res = await fetch(url, { 
                    method: method, 
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData 
                });
                if ((await res.json()).success) {
                    Swal.fire({ icon: 'success', title: '¡Éxito!', text: id ? 'Servicio actualizado con éxito.' : 'Servicio agregado al catálogo.', confirmButtonColor: '#d4af37' });
                    document.getElementById('btn-cancelar-servicio').click();
                    window.cargarServicios();
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Error al procesar el servicio.' });
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error de conexión al guardar el servicio.' });
            }
        });
    }

    window.cargarServicios();
});