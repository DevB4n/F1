const vehiculosMenu = document.getElementById('vehiculos')

vehiculosMenu.addEventListener('click',()=>{
    console.log('menu de vehiculos activados')
})


const cargarCarros = async () =>{
    const respuesta = await fetch('../../db/cars/cars.json');
    const data = await respuesta.json()
    return data
}
const cars = localStorage.setItem('carros', JSON.stringify( await cargarCarros()))
console.log(JSON.parse(localStorage.getItem('carros')))

const cargarTeams = async () =>{
    const respuesta = await fetch('../../db/teams/teams.json');
    const data = await respuesta.json()
    return data
}
const teams = localStorage.setItem('teams', JSON.stringify( await cargarTeams()))
console.log(JSON.parse(localStorage.getItem('teams')))

const cargarDrivers = async () =>{
    const respuesta = await fetch('../../db/drivers/drivers.json');
    const data = await respuesta.json()
    return data
}
const drivers = localStorage.setItem('drivers', JSON.stringify( await cargarDrivers()))
console.log(JSON.parse(localStorage.getItem('drivers')))

const cargarCircuits = async () =>{
    const respuesta = await fetch('../../db/circuits/circuits.json');
    const data = await respuesta.json()
    return data
}
const circuits = localStorage.setItem('circuits', JSON.stringify( await cargarCircuits()));
console.log(JSON.parse(localStorage.getItem('circuits')))


const teamSelect = document.getElementById('team-select')
const driverSelect = document.getElementById('driver-select')
const carSelect = document.getElementById('car-select')
const circuitSelect = document.getElementById('circuit-select')
const guardarBtn = document.getElementById('guardar-config')

// Cargar datos desde localStorage
const equipos = JSON.parse(localStorage.getItem('teams'))
const conductores = JSON.parse(localStorage.getItem('drivers'))
const carros = JSON.parse(localStorage.getItem('carros'))
const circuitos = JSON.parse(localStorage.getItem('circuits'))

// Rellenar selects
equipos.forEach(team => {
    const option = document.createElement('option')
    option.value = team.nombre || team.name
    option.textContent = team.nombre || team.name
    teamSelect.appendChild(option)
})

conductores.forEach(driver => {
    const option = document.createElement('option')
    option.value = driver.nombre || driver.name
    option.textContent = driver.nombre || driver.name
    driverSelect.appendChild(option)
})

carros.forEach(car => {
    const option = document.createElement('option')
    option.value = car.nombre || car.name
    option.textContent = car.nombre || car.name
    carSelect.appendChild(option)
})

circuitos.forEach(circuit => {
    const option = document.createElement('option')
    option.value = circuit.nombre || circuit.name
    option.textContent = circuit.nombre || circuit.name
    circuitSelect.appendChild(option)
})

// Guardar configuración
guardarBtn.addEventListener('click', () => {
    const config = {
        team: teamSelect.value,
        driver: driverSelect.value,
        car: carSelect.value,
        circuit: circuitSelect.value
    }

    if (!config.team || !config.driver || !config.car || !config.circuit) {
        alert('Por favor completa todos los campos antes de guardar.')
        return
    }

    const nombreConfig = prompt('¿Deseas guardar esta configuración? Ingresa un nombre o presiona cancelar para usarla temporalmente:')
    if (nombreConfig) {
        const guardadas = JSON.parse(localStorage.getItem('configs')) || {}
        guardadas[nombreConfig] = config
        localStorage.setItem('configs', JSON.stringify(guardadas))
        alert('Configuración guardada exitosamente.')
    } else {
        localStorage.setItem('temp-config', JSON.stringify(config))
        alert('Configuración lista para simulación.')
    }
})
