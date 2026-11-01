document.addEventListener('DOMContentLoaded', () => {
    const usuarioRol = localStorage.getItem('usuario_rol');
    const token = localStorage.getItem('token');
    if (usuarioRol !== 'administrador' || !token) return;

    const headersAutenticados = {
        'Authorization': `Bearer ${token}`
    };

    window.cargarDashboard = async () => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/ingresos`, { headers: headersAutenticados });
            const data = await res.json();
            const pointsElements = document.querySelectorAll('#dashboard .points');
            if (pointsElements.length > 0) {
                pointsElements[0].textContent = `$${Number(data.dia || 0).toFixed(2)}`;
                pointsElements[1].textContent = `$${Number(data.semana || 0).toFixed(2)}`;
                pointsElements[2].textContent = `$${Number(data.mes || 0).toFixed(2)}`;
            }
        } catch (error) { console.error("Error cargando dashboard"); }
    };

    window.cargarCitas = async () => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/citas`, { headers: headersAutenticados });
            const citas = await res.json();
            if (!Array.isArray(citas)) return;
            
            const listaPendientes = document.getElementById('lista-citas-pendientes');
            const listaHistorial = document.getElementById('lista-citas-historial');
            if (!listaPendientes || !listaHistorial) return;

            listaPendientes.innerHTML = '';
            listaHistorial.innerHTML = '';

            citas.forEach(c => {
                const fecha = escapeHTML(new Date(c.fecha_hora).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' }));
                const cliente = escapeHTML(c.cliente);
                const servicio = escapeHTML(c.servicio);
                const estado = escapeHTML(c.estado);
                const idCita = Number(c.id);
                const idCliente = Number(c.id_cliente);
                const puntos = Number(c.puntos_otorgados) || 0;
                
                if (c.estado === 'activa' || c.estado === 'pendiente') {
                    let boton = `<button onclick="cambiarEstadoCita(${idCita}, ${idCliente}, 'completada', ${puntos})" class="btn-primary" style="padding: 0.5rem; font-size: 0.8rem; background-color: #10b981;">Marcar Completada</button>`;
                    listaPendientes.innerHTML += `
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 1rem; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                            <span>${cliente}</span>
                            <span>${servicio}</span>
                            <span>${fecha}</span>
                            <span>${boton}</span>
                        </div>
                    `;
                } else {
                    let boton = `<button onclick="cambiarEstadoCita(${idCita}, ${idCliente}, 'activa', ${puntos})" class="btn-primary" style="padding: 0.5rem; font-size: 0.8rem; background-color: transparent; border: 1px solid var(--text-muted); color: var(--text-muted);">Revertir a Pendiente</button>`;
                    listaHistorial.innerHTML += `
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 1rem; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                            <span>${cliente}</span>
                            <span>${servicio}</span>
                            <span>${fecha}</span>
                            <div style="display:flex; flex-direction:column; gap:0.5rem;">
                                <span style="color: ${c.estado === 'completada' ? '#10b981' : '#ef4444'}; font-weight: bold; text-transform: capitalize;">${estado}</span>
                                ${boton}
                            </div>
                        </div>
                    `;
                }
            });
        } catch (error) { console.error("Error cargando citas"); }
    };

    window.cargarUsuarios = async () => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/usuarios`, { headers: headersAutenticados });
            const usuarios = await res.json();
            if (!Array.isArray(usuarios)) return;

            const lista = document.getElementById('lista-usuarios');
            if (!lista) return;
            lista.innerHTML = '';

            usuarios.forEach(u => {
                const imgPath = u.imagen_url ? escapeHTML(u.imagen_url.startsWith('/') ? u.imagen_url.slice(1) : u.imagen_url) : '';
                let avatarHtml = imgPath 
                    ? `<img src="${CONFIG.API_URL.replace('/api', '')}/${imgPath}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-gold);" onerror="this.style.display='none'">`
                    : `<div style="width: 40px; height: 40px; border-radius: 50%; background-color: var(--bg-card); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: var(--text-muted);">N/A</div>`;

                const estaInhabilitado = u.estado === 'inhabilitado';
                const estiloFila = estaInhabilitado ? 'opacity: 0.5;' : '';
                const textoBtn = estaInhabilitado ? 'Activar' : 'Inhabilitar';
                const colorBtn = estaInhabilitado ? '#10b981' : '#ef4444';
                const idUser = Number(u.id_usuario || u.id);
                const estadoActual = estaInhabilitado ? 'inhabilitado' : 'activo';

                lista.innerHTML += `
                    <div class="fila-usuario" style="display: grid; grid-template-columns: 0.8fr 1.2fr 1fr 1.5fr 1.2fr 0.8fr 1fr; gap: 1rem; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; ${estiloFila}">
                        ${avatarHtml}
                        <span>${escapeHTML(u.nombre || 'N/A')}</span>
                        <span>${escapeHTML(u.telefono || 'N/A')}</span>
                        <span style="word-break: break-all;">${escapeHTML(u.email)}</span>
                        
                        <select onchange="cambiarRolUsuario(${idUser}, this.value)" style="padding: 0.4rem; border-radius: 6px; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color); font-weight: bold; outline: none; cursor: pointer; font-size: 0.85rem;">
                            <option value="cliente" ${u.rol === 'cliente' ? 'selected' : ''}>Cliente</option>
                            <option value="barbero" ${u.rol === 'barbero' ? 'selected' : ''}>Barbero</option>
                            <option value="administrador" ${u.rol === 'administrador' ? 'selected' : ''}>Admin</option>
                        </select>
                        
                        <span style="color: var(--accent-gold); font-weight: bold; text-align: center;">${Number(u.puntos_fidelidad || 0)}</span>
                        <div>
                            <button onclick="cambiarEstadoUsuario(${idUser}, '${estadoActual}')" class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; background-color: ${colorBtn}; border: none; color: white; cursor: pointer; border-radius: 4px; width: 100%;">
                                ${textoBtn}
                            </button>
                        </div>
                    </div>
                `;
            });

            if (typeof window.habilitarFiltroUniversal === 'function') {
                window.habilitarFiltroUniversal('id-input-busqueda-usuarios', 'lista-usuarios', 'fila-usuario');
            }
        } catch (error) { console.error("Error cargando usuarios"); }
    };

    window.cambiarRolUsuario = async (idUsuario, nuevoRol) => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/usuarios/${encodeURIComponent(idUsuario)}/rol`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...headersAutenticados },
                body: JSON.stringify({ nuevo_rol: nuevoRol })
            });
            const data = await res.json();
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Rol Actualizado', text: `El usuario ahora es ${nuevoRol}.`, timer: 1500, showConfirmButton: false });
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el rol.' });
                window.cargarUsuarios(); 
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error de red.' });
            window.cargarUsuarios(); 
        }
    };

    window.cambiarEstadoUsuario = async (idUsuario, estadoActual) => {
        const nuevoEstado = estadoActual === 'inhabilitado' ? 'activo' : 'inhabilitado';
        const accionTexto = nuevoEstado === 'inhabilitado' ? 'inhabilitar' : 'activar';

        Swal.fire({
            title: `¿Estás seguro de ${accionTexto} a este usuario?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d4af37',
            cancelButtonColor: '#ef4444',
            confirmButtonText: `Sí, ${accionTexto}`,
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`${CONFIG.API_URL}/perfil/${encodeURIComponent(idUsuario)}/estado`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', ...headersAutenticados },
                        body: JSON.stringify({ estado: nuevoEstado })
                    });
                    const data = await res.json();
                    if (data.success) {
                        Swal.fire({ icon: 'success', title: '¡Actualizado!', text: `Usuario ${accionTexto}do exitosamente.`, confirmButtonColor: '#d4af37', timer: 1500, showConfirmButton: false });
                        window.cargarUsuarios();
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'No se pudo completar la acción.' });
                    }
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Error de conexión con el servidor.' });
                }
            }
        });
    };
    

    window.cerrarModalPago = () => {
        document.getElementById('modal-pago').classList.remove('active');
    };

    window.cambiarEstadoCita = async (idCita, idCliente, nuevoEstado, puntos) => {
        if (nuevoEstado === 'completada') {
            document.getElementById('form-pago-cita').reset();
            document.getElementById('pago-cita-id').value = idCita;
            document.getElementById('pago-cliente-id').value = idCliente;
            document.getElementById('pago-puntos').value = puntos;
            document.getElementById('modal-pago').classList.add('active');
            return; 
        }

        Swal.fire({
            title: '¿Revertir a Pendiente?',
            text: 'Esto restará los puntos otorgados previamente de la cuenta del cliente.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                enviarEstadoBackend(idCita, idCliente, nuevoEstado, puntos, null, null);
            }
        });
    };

    const formPago = document.getElementById('form-pago-cita');
    if (formPago) {
        formPago.addEventListener('submit', (e) => {
            e.preventDefault();
            const idCita = document.getElementById('pago-cita-id').value;
            const idCliente = document.getElementById('pago-cliente-id').value;
            const puntos = document.getElementById('pago-puntos').value;
            const metodo = document.getElementById('pago-metodo').value;
            const referencia = document.getElementById('pago-referencia').value || 'N/A';
            
            enviarEstadoBackend(idCita, idCliente, 'completada', puntos, metodo, referencia);
            cerrarModalPago();
        });
    }

    const enviarEstadoBackend = async (idCita, idCliente, nuevoEstado, puntos, metodo_pago, referencia_pago) => {
        try {
            const payload = { 
                id_cliente: Number(idCliente), 
                puntos_otorgados: Number(puntos), 
                nuevo_estado: nuevoEstado 
            };
            
            if (metodo_pago) payload.metodo_pago = metodo_pago;
            if (referencia_pago) payload.referencia_pago = referencia_pago;

            const res = await fetch(`${CONFIG.API_URL}/citas/${encodeURIComponent(idCita)}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...headersAutenticados },
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            if (data.success) {
                Swal.fire({
                    icon: 'success', 
                    title: '¡Listo!', 
                    text: data.mensaje || 'Actualizado correctamente.',
                    showConfirmButton: false, 
                    timer: 1500
                });
                window.cargarCitas();
                window.cargarDashboard();
                window.cargarUsuarios(); 
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'No se pudo actualizar el estado.' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error de conexión.' });
        }
    };

    window.cargarDashboard();
    window.cargarCitas();
    window.cargarUsuarios();

    const ejecutarRefresco = () => {
        window.cargarCitas();
        window.cargarDashboard();
    };

    let adminPolling = setInterval(ejecutarRefresco, 30000);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(adminPolling);
        } else {
            ejecutarRefresco();
            adminPolling = setInterval(ejecutarRefresco, 30000);
        }
    });
});