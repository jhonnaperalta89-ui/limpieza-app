const firebaseConfig = {
    apiKey: "AIzaSyBUPG9N4UPOrLaOiTYLbZ2UB6T5mUbxkLw",
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
        } else {
            ocultarPanelAdmin();
        }
    });

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("usuarioAdmin").value.trim();
            const password = document.getElementById("passwordAdmin").value.trim();
            try {
                await auth.signInWithEmailAndPassword(email, password);
                loginForm.reset();
            } catch (error) {
                alert("Error de acceso: " + error.message);
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
            tabla.innerHTML = `<tr><td colspan="6" style="text-align:center;">No hay órdenes registradas.</td></tr>`;
            return;
        }

        tabla.innerHTML = "";
        snapshot.forEach((doc) => {
            let orden = doc.data();
            let idCorto = doc.id.substring(0, 8).toUpperCase(); // ID resumido para fácil lectura
            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td><strong>#${idCorto}</strong></td>
                <td>${orden.nombre || 'N/A'}<br><small><i class="fas fa-phone"></i> ${orden.telefono || ''}</small></td>
                <td>${orden.tipoServicio || 'Limpieza'}</td>
                <td>${orden.fecha || ''}<br><small><i class="fas fa-map-marker-alt"></i> ${orden.direccion || ''}</small></td>
                <td><span class="badge ${orden.estado || 'Pendiente'}">${orden.estado || 'Pendiente'}</span></td>
                <td>
                    <button onclick="cambiarEstado('${doc.id}', 'Confirmado')" class="btn-action btn-aprobar" title="Aprobar"><i class="fas fa-check"></i></button>
                    <button onclick="cambiarEstado('${doc.id}', 'Rechazado')" class="btn-action btn-rechazar" title="Rechazar"><i class="fas fa-times"></i></button>
                    <button onclick="eliminarOrden('${doc.id}')" class="btn-action btn-eliminar" title="Eliminar"><i class="fas fa-trash"></i></button>
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
        alert("Operación denegada o error al actualizar.");
    }
}

window.eliminarOrden = async function(id) {
    if (confirm("¿Estás seguro de eliminar esta orden del registro?")) {
        try {
            await db.collection("ordenes").doc(id).delete();
        } catch (error) {
            alert("Operación denegada o error al eliminar.");
        }
    }
}