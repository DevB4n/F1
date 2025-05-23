// users.js - Funciones para gestión de usuarios

// Función para forzar la creación del administrador en localStorage
export const forzarCreacionAdmin = () => {
  try {
    // Obtener lista actual de usuarios
    const listaUsuarios = JSON.parse(localStorage.getItem('listaUsuarios')) || [];
    
    // Verificar si ya existe el admin
    const adminExistente = listaUsuarios.find(usuario => 
      usuario.nombre === "admin" && usuario.clase === "admin"
    );
    
    // Si no existe, crearlo
    if (!adminExistente) {
      const adminPredeterminado = {
        id: 1,
        nombre: "admin",
        contraseña: "admin",
        clase: "admin"
      };
      
      listaUsuarios.push(adminPredeterminado);
      localStorage.setItem('listaUsuarios', JSON.stringify(listaUsuarios));
      console.log("Administrador agregado forzosamente a localStorage");
      return true;
    } else {
      console.log("El administrador ya existe en localStorage");
      return false;
    }
  } catch (error) {
    console.error("Error al forzar la creación del admin:", error);
    return false;
  }
};

// Ejecución inmediata (puedes copiar este código en la consola del navegador)
forzarCreacionAdmin();



export const cargarAdmin = async () => {
  try {
      const respuesta = await fetch('./db/users/users.json');
      if (!respuesta.ok) {
        throw new Error('No se pudo cargar el archivo de administradores');
      }
      const usuariosData = await respuesta.json();
      return usuariosData;
  } catch (error) {
      console.error('Error al cargar administradores:', error);
      mostrarNotificacion('Error al cargar datos de administradores', 'error');
      return [];
  }
};

// Nueva función para sincronizar el admin con localStorage
export const sincronizarAdmin = async () => {
try {
  const admin = await cargarAdmin();
  if (!admin) return false;
  
  const listaUsuarios = cargarUsuarios();
  
  // Verificar si el admin ya existe en la lista por nombre
  const adminExistente = listaUsuarios.find(usuario => usuario.nombre === admin.nombre);
  
  if (!adminExistente) {
    // Agregar admin a la lista y guardar en localStorage
    listaUsuarios.push(admin);
    localStorage.setItem('listaUsuarios', JSON.stringify(listaUsuarios));
    console.log('Administrador sincronizado con localStorage');
  }
  
  return true;
} catch (error) {
  console.error('Error al sincronizar admin con localStorage:', error);
  return false;
}
};

export const cargarUsuarios = () => {
try {
  return JSON.parse(localStorage.getItem('listaUsuarios')) || [];
} catch (error) {
  console.error('Error al cargar usuarios del localStorage:', error);
  return [];
}
};

// Sistema de notificaciones mejorado
export const mostrarNotificacion = (mensaje, tipo = 'info') => {
// Crear contenedor si no existe
let contenedor = document.getElementById('sistema-notificaciones');
if (!contenedor) {
  contenedor = document.createElement('div');
  contenedor.id = 'sistema-notificaciones';
  contenedor.style.position = 'fixed';
  contenedor.style.top = '20px';
  contenedor.style.right = '20px';
  contenedor.style.zIndex = '9999';
  document.body.appendChild(contenedor);
}

// Crear notificación
const notificacion = document.createElement('div');
notificacion.className = `notificacion ${tipo}`;
notificacion.innerHTML = `
  <div class="notificacion-contenido">
    <p>${mensaje}</p>
    <button class="cerrar-notificacion">×</button>
  </div>
`;

contenedor.appendChild(notificacion);

// Mostrar con animación
setTimeout(() => {
  notificacion.classList.add('visible');
}, 10);

// Auto-eliminar después de 3 segundos
const timeout = setTimeout(() => {
  closeNotification(notificacion);
}, 3000);

// Permitir cerrar manualmente
const closeBtn = notificacion.querySelector('.cerrar-notificacion');
closeBtn.addEventListener('click', () => {
  clearTimeout(timeout);
  closeNotification(notificacion);
});
};

const closeNotification = (notificacion) => {
notificacion.classList.remove('visible');
setTimeout(() => {
  notificacion.remove();
}, 300);
};

