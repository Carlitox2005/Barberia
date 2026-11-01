document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuario_id');
    const usuarioRol = localStorage.getItem('usuario_rol');
    const path = window.location.pathname;
    const isAuthPage = path.includes('index.html') || path.includes('registro.html') || path.includes('recuperar.html') || path.endsWith('/');

    // Redirección si la sesión ya está iniciada
    if (usuarioId && usuarioRol && isAuthPage) {
        if (usuarioRol === 'administrador') window.location.href = 'admin.html';
        else if (usuarioRol === 'barbero') window.location.href = 'barbero.html';
        else window.location.href = 'cliente.html';
        return;
    }

    const formLogin = document.getElementById('form-login');
    const formRegistro = document.getElementById('form-registro');
    const formRecuperar = document.getElementById('form-recuperar');

    const inputNombreReg = document.getElementById('reg-nombre');
    if (inputNombreReg) {
        inputNombreReg.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        });
    }

    const inputTelefonoNum = document.getElementById('reg-telefono-num');
    if (inputTelefonoNum) {
        inputTelefonoNum.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 7);
        });
    }

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${CONFIG.API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('usuario_id', data.usuario.id);
                    localStorage.setItem('usuario_rol', data.usuario.rol);
                    localStorage.setItem('cliente_id', data.usuario.id_cliente); 
                    localStorage.setItem('usuario_nombre', data.usuario.nombre); // GUARDAMOS EL NOMBRE AQUÍ
                    
                    Swal.fire({
                        icon: 'success',
                        title: '¡Bienvenido!',
                        text: 'Iniciando sesión...',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        if (data.usuario.rol === 'administrador') window.location.href = 'admin.html';
                        else if (data.usuario.rol === 'barbero') window.location.href = 'barbero.html';
                        else window.location.href = 'cliente.html';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Acceso Denegado',
                        text: 'Credenciales incorrectas. Inténtalo de nuevo.',
                        confirmButtonColor: '#d4af37'
                    });
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al conectar con el servidor.' });
            }
        });
    }

    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('reg-nombre').value.trim();
            const cod = document.getElementById('reg-telefono-cod').value;
            const num = document.getElementById('reg-telefono-num').value;
            const telefono = cod + num;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            if (nombre.length < 3) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Nombre muy corto',
                    text: 'El nombre y apellido deben tener al menos 3 letras.',
                    confirmButtonColor: '#d4af37'
                });
                return;
            }

            try {
                const response = await fetch(`${CONFIG.API_URL}/registro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, telefono, email, password })
                });

                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Cuenta creada!',
                        text: 'Tu cuenta ha sido registrada exitosamente.',
                        confirmButtonColor: '#d4af37'
                    }).then(() => {
                        window.location.href = 'index.html';
                    });
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Atención',
                        text: 'El correo electrónico podría ya estar en uso.',
                        confirmButtonColor: '#d4af37'
                    });
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al conectar con el servidor.' });
            }
        });
    }

    if (formRecuperar) {
        formRecuperar.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('rec-email').value;

            try {
                const response = await fetch(`${CONFIG.API_URL}/recuperar-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Enlace Enviado',
                        text: 'Se ha enviado un enlace de recuperación a tu correo.',
                        confirmButtonColor: '#d4af37'
                    }).then(() => {
                        window.location.href = 'index.html';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Ups...',
                        text: 'No se encontró una cuenta con ese correo electrónico.',
                        confirmButtonColor: '#d4af37'
                    });
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al conectar con el servidor.' });
            }
        });
    }
});