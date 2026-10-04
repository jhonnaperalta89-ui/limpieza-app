// Importar los SDKs modulares de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Configuración oficial de tu proyecto con la API Key corregida
const firebaseConfig = { 
  apiKey : "AIzaSyBUPG9N4UPOrLaOiTYLbZ2UB6T5mUbxkLw" , 
  authDomain : "brillaclean-b9226.firebaseapp.com" , 
  projectId : "brillaclean-b9226" , 
  storageBucket : "brillaclean-b9226.firebasestorage.app" , 
  messagingSenderId : "509006775314" , 
  appId : "1:509006775314:web:1b92b6d31d110b5b4c84cb" , 
  measurementId : "G-LCWWKB1Q7B" 
};

// Inicializar Firebase y los servicios
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    // Verificar si el usuario ya tiene una sesión activa
    onAuthStateChanged(auth, (user) => {
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
            
            // Capturar los valores ingresados en el formulario web
            const emailInput = document.getElementById("usuarioAdmin").value.trim();
            const passwordInput = document.getElementById("passwordAdmin").value.trim();

            try {
                // Autenticación real contra el servidor de Firebase
                await signInWithEmailAndPassword(auth, emailInput, passwordInput);
                loginForm.reset();
            } catch (error) {
                console.error("Código de error Firebase:", error.code);
                console.error("Mensaje completo:", error.message);
                alert("Error al iniciar sesión: " + error.message);
            }
        });
    }

    const btnCerrarSesion = document.getElementById("btnCerrarSesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", async () => {
            await signOut(auth);
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

    onSnapshot(collection(db, "ordenes"), (snapshot) => {
        if (snapshot.empty) {
            tabla.innerHTML = `<tr><td colspan="6" style="text-align:center;">No hay órdenes registradas aún.</td></tr>`;
            return;
        }

        tabla.innerHTML = "";
        snapshot.forEach((documento) => {
            let orden = documento.data();
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
        await updateDoc(doc(db, "ordenes", id), { estado: nuevoEstado });
    } catch (error) {
        alert("Operación denegada por reglas de seguridad.");
    }
}

window.eliminarOrden = async function(id) {
    if (confirm(`¿Estás seguro de eliminar la orden ${id}?`)) {
        try {
            await deleteDoc(doc(db, "ordenes", id));
        } catch (error) {
            alert("Operación denegada por reglas de seguridad.");
        }
    }
}

function escucharNotificaciones() {
    const listaNotificaciones = document.getElementById("listaNotificaciones");
    if (!listaNotificaciones) return;

    onSnapshot(collection(db, "notificaciones"), (snapshot) => {
        if (snapshot.empty) {
            listaNotificaciones.innerHTML = `<p class="placeholder-text">No hay notificaciones nuevas.</p>`;
            return;
        }

        listaNotificaciones.innerHTML = "";
        snapshot.forEach((documento) => {
            let n = documento.data();
            let div = document.createElement("div");
            div.className = `notif-item`;
            div.innerHTML = `<i class="fa-solid fa-bell"></i> ${n.mensaje}`;
            listaNotificaciones.appendChild(div);
        });
    });
}