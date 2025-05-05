// Importar las funciones necesarias
export const cargarCircuitos = async () => {
    // Primero intentamos cargar del localStorage
    const circuitosLocalStorage = localStorage.getItem('circuitos');
    
    if (circuitosLocalStorage) {
        return JSON.parse(circuitosLocalStorage);
    } else {
        // Si no hay datos en localStorage, cargamos del JSON
        const respuesta = await fetch('../db/circuits/circuits.json');
        const data = await respuesta.json();
        
        // Guardamos en localStorage 
        localStorage.setItem('circuitos', JSON.stringify(data));
        return data;
    }
}

export const cargarConductores = async () => {
    const respuesta = await fetch('../db/drivers/drivers.json');
    const data = await respuesta.json();
    return data;
}

// Función para verificar si el usuario es administrador
export const esAdmin = () => {
    return localStorage.getItem('admin') === 'true';
}

// Función para mostrar detalles d
const mostrarDetalles = (circuito, pilotos) => {

    const modal = document.createElement('div');
    modal.classList.add('modal');
    
    const modalContenido = document.createElement('div');
    modalContenido.classList.add('modal-contenido');
    
    // Botón para cerrar
    const cerrarBtn = document.createElement('span');
    cerrarBtn.classList.add('cerrar');
    cerrarBtn.innerHTML = '&times;';
    cerrarBtn.onclick = () => modal.remove();
    
    const img = document.createElement('img');
    img.src = circuito.imagen;
    img.alt = circuito.nombre;
    img.classList.add('modal-img');
    
    // Información detallada
    const info = document.createElement('div');
    info.classList.add('info-detalle');
    
    info.innerHTML = `
        <h2>${circuito.nombre} (${circuito.pais})</h2>
        <p><strong>Longitud:</strong> ${circuito.longitud_km} km</p>
        <p><strong>Vueltas:</strong> ${circuito.vueltas}</p>
        <p><strong>Récord de vuelta:</strong> ${circuito.record_vuelta.tiempo} - ${circuito.record_vuelta.piloto} (${circuito.record_vuelta.año})</p>
        <p><strong>Descripción:</strong> ${circuito.descripcion}</p>
    `;
    
    // Ganadores
    const ganadoresDiv = document.createElement('div');
    ganadoresDiv.innerHTML = '<h3>Ganadores recientes:</h3>';
    
    const ganadoresList = document.createElement('ul');
    circuito.ganadores.forEach(ganador => {
        const pilotoNombre = pilotos.find(p => p.id === ganador.piloto)?.nombre || 'Desconocido';
        const li = document.createElement('li');
        li.textContent = `${ganador.temporada}: ${pilotoNombre}`;
        ganadoresList.appendChild(li);
    });
    
    ganadoresDiv.appendChild(ganadoresList);
    info.appendChild(ganadoresDiv);
    
    // Agregar botones de editar y eliminar si es admin
    if (esAdmin()) {
        const botonesAdmin = document.createElement('div');
        botonesAdmin.classList.add('botones-admin');
        
        const editarBtn = document.createElement('button');
        editarBtn.textContent = 'Editar';
        editarBtn.classList.add('btn', 'btn-editar');
        editarBtn.onclick = () => editarCircuito(circuito);
        
        const eliminarBtn = document.createElement('button');
        eliminarBtn.textContent = 'Eliminar';
        eliminarBtn.classList.add('btn', 'btn-eliminar');
        eliminarBtn.onclick = () => eliminarCircuito(circuito);
        
        botonesAdmin.appendChild(editarBtn);
        botonesAdmin.appendChild(eliminarBtn);
        info.appendChild(botonesAdmin);
    }
    
    modalContenido.appendChild(cerrarBtn);
    modalContenido.appendChild(img);
    modalContenido.appendChild(info);
    modal.appendChild(modalContenido);
    
    document.body.appendChild(modal);
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    }
}

