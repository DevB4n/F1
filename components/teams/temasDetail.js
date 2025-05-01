class TeamDetail extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.pilots = [];
        this._isOpen = false;
    }

    connectedCallback() {
        this.render();
        
        // Agregamos el evento para cerrar el modal
        this.shadowRoot.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('close-btn')) {
                this.close();
            }
        });
    }

    static get observedAttributes() {
        return ['nombre', 'pais', 'imagen'];
    }

    attributeChangedCallback( oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    async open() {
        this._isOpen = true;
        const modal = this.shadowRoot.querySelector('.modal-overlay');
        const modalContent = this.shadowRoot.querySelector('.modal-content');
        
        // Buscar información detallada del equipo
        await this.fetchTeamDetails();
        
        // Animar la apertura
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'translateY(0)';
        }, 10);
    }

    close() {
        const modal = this.shadowRoot.querySelector('.modal-overlay');
        const modalContent = this.shadowRoot.querySelector('.modal-content');
        
        // Animar el cierre
        modal.style.opacity = '0';
        modalContent.style.transform = 'translateY(-50px)';
        
        setTimeout(() => {
            modal.style.display = 'none';
            this._isOpen = false;
        }, 300);
    }

    async fetchTeamDetails() {
        try {
            // Obtener datos completos del equipo
            const teamRes = await fetch("../db/teams/teams.json");
            const teams = await teamRes.json();
            
            const teamName = this.getAttribute('nombre');
            const teamData = teams.find(team => team.nombre === teamName);
            
            if (!teamData) return;
            
            // Guardar datos del motor
            this.shadowRoot.querySelector('.motor-value').textContent = teamData.motor || 'No disponible';
            
            // Obtener datos de los pilotos
            if (teamData.pilotos && teamData.pilotos.length) {
                const pilotsRes = await fetch("../db/drivers/drivers.json");
                const allPilots = await pilotsRes.json();
                
                // Filtrar solo los pilotos de este equipo
                this.pilots = allPilots.filter(pilot => 
                    teamData.pilotos.includes(pilot.id)
                );
                
                // Renderizar pilotos
                this.renderPilots();
            }
        } catch (error) {
            console.error("Error obteniendo detalles del equipo:", error);
        }
    }
    
    renderPilots() {
        const pilotsContainer = this.shadowRoot.querySelector('.pilotos-container');
        pilotsContainer.innerHTML = '';
    
        
        this.pilots.forEach(pilot => {
            const pilotCard = document.createElement('div');
            pilotCard.className = 'pilot-card';
            
            pilotCard.innerHTML = `
                <div class="pilot-img-container">
                    <img src="${pilot.imagen || '../assets/default-pilot.png'}" alt="${pilot.nombre}">
                </div>
                <div class="pilot-info">
                    <h3>${pilot.nombre}</h3>
                    <p class="pilot-equipo">${pilot.equipo}</p>
                    <p class="pilot-rol">${pilot.rol}</p>
                </div>
            `;
            
            pilotsContainer.appendChild(pilotCard);
        });
    }

    render() {
        const nombre = this.getAttribute('nombre');
        const pais = this.getAttribute('pais');
        const imagen = this.getAttribute('imagen');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --primary-color: #e50914;
                    --dark-bg: #111;
                    --card-bg: #1a1a1a;
                    --text-light: #fff;
                    --text-accent: #e50914;
                    --transition: all 0.3s ease;
                }
                
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.85);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .modal-content {
                    width: 90%;
                    max-width: 800px;
                    max-height: 100vh;
                    overflow-y: auto;
                    background: linear-gradient(145deg, #1a1a1a, #111);
                    border-radius: 12px;
                    padding: 0;
                    position: relative;
                    transform: translateY(-50px);
                    transition: transform 0.3s ease;
                    box-shadow: 0 10px 30px rgba(229, 9, 20, 0.4);
                }
                
                .modal-content::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    border-radius: 12px;
                    padding: 2px;
                    background: linear-gradient(45deg, transparent, rgba(229, 9, 20, 0.7), transparent);
                    -webkit-mask: 
                        linear-gradient(#fff 0 0) content-box, 
                        linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                }
                
                .close-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: rgba(229, 9, 20, 0.8);
                    color: white;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    transition: var(--transition);
                    z-index: 10;
                }
                
                .close-btn:hover {
                    background: var(--primary-color);
                    transform: scale(1.1);
                }
                
                .team-header {
                    padding: 30px 20px;
                    text-align: center;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .team-logo {
                    width: 200px;
                    height: 150px;
                    object-fit: contain;
                    margin-bottom: 20px;
                    background-color: white;
                    padding: 15px;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }
                
                .team-name {
                    font-size: 2.2rem;
                    color: var(--text-light);
                    margin: 0 0 10px 0;
                    text-shadow: 0 0 10px rgba(229, 9, 20, 0.7);
                }
                
                .team-country {
                    font-size: 1.2rem;
                    color: var(--text-accent);
                    margin: 0;
                    letter-spacing: 1px;
                }
                
                .team-details {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 20px;
                    border-top: 1px solid rgba(229, 9, 20, 0.3);
                }
                
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    color: var(--text-light);
                    font-size: 1.1rem;
                }
                
                .detail-label {
                    font-weight: 600;
                    color: #ccc;
                }
                
                .detail-value {
                    color: var(--text-light);
                }
                
                .motor-value {
                    color: var(--text-accent);
                    font-weight: 500;
                }
                
                .section-title {
                    color: var(--text-light);
                    font-size: 1.5rem;
                    margin: 25px 0 15px;
                    position: relative;
                    padding-left: 15px;
                }
                
                .section-title::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 100%;
                    width: 5px;
                    background: var(--primary-color);
                    border-radius: 3px;
                }
                
                .pilotos-section {
                    padding: 10px 20px 30px;
                }
                
                .pilotos-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }
                
                .pilot-card {
                    background: rgba(40, 40, 40, 0.6);
                    border-radius: 10px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    transition: var(--transition);
                    padding: 15px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(229, 9, 20, 0.2);
                }
                
                .pilot-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 16px rgba(229, 9, 20, 0.3);
                }
                
                .pilot-img-container {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 2px solid var(--primary-color);
                    flex-shrink: 0;
                }
                
                .pilot-img-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .pilot-info {
                    margin-left: 15px;
                }
                
                .pilot-info h3 {
                    margin: 0 0 5px;
                    color: var(--text-light);
                    font-size: 1.1rem;
                }
                
                .pilot-equipo {
                    margin: 0 0 5px;
                    color: var(--primary-color);
                    font-weight: bold;
                    font-size: 1rem;
                }
                
                .pilot-rol {
                    margin: 0;
                    color: #ccc;
                    font-size: 0.9rem;
                }
                
                .no-pilots {
                    color: #999;
                    font-style: italic;
                    text-align: center;
                    padding: 20px;
                }
                
                /* Responsive styles */
                @media (max-width: 600px) {
                    .team-name {
                        font-size: 1.8rem;
                    }
                    
                    .team-logo {
                        width: 150px;
                        height: 120px;
                    }
                    
                    .pilotos-container {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            
            <div class="modal-overlay">
                <div class="modal-content">
                    <button class="close-btn">✕</button>
                    
                    <div class="team-header">
                        <img class="team-logo" src="${imagen}" alt="${nombre}">
                        <h2 class="team-name">${nombre}</h2>
                        <p class="team-country">${pais}</p>
                    </div>
                    
                    <div class="team-details">
                        <div class="detail-row">
                            <span class="detail-label">Motor:</span>
                            <span class="motor-value">Cargando...</span>
                        </div>
                    </div>
                    
                    <div class="pilotos-section">
                        <h3 class="section-title">Pilotos</h3>
                        <div class="pilotos-container">
                            <p class="no-pilots">Cargando pilotos...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define("team-detail", TeamDetail);
export default TeamDetail;