class CarCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        const { equipo, modelo, motor, imagen } = this.dataset;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin: 20px;
                    width: 320px; /* Ancho incrementado de la tarjeta */
                }

                .card {
                    cursor: pointer;
                    border: 2px solid #e50914; /* Rojo F1 */
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    background: #111; /* Fondo oscuro como un coche de carreras */
                    width: 100%;
                }

                .card:hover {
                    transform: scale(1.05);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4); /* Sombra más intensa al hacer hover */
                }

                img {
                    width: 100%;
                    height: 150px; /* Altura incrementada de la imagen */
                    object-fit: contain; /* Cambiado a contain para mostrar completo sin cortar */
                    display: block;
                    border-bottom: 2px solid #e50914; /* Línea divisoria roja debajo de la imagen */
                    background-color: #1a1a1a; /* Fondo ligeramente más claro para la imagen */
                    padding: 10px 0; /* Padding para dar más espacio a la imagen */
                }

                .info {
                    padding: 1rem;
                    background: #222; /* Fondo oscuro para la información */
                    color: #fff;
                    text-align: center;
                }

                .modelo {
                    font-weight: bold;
                    font-size: 1.2rem;
                    margin: 0 0 0.5rem 0;
                    color: #e50914; /* Rojo brillante para el modelo */
                }

                .equipo {
                    font-size: 0.9rem;
                    color: #ccc; /* Gris claro para el equipo */
                    margin: 0 0 0.5rem 0;
                }

                .motor {
                    font-size: 0.8rem;
                    color: #aaa; /* Gris más claro para el motor */
                    margin: 0;
                }

                .card:active {
                    transform: scale(1.5); /* Efecto de presionar */
                }

                /* Estilos para hacer que la tarjeta se vea más deportiva */
                .card:before {
                    content: "";
                    position: absolute;
                    top: -5px;
                    left: -5px;
                    right: -5px;
                    bottom: -5px;
                    border: 1px solid #e50914; /* Borde extra alrededor de la tarjeta */
                    border-radius: 12px;
                    z-index: -1;
                }
            </style>
            <div class="card">
                <img src="${imagen}" alt="${modelo}">
                <div class="info">
                    <p class="modelo">${modelo}</p>
                    <p class="equipo">${equipo}</p>
                    <p class="motor">Motor: ${motor}</p>
                </div>
            </div>
        `;

        this.shadowRoot.querySelector('.card').addEventListener('click', () => {
            const detail = document.querySelector('car-detail');
            detail.setAttribute('equipo', equipo);
            detail.setAttribute('modelo', modelo);
            detail.setAttribute('motor', motor);
            detail.setAttribute('imagen', imagen);

            setTimeout(() => {
                detail.open();
            }, 50);
        });
    }
}

customElements.define('car-card', CarCard);

document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('contenedor-coches');

    fetch('../db/cars/cars.json')
        .then(res => res.json())
        .then(data => {
            data.forEach(coche => {
                const card = document.createElement('car-card');
                card.dataset.equipo = coche.equipo;
                card.dataset.modelo = coche.modelo;
                card.dataset.motor = coche.motor;
                card.dataset.imagen = coche.imagen;
                contenedor.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error loading car data:', error);
            contenedor.innerHTML = '<p>Error al cargar los datos de coches</p>';
        });
});