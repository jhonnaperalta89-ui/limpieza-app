document.addEventListener("DOMContentLoaded", () => {
    const reservaForm = document.getElementById("reservaForm");
    const resultadoReserva = document.getElementById("resultadoReserva");
    const numeroOrdenGenerado = document.getElementById("numeroOrdenGenerado");
    
    const btnBuscarOrden = document.getElementById("btnBuscarOrden");
    const inputBuscarOrden = document.getElementById("inputBuscarOrden");
    const detalleOrden = document.getElementById("detalleOrden");

    const fechaInput = document.getElementById("fechaReserva");
    const hoy = new Date().toISOString().split("T")[0];
    fechaInput.min = hoy;

    reservaForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = document.getElementById("nombre").value;
        const telefono = document.getElementById("telefono").value;
        const direccion = document.getElementById("direccion").value;
        const tipoServicio = document.getElementById("tipoServicio").value;
        const fecha = document.getElementById("fechaReserva").value;
        const hora = document.getElementById("horaReserva").value;

        let fechasBloqueadas = JSON.parse(localStorage.getItem("fechasBloqueadas")) || [];
        if (fechasBloqueadas.includes(fecha)) {
            alert("Lo sentimos, esta fecha se encuentra bloqueada / ocupada. Por favor selecciona otra.");
            return;
        }

        const nroOrden = "ORD-" + Math.floor(100000 + Math.random() * 900000);

        const nuevaOrden = {
            id: nroOrden,
            nombre,
            telefono,
            direccion,
            tipoServicio,
            fecha,
            hora,
            estado: "Pendiente"
        };

        let ordenes = JSON.parse(localStorage.getItem("ordenesLimpieza")) || [];
        ordenes.push(nuevaOrden);
        localStorage.setItem("ordenesLimpieza", JSON.stringify(ordenes));

        registrarNotificacion(`Nueva reserva recibida de ${nombre} para el${fecha} (${hora}). N° ${nroOrden}`);

        numeroOrdenGenerado.textContent = nroOrden;
        resultadoReserva.classList.remove("hidden");
        reservaForm.reset();
    });

    btnBuscarOrden.addEventListener("click", () => {
        const codigo = inputBuscarOrden.value.trim().toUpperCase();
        if (!codigo) return;

        let ordenes = JSON.parse(localStorage.getItem("ordenesLimpieza")) || [];
        const encontrada = ordenes.find(o => o.id === codigo);

        if (encontrada) {
            detalleOrden.innerHTML = `
                <h4>Detalles de tu Orden: <strong>${encontrada.id}</strong></h4>
                <p><strong>Cliente:</strong> ${encontrada.nombre}</p>
                <p><strong>Servicio:</strong> ${encontrada.tipoServicio}</p>
                <p><strong>Fecha y Hora:</strong> ${encontrada.fecha} a las${encontrada.hora}</p>
                <p><strong>Dirección:</strong> ${encontrada.direccion}</p>
                <p><strong>Estado Actual:</strong> <span class="badge-status status-${encontrada.estado.toLowerCase()}">${encontrada.estado}</span></p>
            `;
            detalleOrden.classList.remove("hidden");
        } else {
            detalleOrden.innerHTML = `<p style="color: red;">No se encontró ninguna orden con el código "${codigo}".</p>`;
            detalleOrden.classList.remove("hidden");
        }
    });

    function registrarNotificacion(mensaje) {
        let notis = JSON.parse(localStorage.getItem("notificacionesLocal")) || [];
        notis.unshift({ mensaje, fecha: new Date().toLocaleTimeString() });
        localStorage.setItem("notificacionesLocal", JSON.stringify(notis));
    }
});
