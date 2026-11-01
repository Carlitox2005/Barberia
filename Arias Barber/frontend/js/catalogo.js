document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    const headersConfig = token ? { 'Authorization': `Bearer ${token}` } : {};

    const cargarCatalogo = async () => {
        try {
            const resTasa = await fetch(`${CONFIG.API_URL}/tasa-bcv`, { headers: headersConfig });
            const dataTasa = await resTasa.json();
            const tasaBCV = dataTasa.success ? dataTasa.tasa : 1;

            const res = await fetch(`${CONFIG.API_URL}/servicios`, { headers: headersConfig });
            const servicios = await res.json();
            const grid = document.querySelector('.grid-cards');
            const selectServicio = document.querySelectorAll('#form-reserva select')[0];
            
            if(grid) grid.innerHTML = '';
            if(selectServicio) selectServicio.innerHTML = '<option value="" disabled selected>Seleccionar...</option>';

            servicios.forEach(s => {
                const precioBs = (s.precio * tasaBCV).toFixed(2); 
                const rutaImagen = s.imagen_url ? (s.imagen_url.startsWith('/') ? s.imagen_url : `/${s.imagen_url}`) : null;
                const srcImg = rutaImagen ? `${CONFIG.API_URL.replace('/api', '')}${rutaImagen}` : '';

                if(grid) {
                    grid.innerHTML += `
                        <div class="card">
                            <img src="${srcImg}" style="width:100%; border-radius:8px; margin-bottom:1rem; height:200px; object-fit:cover;" onerror="this.style.display='none'">
                            <h3>${s.nombre}</h3>
                            <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem;">
                                <span class="badge" style="background-color: var(--accent-gold); color: #000;">$${s.precio}</span>
                                <span class="badge" style="background-color: transparent; color: var(--text-main); border: 1px solid var(--border-color);">Bs. ${precioBs}</span>
                            </div>
                            <p style="color:var(--text-muted); font-size:0.8rem; margin-top:0.5rem;">+${s.puntos_otorgados} Puntos de Fidelidad</p>
                        </div>
                    `;
                }
                if(selectServicio) {
                    selectServicio.innerHTML += `<option value="${s.id}">${s.nombre} ($${s.precio} / Bs. ${precioBs})</option>`;
                }
            });
        } catch (error) {
            console.error("Error cargando el catálogo y la tasa:", error);
        }
    };

    const cargarBarberos = async () => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/barberos`, { headers: headersConfig });
            const barberos = await res.json();
            const selectBarbero = document.querySelectorAll('#form-reserva select')[1];
            
            if(selectBarbero) {
                selectBarbero.innerHTML = '<option value="" disabled selected>Cualquiera...</option>';
                barberos.forEach(b => {
                    selectBarbero.innerHTML += `<option value="${b.id}">${b.nombre}</option>`;
                });
            }
        } catch (error) {
            console.error("Error cargando los barberos:", error);
        }
    };

    cargarCatalogo();
    cargarBarberos();
});