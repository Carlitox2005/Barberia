document.addEventListener('DOMContentLoaded', () => {
    const usuarioRol = localStorage.getItem('usuario_rol');
    const token = localStorage.getItem('token');
    if (usuarioRol !== 'administrador' || !token) return;

    const headersAutenticados = {
        'Authorization': `Bearer ${token}`
    };

    window.recompensasRegistradas = [];

    window.cargarRecompensasAdmin = async () => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/recompensas`, { headers: headersAutenticados });
            const data = await res.json();
            const lista = document.getElementById('lista-admin-recompensas');
            
            if (!lista) return;
            lista.innerHTML = '';

            if (data.success && data.data.length > 0) {
                window.recompensasRegistradas = data.data;
                data.data.forEach(r => {
                    const rutaImagen = r.imagen_url ? (r.imagen_url.startsWith('/') ? r.imagen_url : `/${r.imagen_url}`) : null;
                    let avatarHtml = rutaImagen
                        ? `<img src="${CONFIG.API_URL.replace('/api', '')}${rutaImagen}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;">`
                        : `<div style="width:50px; height:50px; border-radius:50%; background-color: var(--bg-card); border: 1px solid var(--border-color);"></div>`;

                    lista.innerHTML += `
                        <div style="display: grid; grid-template-columns: 1fr 2fr 1fr 3fr 1fr; gap: 1rem; align-items: center; border-bottom: 1px solid var(--border-color); padding: 0.8rem 0;">
                            ${avatarHtml}
                            <span>${r.nombre}</span>
                            <span style="color: var(--accent-gold); font-weight: bold;">${r.puntos_requeridos} pts</span>
                            <span style="font-size: 0.9rem; color: var(--text-muted);">${r.descripcion}</span>
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="prepararEdicionRecompensa(${r.id})" class="btn-primary" style="padding: 0.5rem; font-size: 0.8rem; background-color: #f59e0b; border: none; color: black;">Editar</button>
                                <button onclick="eliminarRecompensa(${r.id})" class="btn-primary" style="padding: 0.5rem; font-size: 0.8rem; background-color: #ef4444; border: none; color: white;">Eliminar</button>
                            </div>
                        </div>
                    `;
                });
            } else {
                lista.innerHTML = '<p style="color: var(--text-muted);">No hay recompensas creadas aún.</p>';
            }
        } catch (error) {
            console.error("Error al cargar recompensas:", error);
        }
    };

    window.prepararEdicionRecompensa = (id) => {
        const recompensa = window.recompensasRegistradas.find(r => r.id === id);
        if (recompensa) {
            document.getElementById('recompensa-id').value = recompensa.id;
            document.getElementById('recompensa-nombre').value = recompensa.nombre;
            document.getElementById('recompensa-puntos').value = recompensa.puntos_requeridos;
            document.getElementById('recompensa-descripcion').value = recompensa.descripcion;
            
            const imagenInput = document.getElementById('recompensa-imagen');
            if (imagenInput) imagenInput.required = false;
            
            document.getElementById('titulo-form-recompensa').innerText = 'Editar Recompensa';
            document.getElementById('btn-guardar-recompensa').textContent = 'Actualizar Recompensa';
            document.getElementById('btn-cancelar-recompensa').style.display = 'block';
            
            window.scrollTo({ top: document.getElementById('form-recompensa').offsetTop - 100, behavior: 'smooth' });
        }
    };

    const btnCancelarRecompensa = document.getElementById('btn-cancelar-recompensa');
    if (btnCancelarRecompensa) {
        btnCancelarRecompensa.addEventListener('click', () => {
            document.getElementById('form-recompensa').reset();
            document.getElementById('recompensa-id').value = '';
            
            const imagenInput = document.getElementById('recompensa-imagen');
            if (imagenInput) imagenInput.required = true;

            document.getElementById('titulo-form-recompensa').innerText = 'Agregar Nueva Recompensa';
            document.getElementById('btn-guardar-recompensa').textContent = 'Guardar Recompensa';
            btnCancelarRecompensa.style.display = 'none';
        });
    }

    window.eliminarRecompensa = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "La recompensa ya no será visible para los clientes.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d4af37',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`${CONFIG.API_URL}/recompensas/${id}`, { 
                        method: 'DELETE',
                        headers: headersAutenticados
                    });
                    const data = await res.json();
                    if (data.success) {
                        Swal.fire({ icon: 'success', title: 'Eliminado', text: data.mensaje, confirmButtonColor: '#d4af37' });
                        window.cargarRecompensasAdmin();
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        });
    };

    const formRecompensa = document.getElementById('form-recompensa');
    if (formRecompensa) {
        formRecompensa.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const id = document.getElementById('recompensa-id').value;
            const url = id ? `${CONFIG.API_URL}/recompensas/${id}` : `${CONFIG.API_URL}/recompensas`;
            const method = id ? 'PUT' : 'POST';

            const formData = new FormData();
            formData.append('nombre', document.getElementById('recompensa-nombre').value);
            formData.append('puntos_requeridos', document.getElementById('recompensa-puntos').value);
            formData.append('descripcion', document.getElementById('recompensa-descripcion').value);

            const imagenInput = document.getElementById('recompensa-imagen');
            if (imagenInput && imagenInput.files.length > 0) {
                formData.append('imagen', imagenInput.files[0]);
            }

            try {
                const res = await fetch(url, { 
                    method: method,
                    headers: headersAutenticados,
                    body: formData 
                });
                const data = await res.json();

                if (data.success) {
                    Swal.fire({ icon: 'success', title: '¡Éxito!', text: data.mensaje, confirmButtonColor: '#d4af37' });
                    document.getElementById('btn-cancelar-recompensa').click();
                    window.cargarRecompensasAdmin();
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: data.error });
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Problema de conexión con el servidor.' });
            }
        });
    }

    window.cargarRecompensasAdmin();
});