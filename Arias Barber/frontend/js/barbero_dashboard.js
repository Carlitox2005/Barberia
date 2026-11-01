document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const usuarioRol = localStorage.getItem('usuario_rol');
    const barberoActivoNombre = localStorage.getItem('usuario_nombre') || 'Barbero';

    if (!token || usuarioRol !== 'barbero') {
        window.location.href = 'index.html';
        return;
    }
    const headersAutenticados = { 'Authorization': `Bearer ${token}` };

    document.getElementById('nombre-barbero-top').textContent = barberoActivoNombre;

    window.confirmarCerrarSesion = () => {
    Swal.fire({
        title: '¿Cerrar Sesión?',
        text: 'Tu sesión se cerrará de forma segura.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#1e293b',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            sessionStorage.clear();
            
            window.location.replace('index.html');
        }
    });
};

    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            
            const targetSection = document.getElementById(href.substring(1));
            if (!targetSection) return;

            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.dashboard-section').forEach(sec => sec.style.display = 'none');
            targetSection.style.display = 'block';
        });
    });

    // Consulta el endpoint exclusivo del barbero filtrado desde el Backend (Corrige FE-02)
    window.cargarMisCitas = async () => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/barbero/mis-citas`, { headers: headersAutenticados });
            const misCitas = await res.json();
            
            if (!Array.isArray(misCitas)) return;

            const listaPendientes = document.getElementById('mis-citas-pendientes');
            const listaHistorial = document.getElementById('mi-historial-citas');
            if (!listaPendientes || !listaHistorial) return;

            listaPendientes.innerHTML = '';
            listaHistorial.innerHTML = '';

            misCitas.forEach(c => {
                const fecha = escapeHTML(new Date(c.fecha_hora).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' }));
                const cliente = escapeHTML(c.cliente);
                const servicio = escapeHTML(c.servicio);
                const estado = escapeHTML(c.estado);
                const idCita = Number(c.id);
                const idCliente = Number(c.id_cliente);
                const puntos = Number(c.puntos_otorgados) || 0;
                
                if (c.estado === 'activa' || c.estado === 'pendiente') {
                    listaPendientes.innerHTML += `
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 1rem; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                            <span style="font-weight: bold; color: white;">${cliente}</span>
                            <span>${servicio}</span>
                            <span style="color: var(--accent-gold); font-weight: bold;">${fecha}</span>
                            <span>
                                <button onclick="abrirCaja(${idCita}, ${idCliente}, ${puntos})" class="btn-primary" style="padding: 0.5rem; font-size: 0.8rem; background-color: #10b981; box-shadow: none;">Cobrar</button>
                            </span>
                        </div>
                    `;
                } else {
                    listaHistorial.innerHTML += `
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 1rem; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                            <span style="font-weight: bold; color: white;">${cliente}</span>
                            <span>${servicio}</span>
                            <span>${fecha}</span>
                            <span style="color: ${c.estado === 'completada' ? '#10b981' : '#ef4444'}; font-weight: bold; text-transform: capitalize;">${estado}</span>
                        </div>
                    `;
                }
            });

            if (misCitas.length === 0) {
                listaPendientes.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">No tienes citas asignadas.</p>';
            }
        } catch (error) { console.error("Error al procesar las citas:", error); }
    };

    window.cerrarModalPago = () => { document.getElementById('modal-pago').classList.remove('active'); };

    window.abrirCaja = (idCita, idCliente, puntos) => {
        document.getElementById('form-pago-cita').reset();
        document.getElementById('pago-cita-id').value = idCita;
        document.getElementById('pago-cliente-id').value = idCliente;
        document.getElementById('pago-puntos').value = puntos;
        document.getElementById('modal-pago').classList.add('active');
    };

    const formPago = document.getElementById('form-pago-cita');
    if (formPago) {
        formPago.addEventListener('submit', async (e) => {
            e.preventDefault();
            const idCita = document.getElementById('pago-cita-id').value;
            const idCliente = document.getElementById('pago-cliente-id').value;
            const puntos = document.getElementById('pago-puntos').value;
            const metodo = document.getElementById('pago-metodo').value;
            const referencia = document.getElementById('pago-referencia').value || 'N/A';
            
            try {
                const payload = { 
                    id_cliente: Number(idCliente), 
                    puntos_otorgados: Number(puntos), 
                    nuevo_estado: 'completada',
                    metodo_pago: metodo,
                    referencia_pago: referencia
                };
                
                const res = await fetch(`${CONFIG.API_URL}/citas/${encodeURIComponent(idCita)}/estado`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', ...headersAutenticados },
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json();
                if (data.success) {
                    Swal.fire({ icon: 'success', title: '¡Cobro Exitoso!', text: 'La cita ha sido completada.', showConfirmButton: false, timer: 1500 });
                    cargarMisCitas();
                    cerrarModalPago();
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: data.error });
                }
            } catch (error) { console.error(error); }
        });
    }

    window.cargarMisCitas();

    // Control de visibilidad para no saturar servidor ni batería (Corrige FE-08)
    let pollingInterval = setInterval(window.cargarMisCitas, 30000);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(pollingInterval);
        } else {
            window.cargarMisCitas();
            pollingInterval = setInterval(window.cargarMisCitas, 30000);
        }
    });
});