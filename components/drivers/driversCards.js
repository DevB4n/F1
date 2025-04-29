class DriverCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const { name, image, team, rol } = this.dataset;

    this.shadowRoot.innerHTML = `
<style>
  :host {
    display: block;
    margin: 20px;
    width: 220px;
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
    transform: scale(1.10);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4); /* Sombra más intensa al hacer hover */
  }

  img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    display: block;
    border-bottom: 2px solid #e50914; /* Línea divisoria roja debajo de la imagen */
  }

  .info {
    padding: 1rem;
    background: #222; /* Fondo oscuro para la información */
    color: #fff;
    text-align: center;
  }

  .name {
    font-weight: bold;
    font-size: 1.2rem;
    margin: 0 0 0.5rem 0;
    color: #e50914; /* Rojo brillante para el nombre */
  }

  .team {
    font-size: 0.9rem;
    color: #ccc; /* Gris claro para el equipo */
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
        <img src="${image}" alt="${name}">
        <div class="info">
          <p class="name">${name}</p>
          <p class="team">${team}</p>
          <p class="rol">${rol}</p>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.card').addEventListener('click', () => {
      const detail = document.querySelector('driver-detail');
      detail.setAttribute('name', name);
      detail.setAttribute('image', image);
      detail.setAttribute('team', team);
      detail.setAttribute('rol', rol);

      setTimeout(() => {
        detail.open();
      }, 50);
    });
  }
}

customElements.define('driver-card', DriverCard);

document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('contenedor-pilotos');

  fetch('../db/drivers/drivers.json')
    .then(res => res.json())
    .then(data => {
      data.forEach(piloto => {
        const card = document.createElement('driver-card');
        card.dataset.name = piloto.nombre;
        card.dataset.image = piloto.imagen;
        card.dataset.team = piloto.equipo;
        card.dataset.rol = piloto.rol
        contenedor.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error loading driver data:', error);
      contenedor.innerHTML = '<p>Error al cargar los datos de pilotos</p>';
    });
});