class TeamCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    
    }


    connectedCallback() {
        const { nombre, pais, imagen} = this.dataset;


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
            </style>
            <div class="card">
                <img src="${imagen}" alt="${nombre}">
                <div class="info">
                    <p class="nombre">${nombre}</p>
                    <p class="pais">${pais}</p>
                </div>
            </div>
        `;

        this.shadowRoot.querySelector('.card').addEventListener('click', () => {
            const detail = document.querySelector('team-detail');
            detail.setAttribute('nombre', nombre);
            detail.setAttribute('pais', pais);
            detail.setAttribute('imagen', imagen);

            setTimeout(() => {
                detail.open();
            }, 50);
        });
    }
}

customElements.define("team-card", TeamCard);
export default TeamCard;

document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedor-teams");

    fetch("../db/teams/teams.json")
        .then((res) => res.json())
        .then((data) => {
            data.forEach((team) => {
                const card = document.createElement("team-card");
                card.dataset.nombre = team.nombre;
                card.dataset.pais = team.pais;
                card.dataset.imagen = team.imagen;
                contenedor.appendChild(card);
            });
        })
        .catch((error) => {
            console.error("Error loading team data:", error);
            contenedor.innerHTML = "<p>Error al cargar los datos de equipos</p>";
        });
});