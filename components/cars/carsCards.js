// Verificación de administrador
const esAdmin = localStorage.getItem('admin') === 'true';

// Componente de tarjeta de coche
class CarCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        const { equipo, modelo, motor, imagen, id, velocidad, aceleracion, pilotos } = this.dataset;
    
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin: 20px;
                    width: 320px;
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
                    height: 150px;
                    object-fit: contain;
                    display: block;
                    border-bottom: 2px solid #e50914;
                    background-color: #1a1a1a;
                    padding: 10px 0;
                }
    
                .info {
                    padding: 1rem;
                    background: #222;
                    color: #fff;
                    text-align: center;
                }
    
                .modelo {
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
    
                .motor {
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
                <img src="${imagen}" alt="${modelo}">
                <div class="info">
                    <p class="modelo">${modelo}</p>
                    <p class="equipo">${equipo}</p>
                    <p class="motor">Motor: ${motor}</p>
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
    
            const detail = document.querySelector('car-detail');
            detail.setAttribute('equipo', equipo);
            detail.setAttribute('modelo', modelo);
            detail.setAttribute('motor', motor);
            detail.setAttribute('imagen', imagen);
            detail.setAttribute('id', id);
            detail.setAttribute('modelo3d_id', id); // Aseguramos que modelo3d_id se pase correctamente
            
            // Establecer los nuevos atributos si existen
            if (velocidad) detail.setAttribute('velocidad', velocidad);
            if (aceleracion) detail.setAttribute('aceleracion', aceleracion);
            if (pilotos) detail.setAttribute('pilotos', pilotos);
            
            detail.open();
        });
    
        if (esAdmin) {
            this.shadowRoot.querySelector('.editar').addEventListener('click', () => {
                const eventoEditar = new CustomEvent('editar-coche', {
                    detail: { 
                        id, 
                        equipo, 
                        modelo, 
                        motor, 
                        imagen,
                        velocidad: velocidad || '',
                        aceleracion: aceleracion || '',
                        pilotos: pilotos || ''
                    },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(eventoEditar);
            });
    
            this.shadowRoot.querySelector('.eliminar').addEventListener('click', () => {
                const eventoEliminar = new CustomEvent('eliminar-coche', {
                    detail: { id },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(eventoEliminar);
            });
        }
    }
}    

customElements.define('car-card', CarCard);

// Inicialización y gestión principal de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('contenedor-coches');
    window.cochesData = []; // Variable global para acceder a los datos de los coches
    
    // Identificador único para este conjunto de datos
    const STORAGE_KEY = 'f1_cars_data';
    // Lista de IDs de coches eliminados
    const DELETED_CARS_KEY = 'f1_deleted_cars';
    
    // Función para obtener los IDs de coches eliminados del localStorage
    function getDeletedCarsIds() {
        const deletedIds = localStorage.getItem(DELETED_CARS_KEY);
        return deletedIds ? JSON.parse(deletedIds) : [];
    }
    
    // Función para guardar un ID de coche eliminado
    function saveDeletedCarId(id) {
        const deletedIds = getDeletedCarsIds();
        if (!deletedIds.includes(id)) {
            deletedIds.push(id);
            localStorage.setItem(DELETED_CARS_KEY, JSON.stringify(deletedIds));
        }
    }

    // Función para cargar los coches desde el archivo JSON excluyendo los eliminados
    function cargarCoches() {
        // Intentar cargar primero desde localStorage
        const cachedData = localStorage.getItem(STORAGE_KEY);
        
        if (cachedData) {
            // Si tenemos datos en cache, los usamos
            window.cochesData = JSON.parse(cachedData);
            renderizarCoches(window.cochesData);
        } else {
            // Si no hay cache, cargamos del JSON original
            fetch('../db/cars/cars.json')
                .then(res => res.json())
                .then(data => {
                    // Filtrar los coches eliminados
                    const deletedIds = getDeletedCarsIds();
                    window.cochesData = data.filter(coche => !deletedIds.includes(coche.modelo3d_id));
                    
                    // Guardar en localStorage para futuras cargas
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.cochesData));
                    
                    renderizarCoches(window.cochesData);
                })
                .catch(error => {
                    console.error('Error loading car data:', error);
                    contenedor.innerHTML = '<p>Error al cargar los datos de coches</p>';
                });
        }
    }

    // Función para renderizar los coches en el DOM
    function renderizarCoches(coches) {
        // Limpiar el contenedor antes de renderizar
        contenedor.innerHTML = '';
        
        coches.forEach(coche => {
            const card = document.createElement('car-card');
            card.dataset.id = coche.modelo3d_id;
            card.dataset.equipo = coche.equipo;
            card.dataset.modelo = coche.modelo;
            card.dataset.motor = coche.motor;
            card.dataset.imagen = coche.imagen;
            
            // Añadir los nuevos atributos si existen
            if (coche.velocidad) card.dataset.velocidad = coche.velocidad;
            if (coche.aceleracion) card.dataset.aceleracion = coche.aceleracion;
            if (coche.pilotos) card.dataset.pilotos = coche.pilotos;
            
            contenedor.appendChild(card);
        });
    }

    // Manejadores de eventos globales para editar y eliminar
    contenedor.addEventListener('editar-coche', (e) => {
        const coche = e.detail;
        console.log('Editar coche:', coche);
        abrirEditorModal(coche);
    });

    contenedor.addEventListener('eliminar-coche', (e) => {
        const { id } = e.detail;
        console.log('Eliminar coche con ID:', id);
        
        // 1. Eliminar el coche del array de datos en memoria
        window.cochesData = window.cochesData.filter(coche => coche.modelo3d_id !== id);
        
        // 2. Guardar el estado actualizado en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(window.cochesData));
        
        // 3. Añadir el ID a la lista de coches eliminados
        saveDeletedCarId(id);
        
        // 4. Buscar y eliminar la tarjeta del DOM
        const card = [...contenedor.querySelectorAll('car-card')].find(c => c.dataset.id === id);
        if (card) {
            contenedor.removeChild(card);
        }
        
        // Opcional: Mostrar confirmación
        mostrarNotificacion('Coche eliminado correctamente');
    });
    
    // Función para mostrar notificaciones
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

    // Función para resetear todos los coches eliminados (útil para testing)
    window.resetearCochesEliminados = function() {
        localStorage.removeItem(DELETED_CARS_KEY);
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    };

    // NUEVA FUNCIÓN: Agregar botón para crear nuevos coches
    if (esAdmin) {
        // Crear botón para agregar coches (solo visible para administradores)
        const agregarBtn = document.createElement('button');
        agregarBtn.id = 'agregar-coche-btn';
        agregarBtn.textContent = 'Agregar Nuevo Coche';
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
        
        // Insertar el botón antes del contenedor de coches
        document.body.insertBefore(agregarBtn, contenedor);
        
        // Evento para abrir el modal de agregar coche
        agregarBtn.addEventListener('click', () => {
            abrirNuevoCocheModal();
        });
    }

    // Iniciar la aplicación
    cargarCoches();
});

