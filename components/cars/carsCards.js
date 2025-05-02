const esAdmin = localStorage.getItem('admin') === 'true';

class CarCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        const { equipo, modelo, motor, imagen, id } = this.dataset;
    
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
            detail.open();
        });
    
        if (esAdmin) {
            this.shadowRoot.querySelector('.editar').addEventListener('click', () => {
                const eventoEditar = new CustomEvent('editar-coche', {
                    detail: { id, equipo, modelo, motor, imagen },
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

document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('contenedor-coches');
    let cochesData = [];
    // Identificador único para este conjunto de datos (puedes cambiarlo si tienes múltiples conjuntos)
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
            cochesData = JSON.parse(cachedData);
            renderizarCoches(cochesData);
        } else {
            // Si no hay cache, cargamos del JSON original
            fetch('../db/cars/cars.json')
                .then(res => res.json())
                .then(data => {
                    // Filtrar los coches eliminados
                    const deletedIds = getDeletedCarsIds();
                    cochesData = data.filter(coche => !deletedIds.includes(coche.modelo3d_id));
                    
                    // Guardar en localStorage para futuras cargas
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(cochesData));
                    
                    renderizarCoches(cochesData);
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
            contenedor.appendChild(card);
        });
    }

    // Manejadores de eventos globales para editar y eliminar
    contenedor.addEventListener('editar-coche', (e) => {
        const coche = e.detail;
        console.log('Editar coche:', coche);
        // Aquí puedes abrir un formulario con los datos de coche para editarlo
    });

    contenedor.addEventListener('eliminar-coche', (e) => {
        const { id } = e.detail;
        console.log('Eliminar coche con ID:', id);
        
        // 1. Eliminar el coche del array de datos en memoria
        cochesData = cochesData.filter(coche => coche.modelo3d_id !== id);
        
        // 2. Guardar el estado actualizado en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cochesData));
        
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
    function mostrarNotificacion(mensaje) {
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
        }, 1000);
    }

    // Función para resetear todos los coches eliminados (útil para testing)
    window.resetearCochesEliminados = function() {
        localStorage.removeItem(DELETED_CARS_KEY);
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    };

    // Iniciar la aplicación
    cargarCoches();
});


document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias al modal y sus elementos
    const modal = document.getElementById('editor-modal');
    const formulario = document.getElementById('editor-form');
    const cerrarBtn = modal.querySelector('.close');
    const cancelarBtn = modal.querySelector('.cancelar');
    
    // Función para abrir el modal con los datos del coche
    function abrirEditorModal(cocheData) {
        // Llenar el formulario con los datos del coche
        document.getElementById('coche-id').value = cocheData.id;
        document.getElementById('coche-equipo').value = cocheData.equipo;
        document.getElementById('coche-modelo').value = cocheData.modelo;
        document.getElementById('coche-motor').value = cocheData.motor;
        document.getElementById('coche-imagen').value = cocheData.imagen;
        
        // Mostrar el modal
        modal.style.display = 'block';
    }
    
    // Función para cerrar el modal
    function cerrarEditorModal() {
        modal.style.display = 'none';
        formulario.reset();
    }
    
    // Manejar el evento de editar coche
    document.getElementById('contenedor-coches').addEventListener('editar-coche', (e) => {
        const coche = e.detail;
        console.log('Editar coche:', coche);
        abrirEditorModal(coche);
    });
    
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
        
        // Obtener los valores del formulario
        const id = document.getElementById('coche-id').value;
        const equipo = document.getElementById('coche-equipo').value;
        const modelo = document.getElementById('coche-modelo').value;
        const motor = document.getElementById('coche-motor').value;
        const imagen = document.getElementById('coche-imagen').value;
        
        // Actualizar los datos en el array y localStorage
        actualizarCoche({ modelo3d_id: id, equipo, modelo, motor, imagen });
        
        // Cerrar el modal
        cerrarEditorModal();
    });
    
    // Función para mostrar notificaciones
    function mostrarNotificacion(mensaje) {
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
        }, 1000);
    }
    
    function actualizarCoche(cocheActualizado) {
        // Obtenemos la referencia a los datos actuales
        const STORAGE_KEY = 'f1_cars_data';
        let cochesData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        // Encontrar y actualizar el coche
        const index = cochesData.findIndex(c => c.modelo3d_id === cocheActualizado.modelo3d_id);
        
        if (index !== -1) {
            // Actualizar el coche en el array
            cochesData[index] = {
                ...cochesData[index],
                equipo: cocheActualizado.equipo,
                modelo: cocheActualizado.modelo,
                motor: cocheActualizado.motor,
                imagen: cocheActualizado.imagen
            };
            
            // Guardar en localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cochesData));
            
            // Actualizar la tarjeta en el DOM
            const card = [...document.querySelectorAll('car-card')].find(
                c => c.dataset.id === cocheActualizado.modelo3d_id
            );
            
            if (card) {
                // Actualizar los datos del componente
                card.dataset.equipo = cocheActualizado.equipo;
                card.dataset.modelo = cocheActualizado.modelo;
                card.dataset.motor = cocheActualizado.motor;
                card.dataset.imagen = cocheActualizado.imagen;
                
                // Crear una nueva tarjeta con los datos actualizados
                const newCard = document.createElement('car-card');
                newCard.dataset.id = cocheActualizado.modelo3d_id;
                newCard.dataset.equipo = cocheActualizado.equipo;
                newCard.dataset.modelo = cocheActualizado.modelo;
                newCard.dataset.motor = cocheActualizado.motor;
                newCard.dataset.imagen = cocheActualizado.imagen;
                
                // Obtener una referencia al contenedor para reemplazar
                const contenedor = document.getElementById('contenedor-coches');
                
                // Eliminar el componente antiguo
                const oldCard = card;
                const nextSibling = oldCard.nextElementSibling;
                oldCard.remove();
                
                // Insertar el nuevo componente en la misma posición
                if (nextSibling) {
                    contenedor.insertBefore(newCard, nextSibling);
                } else {
                    contenedor.appendChild(newCard);
                }
                
                // También actualizar el detalle si está abierto
                const detail = document.querySelector('car-detail');
                if (detail && detail._isOpen && detail.getAttribute('modelo') === cocheActualizado.modelo) {
                    detail.setAttribute('equipo', cocheActualizado.equipo);
                    detail.setAttribute('modelo', cocheActualizado.modelo);
                    detail.setAttribute('motor', cocheActualizado.motor);
                    detail.setAttribute('imagen', cocheActualizado.imagen);
                    detail.setAttribute('id', cocheActualizado.modelo3d_id);
                    detail.setAttribute('modelo3d_id', cocheActualizado.modelo3d_id);
                    
                    // Forzar una recarga de los detalles
                    detail.loadFullDetails();
                }
            }
            
            // Mostrar notificación
            mostrarNotificacion('Coche actualizado correctamente');
        }
    }
}
);    