const $team = document.getElementById('select-team');
const $driver = document.getElementById('select-driver');
const $car = document.getElementById('select-car');
const $circuit = document.getElementById('select-circuit');
const $result = document.getElementById('result');
const $simulateBtn = document.getElementById('simulate-btn');
const $weather = document.getElementById('weather-info');

let data = {
  teams: [],
  drivers: [],
  cars: [],
  circuits: []
};

let climaActual = null;

const climasPosibles = [
  { nombre: 'Soleado', factor: 1.0 },
  { nombre: 'Nublado', factor: 0.95 },
  { nombre: 'Lluvia ligera', factor: 0.9 },
  { nombre: 'Lluvia fuerte', factor: 0.8 },
  { nombre: 'Tormenta', factor: 0.7 },
  { nombre: 'Nieve', factor: 0.6 },
  { nombre: 'Calor extremo', factor: 0.85 },
];

async function loadData() {
  try {
    const [teams, drivers, cars, circuits] = await Promise.all([
      fetch('../../db/teams/teams.json').then(r => r.json()),
      fetch('../../db/drivers/drivers.json').then(r => r.json()),
      fetch('../../db/cars/cars.json').then(r => r.json()),
      fetch('../../db/circuits/circuits.json').then(r => r.json())
    ]);
    data = { teams, drivers, cars, circuits };
    loadTeams();
    loadCircuits();
    
    // Dispatch event that data is loaded
    const dataLoadedEvent = new CustomEvent('dataLoaded');
    document.dispatchEvent(dataLoadedEvent);
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
}

function loadTeams() {
  $team.innerHTML = `<option disabled selected>Selecciona un equipo</option>`;
  data.teams.forEach(team => {
    const option = document.createElement('option');
    option.value = team.nombre;
    option.textContent = team.nombre;
    $team.appendChild(option);
  });
}

function loadCircuits() {
  $circuit.innerHTML = `<option disabled selected>Selecciona un circuito</option>`;
  data.circuits.forEach(circuit => {
    const option = document.createElement('option');
    option.value = circuit.nombre;
    option.textContent = circuit.nombre;
    $circuit.appendChild(option);
  });
}

// Al cambiar de equipo, mostrar pilotos y autos del equipo
$team.addEventListener('change', () => {
  const teamName = $team.value;
  
  // Actualizar card del equipo
  const team = data.teams.find(t => t.nombre === teamName);
  if (team && document.getElementById('team-card')) {
    document.getElementById('team-card').setAttribute('name', team.nombre);
    document.getElementById('team-card').setAttribute('image', team.imagen || '../assets/teams/default-team.png');
  }

  const drivers = data.drivers.filter(driver => driver.equipo === teamName);
  $driver.innerHTML = `<option disabled selected>Selecciona un piloto</option>`;
  drivers.forEach(driver => {
    const option = document.createElement('option');
    option.value = driver.id;
    option.textContent = driver.nombre;
    $driver.appendChild(option);
  });

  const teamCars = data.cars.filter(car => car.equipo === teamName);
  $car.innerHTML = `<option disabled selected>Selecciona un auto</option>`;
  teamCars.forEach((car, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = car.modelo;
    $car.appendChild(option);
  });
  
  // Resetear cards de piloto y auto
  if (document.getElementById('driver-card')) {
    document.getElementById('driver-card').setAttribute('name', 'Sin selección');
    document.getElementById('driver-card').setAttribute('image', '../assets/placeholder.png');
  }
  
  if (document.getElementById('car-card')) {
    document.getElementById('car-card').setAttribute('name', 'Sin selección');
    document.getElementById('car-card').setAttribute('image', '../assets/placeholder.png');
  }
});

// NUEVO: Al seleccionar un circuito, generar clima aleatorio
$circuit.addEventListener('change', () => {
  climaActual = climasPosibles[Math.floor(Math.random() * climasPosibles.length)];
  $weather.textContent = `🌤️ Clima actual en el circuito: ${climaActual.nombre}`;
  
  // Actualizar card del circuito
  const circuitName = $circuit.value;
  const circuit = data.circuits.find(c => c.nombre === circuitName);
  if (circuit && document.getElementById('circuit-card')) {
    document.getElementById('circuit-card').setAttribute('name', circuit.nombre);
    document.getElementById('circuit-card').setAttribute('image', circuit.imagen || '../assets/circuits/default-circuit.png');
  }
});

// Actualizar card del piloto cuando se selecciona
$driver.addEventListener('change', () => {
  const driverId = parseInt($driver.value);
  const driver = data.drivers.find(d => d.id === driverId);
  if (driver && document.getElementById('driver-card')) {
    document.getElementById('driver-card').setAttribute('name', driver.nombre);
    document.getElementById('driver-card').setAttribute('image', driver.imagen || '../assets/drivers/default-driver.png');
  }
});

// Actualizar card del auto cuando se selecciona
$car.addEventListener('change', () => {
  const carIndex = parseInt($car.value);
  const car = data.cars[carIndex];
  if (car && document.getElementById('car-card')) {
    document.getElementById('car-card').setAttribute('name', car.modelo);
    document.getElementById('car-card').setAttribute('image', car.imagen || '../assets/cars/default-car.png');
  }
});

$simulateBtn.addEventListener('click', () => {
  const driverId = parseInt($driver.value);
  const carIndex = parseInt($car.value);
  const circuitName = $circuit.value;

  const driver = data.drivers.find(d => d.id === driverId);
  const car = data.cars[carIndex];
  const circuit = data.circuits.find(c => c.nombre === circuitName);

  if (!driver || !car || !circuit || !climaActual) {
    $result.textContent = 'Faltan datos para simular.';
    return;
  }

  const result = simulateRace(driver, car, circuit, climaActual.factor);
  $result.innerHTML = `
    <h2>Resultado de la simulación</h2>
    <p>Clima: ${climaActual.nombre}</p>
    <p>Tiempo total: ${result.time.toFixed(2)} segundos</p>
    <p>Velocidad media: ${result.speed.toFixed(2)} km/h</p>
  `;
  
  const simulationResult = {
    driver: driver,
    car: car,
    circuit: circuit,
    clima: climaActual,
    resultado: result
  };
  
  const eventoSimulacion = new CustomEvent('simulacionCompletada', {
    detail: simulationResult
  });
  document.dispatchEvent(eventoSimulacion);
});

function simulateRace(driver, car, circuit, climaFactor) {
  const tipoConduccion = "conduccion_normal";
  const rendimiento = car.rendimiento[tipoConduccion];
  const velocidadBase = rendimiento.velocidad_promedio_kmh;
  const velocidadReal = velocidadBase * climaFactor;

  const distancia = circuit.longitud_km * circuit.vueltas;
  const tiempoHoras = distancia / velocidadReal;
  const tiempoSegundos = tiempoHoras * 3600;

  return {
    time: tiempoSegundos,
    speed: velocidadReal
  };
}

loadData();

class SelectionCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
      this.render();
    }
  
    static get observedAttributes() {
      return ['name', 'image', 'type'];
    }
  
    attributeChangedCallback() {
      if (this.shadowRoot) {
        this.render();
      }
    }
  
    render() {
      const name = this.getAttribute('name') || 'Sin selección';
      const image = this.getAttribute('image') || '../assets/placeholder.png';
      const type = this.getAttribute('type') || '';
  
      this.shadowRoot.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Titillium+Web:wght@300;400;600;700&display=swap');
          
          :host {
            --f1-red: #e10600;
            --f1-dark: #111111;
            --f1-light: #f5f5f5;
            --f1-accent: #00ffff;
            --f1-yellow: #ffcc00;
            --f1-gradient: linear-gradient(90deg, var(--f1-red), #ff5a54);
            display: block;
            height: 100%;
          }
          
          .card {
            border-radius: 8px;
            box-shadow: 0 0 15px rgba(225, 6, 0, 0.2);
            overflow: hidden;
            margin: 0;
            background-color: rgba(20, 20, 20, 0.9);
            transition: all 0.3s ease;
            position: relative;
            border: 1px solid rgba(255, 255, 255, 0.1);
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          
          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(225, 6, 0, 0.3);
          }
          
          .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: var(--f1-gradient);
          }
          
          .card-image-container {
            width: 100%;
            height: 180px; /* Aumentado de 140px a 180px */
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background-color: rgba(0, 0, 0, 0.3);
            position: relative;
          }
          
          .card-image {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain; /* Cambiado de cover a contain */
            transition: all 0.3s ease;
            display: block;
          }
          
          /* Ajustes específicos por tipo */
          :host([type="Piloto"]) .card-image-container {
            background-color: rgba(0, 0, 0, 0.5);
          }
          
          :host([type="Auto"]) .card-image-container {
            background-color: rgba(10, 10, 10, 0.8);
            padding: 10px; /* Añadido para dar más espacio al auto */
          }
          
          :host([type="Circuito"]) .card-image {
            object-fit: cover; /* Los circuitos se ven mejor en cover */
            width: 100%;
            height: 100%;
          }
          
          :host([type="Equipo"]) .card-image-container {
            padding: 15px; /* Para logos de equipos */
          }
          
          .card:hover .card-image {
            filter: contrast(1.2) brightness(1.1);
          }
          
          .card-content {
            padding: 12px;
            font-family: 'Titillium Web', sans-serif;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            background-color: rgba(10, 10, 10, 0.8);
          }
          
          .card-title {
            font-weight: 600;
            margin: 0;
            color: var(--f1-light);
            font-size: 1.1rem;
            letter-spacing: 0.5px;
          }
          
          .card-type {
            font-size: 0.8rem;
            color: var(--f1-accent);
            margin-top: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 400;
            opacity: 0.8;
          }
          
          .no-selection {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: rgba(255, 255, 255, 0.5);
            font-style: italic;
            text-align: center;
          }
          
          /* Ajustes responsivos */
          @media (max-width: 768px) {
            .card-image-container {
              height: 150px;
            }
          }
        </style>
        
        ${name === 'Sin selección' ? 
          `<div class="card">
            <div class="no-selection">Selecciona un ${type.toLowerCase()}</div>
           </div>` : 
          `<div class="card">
            <div class="card-image-container">
              <img class="card-image" src="${image}" alt="${name}">
            </div>
            <div class="card-content">
              <h3 class="card-title">${name}</h3>
              <div class="card-type">${type}</div>
            </div>
           </div>`
        }
      `;
    }
  }
  
  customElements.define('selection-card', SelectionCard);