// Gestión del modal para editar y agregar coches
document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias al modal y sus elementos
    const modal = document.getElementById('editor-modal');
    const formulario = document.getElementById('editor-form');
    const cerrarBtn = modal.querySelector('.close');
    const cancelarBtn = modal.querySelector('.cancelar');
    const modalTitle = modal.querySelector('h2');

    // Función para abrir el modal en modo "agregar nuevo coche"
    window.abrirNuevoCocheModal = function () {
        modalTitle.textContent = 'Agregar Nuevo Coche';
        formulario.reset();
        document.getElementById('coche-id').value = 'car_' + Date.now();
        modal.style.display = 'block';
    };

    // Función para abrir el modal con los datos del coche a editar
    window.abrirEditorModal = function (cocheData) {
        modalTitle.textContent = 'Editar Coche';
        document.getElementById('coche-id').value = cocheData.id;
        document.getElementById('coche-equipo').value = cocheData.equipo;
        document.getElementById('coche-modelo').value = cocheData.modelo;
        document.getElementById('coche-motor').value = cocheData.motor;
        document.getElementById('coche-imagen').value = cocheData.imagen;
        document.getElementById('coche-velocidad').value = cocheData.velocidad || '';
        document.getElementById('coche-aceleracion').value = cocheData.aceleracion || '';
        document.getElementById('coche-pilotos').value = cocheData.pilotos || '';
        modal.style.display = 'block';
    };

    // Función para cerrar el modal
    function cerrarEditorModal() {
        modal.style.display = 'none';
        formulario.reset();
    }

    // Eventos para cerrar el modal
    cerrarBtn.addEventListener('click', cerrarEditorModal);
    cancelarBtn.addEventListener('click', cerrarEditorModal);

    // Cerrar el modal si se hace clic fuera del contenido
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            cerrarEditorModal();
        }
    });

    // Manejar el envío del formulario
    formulario.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('coche-id').value;
        const equipo = document.getElementById('coche-equipo').value;
        const modelo = document.getElementById('coche-modelo').value;
        const motor = document.getElementById('coche-motor').value;
        const imagen = document.getElementById('coche-imagen').value;
        const velocidad = document.getElementById('coche-velocidad').value;
        const aceleracion = document.getElementById('coche-aceleracion').value;
        const pilotos = document.getElementById('coche-pilotos').value;

        const cocheData = {
            modelo3d_id: id,
            equipo,
            modelo,
            motor,
            imagen,
            velocidad: velocidad ? parseInt(velocidad, 10) : null,
            aceleracion: aceleracion ? parseFloat(aceleracion) : null,
            pilotos: pilotos ? pilotos.trim() : null,
        };

        const esNuevoCoche = !window.cochesData.some(coche => coche.modelo3d_id === id);

        if (esNuevoCoche) {
            agregarNuevoCoche(cocheData);
        } else {
            actualizarCoche(cocheData);
        }

        cerrarEditorModal();
    });

    // Función para agregar un nuevo coche
