document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const usuarioRol = localStorage.getItem('usuario_rol');
    if (!token || usuarioRol !== 'administrador') return;

    const headersAutenticados = { 'Authorization': `Bearer ${token}` };
    
    // NOVEDAD: Creamos una memoria caché para guardar los barberos
    let barberosCache = [];

    window.cargarBarberos = async () => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/barberos`, { headers: headersAutenticados });
            const barberos = await res.json();
            
            // Guardamos los datos en la memoria local
            barberosCache = barberos; 
            
            const lista = document.getElementById('lista-barberos');
            if(!lista) return;
            lista.innerHTML = '';

            barberos.forEach(b => {
                let avatarHtml = b.imagen_url 
                    ? `<img src="${CONFIG.API_URL.replace('/api', '')}/${b.imagen_url.startsWith('/') ? b.imagen_url.slice(1) : b.imagen_url}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-gold);" onerror="this.style.display='none'">`
                    : `<div style="width: 40px; height: 40px; border-radius: 50%; background-color: var(--bg-card); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: var(--text-muted);">N/A</div>`;

                const datosPendientes = b.cedula === 'Pendiente' || b.direccion === 'Pendiente';
                const alertaColor = datosPendientes ? '#ef4444' : 'var(--text-muted)';
                const alertaTexto = datosPendientes ? '<span style="color: #ef4444; font-size: 0.7rem; font-weight:bold; display:block;">Datos Faltantes</span>' : '';

                lista.innerHTML += `
                    <div class="fila-barbero" style="display: grid; grid-template-columns: 0.8fr 1.5fr 1.2fr 1.2fr 2fr 1fr; gap: 1rem; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; transition: all 0.3s ease;">
                        ${avatarHtml}
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-weight: bold; color: var(--text-main);">${b.nombre}</span>
                            ${alertaTexto}
                        </div>
                        <span style="color: ${b.cedula === 'Pendiente' ? '#ef4444' : 'inherit'}; font-weight: ${b.cedula === 'Pendiente' ? 'bold' : 'normal'};">${b.cedula || 'Pendiente'}</span>
                        <span>${b.telefono || 'N/A'}</span>
                        <span style="font-size: 0.85rem; color: ${b.direccion === 'Pendiente' ? '#ef4444' : 'inherit'};">${b.direccion || 'Pendiente'}</span>
                        <div>
                            <button onclick="editarBarbero(${b.id})" class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; background-color: ${datosPendientes ? '#f59e0b' : '#3b82f6'}; border: none; width: 100%;">
                                ${datosPendientes ? 'Completar' : 'Editar'}
                            </button>
                        </div>
                    </div>
                `;
            });
            
            if(barberos.length === 0) {
                lista.innerHTML = '<p style="color: var(--text-muted);">No hay barberos registrados. Asigna el rol "Barbero" a un usuario para comenzar.</p>';
            }
            
        } catch(e) { console.error("Error cargando barberos"); }
    };

    window.editarBarbero = (id) => {
        // En lugar de hacer 'fetch', buscamos al barbero en nuestra memoria
        const b = barberosCache.find(barb => barb.id === id);
        if(!b) return;
        
        document.getElementById('barbero-id').value = b.id;
        document.getElementById('barb-nombre').value = b.nombre;
        
        if(b.telefono && b.telefono.length > 4) {
            document.getElementById('barb-telefono-cod').value = b.telefono.substring(0, 5);
            document.getElementById('barb-telefono-num').value = b.telefono.substring(5);
        } else {
            document.getElementById('barb-telefono-cod').value = '0412-';
            document.getElementById('barb-telefono-num').value = '';
        }
        
        if(b.cedula && b.cedula !== 'Pendiente') {
            document.getElementById('barb-cedula-tipo').value = b.cedula.substring(0, 2);
            document.getElementById('barb-cedula-num').value = b.cedula.substring(2);
        } else {
            document.getElementById('barb-cedula-tipo').value = 'V-';
            document.getElementById('barb-cedula-num').value = '';
        }

        document.getElementById('barb-direccion').value = b.direccion === 'Pendiente' ? '' : b.direccion;
        
        document.getElementById('contenedor-form-barbero').style.display = 'block';
        document.getElementById('contenedor-form-barbero').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.ocultarFormBarbero = () => {
        document.getElementById('contenedor-form-barbero').style.display = 'none';
        document.getElementById('form-nuevo-barbero').reset();
    };

    const form = document.getElementById('form-nuevo-barbero');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('barbero-id').value;
            const formData = new FormData();
            formData.append('nombre', document.getElementById('barb-nombre').value);
            formData.append('telefono', document.getElementById('barb-telefono-cod').value + document.getElementById('barb-telefono-num').value);
            formData.append('cedula', document.getElementById('barb-cedula-tipo').value + document.getElementById('barb-cedula-num').value);
            formData.append('direccion', document.getElementById('barb-direccion').value);
            
            const imagen = document.getElementById('barb-imagen').files[0];
            if (imagen) formData.append('imagen', imagen);

            try {
                const res = await fetch(`${CONFIG.API_URL}/barberos/${id}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    Swal.fire({ icon:'success', title:'Actualizado', text:'Los datos del barbero han sido guardados.', timer: 1500, showConfirmButton: false });
                    window.ocultarFormBarbero();
                    window.cargarBarberos();
                } else {
                    Swal.fire({ icon:'error', title:'Error', text:data.error });
                }
            } catch(error) { console.error(error); }
        });
    }

    // Cargar la lista al iniciar
    window.cargarBarberos();
});