export const loginUsuarios = async(nombre, contraseña) => {
// Validación básica
if (!nombre || !contraseña) {
  mostrarNotificacion('Por favor ingresa usuario y contraseña', 'error');
  return false;
}

try {
  // Sincronizar admin con localStorage antes de iniciar sesión
  await sincronizarAdmin();
  
  // Obtener la lista actualizada de usuarios (incluyendo al admin)
  const listaUsuarios = cargarUsuarios();
  
  const usuarioEncontrado = listaUsuarios.find(
    usuario => usuario.nombre === nombre && usuario.contraseña === contraseña
  );
  
  if (usuarioEncontrado) {
    mostrarNotificacion(`Bienvenido ${nombre}!`, 'exito');
    
    // Guardar sesión actual
    sessionStorage.setItem('usuarioActual', JSON.stringify({
      id: usuarioEncontrado.id,
      nombre: usuarioEncontrado.nombre,
      clase: usuarioEncontrado.clase
    }));
    
    // Si es admin, establecer variable en localStorage
    if (usuarioEncontrado.clase === 'admin') {
      localStorage.setItem('admin', 'true');
      console.log('Admin conectado: variable admin establecida como true');
    } else {
      // Asegurarse de que no haya una variable admin si no es administrador
      localStorage.removeItem('admin');
    }
    
    return true;
  } else {
    mostrarNotificacion('Usuario o contraseña incorrectos', 'error');
    return false;
  }
} catch (error) {
  console.error('Error en el login:', error);
  mostrarNotificacion('Error al procesar el login', 'error');
  return false;
}
};

// Función para cerrar sesión
export const cerrarSesion = () => {
sessionStorage.removeItem('usuarioActual');
localStorage.removeItem('admin'); // Eliminar la variable admin cuando se cierre sesión
mostrarNotificacion('Sesión cerrada correctamente', 'info');
};

// Función para verificar si hay una sesión activa
export const verificarSesion = () => {
const usuario = sessionStorage.getItem('usuarioActual');
return usuario ? JSON.parse(usuario) : null;
};

// Función para verificar si el usuario actual es administrador
export const esAdmin = () => {
return localStorage.getItem('admin') === 'true';
};

// Función para generar nueva ID
export const nuevaId = () => {
const listaUsuarios = cargarUsuarios();
if (listaUsuarios.length === 0) {
  return 1; // primer usuario
}
const ultimoUsuario = listaUsuarios[listaUsuarios.length - 1];
return ultimoUsuario.id + 1;
};

// Función para crear usuario mejorada
export const crearUsuario = async (nombre, contraseña, confirmarContraseña) => {
// Validaciones mejoradas
if (!nombre || !contraseña) {
  mostrarNotificacion('Por favor completa todos los campos', 'error');
  return false;
}

if (contraseña !== confirmarContraseña) {
  mostrarNotificacion('Las contraseñas no coinciden', 'error');
  return false;
}

if (contraseña.length < 6) {
  mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
  return false;
}

try {
  // Asegurarse de que el admin esté sincronizado antes de crear usuarios
  await sincronizarAdmin();
  const listaUsuarios = cargarUsuarios();
  
  // Verificar si el usuario ya existe
  const verificarUsuario = listaUsuarios.find(usuario => usuario.nombre === nombre);
  if (verificarUsuario) {
    mostrarNotificacion(`El usuario ${nombre} ya existe`, 'error');
    return false;
  }
  
  const nuevoUsuario = {
    id: nuevaId(),
    nombre: nombre,
    contraseña: contraseña, // En producción, hashear esta contraseña
    clase: 'usuario',
    fechaRegistro: new Date().toISOString()
  };
  
  listaUsuarios.push(nuevoUsuario);
  localStorage.setItem('listaUsuarios', JSON.stringify(listaUsuarios));
  mostrarNotificacion(`Usuario ${nombre} creado exitosamente`, 'exito');
  return true;
} catch (error) {
  console.error('Error al crear usuario:', error);
  mostrarNotificacion('Error al crear el usuario', 'error');
  return false;
}
};