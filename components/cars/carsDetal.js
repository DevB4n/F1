class CarDetail extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this._isOpen = false;
        this._sketchfabViewer = null;
        
        // Crear estructura base
        this.render();
    }
    
    static get observedAttributes() {
        return ['equipo', 'modelo', 'motor', 'imagen', 'modelo3d_id'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }
    
    get equipo() { return this.getAttribute('equipo') || ''; }
    get modelo() { return this.getAttribute('modelo') || ''; }
    get motor() { return this.getAttribute('motor') || ''; }
    get imagen() { return this.getAttribute('imagen') || ''; }
    get modelo3d_id() { return this.getAttribute('modelo3d_id') || ''; }
    
    set equipo(val) { this.setAttribute('equipo', val); }
    set modelo(val) { this.setAttribute('modelo', val); }
    set motor(val) { this.setAttribute('motor', val); }
    set imagen(val) { this.setAttribute('imagen', val); }
    set modelo3d_id(val) { this.setAttribute('modelo3d_id', val); }
    
    open() {
        this._isOpen = true;
        this.shadowRoot.querySelector('.modal').classList.add('active');
        document.body.style.overflow = 'hidden'; // Evitar scroll
        
        // Cargar todos los detalles del coche desde el JSON
        this.loadFullDetails();
        
        // Cargar el modelo 3D si hay un ID disponible
        if (this.modelo3d_id) {
            this.load3DModel();
        }
    }
    
    close() {
        this._isOpen = false;
        this.shadowRoot.querySelector('.modal').classList.remove('active');
        document.body.style.overflow = '';
        
        // Limpiar el iframe del modelo 3D cuando se cierra
        if (this._sketchfabViewer) {
            this._sketchfabViewer = null;
            const container = this.shadowRoot.querySelector('.modelo3d-container');
            if (container) {
                container.innerHTML = '';
            }
        }
    }
    
    load3DModel() {
        if (!this.modelo3d_id) return;
        
        const container = this.shadowRoot.querySelector('.modelo3d-container');
        
        // Limpiar el contenedor
        container.innerHTML = '';
        
        // Crear iframe para el modelo de Sketchfab
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', `https://sketchfab.com/models/${this.modelo3d_id}/embed?autostart=1&ui_infos=0&ui_controls=1&ui_stop=0`);
        iframe.setAttribute('width', '100%');
        iframe.setAttribute('height', '100%');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'autoplay; fullscreen; vr');
        iframe.setAttribute('allowfullscreen', '');
        
        container.appendChild(iframe);
    }
    
    toggleView() {
        const imagenContainer = this.shadowRoot.querySelector('.imagen-container');
        const modelo3dContainer = this.shadowRoot.querySelector('.modelo3d-container');
        
        if (imagenContainer.style.display === 'none') {
            // Cambiar a vista de imagen
            imagenContainer.style.display = 'flex';
            modelo3dContainer.style.display = 'none';
            this.shadowRoot.querySelector('.toggle-view-btn').textContent = 'Ver modelo 3D';
        } else {
            // Cambiar a vista 3D
            imagenContainer.style.display = 'none';
            modelo3dContainer.style.display = 'flex';
            this.shadowRoot.querySelector('.toggle-view-btn').textContent = 'Ver imagen';
            
            // Cargar modelo 3D si no se ha cargado todavía
            if (!modelo3dContainer.querySelector('iframe')) {
                this.load3DModel();
            }
        }
    }
    
    loadFullDetails() {
        // Primero intentamos obtener los datos desde localStorage
        const STORAGE_KEY = 'f1_cars_data';
        const cachedData = localStorage.getItem(STORAGE_KEY);
        
        if (cachedData) {
            const data = JSON.parse(cachedData);
            // Encontrar el coche específico basado en modelo y equipo
            const cocheSeleccionado = data.find(coche => 
                coche.modelo === this.modelo && coche.equipo === this.equipo);
            
            if (cocheSeleccionado) {
                // Actualizar el contenido de detalles con toda la información
                this.updateDetailsContent(cocheSeleccionado);
                
                // Actualizar el atributo modelo3d_id si existe en los datos
                if (cocheSeleccionado.modelo3d_id) {
                    this.modelo3d_id = cocheSeleccionado.modelo3d_id;
                    
                    // Mostrar el botón de toggle solo si hay modelo 3D
                    const toggleBtn = this.shadowRoot.querySelector('.toggle-view-btn');
                    if (toggleBtn) {
                        toggleBtn.style.display = 'flex';
                    }
                }
                
                return; // Si encontramos los datos en localStorage, no hacemos fetch
            }
        }
        
        // Como respaldo, obtenemos todos los detalles del coche desde el JSON original
        fetch('../db/cars/cars.json')
            .then(res => res.json())
            .then(data => {
                // Encontrar el coche específico basado en modelo y equipo
                const cocheSeleccionado = data.find(coche => 
                    coche.modelo === this.modelo && coche.equipo === this.equipo);
                
                if (cocheSeleccionado) {
                    // Actualizar el contenido de detalles con toda la información
                    this.updateDetailsContent(cocheSeleccionado);
                    
                    // Actualizar el atributo modelo3d_id si existe en los datos
                    if (cocheSeleccionado.modelo3d_id) {
                        this.modelo3d_id = cocheSeleccionado.modelo3d_id;
                        
                        // Mostrar el botón de toggle solo si hay modelo 3D
                        const toggleBtn = this.shadowRoot.querySelector('.toggle-view-btn');
                        if (toggleBtn) {
                            toggleBtn.style.display = 'flex';
                        }
                    }
                }
            })
            .catch(error => {
                console.error('Error cargando detalles del coche:', error);
            });
    }    
    
    updateDetailsContent(coche) {
        const detallesDiv = this.shadowRoot.querySelector('.detalles-content');
        
        let detallesHTML = '';
        
        // Información básica
        detallesHTML += `
            <div class="seccion-detalles">
                <h3 class="seccion-titulo">Información Básica</h3>
                <div class="detalle-grid">
                    <div class="detalle-item">
                        <span class="detalle-label">Equipo:</span>
                        <span class="detalle-value">${coche.equipo}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Modelo:</span>
                        <span class="detalle-value">${coche.modelo}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Motor:</span>
                        <span class="detalle-value">${coche.motor}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Velocidad Máxima:</span>
                        <span class="detalle-value">${coche.velocidad_maxima_kmh} km/h</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Aceleración 0-100:</span>
                        <span class="detalle-value">${coche.aceleracion_0_100} segundos</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Pilotos ID:</span>
                        <span class="detalle-value">${Array.isArray(coche.pilotos) ? coche.pilotos.join(', ') : coche.pilotos}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Sección de rendimiento - Conducción normal
        if (coche.rendimiento && coche.rendimiento.conduccion_normal) {
            const normal = coche.rendimiento.conduccion_normal;
            detallesHTML += `
                <div class="seccion-detalles">
                    <h3 class="seccion-titulo">Conducción Normal</h3>
                    <div class="detalle-grid">
                        <div class="detalle-item">
                            <span class="detalle-label">Velocidad Promedio:</span>
                            <span class="detalle-value">${normal.velocidad_promedio_kmh} km/h</span>
                        </div>
                    </div>
                    
                    <div class="detalle-item" style="margin-top: 12px;">
                        <span class="detalle-label">Consumo Combustible:</span>
                        <div class="sub-detalles">
                            <div><span class="sub-label">Seco:</span> <span class="sub-value">${normal.consumo_combustible.seco}</span></div>
                            <div><span class="sub-label">Lluvioso:</span> <span class="sub-value">${normal.consumo_combustible.lluvioso}</span></div>
                            <div><span class="sub-label">Extremo:</span> <span class="sub-value">${normal.consumo_combustible.extremo}</span></div>
                        </div>
                    </div>
                    
                    <div class="detalle-item" style="margin-top: 12px;">
                        <span class="detalle-label">Desgaste Neumáticos:</span>
                        <div class="sub-detalles">
                            <div><span class="sub-label">Seco:</span> <span class="sub-value">${normal.desgaste_neumaticos.seco}</span></div>
                            <div><span class="sub-label">Lluvioso:</span> <span class="sub-value">${normal.desgaste_neumaticos.lluvioso}</span></div>
                            <div><span class="sub-label">Extremo:</span> <span class="sub-value">${normal.desgaste_neumaticos.extremo}</span></div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Sección de rendimiento - Conducción agresiva
        if (coche.rendimiento && coche.rendimiento.conduccion_agresiva) {
            const agresiva = coche.rendimiento.conduccion_agresiva;
            detallesHTML += `
                <div class="seccion-detalles">
                    <h3 class="seccion-titulo">Conducción Agresiva</h3>
                    <div class="detalle-grid">
                        <div class="detalle-item">
                            <span class="detalle-label">Velocidad Promedio:</span>
                            <span class="detalle-value">${agresiva.velocidad_promedio_kmh} km/h</span>
                        </div>
                    </div>
                    
                    <div class="detalle-item" style="margin-top: 12px;">
                        <span class="detalle-label">Consumo Combustible:</span>
                        <div class="sub-detalles">
                            <div><span class="sub-label">Seco:</span> <span class="sub-value">${agresiva.consumo_combustible.seco}</span></div>
                            <div><span class="sub-label">Lluvioso:</span> <span class="sub-value">${agresiva.consumo_combustible.lluvioso}</span></div>
                            <div><span class="sub-label">Extremo:</span> <span class="sub-value">${agresiva.consumo_combustible.extremo}</span></div>
                        </div>
                    </div>
                    
                    <div class="detalle-item" style="margin-top: 12px;">
                        <span class="detalle-label">Desgaste Neumáticos:</span>
                        <div class="sub-detalles">
                            <div><span class="sub-label">Seco:</span> <span class="sub-value">${agresiva.desgaste_neumaticos.seco}</span></div>
                            <div><span class="sub-label">Lluvioso:</span> <span class="sub-value">${agresiva.desgaste_neumaticos.lluvioso}</span></div>
                            <div><span class="sub-label">Extremo:</span> <span class="sub-value">${agresiva.desgaste_neumaticos.extremo}</span></div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Sección de rendimiento - Ahorro combustible
        if (coche.rendimiento && coche.rendimiento.ahorro_combustible) {
            const ahorro = coche.rendimiento.ahorro_combustible;
            detallesHTML += `
                <div class="seccion-detalles">
                    <h3 class="seccion-titulo">Ahorro de Combustible</h3>
                    <div class="detalle-grid">
                        <div class="detalle-item">
                            <span class="detalle-label">Velocidad Promedio:</span>
                            <span class="detalle-value">${ahorro.velocidad_promedio_kmh} km/h</span>
                        </div>
                    </div>
                    
                    <div class="detalle-item" style="margin-top: 12px;">
                        <span class="detalle-label">Consumo Combustible:</span>
                        <div class="sub-detalles">
                            <div><span class="sub-label">Seco:</span> <span class="sub-value">${ahorro.consumo_combustible.seco}</span></div>
                            <div><span class="sub-label">Lluvioso:</span> <span class="sub-value">${ahorro.consumo_combustible.lluvioso}</span></div>
                            <div><span class="sub-label">Extremo:</span> <span class="sub-value">${ahorro.consumo_combustible.extremo}</span></div>
                        </div>
                    </div>
                    
                    <div class="detalle-item" style="margin-top: 12px;">
                        <span class="detalle-label">Desgaste Neumáticos:</span>
                        <div class="sub-detalles">
                            <div><span class="sub-label">Seco:</span> <span class="sub-value">${ahorro.desgaste_neumaticos.seco}</span></div>
                            <div><span class="sub-label">Lluvioso:</span> <span class="sub-value">${ahorro.desgaste_neumaticos.lluvioso}</span></div>
                            <div><span class="sub-label">Extremo:</span> <span class="sub-value">${ahorro.desgaste_neumaticos.extremo}</span></div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        detallesDiv.innerHTML = detallesHTML;
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 0;
                    z-index: 1000;
                }
                
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color:   rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s ease, visibility 0.3s ease;
                }
                
                .modal.active {
                    opacity: 1;
                    visibility: visible;
                }
                
                .modal-content {
                    background-color: #222;
                    width: 90%;
                    max-width: 1100px;
                    max-height: 70vh;
                    border-radius: 15px;
                    overflow: auto;
                    box-shadow: 0 5px 25px rgba(229, 9, 20, 0.4);
                    display: flex;
                    flex-direction: row;
                    animation: fadeIn 0.5s;
                    position: relative;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .imagen-container {
                    flex: 0 0 40%;
                    min-width: 350px;
                    background-color: #1a1a1a;
                    display: none; /* Oculta por defecto */
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    position: relative;
                }
                
                .modelo3d-container {
                    flex: 0 0 45%;
                    min-width: 350px;
                    height: 670px; /* Altura aumentada */
                    background-color: #1a1a1a;
                    display: flex; /* Mostrado por defecto */
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                    border-radius: 10px 0 0 10px;
                }
                
                .modelo3d-container iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                
                .coche-imagen {
                    max-width: 100%;
                    max-height: 400px;
                    object-fit: contain;
                    transition: transform 0.3s ease;
                }
                
                .coche-imagen:hover {
                    transform: scale(1.05);
                }
                
                .detalles-container {
                    flex: 1 1 55%;
                    padding: 25px;
                    overflow-y: auto;
                    color: #fff;
                }
                
                .titulo-detalle {
                    color: #e50914;
                    font-size: 1.8rem;
                    margin-top: 0;
                    margin-bottom: 15px;
                    border-bottom: 2px solid #e50914;
                    padding-bottom: 10px;
                    text-align: center;
                    text-shadow: 0 0 10px rgba(229, 9, 20, 0.4);
                }
                
                .subtitulo-detalle {
                    color: #ccc;
                    font-size: 1.3rem;
                    margin-top: 0;
                    margin-bottom: 20px;
                    text-align: center;
                }
                
                .detalles-content {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    padding-bottom: 20px; /* Espacio adicional al final */
                }
                
                .seccion-detalles {
                    background-color: #2a2a2a;
                    border-radius: 10px;
                    padding: 15px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                    border-left: 3px solid #e50914;
                    margin-bottom: 5px;
                }
                
                .seccion-titulo {
                    color: #e50914;
                    margin-top: 0;
                    margin-bottom: 15px;
                    font-size: 1.3rem;
                    border-bottom: 1px solid #444;
                    padding-bottom: 8px;
                }
                
                .detalle-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 12px;
                }
                
                .detalle-item {
                    padding: 10px;
                    background-color: #333;
                    border-radius: 6px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    margin-bottom: 0;
                }
                
                .detalle-item:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 4px 8px rgba(229, 9, 20, 0.2);
                }
                
                .detalle-label {
                    font-weight: bold;
                    color: #e50914;
                    display: block;
                    margin-bottom: 6px;
                    font-size: 0.9rem;
                }
                
                .detalle-value {
                    color: #ddd;
                    font-size: 1.1rem;
                }
                
                .sub-detalles {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-top: 6px;
                    padding-top: 6px;
                    border-top: 1px dashed #444;
                }
                
                .detalle-item.expandible {
                    grid-column: span 2;
                }
                
                .sub-label {
                    font-weight: bold;
                    color: #aaa;
                    font-size: 0.8rem;
                }
                
                .sub-value {
                    color: #fff;
                    font-size: 0.95rem;
                }
                
                .cerrar-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: #e50914;
                    color: white;
                    border: none;
                    font-size: 1.2rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                    transition: transform 0.2s, background-color 0.2s;
                    z-index: 10;
                }
                
                .cerrar-btn:hover {
                    transform: scale(1.1);
                    background-color: #ff0f1b;
                }
                
                .toggle-view-btn {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    background-color: #e50914;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    display: flex; /* Mostrado por defecto */
                    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                    transition: transform 0.2s, background-color 0.2s;
                    z-index: 10;
                }
                
                .toggle-view-btn:hover {
                    transform: scale(1.05);
                    background-color: #ff0f1b;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .modal-content {
                        flex-direction: column;
                        width: 95%;
                    }
                    
                    .imagen-container,
                    .modelo3d-container {
                        flex: 0 0 auto;
                        min-width: auto;
                        max-height: 350px; /* Altura para móviles */
                        border-radius: 10px 10px 0 0;
                    }
                    
                    .detalles-container {
                        flex: 1 1 auto;
                        max-height: none;
                    }
                    
                    .sub-detalles {
                        grid-template-columns: 1fr;
                    }
                    
                    .detalle-item.expandible {
                        grid-column: span 1;
                    }
                    
                    .detalle-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            
            <div class="modal">
                <div class="modal-content">
                    <div class="imagen-container">
                        <img class="coche-imagen" src="${this.imagen}" alt="${this.modelo}">
                    </div>
                    <div class="modelo3d-container">
                        <!-- Aquí se cargará el modelo 3D dinámicamente -->
                    </div>
                    <div class="detalles-container">
                        <h2 class="titulo-detalle">${this.modelo}</h2>
                        <h3 class="subtitulo-detalle">${this.equipo}</h3>
                        <div class="detalles-content">
                            <!-- Aquí se cargarán dinámicamente todos los detalles -->
                            <div class="detalle-item">
                                <span class="detalle-label">Motor:</span>
                                <span class="detalle-value">${this.motor}</span>
                            </div>
                        </div>
                    </div>
                    <button class="toggle-view-btn">Ver imagen</button>
                    <button class="cerrar-btn">✕</button>
                </div>
            </div>
        `;
        
        // Añadir event listener para cerrar
        this.shadowRoot.querySelector('.cerrar-btn').addEventListener('click', () => {
            this.close();
        });
        
        // Añadir event listener para cambiar entre vista de imagen y 3D
        this.shadowRoot.querySelector('.toggle-view-btn').addEventListener('click', () => {
            this.toggleView();
        });
        
        // Cerrar al hacer clic fuera del contenido
        this.shadowRoot.querySelector('.modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.close();
            }
        });
    }
}

customElements.define('car-detail', CarDetail);