// Función para editar circuito 
const editarCircuito = (circuito) => {
    // Crear un formulario dentro de un modal
    const modal = document.createElement('div');
    modal.classList.add('modal');
    
    const modalContenido = document.createElement('div');
    modalContenido.classList.add('modal-contenido', 'form-contenido');
    
    const cerrarBtn = document.createElement('span');
    cerrarBtn.classList.add('cerrar');
    cerrarBtn.innerHTML = '&times;';
    cerrarBtn.onclick = () => modal.remove();
    
    const form = document.createElement('form');
    form.classList.add('form-editar');
    form.innerHTML = `
        <h2>Editar Circuito</h2>
        
        <div class="form-grupo">
            <label for="nombre">Nombre:</label>
            <input type="text" id="nombre" value="${circuito.nombre}" required>
        </div>
        
        <div class="form-grupo">
            <label for="pais">País:</label>
            <input type="text" id="pais" value="${circuito.pais}" required>
        </div>
        
        <div class="form-grupo">
            <label for="longitud">Longitud (km):</label>
            <input type="number" id="longitud" step="0.01" value="${circuito.longitud_km}" required>
        </div>
        
        <div class="form-grupo">
            <label for="vueltas">Vueltas:</label>
            <input type="number" id="vueltas" value="${circuito.vueltas}" required>
        </div>
        
        <div class="form-grupo">
            <label for="descripcion">Descripción:</label>
            <textarea id="descripcion" required>${circuito.descripcion}</textarea>
        </div>
        
        <div class="form-grupo">
            <label for="recordTiempo">Récord - Tiempo:</label>
            <input type="text" id="recordTiempo" value="${circuito.record_vuelta.tiempo}" required>
        </div>
        
        <div class="form-grupo">
            <label for="recordPiloto">Récord - Piloto:</label>
            <input type="text" id="recordPiloto" value="${circuito.record_vuelta.piloto}" required>
        </div>
        
        <div class="form-grupo">
            <label for="recordAno">Récord - Año:</label>
            <input type="number" id="recordAno" value="${circuito.record_vuelta.año}" required>
        </div>
        
        <div class="form-grupo">
            <label for="imagen">URL de la imagen:</label>
            <input type="url" id="imagen" value="${circuito.imagen}" required>
        </div>
        
        <div class="form-grupo botones">
            <button type="submit" class="btn btn-guardar">Guardar Cambios</button>
            <button type="button" class="btn btn-cancelar" id="cancelarBtn">Cancelar</button>
        </div>
    `;
    
    modalContenido.appendChild(cerrarBtn);
    modalContenido.appendChild(form);
    modal.appendChild(modalContenido);
    document.body.appendChild(modal);
    
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const circuitos = await cargarCircuitos();
        
        // Encontrar el índice del circuito a editar
        const index = circuitos.findIndex(c => 
            c.nombre === circuito.nombre && 
            c.pais === circuito.pais
        );
        
        if (index !== -1) {

            circuitos[index] = {
                ...circuito, 
                nombre: document.getElementById('nombre').value,
                pais: document.getElementById('pais').value,
                longitud_km: parseFloat(document.getElementById('longitud').value),
                vueltas: parseInt(document.getElementById('vueltas').value),
                descripcion: document.getElementById('descripcion').value,
                record_vuelta: {
                    tiempo: document.getElementById('recordTiempo').value,
                    piloto: document.getElementById('recordPiloto').value,
                    año: parseInt(document.getElementById('recordAno').value)
                },
                imagen: document.getElementById('imagen').value
            };
            
            // Guardar en localStorage
            localStorage.setItem('circuitos', JSON.stringify(circuitos));
            
            // Cerrar modal y recargar la página
            modal.remove();
            location.reload();
        }
    };
    
    // Botón cancelar - AHORA SÍ PODEMOS ENCONTRARLO EN EL DOM
    document.getElementById('cancelarBtn').onclick = () => modal.remove();
}
// Función para eliminar circuito
const eliminarCircuito = (circuito) => {
    // Confirmar antes de eliminar
    const confirmar = confirm(`¿Estás seguro de que deseas eliminar el circuito ${circuito.nombre}?`);
    
    if (confirmar) {
        // Obtener circuitos del localStorage
        const circuitosStr = localStorage.getItem('circuitos');
        
        if (circuitosStr) {
            const circuitos = JSON.parse(circuitosStr);
            
            // Encontrar el índice del circuito a eliminar
            const index = circuitos.findIndex(c => 
                c.nombre === circuito.nombre && 
                c.pais === circuito.pais
            );
            
            if (index !== -1) {
                // Eliminar el circuito
                circuitos.splice(index, 1);
                
                // Guardar en localStorage
                localStorage.setItem('circuitos', JSON.stringify(circuitos));
                
                // Recargar la página
                location.reload();
            }
        }
    }
}

