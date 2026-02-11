const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

// Bloques de 50 minutos (último se pasa)
const horas = [
  "11:00-11:50",
  "11:50-12:40",
  "12:40-13:30",
  "13:30-14:20",
  "14:20-15:10"
];

let jugadores = JSON.parse(localStorage.getItem("jugadores")) || [];
let grafica = null;

// Crear checkboxes
const contenedor = document.getElementById("horarios");
dias.forEach(dia => {
  horas.forEach(hora => {
    contenedor.innerHTML += `
      <label class="hora">
        <input type="checkbox" value="${dia}-${hora}">
        ${dia} ${hora}
      </label>
    `;
  });
  contenedor.innerHTML += "<br>";
});

function guardarJugador() {
  const nombre = document.getElementById("nombre").value.trim();
  if (!nombre) {
    alert("Escribe tu nombre");
    return;
  }

  // Evitar nombres duplicados
  const existe = jugadores.some(j =>
    j.nombre.toLowerCase() === nombre.toLowerCase()
  );

  if (existe) {
    alert("Ese nombre ya está registrado");
    return;
  }

  const ocupados = Array.from(
    document.querySelectorAll("input[type=checkbox]:checked")
  ).map(cb => cb.value);

  jugadores.push({ nombre, ocupados });
  localStorage.setItem("jugadores", JSON.stringify(jugadores));

  document.getElementById("nombre").value = "";
  document.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);

  calcularDisponibilidad();
}

function calcularDisponibilidad() {
  const resultados = [];

  dias.forEach(dia => {
    horas.forEach(hora => {
      let libres = 0;

      jugadores.forEach(j => {
        if (!j.ocupados.includes(`${dia}-${hora}`)) libres++;
      });

      resultados.push({ dia, hora, libres });
    });
  });

  resultados.sort((a, b) => b.libres - a.libres);
  mostrarResultados(resultados);
}

function mostrarResultados(resultados) {
  const tabla = document.getElementById("tablaResultados");
  tabla.innerHTML = "";

  const labels = [];
  const data = [];

  resultados.forEach(r => {
    let clase = "rojo";
    if (r.libres >= 9) clase = "verde";
    else if (r.libres >= 6) clase = "amarillo";

    tabla.innerHTML += `
      <tr class="${clase}">
        <td>${r.dia}</td>
        <td>${r.hora}</td>
        <td>${r.libres} / 12</td>
      </tr>
    `;

    labels.push(`${r.dia} ${r.hora}`);
    data.push(r.libres);
  });

  document.getElementById("totalJugadores").innerText =
    `Jugadores registrados: ${jugadores.length}`;

  crearGrafica(labels, data);
}

function crearGrafica(labels, data) {
  const ctx = document.getElementById("graficaHorarios").getContext("2d");

  if (grafica) grafica.destroy();

  grafica = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Jugadores disponibles",
        data: data,
        backgroundColor: "#4caf50"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 12 }
      }
    }
  });
}

// Mostrar / ocultar gráfica (solo organizador)
function toggleGrafica() {
  const zona = document.getElementById("zonaGrafica");
  zona.style.display = zona.style.display === "none" ? "block" : "none";
}

function borrarTodo() {
  if (confirm("¿Seguro que deseas borrar todos los datos?")) {
    localStorage.removeItem("jugadores");
    jugadores = [];
    calcularDisponibilidad();
  }
}

// Al cargar
calcularDisponibilidad();
