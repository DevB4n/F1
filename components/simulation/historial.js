// Funcionalidad para manejar el historial de carreras
document.addEventListener('DOMContentLoaded', () => {
    const historialContainer = document.getElementById('historial-carreras');
    const borrarHistorialBtn = document.getElementById('borrar-historial');
    
    // Cargar el historial al iniciar la página
    cargarHistorial();
    
    // Escuchar el evento personalizado de simulación completada
    document.addEventListener('simulacionCompletada', (event) => {
      const simData = event.detail;
      
      // Extraer datos de la simulación
      const driver = simData.driver;
      const car = simData.car;
      const circuit = simData.circuit;
      const clima = simData.clima;
      const resultado = simData.resultado;
      
      // Crear objeto de carrera para guardar
      const carrera = {
        id: Date.now(), // ID único basado en timestamp
        fecha: new Date().toLocaleString(),
        equipo: driver.equipo,
        piloto: driver.nombre,
        auto: car.modelo,
        circuito: circuit.nombre,
        clima: clima.nombre,
        tiempo: resultado.time,
        velocidad: resultado.speed
      };
      
      // Guardar automáticamente en el historial
      guardarCarrera(carrera);
    });
  
    // Evento para borrar todo el historial
    borrarHistorialBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas borrar todo el historial de carreras?')) {
        localStorage.removeItem('historialf1');
        cargarHistorial(); // Recargar la vista (ahora vacía)
      }
    });
  
    // Función para cargar el historial desde localStorage
    function cargarHistorial() {
      const historial = obtenerHistorial();
      historialContainer.innerHTML = '';
  
      if (historial.length === 0) {
        historialContainer.innerHTML = '<p class="no-historial">No hay carreras en el historial</p>';
        return;
      }
  
      // Crear la tabla para mostrar el historial
      const tabla = document.createElement('table');
      tabla.className = 'historial-tabla';
      
      // Encabezado de la tabla
      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr>
          <th>Fecha</th>
          <th>Piloto</th>
          <th>Equipo</th>
          <th>Auto</th>
          <th>Circuito</th>
          <th>Clima</th>
          <th>Tiempo</th>
          <th>Velocidad</th>
          <th>Acciones</th>
        </tr>
      `;
      tabla.appendChild(thead);
      
      // Cuerpo de la tabla
      const tbody = document.createElement('tbody');
      historial.forEach(carrera => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${carrera.fecha}</td>
          <td>${carrera.piloto}</td>
          <td>${carrera.equipo}</td>
          <td>${carrera.auto}</td>
          <td>${carrera.circuito}</td>
          <td>${carrera.clima}</td>
          <td>${carrera.tiempo.toFixed(2)} s</td>
          <td>${carrera.velocidad.toFixed(2)} km/h</td>
          <td><button class="borrar-carrera" data-id="${carrera.id}">🗑️</button></td>
        `;
        tbody.appendChild(fila);
      });
      tabla.appendChild(tbody);
      
      historialContainer.appendChild(tabla);
      
      // Agregar eventos a los botones de borrar individual
      document.querySelectorAll('.borrar-carrera').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.getAttribute('data-id'));
          borrarCarrera(id);
        });
      });
    }
  
    // Función para obtener el historial desde localStorage
    function obtenerHistorial() {
      const historialJSON = localStorage.getItem('historialf1');
      return historialJSON ? JSON.parse(historialJSON) : [];
    }
  
    // Función para guardar una carrera en el historial
    function guardarCarrera(carrera) {
      const historial = obtenerHistorial();
      historial.unshift(carrera); // Agregar al inicio para mostrar los más recientes primero
      localStorage.setItem('historialf1', JSON.stringify(historial));
      cargarHistorial(); // Actualizar la vista
    }
  
    // Función para borrar una carrera específica
    function borrarCarrera(id) {
      const historial = obtenerHistorial();
      const nuevoHistorial = historial.filter(carrera => carrera.id !== id);
      localStorage.setItem('historialf1', JSON.stringify(nuevoHistorial));
      cargarHistorial(); // Actualizar la vista
    }
  });