window.agregarNuevoCoche = function (nuevoCoche) {
    const STORAGE_KEY = 'f1_cars_data';
    window.cochesData.push(nuevoCoche);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.cochesData));

    const newCard = document.createElement('car-card');
    newCard.dataset.id = nuevoCoche.modelo3d_id;
    newCard.dataset.equipo = nuevoCoche.equipo;
    newCard.dataset.modelo = nuevoCoche.modelo;
    newCard.dataset.motor = nuevoCoche.motor;
    newCard.dataset.imagen = nuevoCoche.imagen;

    if (nuevoCoche.velocidad !== null) newCard.dataset.velocidad = nuevoCoche.velocidad;
    if (nuevoCoche.aceleracion !== null) newCard.dataset.aceleracion = nuevoCoche.aceleracion;
    if (nuevoCoche.pilotos !== null) newCard.dataset.pilotos = nuevoCoche.pilotos;

    const contenedor = document.getElementById('contenedor-coches');
    contenedor.appendChild(newCard);

    mostrarNotificacion('Nuevo coche agregado correctamente');
};


    // Función para actualizar un coche existente
    window.actualizarCoche = function (cocheActualizado) {
        const STORAGE_KEY = 'f1_cars_data';
        const index = window.cochesData.findIndex(c => c.modelo3d_id === cocheActualizado.modelo3d_id);

        if (index !== -1) {
            window.cochesData[index] = {
                ...window.cochesData[index],
                ...cocheActualizado,
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(window.cochesData));

            const card = [...document.querySelectorAll('car-card')].find(
                c => c.dataset.id === cocheActualizado.modelo3d_id
            );

            if (card) {
                const newCard = document.createElement('car-card');
                newCard.dataset.id = cocheActualizado.modelo3d_id;
                newCard.dataset.equipo = cocheActualizado.equipo;
                newCard.dataset.modelo = cocheActualizado.modelo;
                newCard.dataset.motor = cocheActualizado.motor;
                newCard.dataset.imagen = cocheActualizado.imagen;

                if (cocheActualizado.velocidad !== null) newCard.dataset.velocidad = cocheActualizado.velocidad;
                if (cocheActualizado.aceleracion !== null) newCard.dataset.aceleracion = cocheActualizado.aceleracion;
                if (cocheActualizado.pilotos !== null) newCard.dataset.pilotos = cocheActualizado.pilotos;

                const contenedor = document.getElementById('contenedor-coches');
                contenedor.replaceChild(newCard, card);

                mostrarNotificacion('Coche actualizado correctamente');
            }
        }
    };
});
