// Verificación de administrador
const esAdmin = localStorage.getItem('admin') === 'true';

// Componente de tarjeta de piloto
class DriverCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        const { id, nombre, equipo, rol, imagen } = this.dataset;
        const caracteristicas = this.dataset.caracteristicas ? JSON.parse(this.dataset.caracteristicas) : null;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin: 20px;
                    width: 280px;
                }
    
                .card {
                    position: relative;
                    cursor: pointer;
                    border: 2px solid #e50914;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    background: #111;
                    width: 100%;
                }
    
                .card:hover {
                    transform: scale(1.05);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
                }
    
                img {
                    width: 100%;
                    height: 250px;
                    object-fit: cover;
                    display: block;
                    border-bottom: 2px solid #e50914;
                    background-color: #1a1a1a;
                }
    
                .info {
                    padding: 1rem;
                    background: #222;
                    color: #fff;
                    text-align: center;
                }
    
                .nombre {
                    font-weight: bold;
                    font-size: 1.2rem;
                    margin: 0 0 0.5rem 0;
                    color: #e50914;
                }
    
                .equipo {
                    font-size: 0.9rem;
                    color: #ccc;
                    margin: 0 0 0.5rem 0;
                }
    
                .rol {
                    font-size: 0.8rem;
                    color: #aaa;
                    margin: 0;
                }
    
                .admin-buttons {
                    display: ${esAdmin ? 'flex' : 'none'};
                    justify-content: space-around;
                    padding: 0.5rem;
                    background-color: #111;
                    border-top: 1px solid #333;
                }
    
                button {
                    background-color: #e50914;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    cursor: pointer;
                    border-radius: 5px;
                    font-size: 0.8rem;
                }
    
                button:hover {
                    background-color: #ff1f2d;
                }
            </style>
    
            <div class="card">
                <img src="${imagen}" alt="${nombre}">
                <div class="info">
                    <p class="nombre">${nombre}</p>
                    <p class="equipo">${equipo}</p>
                    <p class="rol">${rol}</p>
                </div>
                <div class="admin-buttons">
                    <button class="editar">Editar</button>
                    <button class="eliminar">Eliminar</button>
                </div>
            </div>
        `;
    
        const cardElement = this.shadowRoot.querySelector('.card');
    
        cardElement.addEventListener('click', (e) => {
            // Evitar que haga click en el detalle si se presiona el botón
            if (e.target.tagName.toLowerCase() === 'button') return;
    
            const detail = document.querySelector('driver-detail');
            detail.setAttribute('name', nombre);
            detail.setAttribute('image', imagen);
            detail.open();
        });
    
        if (esAdmin) {
            this.shadowRoot.querySelector('.editar').addEventListener('click', () => {
                const eventoEditar = new CustomEvent('editar-piloto', {
                    detail: { 
                        id, 
                        nombre, 
                        equipo, 
                        rol, 
                        imagen,
                        caracteristicas: caracteristicas || {
                            frenado: 80,
                            paso_por_curvas: 80,
                            reaccion: 80,
                            control: 80
                        }
                    },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(eventoEditar);
            });
    
            this.shadowRoot.querySelector('.eliminar').addEventListener('click', () => {
                const eventoEliminar = new CustomEvent('eliminar-piloto', {
                    detail: { id },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(eventoEliminar);
            });
        }
    }
}    

customElements.define('driver-card', DriverCard);

// Inicialización y gestión principal de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    const contenedorPilotos = document.getElementById('contenedor-pilotos');
    if (!contenedorPilotos) {
        console.error('No se encontró el elemento #contenedor-pilotos');
        return;
    }
    
    window.pilotosData = []; // Variable global para acceder a los datos de los pilotos
    
    // Identificador único para este conjunto de datos
    const STORAGE_KEY = 'f1_drivers_data';
    // Lista de IDs de pilotos eliminados
    const DELETED_DRIVERS_KEY = 'f1_deleted_drivers';
    
    // Función para obtener los IDs de pilotos eliminados del localStorage
    function getDeletedDriversIds() {
        const deletedIds = localStorage.getItem(DELETED_DRIVERS_KEY);
        return deletedIds ? JSON.parse(deletedIds) : [];
    }
    
    // Función para guardar un ID de piloto eliminado
    function saveDeletedDriverId(id) {
        const deletedIds = getDeletedDriversIds();
        if (!deletedIds.includes(id)) {
            deletedIds.push(id);
            localStorage.setItem(DELETED_DRIVERS_KEY, JSON.stringify(deletedIds));
        }
    }

    // Función para cargar los pilotos desde el archivo JSON excluyendo los eliminados
    function cargarPilotos() {
        // Intentar cargar primero desde localStorage
        const cachedData = localStorage.getItem(STORAGE_KEY);
        
        if (cachedData) {
            // Si tenemos datos en cache, los usamos
            window.pilotosData = JSON.parse(cachedData);
            renderizarPilotos(window.pilotosData);
        } else {
            // Si no hay cache, cargamos del JSON original
            fetch('../db/drivers/drivers.json')
                .then(res => res.json())
                .then(data => {
                    // Filtrar los pilotos eliminados
                    const deletedIds = getDeletedDriversIds();
                    window.pilotosData = data.filter(piloto => !deletedIds.includes(piloto.id.toString()));
                    
                    // Guardar en localStorage para futuras cargas
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.pilotosData));
                    
                    renderizarPilotos(window.pilotosData);
                })
                .catch(error => {
                    console.error('Error loading driver data:', error);
                    contenedorPilotos.innerHTML = '<p>Error al cargar los datos de pilotos</p>';
                });
        }
    }

    // Función para renderizar los pilotos en el DOM
    function renderizarPilotos(pilotos) {
        // Limpiar el contenedor antes de renderizar
        contenedorPilotos.innerHTML = '';
        
        pilotos.forEach(piloto => {
            const card = document.createElement('driver-card');
            card.dataset.id = piloto.id;
            card.dataset.nombre = piloto.nombre;
            card.dataset.equipo = piloto.equipo;
            card.dataset.rol = piloto.rol;
            card.dataset.imagen = piloto.imagen;
            
            // Guardamos las características como JSON string para pasarlas al dataset
            if (piloto.caracteristicas) {
                card.dataset.caracteristicas = JSON.stringify(piloto.caracteristicas);
            }
            
            contenedorPilotos.appendChild(card);
        });
    }

    // Manejadores de eventos globales para editar y eliminar
    contenedorPilotos.addEventListener('editar-piloto', (e) => {
        const piloto = e.detail;
        console.log('Editar piloto:', piloto);
        abrirEditorPilotoModal(piloto);
    });

    contenedorPilotos.addEventListener('eliminar-piloto', (e) => {
        const { id } = e.detail;
        console.log('Eliminar piloto con ID:', id);
        
        // 1. Eliminar el piloto del array de datos en memoria
        window.pilotosData = window.pilotosData.filter(piloto => piloto.id.toString() !== id.toString());
        
        // 2. Guardar el estado actualizado en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(window.pilotosData));
        
        // 3. Añadir el ID a la lista de pilotos eliminados
        saveDeletedDriverId(id);
        
        // 4. Buscar y eliminar la tarjeta del DOM
        const card = [...contenedorPilotos.querySelectorAll('driver-card')].find(c => c.dataset.id === id.toString());
        if (card) {
            contenedorPilotos.removeChild(card);
        }
        
        // Mostrar confirmación
        mostrarNotificacion('Piloto eliminado correctamente');
    });
    
    // Función para mostrar notificaciones (reutilizamos la misma del script de coches)
    if (!window.mostrarNotificacion) {
        window.mostrarNotificacion = function(mensaje) {
            // Crea un elemento de notificación
            const notificacion = document.createElement('div');
            notificacion.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #e50914;
                color: white;
                padding: 15px 25px;
                border-radius: 5px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                z-index: 9999;
                transition: opacity 0.5s ease-out;
            `;
            notificacion.textContent = mensaje;
            document.body.appendChild(notificacion);
            
            // Eliminar después de 3 segundos
            setTimeout(() => {
                notificacion.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(notificacion);
                }, 500);
            }, 3000);
        };
    }

    // Función para resetear todos los pilotos eliminados (útil para testing)
    window.resetearPilotosEliminados = function() {
        localStorage.removeItem(DELETED_DRIVERS_KEY);
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    };

    // Agregar botón para crear nuevos pilotos (solo visible para administradores)
    if (esAdmin) {
        const agregarBtn = document.createElement('button');
        agregarBtn.id = 'agregar-piloto-btn';
        agregarBtn.textContent = 'Agregar Nuevo Piloto';
        agregarBtn.style.cssText = `
            background-color: #e50914;
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 20px;
            cursor: pointer;
            font-size: 1rem;
            border-radius: 5px;
        `;
        
        // Insertar el botón antes del contenedor de pilotos
        document.body.insertBefore(agregarBtn, contenedorPilotos);
        
        // Evento para abrir el modal de agregar piloto
        agregarBtn.addEventListener('click', () => {
            abrirNuevoPilotoModal();
        });
    }

    // Iniciar la aplicación
    cargarPilotos();
});

