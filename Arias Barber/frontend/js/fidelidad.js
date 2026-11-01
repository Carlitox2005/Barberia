document.addEventListener('DOMContentLoaded', () => {
    const clienteId = localStorage.getItem('cliente_id');
    const usuarioId = localStorage.getItem('usuario_id');
    const token = localStorage.getItem('token');
    
    if (!clienteId || !usuarioId || !token) return;

    const headersAutenticados = {
        'Authorization': `Bearer ${token}`
    };

    const cargarRecompensas = async () => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/recompensas`, { headers: headersAutenticados });
            const data = await res.json();
            const contenedor = document.getElementById('contenedor-recompensas');
            
            if (!contenedor || !data.success) return;
            contenedor.innerHTML = '';

            data.data.forEach(premio => {
                const rutaImagen = premio.imagen_url ? (premio.imagen_url.startsWith('/') ? premio.imagen_url : `/${premio.imagen_url}`) : null;
                const srcImg = rutaImagen ? `${CONFIG.API_URL.replace('/api', '')}${rutaImagen}` : '';

                contenedor.innerHTML += `
                    <div class="card" style="padding: 1.5rem; text-align: center; border: 1px solid var(--border-color); border-radius: 8px;">
                        <img src="${srcImg}" style="width:100%; border-radius:8px; margin-bottom:1rem; height:150px; object-fit:cover;" onerror="this.style.display='none'">
                        <h4 style="color: var(--accent-gold); margin-bottom: 0.5rem;">${premio.nombre}</h4>
                        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">${premio.descripcion}</p>
                        <h2 style="margin-bottom: 1rem;">${premio.puntos_requeridos} pts</h2>
                        <button onclick="ejecutarCanje(${premio.id}, ${premio.puntos_requeridos}, '${premio.nombre}')" 
                                style="background-color: var(--accent-gold); color: #000; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;">
                            Canjear Premio
                        </button>
                    </div>
                `;
            });
        } catch (error) {
            console.error("Error cargando el catálogo de recompensas:", error);
        }
    };

    const cargarPuntosDisponibles = async () => {
        try {
            // Utilizamos usuarioId para coincidir con el controlador perfilController corregido previamente
            const res = await fetch(`${CONFIG.API_URL}/perfil/${usuarioId}`, { headers: headersAutenticados });
            const data = await res.json();
            if (data.success && data.data) {
                const spanPuntos = document.getElementById('puntos-disponibles-canje');
                if (spanPuntos) {
                    spanPuntos.innerText = data.data.puntos_fidelidad;
                }
            }
        } catch (error) {
            console.error("Error cargando puntos:", error);
        }
    };

    window.ejecutarCanje = async (idRecompensa, puntosCosto, nombrePremio) => {
        const spanPuntos = document.getElementById('puntos-disponibles-canje');
        const puntosActuales = spanPuntos ? parseInt(spanPuntos.innerText) || 0 : 0;

        if (puntosActuales < puntosCosto) {
            Swal.fire({
                icon: 'error',
                title: 'Puntos Insuficientes',
                text: `Tienes ${puntosActuales} puntos y necesitas ${puntosCosto} para esta recompensa.`,
                confirmButtonColor: '#d4af37'
            });
            return;
        }

        Swal.fire({
            title: '¿Confirmar canje?',
            text: `¿Deseas gastar ${puntosCosto} puntos en: ${nombrePremio}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d4af37',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Sí, canjear',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`${CONFIG.API_URL}/recompensas/canjear`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            ...headersAutenticados
                        },
                        body: JSON.stringify({ 
                            id_cliente: clienteId, 
                            id_recompensa: idRecompensa, 
                            puntos_costo: puntosCosto 
                        })
                    });
                    
                    const data = await res.json();
                    
                    if(data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Canje Exitoso!',
                            text: `Has obtenido: ${nombrePremio}. Tu recompensa está lista para usarse.`,
                            confirmButtonColor: '#d4af37'
                        });
                        
                        cargarPuntosDisponibles(); 
                        
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'No se pudo procesar el canje.' });
                    }
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
                }
            }
        });
    };

    cargarRecompensas();
    cargarPuntosDisponibles();
});