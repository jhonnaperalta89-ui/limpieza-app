const firebaseConfig = {
    apiKey: "AIzaSyBUPG9N4UPorLaOiTYLbZ2UB6T5mUbxkLw",
    authDomain: "brillaclean-b9226.firebaseapp.com",
    projectId: "brillaclean-b9226",
    storageBucket: "brillaclean-b9226.firebasestorage.app",
    messagingSenderId: "509006775314",
    appId: "1:509006775314:web:1b92b6d31d110b5b4c84cb",
    measurementId: "G-LCWWKB1Q7B"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            mostrarPanelAdmin();
            escucharOrdenesAdmin();
            escucharNotificaciones();
        } else {
            ocultarPanelAdmin();
        }
    });

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("usuarioAdmin").value.trim();
            const passwordInput = document.getElementById("passwordAdmin").value.trim();

            try {
                await auth.signInWithEmailAndPassword(emailInput, passwordInput);
                loginForm.reset();
            } catch (error) {
                console.error("Código de error Firebase:", error.code);
                alert("Error: " + error.message);
            }
        });
    }

    const btnCerrarSesion = document.getElementById("btnCerrarSesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", async () => {
            await auth.signOut();
            location.reload();
        });
    }
});

function mostrarPanelAdmin() {
    document.getElementById("loginModalContainer").classList.add("hidden");
    document.getElementById("panelAdminContent").classList.remove("hidden");
}

function ocultarPanelAdmin() {
    document.getElementById("loginModalContainer").classList.remove("hidden");
    document.getElementById("panelAdminContent").classList.add("hidden");
}

function escucharOrdenesAdmin() {
    const tabla = document.getElementById("tablaOrdenesAdmin");
    if (!tabla) return;

    db.collection("ordenes").onSnapshot((snapshot) => {
        if (snapshot.empty) {
            tabla.innerHTML = `<tr><td colspan="6" style="text-align:center;">No hay órdenes registradas aún.</td></tr>`;
            return;
        }

        tabla.innerHTML = "";
        snapshot.forEach((doc) => {
            let orden = doc.data();
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
    });
}

window.cambiarEstado = async function(id, nuevoEstado) {
    try {
        await db.collection("ordenes").doc(id).update({ estado: nuevoEstado });
    } catch (error) {
        alert("Operación denegada por reglas de seguridad.");
    }
}

window.eliminarOrden = async function(id) {
    if (confirm(`¿Estás seguro de eliminar la orden ${id}?`)) {
        try {
            await db.collection("ordenes").doc(id).delete();
        } catch (error) {
            alert("Operación denegada por reglas de seguridad.");
        }
    }
}

function escucharNotificaciones() {
    const listaNotificaciones = document.getElementById("listaNotificaciones");
    if (!listaNotificaciones) return;

    db.collection("notificaciones").onSnapshot((snapshot) => {
        if (snapshot.empty) {
            listaNotificaciones.innerHTML = `<p class="placeholder-text">No hay notificaciones nuevas.</p>`;
            return;
        }

        listaNotificaciones.innerHTML = "";
        snapshot.forEach((doc) => {
            let n = doc.data();
            let div = document.createElement("div");
            div.className = `notif-item`;
            div.innerHTML = `<i class="fa-solid fa-bell"></i> ${n.mensaje}`;
            listaNotificaciones.appendChild(div);
        });
    });
}