// Modal para editar y agregar pilotos
document.addEventListener('DOMContentLoaded', () => {
    // Comprobar si el modal ya existe (para evitar duplicados)
    if (!document.getElementById('editor-piloto-modal')) {
        // Crear el modal de edición para pilotos
        const modalHTML = `
            <div id="editor-piloto-modal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Editar Piloto</h2>
                    <form id="editor-piloto-form">
                        <input type="hidden" id="piloto-id">
                        <div class="form-group">
                            <label for="piloto-nombre">Nombre:</label>
                            <input type="text" id="piloto-nombre" required>
                        </div>
                        <div class="form-group">
                            <label for="piloto-equipo">Equipo:</label>
                            <input type="text" id="piloto-equipo" required>
                        </div>
                        <div class="form-group">
                            <label for="piloto-rol">Rol:</label>
                            <input type="text" id="piloto-rol" required>
                        </div>
                        <div class="form-group">
                            <label for="piloto-imagen">URL de la imagen:</label>
                            <input type="text" id="piloto-imagen" required>
                        </div>
                        <hr />
                        <h3>Características</h3>
                        <div class="form-group">
                            <label for="piloto-frenado">Frenado (0-100):</label>
                            <input type="number" id="piloto-frenado" min="0" max="100" value="80">
                        </div>
                        <div class="form-group">
                            <label for="piloto-curvas">Paso por curvas (0-100):</label>
                            <input type="number" id="piloto-curvas" min="0" max="100" value="80">
                        </div>
                        <div class="form-group">
                            <label for="piloto-reaccion">Reacción (0-100):</label>
                            <input type="number" id="piloto-reaccion" min="0" max="100" value="80">
                        </div>
                        <div class="form-group">
                            <label for="piloto-control">Control (0-100):</label>
                            <input type="number" id="piloto-control" min="0" max="100" value="80">
                        </div>
                        <div class="buttons">
                            <button type="button" class="cancelar">Cancelar</button>
                            <button type="submit">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Estilos para el modal
        const modalStyles = `
            <style>
                #editor-piloto-modal {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    overflow: auto;
                    background-color: rgba(0, 0, 0, 0.7);
                }
                
                #editor-piloto-modal .modal-content {
                    background-color: #222;
                    margin: 5% auto;
                    padding: 20px;
                    border: 1px solid #444;
                    width: 80%;
                    max-width: 600px;
                    color: white;
                    border-radius: 8px;
                }
                
                #editor-piloto-modal .close {
                    color: #aaa;
                    float: right;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                }
                
                #editor-piloto-modal .close:hover {
                    color: #e50914;
                }
                
                #editor-piloto-modal h2 {
                    margin-top: 0;
                    color: #e50914;
                }
                
                #editor-piloto-modal h3 {
                    color: #e50914;
                    margin-top: 20px;
                }
                
                #editor-piloto-modal .form-group {
                    margin-bottom: 15px;
                }
                
                #editor-piloto-modal label {
                    display: block;
                    margin-bottom: 5px;
                }
                
                #editor-piloto-modal input {
                    width: 100%;
                    padding: 8px;
                    box-sizing: border-box;
                    background-color: #333;
                    border: 1px solid #555;
                    color: white;
                    border-radius: 4px;
                }
                
                #editor-piloto-modal .buttons {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 20px;
                }
                
                #editor-piloto-modal button {
                    padding: 10px 20px;
                    background-color: #e50914;
                    color: white;
                    border: none;
                    cursor: pointer;
                    border-radius: 4px;
                }
                
                #editor-piloto-modal button.cancelar {
                    background-color: #555;
                }
                
                #editor-piloto-modal button:hover {
                    opacity: 0.9;
                }
                
                #editor-piloto-modal hr {
                    border: 0;
                    height: 1px;
                    background-color: #444;
                    margin: 20px 0;
                }
            </style>
        `;
        
        // Añadir el modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalStyles + modalHTML);
    }
    
    // Obtener referencias al modal y sus elementos
    const modal = document.getElementById('editor-piloto-modal');
    const formulario = document.getElementById('editor-piloto-form');
    const cerrarBtn = modal.querySelector('.close');
    const cancelarBtn = modal.querySelector('.cancelar');
    const modalTitle = modal.querySelector('h2');

    // Función para abrir el modal en modo "agregar nuevo piloto"
    window.abrirNuevoPilotoModal = function () {
        modalTitle.textContent = 'Agregar Nuevo Piloto';
        formulario.reset();
        // Generamos un nuevo ID (el próximo disponible en secuencia)
        const nuevoId = window.pilotosData.length > 0 
            ? Math.max(...window.pilotosData.map(p => parseInt(p.id))) + 1 
            : 1;
        document.getElementById('piloto-id').value = nuevoId;
        modal.style.display = 'block';
    };

    // Función para abrir el modal con los datos del piloto a editar
    window.abrirEditorPilotoModal = function (pilotoData) {
        modalTitle.textContent = 'Editar Piloto';
        document.getElementById('piloto-id').value = pilotoData.id;
        document.getElementById('piloto-nombre').value = pilotoData.nombre;
        document.getElementById('piloto-equipo').value = pilotoData.equipo;
        document.getElementById('piloto-rol').value = pilotoData.rol;
        document.getElementById('piloto-imagen').value = pilotoData.imagen;
        
        // Características
        const caracteristicas = pilotoData.caracteristicas || {};
        document.getElementById('piloto-frenado').value = caracteristicas.frenado || 80;
        document.getElementById('piloto-curvas').value = caracteristicas.paso_por_curvas || 80;
        document.getElementById('piloto-reaccion').value = caracteristicas.reaccion || 80;
        document.getElementById('piloto-control').value = caracteristicas.control || 80;
        
        modal.style.display = 'block';
    };

    // Función para cerrar el modal
    function cerrarEditorPilotoModal() {
        modal.style.display = 'none';
        formulario.reset();
    }

    // Eventos para cerrar el modal
    cerrarBtn.addEventListener('click', cerrarEditorPilotoModal);
    cancelarBtn.addEventListener('click', cerrarEditorPilotoModal);

    // Cerrar el modal si se hace clic fuera del contenido
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            cerrarEditorPilotoModal();
        }
    });

    // Manejar el envío del formulario
    formulario.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('piloto-id').value;
        const nombre = document.getElementById('piloto-nombre').value;
        const equipo = document.getElementById('piloto-equipo').value;
        const rol = document.getElementById('piloto-rol').value;
        const imagen = document.getElementById('piloto-imagen').value;
        
        // Características
        const frenado = parseInt(document.getElementById('piloto-frenado').value, 10);
        const paso_por_curvas = parseInt(document.getElementById('piloto-curvas').value, 10);
        const reaccion = parseInt(document.getElementById('piloto-reaccion').value, 10);
        const control = parseInt(document.getElementById('piloto-control').value, 10);

        const pilotoData = {
            id: parseInt(id),
            nombre,
            equipo,
            rol,
            imagen,
            caracteristicas: {
                frenado,
                paso_por_curvas,
                reaccion,
                control
            }
        };

        const esNuevoPiloto = !window.pilotosData.some(piloto => piloto.id.toString() === id);

        if (esNuevoPiloto) {
            agregarNuevoPiloto(pilotoData);
        } else {
            actualizarPiloto(pilotoData);
        }

        cerrarEditorPilotoModal();
    });

    // Función para agregar un nuevo piloto
    window.agregarNuevoPiloto = function (nuevoPiloto) {
        const STORAGE_KEY = 'f1_drivers_data';
        window.pilotosData.push(nuevoPiloto);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(window.pilotosData));

        const newCard = document.createElement('driver-card');
        newCard.dataset.id = nuevoPiloto.id;
        newCard.dataset.nombre = nuevoPiloto.nombre;
        newCard.dataset.equipo = nuevoPiloto.equipo;
        newCard.dataset.rol = nuevoPiloto.rol;
        newCard.dataset.imagen = nuevoPiloto.imagen;
        newCard.dataset.caracteristicas = JSON.stringify(nuevoPiloto.caracteristicas);

        const contenedor = document.getElementById('contenedor-pilotos');
        contenedor.appendChild(newCard);

        mostrarNotificacion('Nuevo piloto agregado correctamente');
    };

    // Función para actualizar un piloto existente
    window.actualizarPiloto = function (pilotoActualizado) {
        const STORAGE_KEY = 'f1_drivers_data';
        const index = window.pilotosData.findIndex(p => p.id.toString() === pilotoActualizado.id.toString());

        if (index !== -1) {
            window.pilotosData[index] = pilotoActualizado;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(window.pilotosData));

            const card = [...document.querySelectorAll('driver-card')].find(
                c => c.dataset.id === pilotoActualizado.id.toString()
            );

            if (card) {
                const newCard = document.createElement('driver-card');
                newCard.dataset.id = pilotoActualizado.id;
                newCard.dataset.nombre = pilotoActualizado.nombre;
                newCard.dataset.equipo = pilotoActualizado.equipo;
                newCard.dataset.rol = pilotoActualizado.rol;
                newCard.dataset.imagen = pilotoActualizado.imagen;
                newCard.dataset.caracteristicas = JSON.stringify(pilotoActualizado.caracteristicas);

                const contenedor = document.getElementById('contenedor-pilotos');
                contenedor.replaceChild(newCard, card);

                mostrarNotificacion('Piloto actualizado correctamente');
            }
        }
    };
});