// Función para agregar un nuevo circuito
export const agregarCircuito = () => {
    // Crear un formulario dentro de un modal
    const modal = document.createElement('div');
    modal.classList.add('modal');
    
    const modalContenido = document.createElement('div');
    modalContenido.classList.add('modal-contenido', 'form-contenido');
    
    const cerrarBtn = document.createElement('span');
    cerrarBtn.classList.add('cerrar');
    cerrarBtn.innerHTML = '&times;';
    cerrarBtn.onclick = () => modal.remove();
    
    const form = document.createElement('form');
    form.classList.add('form-agregar');
    form.innerHTML = `
        <h2>Agregar Nuevo Circuito</h2>
        
        <div class="form-grupo">
            <label for="nombre">Nombre:</label>
            <input type="text" id="nombre" required>
        </div>
        
        <div class="form-grupo">
            <label for="pais">País:</label>
            <input type="text" id="pais" required>
        </div>
        
        <div class="form-grupo">
            <label for="longitud">Longitud (km):</label>
            <input type="number" id="longitud" step="0.01" required>
        </div>
        
        <div class="form-grupo">
            <label for="vueltas">Vueltas:</label>
            <input type="number" id="vueltas" required>
        </div>
        
        <div class="form-grupo">
            <label for="descripcion">Descripción:</label>
            <textarea id="descripcion" required></textarea>
        </div>
        
        <div class="form-grupo">
            <label for="recordTiempo">Récord - Tiempo:</label>
            <input type="text" id="recordTiempo" required>
        </div>
        
        <div class="form-grupo">
            <label for="recordPiloto">Récord - Piloto:</label>
            <input type="text" id="recordPiloto" required>
        </div>
        
        <div class="form-grupo">
            <label for="recordAno">Récord - Año:</label>
            <input type="number" id="recordAno" required>
        </div>
        
        <div class="form-grupo">
            <label for="imagen">URL de la imagen:</label>
            <input type="url" id="imagen" required>
        </div>
        
        <div class="form-grupo">
            <h3>Ganadores Recientes</h3>
            <div id="ganadores-container">
                <div class="ganador-entrada">
                    <label>Temporada:</label>
                    <input type="number" class="temporada" required>
                    <label>ID del Piloto:</label>
                    <input type="number" class="piloto-id" required>
                    <button type="button" class="btn-eliminar-ganador">-</button>
                </div>
            </div>
            <button type="button" id="agregar-ganador" class="btn btn-agregar-ganador">+ Añadir Ganador</button>
        </div>
        
        <div class="form-grupo botones">
            <button type="submit" class="btn btn-guardar">Guardar Circuito</button>
            <button type="button" class="btn btn-cancelar" id="cancelarBtn">Cancelar</button>
        </div>
    `;
    
    // Agregar el modal al DOM antes de agregar event listeners
    modalContenido.appendChild(cerrarBtn);
    modalContenido.appendChild(form);
    modal.appendChild(modalContenido);
    document.body.appendChild(modal);
    
    // Función para añadir otro ganador
    document.getElementById('agregar-ganador').addEventListener('click', () => {
        const container = document.getElementById('ganadores-container');
        const nuevaEntrada = document.createElement('div');
        nuevaEntrada.classList.add('ganador-entrada');
        nuevaEntrada.innerHTML = `
            <label>Temporada:</label>
            <input type="number" class="temporada" required>
            <label>ID del Piloto:</label>
            <input type="number" class="piloto-id" required>
            <button type="button" class="btn-eliminar-ganador">-</button>
        `;
        container.appendChild(nuevaEntrada);
        
        // Añadir event listener al nuevo botón de eliminar
        nuevaEntrada.querySelector('.btn-eliminar-ganador').addEventListener('click', function() {
            this.parentElement.remove();
        });
    });
    
    // Añadir event listeners a botones de eliminar ganador existentes
    document.querySelectorAll('.btn-eliminar-ganador').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.remove();
        });
    });
    
    // Manejar envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Recopilar todos los ganadores
        const ganadoresEntradas = document.querySelectorAll('.ganador-entrada');
        const ganadores = [];
        
        ganadoresEntradas.forEach(entrada => {
            ganadores.push({
                temporada: parseInt(entrada.querySelector('.temporada').value),
                piloto: parseInt(entrada.querySelector('.piloto-id').value)
            });
        });
        
        // Crear el nuevo circuito
        const nuevoCircuito = {
            nombre: document.getElementById('nombre').value,
            pais: document.getElementById('pais').value,
            longitud_km: parseFloat(document.getElementById('longitud').value),
            vueltas: parseInt(document.getElementById('vueltas').value),
            descripcion: document.getElementById('descripcion').value,
            record_vuelta: {
                tiempo: document.getElementById('recordTiempo').value,
                piloto: document.getElementById('recordPiloto').value,
                año: parseInt(document.getElementById('recordAno').value)
            },
            imagen: document.getElementById('imagen').value,
            ganadores: ganadores
        };
        
        const circuitosStr = localStorage.getItem('circuitos');
        let circuitos = [];
        
        if (circuitosStr) {
            circuitos = JSON.parse(circuitosStr);
        }
        
        circuitos.push(nuevoCircuito);
        
        // Guardar en localStorage
        localStorage.setItem('circuitos', JSON.stringify(circuitos));
        
        modal.remove();
        location.reload();
    });
    
    document.getElementById('cancelarBtn').addEventListener('click', () => modal.remove());
}

