const vehiculosMenu = document.getElementById('vehiculos')

vehiculosMenu.addEventListener('click',()=>{
    console.log('menu de vehiculos activados')
})


const cargarCarros = async () =>{
    const respuesta = await fetch('../../db/cars/cars.json');
    const data = await respuesta.json()
    return data
}
const carros = localStorage.setItem('carros', JSON.stringify( await cargarCarros()))
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