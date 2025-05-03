export const cargarCircuitos = async () =>{
    const respuesta = await fetch('../../db/circuits/circuits.json')
    const data = await respuesta.json()
    return data
}

export const cargarConductores = async () =>{
    const respuesta = await fetch('../../db/drivers/drivers.json')
    const data = await respuesta.json()
    return data
}



export const crearTarjetas = async () => {
    const circuitos = await cargarCircuitos();
    const pilotos = await cargarConductores();
    const contenedorTarjetas = document.getElementById('circuitos');

    circuitos.forEach(circuito => {
        // Crear tarjeta
        const card = document.createElement('div');
        card.classList.add('card');

        // Imagen
        const img = document.createElement('img');
        img.src = circuito.imagen;
        img.alt = circuito.nombre;
        img.classList.add('card-img');
        card.appendChild(img);

        // Nombre y país
        const titulo = document.createElement('h3');
        titulo.textContent = `${circuito.nombre} (${circuito.pais})`;
        card.appendChild(titulo);

        // Descripción
        const desc = document.createElement('p');
        desc.textContent = circuito.descripcion;
        card.appendChild(desc);

        // Record de vuelta
        const record = document.createElement('p');
        record.innerHTML = `<strong>Récord:</strong> ${circuito.record_vuelta.tiempo} - ${circuito.record_vuelta.piloto} (${circuito.record_vuelta.año})`;
        card.appendChild(record);

        // Ganadores
        const ganadores = document.createElement('ul');
        ganadores.innerHTML = `<strong>Ganadores recientes:</strong>`;
        circuito.ganadores.forEach(ganador => {
            const pilotoNombre = pilotos.find(p => p.id === ganador.piloto)?.nombre || 'Desconocido';
            const li = document.createElement('li');
            li.textContent = `${ganador.temporada}: ${pilotoNombre}`;
            ganadores.appendChild(li);
        });
        card.appendChild(ganadores);

        // Agregar al contenedor principal
        contenedorTarjetas.appendChild(card);
    });
};
