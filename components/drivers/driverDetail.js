class DriverDetail extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
  }

  static get observedAttributes() {
    return ['name', 'image'];
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.loadDriverData();
  }

  loadDriverData() {
    fetch('../db/drivers/drivers.json')
      .then(res => res.json())
      .then(data => {
        this.driversData = data;
        this.render();
      })
      .catch(error => {
        console.error('Error cargando datos de pilotos:', error);
      });
  }

  open() {
    const modal = this.shadowRoot.querySelector(".modal");
    if (modal) {
      modal.style.display = "flex";
    }
  }

  close() {
    const modal = this.shadowRoot.querySelector(".modal");
    if (modal) {
      modal.style.display = "none";
    }
  }

  render() {
    const name = this.getAttribute("name") || '';
    const image = this.getAttribute("image") || '';

    let driverData = null;
    if (this.driversData && name) {
      driverData = this.driversData.find(driver => driver.nombre === name);
    }

    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const caracteristicas = driverData?.caracteristicas || {};

    const allSkills = [
      { key: 'paso_por_curvas', label: 'PASO POR CURVAS' },
      { key: 'frenado', label: 'FRENADO' },
      { key: 'reaccion', label: 'REACCIÓN' },
      { key: 'control', label: 'CONTROL' },
    ];

    this.shadowRoot.innerHTML = `
      <style>
        .modal {
          display: none;
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.85);
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
          overflow-y: auto;
          font-family: 'Arial', sans-serif;
        }

        .content {
          background: #222;
          color: white;
          padding: 2rem;
          text-align: left;
          max-width: 800px;
          width: 90%;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          animation: fadeIn 0.3s ease-out;
          display: flex;
          flex-direction: row;
          position: relative;
        }

        .close-btn {
          position: absolute;
          right: 15px;
          top: 15px;
          background: #e10600;
          color: white;
          width: 30px;
          height: 30px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          z-index: 10;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .driver-info {
          flex: 1;
        }

        .driver-image {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .driver-image img {
          max-width: 100%;
          max-height: 400px;
          object-fit: cover;
        }

        .first-name {
          margin: 0;
          font-size: 2rem;
          font-weight: normal;
          color: #fff;
        }

        .last-name {
          margin: 0 0 1.5rem 0;
          font-size: 2.5rem;
          font-weight: bold;
          color: #fff;
          text-transform: uppercase;
        }

        .name-divider {
          width: 70%;
          height: 3px;
          background-color: #e10600;
          margin-bottom: 1.5rem;
        }

        .statistics {
          margin-top: 1rem;
        }

        .stat-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.8rem;
        }

        .stat-label {
          font-weight: bold;
          color: #fff;
          flex: 1;
        }

        .stat-value {
          width: 40px;
          text-align: right;
          font-weight: bold;
          color: #fff;
          font-size: 1.2rem;
          padding-left: 10px;
        }

        .barra-progreso {
          flex: 2;
          height: 15px;
          background-color: #444;
          overflow: hidden;
        }

        .progreso {
          height: 100%;
          background-color: #e10600;
        }

        .progreso.high {
          background-color: #00e676;
        }

        .high-value {
          color: #00e676;
        }

        .medium-value,
        .low-value {
          color: #fff;
        }
      </style>

      <div class="modal">
        <div class="content">
          <button class="close-btn">✕</button>
          
          <div class="driver-info">
            <h2 class="first-name">${firstName}</h2>
            <h1 class="last-name">${lastName}</h1>
            <div class="name-divider"></div>

            <div class="statistics">
              ${allSkills.map(skill => {
                const value = caracteristicas[skill.key] || driverData?.[skill.key] || 80;
                const valueClass = value >= 95 ? 'high-value' : (value >= 90 ? 'medium-value' : 'low-value');
                const progressClass = value >= 95 ? 'high' : '';

                return `
                  <div class="stat-row">
                    <span class="stat-label">${skill.label}</span>
                    <div class="barra-progreso">
                      <div class="progreso ${progressClass}" style="width: ${value}%"></div>
                    </div>
                    <span class="stat-value ${valueClass}">${value}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="driver-image">
            <img src="${image}" alt="${name}">
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector(".close-btn").addEventListener("click", () => this.close());
  }
}

customElements.define('driver-detail', DriverDetail);
