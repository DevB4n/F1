// Import funciones de gestión de usuarios
import { crearUsuario, loginUsuarios, mostrarNotificacion } from './components/db/users.js';

// Elementos del DOM
const popUp = document.getElementById('pop-up');
const signIn = document.getElementById('log-in-btn');
const login = document.getElementById('login-button');
const registerPopUp = document.getElementById('register-pop-up');
const registerBtn = document.getElementById('sign-in-btn');
const registerConfirm = document.getElementById('register-button');
const closeLoginBtn = document.getElementById('close-login');
const closeRegisterBtn = document.getElementById('close-register');

// Función para cerrar modales
function cerrarModal(modal) {
    modal.style.opacity = 0;
    modal.style.pointerEvents = 'none';
    modal.style.transform = 'scale(0.8)';
    document.body.classList.remove('blur-active');
}

// Pantalla de carga
window.addEventListener('load', () => {
    const loader = document.getElementById('f1-loader');
    const barFill = document.getElementById('f1-bar-fill');
    
    if (loader && barFill) {
        barFill.addEventListener('animationend', () => {
            loader.style.opacity = 0;
            loader.style.pointerEvents = 'none';
            setTimeout(() => loader.remove(), 500);
        });
    } else {
        console.error('Elementos de carga no encontrados');
    }
    
    // Verificar si hay usuarios registrados (solo para desarrollo)
    console.log('Usuarios registrados:', localStorage.getItem('listaUsuarios'));
});

// Iniciar sesión
if (signIn) {
    signIn.addEventListener('click', () => {
        popUp.style.opacity = 1;
        popUp.style.pointerEvents = 'auto';
        popUp.style.transform = 'scale(1)';
        document.body.classList.add('blur-active');
    });
}

if (login) {
    login.addEventListener('click', async () => {
        const usuario = document.getElementById('usuario-registro').value;
        const contraseña = document.getElementById('usuario-password').value;
        
        // Validar campos vacíos
        if (!usuario || !contraseña) {
            mostrarNotificacion('Por favor completa todos los campos', 'error');
            return;
        }
        
        const loginExitoso = await loginUsuarios(usuario, contraseña);
        
        if (loginExitoso) {
            cerrarModal(popUp);
            
            // Redirigir según el tipo de usuario
            const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));
            if (usuarioActual?.clase === 'admin') {
                // Opcional: redirigir a página de administrador
                // window.location.href = './admin.html';
                mostrarNotificacion('Bienvenido administrador', 'exito');
            } else {
                mostrarNotificacion(`Bienvenido ${usuario}!`, 'exito');
            }
        }
    });
}

// Botones para cerrar modales
if (closeLoginBtn) {
    closeLoginBtn.addEventListener('click', () => cerrarModal(popUp));
}

if (closeRegisterBtn) {
    closeRegisterBtn.addEventListener('click', () => cerrarModal(registerPopUp));
}

// Registrarse
if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        registerPopUp.style.opacity = 1;
        registerPopUp.style.pointerEvents = 'auto';
        registerPopUp.style.transform = 'scale(1)';
        document.body.classList.add('blur-active');
    });
}

if (registerConfirm) {
    registerConfirm.addEventListener('click', async () => {
        const usuario = document.getElementById('new-user').value;
        const contraseña = document.getElementById('new-password').value;
        const confirmarContraseña = document.getElementById('confirm-password').value;
        
        // Validar campos vacíos
        if (!usuario || !contraseña || !confirmarContraseña) {
            mostrarNotificacion('Por favor completa todos los campos', 'error');
            return;
        }
        
        const registroExitoso = await crearUsuario(usuario, contraseña, confirmarContraseña);
        
        if (registroExitoso) {
            cerrarModal(registerPopUp);
            mostrarNotificacion(`Usuario ${usuario} creado exitosamente. ¡Ya puedes iniciar sesión!`, 'exito');
        }
    });
}

// Función para verificar si hay sesión activa al cargar la página
function verificarSesionActiva() {
    const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));
    
    if (usuarioActual) {
        // Actualizar la interfaz según el usuario
        const loginBtn = document.getElementById('log-in-btn');
        const registerBtn = document.getElementById('sign-in-btn');
        const userInfoElement = document.getElementById('user-info');
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        
        if (userInfoElement) {
            userInfoElement.innerHTML = `
                <span>Bienvenido, ${usuarioActual.nombre}</span>
                <button id="logout-btn" class="btn">Cerrar sesión</button>
            `;
            userInfoElement.style.display = 'flex';
            
            // Agregar evento al botón de cerrar sesión
            document.getElementById('logout-btn').addEventListener('click', cerrarSesion);
        }
        
        // Si es admin, mostrar enlaces o funcionalidades de administrador
        if (usuarioActual.clase === 'admin') {
            const adminPanel = document.getElementById('admin-panel');
            if (adminPanel) {
                adminPanel.style.display = 'block';
            }
        }
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    sessionStorage.removeItem('usuarioActual');
    localStorage.removeItem('admin');
    mostrarNotificacion('Sesión cerrada correctamente', 'info');
    
    // Recargar la página para actualizar la interfaz
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Verificar sesión al cargar la página
document.addEventListener('DOMContentLoaded', verificarSesionActiva);