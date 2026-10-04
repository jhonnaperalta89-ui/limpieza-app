document.addEventListener("DOMContentLoaded", () => {
    const sesionIniciada = sessionStorage.getItem("adminLogueado");
    if (sesionIniciada === "true") {
        mostrarPanelAdmin();
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const usuarioInput = document.getElementById("usuarioAdmin").value.trim();
            const passwordInput = document.getElementById("passwordAdmin").value.trim();

            const usuarioCorrecto = "Maida@Bogado";
            const passwordCorrecta = "Catalina1208";

            if (usuarioInput === usuarioCorrecto && passwordInput === passwordCorrecta) {
                sessionStorage.setItem("adminLogueado", "true");
                mostrarPanelAdmin();
            } else {
                alert("Credenciales incorrectas. Verifique usuario y contraseña.");
            }
        });
    }

    const btnCerrarSesion = document.getElementById("btnCerrarSesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            sessionStorage.removeItem("adminLogueado");
            location.reload();
        });
    }

    cargarOrdenesAdmin();
    cargarNotificaciones();

    const bloqueoForm = document.getElementById("bloqueoForm");
    if (bloqueoForm) {
        bloqueoForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const fecha = document.getElementById("fechaBloqueo").value;
            const motivo = document.getElementById("motivoBloqueo").value;

            let fechasBloqueadas = JSON.parse(localStorage.getItem("fechasBloqueadas")) || [];
            if (!fechasBloqueadas.includes(fecha)) {
                fechasBloqueadas.push(fecha);
                localStorage.setItem("fechasBloqueadas", JSON.stringify(fechasBloqueadas));
                alert(`Fecha ${fecha} bloqueada correctamente.`);
                bloqueoForm.reset();
            } else {
                alert("Esta fecha ya está bloqueada.");
            }
        });
    }
});

function mostrarPanelAdmin() {
    const loginModal = document.getElementById("loginModalContainer");
    const panelContent = document.getElementById("panelAdminContent");
    if (loginModal) loginModal.classList.add("hidden");
    if (panelContent) panelContent.classList.remove("hidden");
}

function cargarOrdenesAdmin() {
    const tabla = document.getElementById("tablaOrdenesAdmin");
    if (!tabla) return;
    
    let ordenes = JSON.parse(localStorage.getItem("ordenesLimpieza")) || [];

    if (ordenes.length === 0) {
        tabla.innerHTML = `<tr><td colspan="6" style="text-align:center;">No hay órdenes registradas aún.</td></tr>`;
        return;
    }

    tabla.innerHTML = "";
    ordenes.forEach((orden) => {
        let fila = document.createElement("tr");
        fila.innerHTML = `
            <td><strong>${orden.id}</strong></td>
            <td>${orden.nombre}<br><small>${orden.telefono}</small></td>
            <td>${orden.tipoServicio}</td>
            <td>${orden.fecha}<br><small>${orden.hora}</small></td>
            <td><span class="badge-status status-${orden.estado.toLowerCase()}">${orden.estado}</span></td>
            <td>
                <button onclick="cambiarEstado('${orden.id}', 'Confirmado')" class="btn-sm btn-success">Aprobar</button>
                <button onclick="eliminarOrden('${orden.id}')" class="btn-sm btn-danger"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

window.cambiarEstado = function(id, nuevoEstado) {
    let ordenes = JSON.parse(localStorage.getItem("ordenesLimpieza")) || [];
    let orden = ordenes.find(o => o.id === id);
    if (orden) {
        orden.estado = nuevoEstado;
        localStorage.setItem("ordenesLimpieza", JSON.stringify(ordenes));
        registrarNotificacion(`Orden ${id} cambiada a estado:${nuevoEstado}`);
        cargarOrdenesAdmin();
        cargarNotificaciones();
    }
}

window.eliminarOrden = function(id) {
    if (confirm(`¿Estás seguro de eliminar la orden ${id}?`)) {
        let ordenes = JSON.parse(localStorage.getItem("ordenesLimpieza")) || [];
        ordenes = ordenes.filter(o => o.id !== id);
        localStorage.setItem("ordenesLimpieza", JSON.stringify(ordenes));
        cargarOrdenesAdmin();
    }
}

function registrarNotificacion(mensaje) {
    let notis = JSON.parse(localStorage.getItem("notificacionesLocal")) || [];
    notis.unshift({ mensaje, fecha: new Date().toLocaleTimeString() });
    localStorage.setItem("notificacionesLocal", JSON.stringify(notis));
}

function cargarNotificaciones() {
    const listaNotificaciones = document.getElementById("listaNotificaciones");
    if (!listaNotificaciones) return;
    
    let notis = JSON.parse(localStorage.getItem("notificacionesLocal")) || [];

    if (notis.length === 0) {
        listaNotificaciones.innerHTML = `<p class="placeholder-text">No hay notificaciones nuevas en este momento.</p>`;
        return;
    }

    listaNotificaciones.innerHTML = "";
    notis.forEach(n => {
        let div = document.createElement("div");
        div.className = `notif-item`;
        div.innerHTML = `<i class="fa-solid fa-bell"></i> [${n.fecha}]${n.mensaje}`;
        listaNotificaciones.appendChild(div);
    });
}
