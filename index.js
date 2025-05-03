// Import funciones de gestión de usuarios
import { crearUsuario, loginUsuarios, mostrarNotificacion, cerrarSesion, verificarSesion, sincronizarAdmin, esAdmin } from './components/db/users.js';

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
window.addEventListener('load', async () => {
    const loader = document.getElementById('f1-loader');
    const barFill = document.getElementById('f1-bar-fill');
    
    // Sincronizar el administrador con localStorage al cargar la página
    await sincronizarAdmin();
    
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
            
            // Actualizar la interfaz para reflejar el inicio de sesión
            actualizarInterfazUsuario();
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

// Función para actualizar la interfaz según el usuario
function actualizarInterfazUsuario() {
    const usuarioActual = verificarSesion();
    const esAdministrador = esAdmin();
    
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
            document.getElementById('logout-btn').addEventListener('click', () => {
                cerrarSesion();
                // Recargar la página para actualizar la interfaz
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            });
        }
        
        // Si es admin, mostrar enlaces o funcionalidades de administrador
        if (esAdministrador) {
            const adminPanel = document.getElementById('admin-panel');
            if (adminPanel) {
                adminPanel.style.display = 'block';
            }
        }
    }
}

// Verificar sesión al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Sincronizar admin con localStorage
    sincronizarAdmin().then(() => {
        // Verificar sesión y actualizar interfaz
        actualizarInterfazUsuario();
    });
});

