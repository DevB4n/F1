const $team = document.getElementById('select-team');
const $driver = document.getElementById('select-driver');
const $car = document.getElementById('select-car');
const $circuit = document.getElementById('select-circuit');
const $result = document.getElementById('result');
const $simulateBtn = document.getElementById('simulate-btn');
const $weather = document.getElementById('weather-info'); // NUEVO: contenedor para mostrar el clima

let data = {
  teams: [],
  drivers: [],
  cars: [],
  circuits: []
};

let climaActual = null; // Aquí se guarda el clima actual aleatorio

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
  const [teams, drivers, cars, circuits] = await Promise.all([
    fetch('../../db/teams/teams.json').then(r => r.json()),
    fetch('../../db/drivers/drivers.json').then(r => r.json()),
    fetch('../../db/cars/cars.json').then(r => r.json()),
    fetch('../../db/circuits/circuits.json').then(r => r.json())
  ]);
  data = { teams, drivers, cars, circuits };
  loadTeams();
  loadCircuits();
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
});

// NUEVO: Al seleccionar un circuito, generar clima aleatorio
$circuit.addEventListener('change', () => {
  climaActual = climasPosibles[Math.floor(Math.random() * climasPosibles.length)];
  $weather.textContent = `🌤️ Clima actual en el circuito: ${climaActual.nombre}`;
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
  
  // Crear y lanzar un evento personalizado para notificar que se ha completado una simulación
  const simulationResult = {
    driver: driver,
    car: car,
    circuit: circuit,
    clima: climaActual,
    resultado: result
  };
  
  // Crear y disparar un evento personalizado con los datos de la simulación
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