// Función principal para crear las tarjetas
export const crearTarjetas = async () => {
    const circuitos = await cargarCircuitos();
    const pilotos = await cargarConductores();
    const contenedorTarjetas = document.getElementById('circuitos');
    console.log(circuitos);console.log(await cargarCircuitos())
    // Limpiar el contenedor
    contenedorTarjetas.innerHTML = '';
    
    // Crear el botón de añadir circuito si es admin
    if (esAdmin()) {
        const btnContainer = document.createElement('div');
        btnContainer.classList.add('admin-controls');
        
        const addBtn = document.createElement('button');
        addBtn.textContent = '+ Añadir Circuito';
        addBtn.classList.add('btn', 'btn-agregar');
        addBtn.onclick = agregarCircuito;
        
        btnContainer.appendChild(addBtn);
        document.querySelector('#header').appendChild(btnContainer);
    }
    
    // Crear tarjetas para cada circuito
    circuitos.forEach(circuito => {

        const card = document.createElement('div');
        card.classList.add('card');
        
        const img = document.createElement('img');
        img.src = circuito.imagen;
        img.alt = circuito.nombre;
        img.classList.add('card-img');
        card.appendChild(img);
        
        const titulo = document.createElement('h3');
        titulo.textContent = `${circuito.nombre} (${circuito.pais})`;
        card.appendChild(titulo);
        
        const desc = document.createElement('p');
        desc.textContent = circuito.descripcion.length > 100 
            ? circuito.descripcion.substring(0, 100) + '...' 
            : circuito.descripcion;
        card.appendChild(desc);
        
        const record = document.createElement('p');
        record.innerHTML = `<strong>Récord:</strong> ${circuito.record_vuelta.tiempo} - ${circuito.record_vuelta.piloto} (${circuito.record_vuelta.año})`;
        card.appendChild(record);
        
        const ganadores = document.createElement('ul');
        ganadores.innerHTML = `<strong>Ganadores recientes:</strong>`;
        
        const ganadoresRecientes = [...circuito.ganadores].sort((a, b) => b.temporada - a.temporada).slice(0, 2);
        
        ganadoresRecientes.forEach(ganador => {
            const pilotoNombre = pilotos.find(p => p.id === ganador.piloto)?.nombre || 'Desconocido';
            const li = document.createElement('li');
            li.textContent = `${ganador.temporada}: ${pilotoNombre}`;
            ganadores.appendChild(li);
        });
        
        card.appendChild(ganadores);
        
        const btnDetalles = document.createElement('button');
        btnDetalles.textContent = 'Ver detalles';
        btnDetalles.classList.add('btn', 'btn-detalles');
        btnDetalles.onclick = () => mostrarDetalles(circuito, pilotos);
        
        card.appendChild(btnDetalles);
        
        if (esAdmin()) {
            const adminBtns = document.createElement('div');
            adminBtns.classList.add('card-admin-btns');
            
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '✏️';
            editBtn.title = 'Editar';
            editBtn.classList.add('btn', 'btn-icon');
            editBtn.onclick = (e) => {
                e.stopPropagation();
                editarCircuito(circuito);
            };
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.title = 'Eliminar';
            deleteBtn.classList.add('btn', 'btn-icon');
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                eliminarCircuito(circuito);
            };
            
            adminBtns.appendChild(editBtn);
            adminBtns.appendChild(deleteBtn);
            card.appendChild(adminBtns);
        }
        
        card.addEventListener('click', () => mostrarDetalles(circuito, pilotos));
        
        contenedorTarjetas.appendChild(card);
        
    });
};

document.addEventListener('DOMContentLoaded', crearTarjetas);