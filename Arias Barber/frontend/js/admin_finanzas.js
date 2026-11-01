document.addEventListener('DOMContentLoaded', () => {
    const usuarioRol = localStorage.getItem('usuario_rol');
    const token = localStorage.getItem('token');
    if (usuarioRol !== 'administrador' || !token) return;

    const headersAutenticados = {
        'Authorization': `Bearer ${token}`
    };

    let chartIngresosInstance = null;

    window.cargarFinanzas = async () => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/finanzas-historial?nocache=` + new Date().getTime(), {
                headers: headersAutenticados 
            });            
            const data = await res.json();
            
            const listaHistorial = document.getElementById('lista-historial-ingresos');
            if (!listaHistorial) return;

            const pointsElements = document.querySelectorAll('#dashboard .points');
            if(pointsElements.length >= 3) {
                const dia = data.totales ? data.totales.dia : (data.dia || 0);
                const semana = data.totales ? data.totales.semana : (data.semana || 0);
                const mes = data.totales ? data.totales.mes : (data.mes || 0);
                
                pointsElements[0].innerText = `$${parseFloat(dia).toFixed(2)}`;
                pointsElements[1].innerText = `$${parseFloat(semana).toFixed(2)}`;
                pointsElements[2].innerText = `$${parseFloat(mes).toFixed(2)}`;
            }

            actualizarGraficoFinanciero(data.historial || []);

            listaHistorial.innerHTML = '';
            
            if (data.historial) {
                if (data.historial.length > 0) {
                    data.historial.forEach((item) => {
                        let fechaFormateada = item.fecha_hora;
                        let fechaPura = '';

                        try {
                            if (item.fecha_hora) {
                                const objFecha = new Date(item.fecha_hora);
                                fechaFormateada = objFecha.toLocaleString('es-VE', { 
                                    dateStyle: 'short', timeStyle: 'short' 
                                });
                                const year = objFecha.getFullYear();
                                const month = String(objFecha.getMonth() + 1).padStart(2, '0');
                                const day = String(objFecha.getDate()).padStart(2, '0');
                                fechaPura = `${year}-${month}-${day}`;
                            }
                        } catch (e) {}

                        const cliente = item.cliente || 'Cliente General';
                        const servicio = item.servicio || 'Servicio General';
                        const barbero = item.barbero || 'Sin Asignar';
                        const precio = parseFloat(item.precio || 0).toFixed(2);

                        listaHistorial.innerHTML += `
                            <div class="fila-ingreso" data-fecha="${fechaPura}" style="display: grid; grid-template-columns: 1.5fr 1.5fr 1.5fr 1fr 1.5fr; gap: 1rem; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                                <span>${cliente}</span>
                                <span>${servicio}</span>
                                <span>${barbero}</span>
                                <span style="color: var(--accent-gold); font-weight: bold;">$${precio}</span>
                                <span style="font-size: 0.9rem; color: var(--text-muted);">${fechaFormateada}</span>
                            </div>
                        `;
                    });
                    
                    filtrarHistorialIngresos();
                } else {
                    listaHistorial.innerHTML = '<p style="color: var(--text-muted);">No hay registros de ingresos completados aún.</p>';
                }
            } else {
                listaHistorial.innerHTML = '<p style="color: #F44336; font-weight: bold; background: #ffebee; padding: 1rem; border-radius: 8px;">⚠️ ERROR DE BACKEND: Formato de respuesta incorrecto.</p>';
            }
            
        } catch (error) { 
            console.error(error); 
        }
    };

    function actualizarGraficoFinanciero(historial) {
        const canvasCtx = document.getElementById('graficoIngresos');
        if (!canvasCtx) return;

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const ultimos7Dias = [];
        const mapaTotales = {};

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const nombreDia = diasSemana[d.getDay()];
            const fechaKey = d.toISOString().split('T')[0];
            ultimos7Dias.push({ label: nombreDia, fecha: fechaKey });
            mapaTotales[fechaKey] = 0;
        }

        historial.forEach(item => {
            if (item.fecha_hora) {
                const fStr = item.fecha_hora.split('T')[0];
                if (mapaTotales[fStr] !== undefined) {
                    mapaTotales[fStr] += parseFloat(item.precio || 0);
                }
            }
        });

        const labels = ultimos7Dias.map(d => d.label);
        const dataValues = ultimos7Dias.map(d => mapaTotales[d.fecha]);

        const ctx = canvasCtx.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 350);
        gradient.addColorStop(0, 'rgba(212, 175, 55, 0.35)');
        gradient.addColorStop(1, 'rgba(212, 175, 55, 0.0)');

        if (chartIngresosInstance) {
            chartIngresosInstance.destroy();
        }

        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#64748b';

        chartIngresosInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ingresos ($)',
                    data: dataValues,
                    borderColor: '#d4af37',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#d4af37',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(200, 200, 200, 0.08)' },
                        ticks: { color: textColor }
                    },
                    y: {
                        grid: { color: 'rgba(200, 200, 200, 0.08)' },
                        ticks: { color: textColor }
                    }
                }
            }
        });
    }

    window.filtrarHistorialIngresos = () => {
        const inputTexto = document.getElementById('filtro-texto-ingresos');
        const inputFechaInicio = document.getElementById('filtro-fecha-inicio');
        const inputFechaFin = document.getElementById('filtro-fecha-fin');

        if (!inputTexto || !inputFechaInicio || !inputFechaFin) return;

        const textoBusqueda = inputTexto.value.toLowerCase().trim();
        const strFechaInicio = inputFechaInicio.value; 
        const strFechaFin = inputFechaFin.value;       

        const filas = document.querySelectorAll('.fila-ingreso');
        const historialFiltradoParaGrafico = [];

        filas.forEach(fila => {
            const contenidoTexto = fila.innerText.toLowerCase();
            const fechaFilaStr = fila.getAttribute('data-fecha'); 

            const coincideTexto = textoBusqueda === '' || contenidoTexto.includes(textoBusqueda);
            let coincideFecha = true;
            
            if (fechaFilaStr) {
                if (strFechaInicio && fechaFilaStr < strFechaInicio) coincideFecha = false;
                if (strFechaFin && fechaFilaStr > strFechaFin) coincideFecha = false;
            }

            if (coincideTexto && coincideFecha) {
                fila.style.display = 'grid';
                const columnas = fila.querySelectorAll('span');
                if (fechaFilaStr) {
                    historialFiltradoParaGrafico.push({
                        fecha_hora: fechaFilaStr,
                        precio: parseFloat(columnas[3].innerText.replace('$', '') || 0)
                    });
                }
            } else {
                fila.style.display = 'none';
            }
        });

        actualizarGraficoFinanciero(historialFiltradoParaGrafico);
    };

    const inputTexto = document.getElementById('filtro-texto-ingresos');
    const inputFechaInicio = document.getElementById('filtro-fecha-inicio');
    const inputFechaFin = document.getElementById('filtro-fecha-fin');

    if (inputTexto) inputTexto.addEventListener('input', window.filtrarHistorialIngresos);
    if (inputFechaInicio) inputFechaInicio.addEventListener('change', window.filtrarHistorialIngresos);
    if (inputFechaFin) inputFechaFin.addEventListener('change', window.filtrarHistorialIngresos);

    const btnExportarPdf = document.getElementById('btn-exportar-pdf');
    if (btnExportarPdf) {
        btnExportarPdf.addEventListener('click', () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            doc.setFillColor(15, 23, 42); 
            doc.rect(0, 0, 210, 35, 'F');
            doc.setFillColor(212, 175, 55); 
            doc.rect(0, 35, 210, 3, 'F');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.setTextColor(255, 255, 255);
            doc.text("ARIAS BARBER STUDIO", 14, 18);
            doc.setFontSize(11);
            doc.setTextColor(212, 175, 55);
            doc.text("REPORTE FINANCIERO OFICIAL", 14, 26);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);

            const fechaInicio = document.getElementById('filtro-fecha-inicio').value;
            const fechaFin = document.getElementById('filtro-fecha-fin').value;
            let subtitulo = "Periodo: Todos los registros históricos";
            
            if (fechaInicio && fechaFin) {
                subtitulo = `Periodo filtrado: Desde ${fechaInicio} hasta ${fechaFin}`;
            } else if (fechaInicio) {
                subtitulo = `Periodo filtrado: Desde ${fechaInicio} en adelante`;
            } else if (fechaFin) {
                subtitulo = `Periodo filtrado: Hasta el ${fechaFin}`;
            }

            doc.text(subtitulo, 14, 46);
            doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-VE')}`, 14, 52);

            const filasVisibles = Array.from(document.querySelectorAll('.fila-ingreso')).filter(fila => fila.style.display !== 'none');
            
            if (filasVisibles.length === 0) {
                Swal.fire({ icon: 'warning', title: 'Sin datos', text: 'No hay registros visibles con los filtros actuales para exportar.', confirmButtonColor: '#d4af37' });
                return;
            }

            const cuerpoTabla = [];
            let totalAcumulado = 0;

            filasVisibles.forEach(fila => {
                const columnas = fila.querySelectorAll('span');
                const cliente = columnas[0].innerText;
                const servicio = columnas[1].innerText;
                const barbero = columnas[2].innerText;
                const montoTexto = columnas[3].innerText;
                const fecha = columnas[4].innerText;

                const monto = parseFloat(montoTexto.replace('$', ''));
                totalAcumulado += monto;

                cuerpoTabla.push([cliente, servicio, barbero, fecha, montoTexto]);
            });

            doc.autoTable({
                startY: 58,
                head: [['Cliente', 'Servicio', 'Barbero', 'Fecha y Hora', 'Monto']],
                body: cuerpoTabla,
                theme: 'grid',
                headStyles: { 
                    fillColor: [15, 23, 42],
                    textColor: [212, 175, 55],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                columnStyles: {
                    4: { halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] }
                },
                styles: { fontSize: 9, cellPadding: 5 },
                alternateRowStyles: { fillColor: [248, 249, 250] },
                foot: [['', '', '', 'TOTAL RECAUDADO:', `$${totalAcumulado.toFixed(2)}`]],
                footStyles: {
                    fillColor: [15, 23, 42],
                    textColor: [212, 175, 55],
                    fontStyle: 'bold',
                    halign: 'right'
                }
            });

            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Página ${i} de ${pageCount} - Arias Barber Studio System`, 14, 287);
            }

            const nombreArchivo = `Reporte_Financiero_ABS_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(nombreArchivo);
        });
    }

    window.cargarFinanzas();
});