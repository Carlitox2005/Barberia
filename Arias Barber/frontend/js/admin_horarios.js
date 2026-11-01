document.addEventListener('DOMContentLoaded', () => {
    const usuarioRol = localStorage.getItem('usuario_rol');
    const token = localStorage.getItem('token');
    if (usuarioRol !== 'administrador' || !token) return;

    const headersAutenticados = {
        'Authorization': `Bearer ${token}`
    };

    const selectBarberoHorario = document.getElementById('horario-select-barbero');
    if (selectBarberoHorario) {
        selectBarberoHorario.addEventListener('change', (e) => {
            window.cargarHorariosBarbero(e.target.value);
        });
    }

    window.cargarSelectBarberosHorarios = async () => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/barberos`, { headers: headersAutenticados });
            const barberos = await res.json();
            if (selectBarberoHorario) {
                selectBarberoHorario.innerHTML = '<option value="" disabled selected>Seleccione un barbero...</option>';
                barberos.forEach(b => {
                    selectBarberoHorario.innerHTML += `<option value="${b.id}">${b.nombre}</option>`;
                });
            }
        } catch (error) {
            console.error("Error cargando barberos para horarios", error);
        }
    };

    window.cargarHorariosBarbero = async (idBarbero) => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/horarios/barbero/${idBarbero}`, { headers: headersAutenticados });
            const data = await res.json();
            const lista = document.getElementById('lista-horarios-barbero');
            if (!lista) return;
            lista.innerHTML = '';

            if (data.success && data.data.length > 0) {
                data.data.forEach(h => {
                    lista.innerHTML += `
                        <div style="display: grid; grid-template-columns: 2fr 2fr 2fr 1fr; gap: 1rem; align-items: center; border-bottom: 1px solid var(--border-color); padding: 0.8rem 0;">
                            <span><strong>${h.dia_semana}</strong></span>
                            <span>${h.hora_apertura}</span>
                            <span>${h.hora_cierre}</span>
                            <div>
                                <button onclick="eliminarHorario(${h.id}, ${idBarbero})" class="btn-primary" style="padding: 0.3rem 0.8rem; font-size: 0.8rem; background-color: #ef4444; border: none; color: white;">Eliminar</button>
                            </div>
                        </div>
                    `;
                });
            } else {
                lista.innerHTML = '<p style="color: var(--text-muted);">Este barbero no tiene turnos configurados.</p>';
            }
        } catch (error) {
            console.error("Error cargando horarios", error);
        }
    };

    const formHorario = document.getElementById('form-nuevo-horario');
    if (formHorario) {
        formHorario.addEventListener('submit', async (e) => {
            e.preventDefault();
            const idBarbero = selectBarberoHorario ? selectBarberoHorario.value : null;
            if (!idBarbero) {
                Swal.fire({ icon: 'warning', title: 'Atención', text: 'Por favor seleccione un barbero primero.', confirmButtonColor: '#d4af37' });
                return;
            }

            const dia_semana = document.getElementById('horario-dia').value;
            const hora_apertura = document.getElementById('horario-apertura').value;
            const hora_cierre = document.getElementById('horario-cierre').value;

            try {
                const res = await fetch(`${CONFIG.API_URL}/horarios`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        ...headersAutenticados
                    },
                    body: JSON.stringify({ id_barbero: idBarbero, dia_semana, hora_apertura, hora_cierre, esta_activo: 1 })
                });
                const data = await res.json();

                if (data.success) {
                    Swal.fire({ icon: 'success', title: '¡Éxito!', text: data.mensaje, confirmButtonColor: '#d4af37' });
                    formHorario.reset();
                    window.cargarHorariosBarbero(idBarbero);
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: data.error });
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Problema de conexión con el servidor.' });
            }
        });
    }

    window.eliminarHorario = async (idHorario, idBarbero) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará este turno del horario del barbero.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d4af37',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`${CONFIG.API_URL}/horarios/${idHorario}`, { 
                        method: 'DELETE',
                        headers: headersAutenticados
                    });
                    const data = await res.json();
                    if (data.success) {
                        Swal.fire({ icon: 'success', title: 'Eliminado', text: data.mensaje, confirmButtonColor: '#d4af37' });
                        window.cargarHorariosBarbero(idBarbero);
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        });
    };

    window.cargarSelectBarberosHorarios();
});