const noticias = [
    {
      "titulo": "F1 implementa cambio de regla en pit lane tras incidente en Australia",
      "resumen": "La FIA ha modificado el artículo 55.14 del reglamento deportivo, permitiendo al director de carrera cerrar la salida de boxes durante el safety car para evitar que autos rezagados alteren el orden de la carrera.",
      "fecha": "2025-05-02",
      "fuente": "The Scottish Sun",
      "url": "https://www.thescottishsun.co.uk/sport/14731574/f1-rule-change-close-pit-safety-car-verstappen/"
    },
    {
      "titulo": "F1 extiende contrato con el GP de Miami hasta 2041",
      "resumen": "La Fórmula 1 ha firmado una extensión de 10 años con el Gran Premio de Miami, asegurando su presencia en el calendario hasta 2041.",
      "fecha": "2025-05-02",
      "fuente": "AP News",
      "url": "https://apnews.com/article/e5e97f2a14f8e5c57cb1bb3e788cb894"
    },
    {
      "titulo": "Ralf Schumacher sugiere que Hamilton podría retirarse antes de 2026",
      "resumen": "Ralf Schumacher ha insinuado que Lewis Hamilton podría considerar retirarse de la F1 antes de que finalice su contrato con Ferrari en 2026, debido a su falta de competitividad y disfrute.",
      "fecha": "2025-05-02",
      "fuente": "The Sun",
      "url": "https://www.thesun.ie/sport/15143733/lewis-hamilton-f1-retire-ralf-schumacher/"
    },
    {
      "titulo": "McLaren olvida herramientas en el cockpit de Norris durante libres en Miami",
      "resumen": "Durante los entrenamientos libres del GP de Miami, Lando Norris encontró dos linternas olvidadas en su asiento, lo que le obligó a regresar a boxes.",
      "fecha": "2025-05-02",
      "fuente": "Cadena SER",
      "url": "https://cadenaser.com/nacional/2025/05/02/dos-linternas-entre-las-piernas-el-olvido-de-mclaren-que-sorprendio-a-norris-durante-los-libres-en-miami-cadena-ser/"
    },
    {
      "titulo": "Cadillac se unirá a la F1 como el 11º equipo en 2026",
      "resumen": "General Motors, a través de su marca Cadillac, ingresará a la Fórmula 1 en 2026 como el undécimo equipo en la parrilla.",
      "fecha": "2025-05-02",
      "fuente": "Axios",
      "url": "https://www.axios.com/2025/05/02/miami-grand-prix-axios-event-cadillac-team"
    },
    {
      "titulo": "Lando Norris clasifica tercero para la carrera sprint en Miami",
      "resumen": "Lando Norris mostró confianza al clasificar tercero para la carrera sprint del GP de Miami, mientras su compañero Piastri obtuvo la pole.",
      "fecha": "2025-05-02",
      "fuente": "The Guardian",
      "url": "https://www.theguardian.com/sport/2025/may/02/lando-norris--f1-miami-formula-one-sprint-race"
    },
    {
      "titulo": "Hamilton lidera petición para que pilotos tengan más voz ante la FIA",
      "resumen": "Lewis Hamilton aboga por una mayor participación de los pilotos en las decisiones de la FIA, tras sanciones por declaraciones políticas y lenguaje inapropiado.",
      "fecha": "2025-05-01",
      "fuente": "The Guardian",
      "url": "https://www.theguardian.com/sport/2025/may/01/lewis-hamilton-leads-call-f1-drivers-more-say-talks-fia"
    },
    {
      "titulo": "Andrea Kimi Antonelli logra su primera pole en clasificación sprint",
      "resumen": "El joven piloto de Mercedes, Andrea Kimi Antonelli, consiguió su primera pole position en la clasificación sprint del GP de Miami.",
      "fecha": "2025-05-02",
      "fuente": "Mundo Deportivo",
      "url": "https://www.mundodeportivo.com/motor/f1"
    },
    {
      "titulo": "GP de México continuará en el calendario de F1 hasta 2028",
      "resumen": "La Fórmula 1 ha confirmado la extensión del contrato con el Gran Premio de México, asegurando su presencia hasta al menos 2028.",
      "fecha": "2025-04-30",
      "fuente": "Motorsport.com",
      "url": "https://es.motorsport.com/f1/news/"
    },
    {
      "titulo": "Verstappen se convierte en padre y se ausenta de la jornada de medios en Miami",
      "resumen": "Max Verstappen fue padre recientemente y se ausentó de la jornada de medios del jueves en el GP de Miami, aunque participará en las sesiones del fin de semana.",
      "fecha": "2025-05-02",
      "fuente": "Motorsport.com",
      "url": "https://es.motorsport.com/f1/news/"
    }
  ];

  // Esperar a que el DOM esté cargado
  document.addEventListener('DOMContentLoaded', function() {
    // Simular carga
    setTimeout(() => {
      document.getElementById('f1-loader').style.opacity = '0';
      setTimeout(() => {
        document.getElementById('f1-loader').style.display = 'none';
      }, 500);
    }, 3000);
    
    // Inicializar noticias
    inicializarNoticias();
    
    // Event listeners para controles del carrusel
    document.querySelector('.carrusel-prev').addEventListener('click', () => moverCarrusel(-1));
    document.querySelector('.carrusel-next').addEventListener('click', () => moverCarrusel(1));
    
    // Cerrar modal al hacer clic en el botón de cerrar
    document.getElementById('modal-close').addEventListener('click', cerrarModa);
    
    // Cerrar modal al hacer clic fuera del contenido
    document.getElementById('modal-noticia').addEventListener('click', function(e) {
      if (e.target === this) {
        cerrarModa();
      }
    });
  });

  // Variables para el carrusel
  let posicionActual = 0;
  const itemsVisibles = window.innerWidth > 992 ? 3 : window.innerWidth > 768 ? 2 : 1;
  const totalSlides = Math.ceil(6 / itemsVisibles);

  function inicializarNoticias() {
    const carruselContainer = document.getElementById('carrusel-noticias');
    const noticiasEstaticasContainer = document.getElementById('noticias-estaticas');
    const indicadoresContainer = document.getElementById('indicadores');
    
    // Limpiar contenedores
    carruselContainer.innerHTML = '';
    noticiasEstaticasContainer.innerHTML = '';
    indicadoresContainer.innerHTML = '';
    
    // Agregar noticias al carrusel (primeras 6)
    for (let i = 0; i < 6; i++) {
      if (i < noticias.length) {
        const noticia = noticias[i];
        const noticiaElement = crearElementoNoticia(noticia, i);
        carruselContainer.appendChild(noticiaElement);
      }
    }
    
    // Agregar noticias estáticas (siguientes 4)
    for (let i = 6; i < 10; i++) {
      if (i < noticias.length) {
        const noticia = noticias[i];
        const noticiaElement = crearElementoNoticia(noticia, i);
        noticiasEstaticasContainer.appendChild(noticiaElement);
      }
    }
    
    // Crear indicadores para el carrusel
    for (let i = 0; i < totalSlides; i++) {
      const indicador = document.createElement('div');
      indicador.className = 'indicador' + (i === 0 ? ' active' : '');
      indicador.dataset.slide = i;
      indicador.addEventListener('click', () => {
        irASlide(i);
      });
      indicadoresContainer.appendChild(indicador);
    }
    
    // Ajustar ancho de los items del carrusel
    const carruselItems = document.querySelectorAll('.carrusel-item');
    carruselItems.forEach(item => {
      item.style.minWidth = `${100 / itemsVisibles}%`;
    });
  }

  function crearElementoNoticia(noticia, index) {
    const noticiaItem = document.createElement('div');
    noticiaItem.className = 'carrusel-item';
    
    noticiaItem.innerHTML = `
      <div class="noticia-card" data-index="${index}">
        <div class="noticia-header">
          <h3 class="noticia-titulo">${noticia.titulo}</h3>
        </div>
        <div class="noticia-body">
          <p class="noticia-resumen">${noticia.resumen}</p>
        </div>
        <div class="noticia-footer">
          <span>${noticia.fecha}</span>
          <span>${noticia.fuente}</span>
        </div>
      </div>
    `;
    
    // Agregar evento click para abrir el modal
    noticiaItem.querySelector('.noticia-card').addEventListener('click', () => {
      abrirModal(noticia);
    });
    
    return noticiaItem;
  }

  function moverCarrusel(direccion) {
    const totalSlides = Math.ceil(6 / itemsVisibles);
    posicionActual += direccion;
    
    // Manejar el bucle del carrusel
    if (posicionActual < 0) posicionActual = totalSlides - 1;
    if (posicionActual >= totalSlides) posicionActual = 0;
    
    actualizarCarrusel();
  }

  function irASlide(indice) {
    posicionActual = indice;
    actualizarCarrusel();
  }

  function actualizarCarrusel() {
    const carruselInner = document.querySelector('.carrusel-inner');
    const slideWidth = 100 / itemsVisibles;
    const desplazamiento = -posicionActual * slideWidth * itemsVisibles;
    
    carruselInner.style.transform = `translateX(${desplazamiento}%)`;
    
    // Actualizar indicadores activos
    const indicadores = document.querySelectorAll('.indicador');
    indicadores.forEach((ind, i) => {
      ind.classList.toggle('active', i === posicionActual);
    });
  }

  function abrirModal(noticia) {
    document.getElementById('modal-titulo').textContent = noticia.titulo;
    document.getElementById('modal-resumen').textContent = noticia.resumen;
    document.getElementById('modal-fecha').textContent = `Fecha: ${noticia.fecha}`;
    document.getElementById('modal-fuente').textContent = `Fuente: ${noticia.fuente}`;
    document.getElementById('modal-url').href = noticia.url;
    
    document.getElementById('modal-noticia').classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevenir scroll
  }

  function cerrarModa() {
    document.getElementById('modal-noticia').classList.remove('active');
    document.body.style.overflow = 'auto'; // Restaurar scroll
  }

  // Ajustar el carrusel cuando cambia el tamaño de la ventana
  window.addEventListener('resize', function() {
    const newItemsVisibles = window.innerWidth > 992 ? 3 : window.innerWidth > 768 ? 2 : 1;
    
    if (newItemsVisibles !== itemsVisibles) {
      // Reinicializar el carrusel con la nueva configuración
      posicionActual = 0;
      inicializarNoticias();
    }
  });