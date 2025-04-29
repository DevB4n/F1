class DriverCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const { name, image, team } = this.dataset;

    this.shadowRoot.innerHTML = `
      <style>
        .card {
          background: #000;
          color: white;
          border: 2px solid red;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s;
          font-family: 'Poppins', sans-serif;
        }
        .card:hover {
          transform: scale(1.03);
        }
        img {
          width: 100%;
          display: block;
        }
        .info {
          padding: 1rem;
          background-color: #111;
        }
        .name {
          font-weight: bold;
          font-size: 1.2rem;
          margin: 0;
        }
        .team {
          font-size: 0.9rem;
          color: #aaa;
        }
      </style>
      <div class="card">
        <img src="${image}" alt="${name}">
        <div class="info">
          <p class="name">${name}</p>
          <p class="team">${team}</p>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.card').addEventListener('click', () => {
      const detail = document.querySelector('driver-detail');
      detail.setAttribute('name', name);
      detail.setAttribute('image', image);
      detail.setAttribute('team', team);
      detail.setAttribute('bio', this.dataset.bio || 'No data available');
      detail.open();
    });
  }
}

customElements.define('driver-card', DriverCard);
