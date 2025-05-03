const esAdmin = localStorage.getItem('admin') === 'true';

// Componente de tarjeta de equipo
class TeamCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        const { id, nombre, pais, motor, imagen } = this.dataset;
        const pilotos = this.dataset.pilotos ? JSON.parse(this.dataset.pilotos) : [];

        this.shadowRoot.innerHTML = `
            <style>
            :host {
                display: block;
                margin: 20px;
                width: 320px;
                font-family: 'Roboto', 'Segoe UI', sans-serif;
            }
            
            .card {
                cursor: pointer;
                border: none;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                background: linear-gradient(145deg, #1a1a1a, #111);
                width: 100%;
                position: relative;
            }
            
            .card:hover {
                transform: translateY(-8px);
                box-shadow: 0 15px 30px rgba(229, 9, 20, 0.3);
            }
            
            .card::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: linear-gradient(90deg, #e50914, #ff3d47, #e50914);
                background-size: 200% 100%;
                animation: gradientShift 3s ease infinite;
            }
            
            @keyframes gradientShift {
                0% {background-position: 0% 50%}
                50% {background-position: 100% 50%}
                100% {background-position: 0% 50%}
            }
            
            img {
                width: 100%;
                height: 220px;
                object-fit: contain;
                display: block;
                background-color:rgb(255, 255, 255);
                padding: 15px 0;
                transition: transform 0.3s ease;
            }
            
            .card:hover img {
                transform: scale(1.05);
            }
            
            .info {
                padding: 1.2rem;
                background: linear-gradient(to bottom, #222, #181818);
                color: #fff;
                text-align: center;
                position: relative;
            }
            
            .nombre {
                font-weight: 600;
                font-size: 1.3rem;
                margin: 0 0 0.6rem 0;
                color: #fff;
                text-shadow: 0 0 10px rgba(229, 9, 20, 0.7);
                letter-spacing: 0.5px;
            }
            
            .pais {
                font-size: 0.95rem;
                color: #e50914;
                margin: 0;
                font-weight: 500;
                opacity: 0.9;
                letter-spacing: 0.5px;
            }

            .motor {
                font-size: 0.9rem;
                color: #ccc;
                margin: 0.5rem 0 0 0;
                font-weight: 400;
            }
            
            .card:active {
                transform: scale(0.98);
            }
            
            /* Detalles de estilo tipo F1 */
            .info::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 1px;
                background: linear-gradient(90deg, transparent 0%, rgba(229, 9, 20, 0.8) 50%, transparent 100%);
            }
            
            /* Efecto de viñeta en las esquinas */
            .card::before {
                content: "";
                position: absolute;
                inset: 0;
                border-radius: 12px;
                padding: 2px;
                background: linear-gradient(45deg, transparent, rgba(229, 9, 20, 0.5), transparent);
                -webkit-mask: 
                    linear-gradient(#fff 0 0) content-box, 
                    linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
                pointer-events: none;
            }

            .admin-buttons {
                display: ${esAdmin ? 'flex' : 'none'};
                justify-content: space-around;
                padding: 0.8rem;
                background-color: #111;
                border-top: 1px solid #333;
            }

            button {
                background-color: #e50914;
                color: white;
                border: none;
                padding: 6px 15px;
                cursor: pointer;
                border-radius: 5px;
                font-size: 0.9rem;
                font-weight: 500;
                transition: all 0.2s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            button:hover {
                background-color: #ff1f2d;
                transform: translateY(-2px);
                box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
            }

            button:active {
                transform: translateY(0);
                box-shadow: none;
            }
            </style>
            <div class="card">
                <img src="${imagen}" alt="${nombre}">
                <div class="info">
                    <p class="nombre">${nombre}</p>
                    <p class="pais">${pais}</p>
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
            
            const detail = document.querySelector('team-detail');
            detail.setAttribute('nombre', nombre);
            detail.setAttribute('pais', pais);
            detail.setAttribute('imagen', imagen);
            detail.setAttribute('motor', motor);
            
            setTimeout(() => {
                detail.open();
            }, 50);
        });

        if (esAdmin) {
            this.shadowRoot.querySelector('.editar').addEventListener('click', () => {
                const eventoEditar = new CustomEvent('editar-team', {
                    detail: { 
                        id, 
                        nombre, 
                        pais, 
                        motor, 
                        imagen,
                        pilotos: pilotos || []
                    },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(eventoEditar);
            });

            this.shadowRoot.querySelector('.eliminar').addEventListener('click', () => {
                const eventoEliminar = new CustomEvent('eliminar-team', {
                    detail: { id },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(eventoEliminar);
            });
        }
    }
}

customElements.define("team-card", TeamCard);

// Inicialización y gestión principal de la aplicación
document.addEventListener("DOMContentLoaded", () => {
    const contenedorTeams = document.getElementById("contenedor-teams");
    if (!contenedorTeams) {
        console.error('No se encontró el elemento #contenedor-teams');
        return;
    }
    
    window.teamsData = []; // Variable global para acceder a los datos de los equipos
    
    // Identificador único para este conjunto de datos
    const STORAGE_KEY = 'f1_teams_data';
    // Lista de IDs de equipos eliminados
    const DELETED_TEAMS_KEY = 'f1_deleted_teams';
    
    // Función para obtener los IDs de equipos eliminados del localStorage
    function getDeletedTeamsIds() {
        const deletedIds = localStorage.getItem(DELETED_TEAMS_KEY);
        return deletedIds ? JSON.parse(deletedIds) : [];
    }
    
    // Función para guardar un ID de equipo eliminado
    function saveDeletedTeamId(id) {
        const deletedIds = getDeletedTeamsIds();
        if (!deletedIds.includes(id)) {
            deletedIds.push(id);
            localStorage.setItem(DELETED_TEAMS_KEY, JSON.stringify(deletedIds));
        }
    }

    // Función para cargar los equipos desde el archivo JSON excluyendo los eliminados
    function cargarTeams() {
        // Intentar cargar primero desde localStorage
        const cachedData = localStorage.getItem(STORAGE_KEY);
        
        if (cachedData) {
            // Si tenemos datos en cache, los usamos
            window.teamsData = JSON.parse(cachedData);
            renderizarTeams(window.teamsData);
        } else {
            // Si no hay cache, cargamos del JSON original
            fetch('../db/teams/teams.json')
                .then(res => res.json())
                .then(data => {
                    // Añadir IDs si no los tienen (asegurando compatibilidad)
                    data = data.map((team, index) => {
                        if (!team.id) {
                            team.id = index + 1;
                        }
                        return team;
                    });
                    
                    // Filtrar los equipos eliminados
                    const deletedIds = getDeletedTeamsIds();
                    window.teamsData = data.filter(team => !deletedIds.includes(team.id.toString()));
                    
                    // Guardar en localStorage para futuras cargas
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.teamsData));
                    
                    renderizarTeams(window.teamsData);
                })
                .catch(error => {
                    console.error('Error loading team data:', error);
                    contenedorTeams.innerHTML = '<p>Error al cargar los datos de equipos</p>';
                });
        }
    }

    // Función para renderizar los equipos en el DOM
    function renderizarTeams(teams) {
        // Limpiar el contenedor antes de renderizar
        contenedorTeams.innerHTML = '';
        
        teams.forEach(team => {
            const card = document.createElement('team-card');
            card.dataset.id = team.id;
            card.dataset.nombre = team.nombre;
            card.dataset.pais = team.pais;
            card.dataset.motor = team.motor || '';
            card.dataset.imagen = team.imagen;
            
            // Guardamos los pilotos como JSON string para pasarlos al dataset
            if (team.pilotos && Array.isArray(team.pilotos)) {
                card.dataset.pilotos = JSON.stringify(team.pilotos);
            }
            
            contenedorTeams.appendChild(card);
        });
    }

    // Manejadores de eventos globales para editar y eliminar
    contenedorTeams.addEventListener('editar-team', (e) => {
        const team = e.detail;
        console.log('Editar equipo:', team);
        abrirEditorTeamModal(team);
    });

    contenedorTeams.addEventListener('eliminar-team', (e) => {
        const { id } = e.detail;
        console.log('Eliminar equipo con ID:', id);
        
        // 1. Eliminar el equipo del array de datos en memoria
        window.teamsData = window.teamsData.filter(team => team.id.toString() !== id.toString());
        
        // 2. Guardar el estado actualizado en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(window.teamsData));
        
        // 3. Añadir el ID a la lista de equipos eliminados
        saveDeletedTeamId(id);
        
        // 4. Buscar y eliminar la tarjeta del DOM
        const card = [...contenedorTeams.querySelectorAll('team-card')].find(c => c.dataset.id === id.toString());
        if (card) {
            contenedorTeams.removeChild(card);
        }
        
        // Mostrar confirmación
        mostrarNotificacion('Equipo eliminado correctamente');
    });
    
    // Función para mostrar notificaciones (reutilizamos la misma del script de pilotos)
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

    // Función para resetear todos los equipos eliminados (útil para testing)
    window.resetearTeamsEliminados = function() {
        localStorage.removeItem(DELETED_TEAMS_KEY);
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    };

    // Agregar botón para crear nuevos equipos (solo visible para administradores)
    if (esAdmin) {
        const agregarBtn = document.createElement('button');
        agregarBtn.id = 'agregar-team-btn';
        agregarBtn.textContent = 'Agregar Nuevo Equipo';
        agregarBtn.style.cssText = `
            background-color: #e50914;
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 20px;
            cursor: pointer;
            font-size: 1rem;
            border-radius: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 500;
        `;
        
        // Insertar el botón antes del contenedor de equipos
        document.body.insertBefore(agregarBtn, contenedorTeams);
        
        // Evento para abrir el modal de agregar equipo
        agregarBtn.addEventListener('click', () => {
            abrirNuevoTeamModal();
        });
    }

    // Iniciar la aplicación
    cargarTeams();
});

// Modal para editar y agregar equipos
document.addEventListener('DOMContentLoaded', () => {
    // Comprobar si el modal ya existe (para evitar duplicados)
    if (!document.getElementById('editor-team-modal')) {
        // Crear el modal de edición para equipos
        const modalHTML = `
            <div id="editor-team-modal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Editar Equipo</h2>
                    <form id="editor-team-form">
                        <input type="hidden" id="team-id">
                        <div class="form-group">
                            <label for="team-nombre">Nombre:</label>
                            <input type="text" id="team-nombre" required>
                        </div>
                        <div class="form-group">
                            <label for="team-pais">País:</label>
                            <input type="text" id="team-pais" required>
                        </div>
                        <div class="form-group">
                            <label for="team-motor">Motor:</label>
                            <input type="text" id="team-motor" required>
                        </div>
                        <div class="form-group">
                            <label for="team-imagen">URL de la imagen:</label>
                            <input type="text" id="team-imagen" required>
                        </div>
                        <div class="form-group">
                            <label for="team-pilotos">IDs de pilotos (separados por coma):</label>
                            <input type="text" id="team-pilotos" placeholder="Ej: 1,2">
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
                #editor-team-modal {
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
                
                #editor-team-modal .modal-content {
                    background-color: #222;
                    margin: 5% auto;
                    padding: 20px;
                    border: 1px solid #444;
                    width: 80%;
                    max-width: 600px;
                    color: white;
                    border-radius: 8px;
                }
                
                #editor-team-modal .close {
                    color: #aaa;
                    float: right;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                }
                
                #editor-team-modal .close:hover {
                    color: #e50914;
                }
                
                #editor-team-modal h2 {
                    margin-top: 0;
                    color: #e50914;
                }
                
                #editor-team-modal .form-group {
                    margin-bottom: 15px;
                }
                
                #editor-team-modal label {
                    display: block;
                    margin-bottom: 5px;
                }
                
                #editor-team-modal input {
                    width: 100%;
                    padding: 8px;
                    box-sizing: border-box;
                    background-color: #333;
                    border: 1px solid #555;
                    color: white;
                    border-radius: 4px;
                }
                
                #editor-team-modal .buttons {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 20px;
                }
                
                #editor-team-modal button {
                    padding: 10px 20px;
                    background-color: #e50914;
                    color: white;
                    border: none;
                    cursor: pointer;
                    border-radius: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 500;
                }
                
                #editor-team-modal button.cancelar {
                    background-color: #555;
                }
                
                #editor-team-modal button:hover {
                    opacity: 0.9;
                }
                
                #editor-team-modal hr {
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
    const modal = document.getElementById('editor-team-modal');
    const formulario = document.getElementById('editor-team-form');
    const cerrarBtn = modal.querySelector('.close');
    const cancelarBtn = modal.querySelector('.cancelar');
    const modalTitle = modal.querySelector('h2');

    // Función para abrir el modal en modo "agregar nuevo equipo"
    window.abrirNuevoTeamModal = function () {
        modalTitle.textContent = 'Agregar Nuevo Equipo';
        formulario.reset();
        // Generamos un nuevo ID (el próximo disponible en secuencia)
        const nuevoId = window.teamsData.length > 0 
            ? Math.max(...window.teamsData.map(p => parseInt(p.id))) + 1 
            : 1;
        document.getElementById('team-id').value = nuevoId;
        modal.style.display = 'block';
    };

    // Función para abrir el modal con los datos del equipo a editar
    window.abrirEditorTeamModal = function (teamData) {
        modalTitle.textContent = 'Editar Equipo';
        document.getElementById('team-id').value = teamData.id;
        document.getElementById('team-nombre').value = teamData.nombre;
        document.getElementById('team-pais').value = teamData.pais;
        document.getElementById('team-motor').value = teamData.motor || '';
        document.getElementById('team-imagen').value = teamData.imagen;
        
        // Convertir el array de pilotos a una cadena separada por comas
        const pilotosString = Array.isArray(teamData.pilotos) ? teamData.pilotos.join(',') : '';
        document.getElementById('team-pilotos').value = pilotosString;
        
        modal.style.display = 'block';
    };

    // Función para cerrar el modal
    function cerrarEditorTeamModal() {
        modal.style.display = 'none';
        formulario.reset();
    }

    // Eventos para cerrar el modal
    cerrarBtn.addEventListener('click', cerrarEditorTeamModal);
    cancelarBtn.addEventListener('click', cerrarEditorTeamModal);

    // Cerrar el modal si se hace clic fuera del contenido
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            cerrarEditorTeamModal();
        }
    });

    // Manejar el envío del formulario
    formulario.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('team-id').value;
        const nombre = document.getElementById('team-nombre').value;
        const pais = document.getElementById('team-pais').value;
        const motor = document.getElementById('team-motor').value;
        const imagen = document.getElementById('team-imagen').value;
        
        // Convertir la cadena de pilotos a un array de números
        const pilotosInput = document.getElementById('team-pilotos').value;
        const pilotos = pilotosInput
            .split(',')
            .filter(id => id.trim() !== '')
            .map(id => parseInt(id.trim()));

        const teamData = {
            id: parseInt(id),
            nombre,
            pais,
            motor,
            imagen,
            pilotos
        };

        const esNuevoTeam = !window.teamsData.some(team => team.id.toString() === id);

        if (esNuevoTeam) {
            agregarNuevoTeam(teamData);
        } else {
            actualizarTeam(teamData);
        }

        cerrarEditorTeamModal();
    });

    // Función para agregar un nuevo equipo
    window.agregarNuevoTeam = function (nuevoTeam) {
        const STORAGE_KEY = 'f1_teams_data';
        window.teamsData.push(nuevoTeam);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(window.teamsData));

        const newCard = document.createElement('team-card');
        newCard.dataset.id = nuevoTeam.id;
        newCard.dataset.nombre = nuevoTeam.nombre;
        newCard.dataset.pais = nuevoTeam.pais;
        newCard.dataset.motor = nuevoTeam.motor;
        newCard.dataset.imagen = nuevoTeam.imagen;
        if (nuevoTeam.pilotos && Array.isArray(nuevoTeam.pilotos)) {
            newCard.dataset.pilotos = JSON.stringify(nuevoTeam.pilotos);
        }

        const contenedor = document.getElementById('contenedor-teams');
        contenedor.appendChild(newCard);

        mostrarNotificacion('Nuevo equipo agregado correctamente');
    };

    // Función para actualizar un equipo existente
    window.actualizarTeam = function (teamActualizado) {
        const STORAGE_KEY = 'f1_teams_data';
        const index = window.teamsData.findIndex(t => t.id.toString() === teamActualizado.id.toString());

        if (index !== -1) {
            window.teamsData[index] = teamActualizado;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(window.teamsData));

            const card = [...document.querySelectorAll('team-card')].find(
                c => c.dataset.id === teamActualizado.id.toString()
            );

            if (card) {
                const newCard = document.createElement('team-card');
                newCard.dataset.id = teamActualizado.id;
                newCard.dataset.nombre = teamActualizado.nombre;
                newCard.dataset.pais = teamActualizado.pais;
                newCard.dataset.motor = teamActualizado.motor;
                newCard.dataset.imagen = teamActualizado.imagen;
                if (teamActualizado.pilotos && Array.isArray(teamActualizado.pilotos)) {
                    newCard.dataset.pilotos = JSON.stringify(teamActualizado.pilotos);
                }

                const contenedor = document.getElementById('contenedor-teams');
                contenedor.replaceChild(newCard, card);

                mostrarNotificacion('Equipo actualizado correctamente');
            }
        }
    };
});