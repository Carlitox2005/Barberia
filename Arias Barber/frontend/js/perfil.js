document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuario_id');
    if (!usuarioId) return;

    const cargarPerfil = async () => {
        try {
            const data = await window.api.get(`/perfil/${usuarioId}`);
            
            if (data.success) {
                const perfil = data.data;
                
                document.getElementById('perfil-nombre').value = perfil.nombre || '';
                document.getElementById('perfil-telefono').value = perfil.telefono || '';
                document.getElementById('perfil-puntos-display').innerText = `${Number(perfil.puntos_fidelidad || 0)} Puntos`;
                
                if (perfil.imagen_url) {
                    const rutaImagen = perfil.imagen_url.startsWith('/') ? perfil.imagen_url : `/${perfil.imagen_url}`;
                    const urlCompleta = `${CONFIG.API_URL.replace('/api', '')}${rutaImagen}`;
                    
                    document.getElementById('img-perfil-preview').src = urlCompleta;
                    const navImg = document.getElementById('nav-perfil-img');
                    if (navImg) navImg.src = urlCompleta;
                }

                const notifRecompensa = document.getElementById('notificacion-recompensa');
                const navNotif = document.getElementById('nav-notificacion-recompensa');

                if (perfil.minimo_recompensa && perfil.puntos_fidelidad >= perfil.minimo_recompensa) {
                    if (notifRecompensa) notifRecompensa.style.display = 'block';
                    if (navNotif) navNotif.style.display = 'block';
                } else {
                    if (notifRecompensa) notifRecompensa.style.display = 'none';
                    if (navNotif) navNotif.style.display = 'none';
                }
            }
        } catch (error) {
            console.error("Error al cargar perfil:", error);
        }
    };

    document.getElementById('form-datos-personales').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('perfil-nombre').value;
        const telefono = document.getElementById('perfil-telefono').value;

        try {
            const data = await window.api.put(`/perfil/${usuarioId}/datos`, { nombre, telefono });
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Datos actualizados', confirmButtonColor: '#d4af37' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error de conexión' });
        }
    });

    document.getElementById('form-cambiar-password').addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('perfil-password').value;

        try {
            const data = await window.api.put(`/perfil/${usuarioId}/password`, { password });
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Contraseña actualizada', confirmButtonColor: '#d4af37' });
                document.getElementById('form-cambiar-password').reset();
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error de conexión' });
        }
    });

    document.getElementById('input-foto-perfil').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('imagen', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${CONFIG.API_URL}/perfil/${usuarioId}/imagen`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                const rutaImagen = data.imagen_url.startsWith('/') ? data.imagen_url : `/${data.imagen_url}`;
                const urlCompleta = `${CONFIG.API_URL.replace('/api', '')}${rutaImagen}`;
                
                document.getElementById('img-perfil-preview').src = urlCompleta;
                const navImg = document.getElementById('nav-perfil-img');
                if (navImg) navImg.src = urlCompleta;
                
                Swal.fire({ icon: 'success', title: 'Foto actualizada', confirmButtonColor: '#d4af37' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error al subir la imagen' });
        }
    });

    cargarPerfil();
});