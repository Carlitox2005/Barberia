document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuario_id');
    const clienteId = localStorage.getItem('cliente_id');
    const token = localStorage.getItem('token');
    
    if (!usuarioId || !clienteId || !token) return;

    const headersAutenticados = {
        'Authorization': `Bearer ${token}`
    };
    
    const fechaInput = document.getElementById('fecha-reserva');
    if (fechaInput) {
        // Bloquear fechas anteriores a hoy
        const hoy = new Date().toISOString().split('T')[0];
        fechaInput.setAttribute('min', hoy);
    }

    // --- CARGA DE PUNTOS E HISTORIAL ---
    const cargarPuntos = async () => {
        try {
            // CORRECCIÓN: Ruta directa /usuario/ sin el /fidelidad/
            const res = await fetch(`${CONFIG.API_URL}/usuario/${clienteId}/puntos`, { headers: headersAutenticados });
            if (res.ok) {
                const data = await res.json();
                const pointsElement = document.querySelector('.points');
                if (pointsElement) pointsElement.innerText = data.puntos_fidelidad || 0;
            }
        } catch (error) {}
    };

    const cargarHistorial = async () => {
        try {
            // CORRECCIÓN: Ruta directa /usuario/ sin el /citas/
            const res = await fetch(`${CONFIG.API_URL}/usuario/${clienteId}/citas`, { headers: headersAutenticados });
            if (res.ok) {
                const citas = await res.json();
                const lista = document.getElementById('lista-historial');
                if (!lista) return;
                lista.innerHTML = '';
                citas.forEach(c => {
                    const fecha = new Date(c.fecha_hora).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' });
                    let colorEstado = c.estado === 'activa' ? 'var(--text-main)' : (c.estado === 'completada' ? '#10b981' : '#ef4444');
                    lista.innerHTML += `
                        <div style="display: grid; grid-template-columns: 1.5fr 1.5fr 1fr 1fr; gap: 1rem; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                            <span>${c.servicio}</span>
                            <span>${c.barbero}</span>
                            <span>${fecha}</span>
                            <span style="color: ${colorEstado}; font-weight: bold; text-transform: capitalize;">${c.estado}</span>
                        </div>
                    `;
                });
            }
        } catch (error) {}
    };

    window.canjearRecompensa = async (puntosRequeridos, nombreRecompensa) => {
        const puntosActuales = parseInt(document.querySelector('.points').innerText);
        if (puntosActuales < puntosRequeridos) {
            Swal.fire({ icon: 'error', title: 'Puntos Insuficientes', text: `Tienes ${puntosActuales} puntos y necesitas ${puntosRequeridos}.`, confirmButtonColor: '#d4af37' });
            return;
        }

        Swal.fire({
            title: '¿Confirmar canje?', text: `¿Gastar ${puntosRequeridos} puntos en: ${nombreRecompensa}?`, icon: 'question', showCancelButton: true, confirmButtonColor: '#d4af37', cancelButtonColor: '#ef4444', confirmButtonText: 'Sí, canjear'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // CORRECCIÓN: Ruta directa /usuario/ sin el /fidelidad/
                    const res = await fetch(`${CONFIG.API_URL}/usuario/${clienteId}/canjear`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json', ...headersAutenticados }, body: JSON.stringify({ puntos_a_canjear: puntosRequeridos })
                    });
                    const data = await res.json();
                    if(data.success) {
                        Swal.fire({ icon: 'success', title: '¡Canje Exitoso!', text: `Has obtenido: ${nombreRecompensa}.`, confirmButtonColor: '#d4af37' });
                        cargarPuntos();
                    } else { Swal.fire({ icon: 'error', title: 'Error', text: data.error }); }
                } catch (error) {}
            }
        });
    };

    // --- NUEVO SISTEMA DE SLOTS INTERACTIVOS ---
    const selectServicio = document.getElementById('reserva-servicio') || document.querySelectorAll('#form-reserva select')[0];
    const selectBarbero = document.getElementById('reserva-barbero') || document.querySelectorAll('#form-reserva select')[1];
    const contenedorSlots = document.getElementById('contenedor-slots');
    const inputHoraOculta = document.getElementById('hora-reserva');

    const cargarSlotsDisponibles = async () => {
        if (!selectServicio || !selectBarbero || !fechaInput || !contenedorSlots) return;

        const idServicio = selectServicio.value;
        const idBarbero = selectBarbero.value;
        const fecha = fechaInput.value;

        if (!idServicio || !idBarbero || !fecha) {
            contenedorSlots.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem; padding: 1rem 0;">👈 Selecciona un servicio, barbero y fecha para ver los turnos libres.</p>';
            inputHoraOculta.value = '';
            return;
        }

        contenedorSlots.innerHTML = '<p style="color: var(--accent-gold); font-size: 0.9rem; font-weight: bold; padding: 1rem 0;">Buscando disponibilidad...</p>';
        inputHoraOculta.value = '';

        try {
            // CORRECCIÓN: Ruta directa /disponibilidad sin el /citas/
            const res = await fetch(`${CONFIG.API_URL}/disponibilidad?id_barbero=${idBarbero}&fecha=${fecha}&id_servicio=${idServicio}`, { headers: headersAutenticados });
            const data = await res.json();

            contenedorSlots.innerHTML = '';

            if (data.success && data.disponibles.length > 0) {
                data.disponibles.forEach(hora => {
                    // Convertir de formato militar (14:30) a formato 12h (02:30 PM)
                    const [h, m] = hora.split(':');
                    let ampm = 'AM';
                    let h12 = parseInt(h);
                    if (h12 >= 12) { ampm = 'PM'; if (h12 > 12) h12 -= 12; }
                    if (h12 === 0) h12 = 12;
                    const horaVisual = `${h12}:${m} ${ampm}`;

                    // Crear el botón
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.innerText = horaVisual;
                    btn.className = 'slot-btn';
                    btn.style.cssText = 'padding: 0.6rem 1.2rem; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-main); border-radius: 8px; cursor: pointer; transition: all 0.2s ease; font-weight: 600; box-shadow: 0 2px 5px rgba(0,0,0,0.1);';
                    
                    btn.addEventListener('mouseover', () => { if(inputHoraOculta.value !== hora) btn.style.border = '1px solid var(--accent-gold)'; });
                    btn.addEventListener('mouseout', () => { if(inputHoraOculta.value !== hora) btn.style.border = '1px solid var(--border-color)'; });

                    btn.addEventListener('click', () => {
                        document.querySelectorAll('.slot-btn').forEach(b => {
                            b.style.background = 'var(--bg-card)';
                            b.style.color = 'var(--text-main)';
                            b.style.border = '1px solid var(--border-color)';
                        });
                        btn.style.background = 'var(--accent-gold)';
                        btn.style.color = '#000';
                        btn.style.border = '1px solid var(--accent-gold)';
                        inputHoraOculta.value = hora; 
                    });

                    contenedorSlots.appendChild(btn);
                });
            } else {
                contenedorSlots.innerHTML = `<p style="color: #ef4444; font-size: 0.9rem; padding: 1rem 0; font-weight: bold;">❌ ${data.mensaje || 'No hay turnos disponibles. Intenta otra fecha o barbero.'}</p>`;
            }
        } catch (error) {
            contenedorSlots.innerHTML = '<p style="color: #ef4444; font-size: 0.9rem;">Error al cargar disponibilidad.</p>';
        }
    };

    // Escuchar cambios para volver a calcular slots
    if (selectServicio) selectServicio.addEventListener('change', cargarSlotsDisponibles);
    if (selectBarbero) selectBarbero.addEventListener('change', cargarSlotsDisponibles);
    if (fechaInput) fechaInput.addEventListener('change', cargarSlotsDisponibles);

    const formReserva = document.getElementById('form-reserva');
    if (formReserva) {
        formReserva.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const idServicio = selectServicio.value;
            const idBarbero = selectBarbero.value;
            const fechaStr = fechaInput.value;
            const horaSeleccionada = inputHoraOculta.value;

            if (!horaSeleccionada) {
                Swal.fire({ icon: 'warning', title: 'Turno pendiente', text: 'Haz clic en uno de los bloques de hora disponibles para confirmar.', confirmButtonColor: '#d4af37' });
                return;
            }

            const cita = { id_cliente: clienteId, id_servicio: idServicio, id_barbero: idBarbero, fecha: fechaStr, hora: horaSeleccionada };

            try {
                const response = await fetch(`${CONFIG.API_URL}/citas`, {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json', ...headersAutenticados }, 
                    body: JSON.stringify(cita)
                });
                const data = await response.json();

                if (data.success) {
                    Swal.fire({ icon: 'success', title: '¡Cita Agendada!', text: 'Tu reserva se ha registrado con éxito.', confirmButtonColor: '#d4af37' });
                    e.target.reset();
                    contenedorSlots.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem; padding: 1rem 0;">👈 Selecciona un servicio, barbero y fecha para ver los turnos libres.</p>';
                    inputHoraOculta.value = '';
                    cargarHistorial();
                } else { 
                    Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'Error al agendar la cita.' }); 
                }
            } catch (error) { 
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error de conexión al guardar la cita.' }); 
            }
        });
    }

    cargarPuntos();
    cargarHistorial();

    setInterval(() => {
        cargarHistorial();
        cargarPuntos();
    }, 15000); 
});