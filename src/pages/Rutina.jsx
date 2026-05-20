import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Rutina.css";

const API_URL = "https://empatia-backend.onrender.com";

export default function Rutina() {
  const navigate = useNavigate();

  /* =========================
     MOBILE PANELS
  ========================= */
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  /* =========================
     USER
  ========================= */
  const storedUser = JSON.parse(
    sessionStorage.getItem("usuario") || "null"
  );

  console.log("SESSION USER:", storedUser);

  const user = {
    id_usuario:
      storedUser?.id_usuario ||
      storedUser?.user?.id_usuario ||
      storedUser?.id ||
      null,
  };

  console.log("USER FINAL:", user);

  /* =========================
     STATES
  ========================= */
  const [actividades, setActividades] = useState([]);
  const [eventos, setEventos] = useState([]);

  const [selectedActivity, setSelectedActivity] = useState(null);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [hora, setHora] = useState("");
  const [duracion, setDuracion] = useState(30);

  const [selectedDate, setSelectedDate] = useState(new Date());

  /* =========================
     FORMAT DATE LOCAL
  ========================= */
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /* =========================
     LOAD ACTIVITIES
  ========================= */
  const loadActivities = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
      );

      const data = await res.json();

      console.log("ACTIVIDADES:", data);

      setActividades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
     LOAD EVENTS
  ========================= */
  const loadEvents = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/rutina-eventos/${user.id_usuario}`
      );

      const data = await res.json();

      console.log("EVENTOS:", data);

      setEventos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
     INIT
  ========================= */
  useEffect(() => {
    if (user?.id_usuario) {
      loadActivities();
      loadEvents();
    }
  }, [user?.id_usuario]);

  /* =========================
     SELECT ACTIVITY
  ========================= */
  const selectActivity = (act) => {
    setSelectedActivity(act);

    setTitulo(act.nombre_actividad || "");

    setLeftOpen(true);
    setRightOpen(false);
  };

  /* =========================
     CREATE EVENT
  ========================= */
  const createEvent = async () => {
    if (!user?.id_usuario) {
      alert("Usuario no encontrado");
      return;
    }

    if (!titulo.trim()) {
      alert("Debe ingresar un título");
      return;
    }

    if (!hora) {
      alert("Debe seleccionar una hora");
      return;
    }

    try {
      const payload = {
        id_usuario: user.id_usuario,
        id_registro: selectedActivity?.id_registro || null,
        titulo,
        descripcion,
        hora,
        duracion,
        fecha: formatDateLocal(selectedDate),
      };

      console.log("📤 ENVIANDO:", payload);

      const res = await fetch(`${API_URL}/api/rutina-eventos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("📥 RESPUESTA:", data);

      if (!res.ok) {
        alert(data.error || "Error creando evento");
        return;
      }

      alert("Rutina creada correctamente");

      await loadEvents();

      setTitulo("");
      setDescripcion("");
      setHora("");
      setDuracion(30);

      setSelectedActivity(null);

      setLeftOpen(false);

    } catch (err) {
      console.log(err);
      alert("Error conexión servidor");
    }
  };

  /* =========================
     DELETE EVENT
  ========================= */
  const deleteEvent = async (id_evento) => {
    try {
      await fetch(`${API_URL}/api/rutina-eventos/${id_evento}`, {
        method: "DELETE",
      });

      loadEvents();
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
     TOGGLE COMPLETE
  ========================= */
  const toggleComplete = async (evento) => {
    try {
      await fetch(`${API_URL}/api/rutina-eventos/${evento.id_evento}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completado: !evento.completado,
        }),
      });

      loadEvents();
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
     FILTER EVENTS
  ========================= */
  const currentDate = formatDateLocal(selectedDate);

  const eventosDia = eventos.filter(
    (e) => e.fecha === currentDate
  );

  /* =========================
     CALENDAR
  ========================= */
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const daysInMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();

  let firstDay = new Date(
    currentYear,
    currentMonth,
    1
  ).getDay();

  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  /* =========================
     MONTH CHANGE
  ========================= */
  const changeMonth = (direction) => {
    setSelectedDate(
      new Date(currentYear, currentMonth + direction, 1)
    );
  };

  return (
    <div className="page">

      {/* HEADER */}
      <div className="header">

        <div>
          <h1>🧘 Rutina Inteligente</h1>
          <p>Organiza tus actividades diarias</p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/home")}
        >
          ⬅ Volver
        </button>

      </div>

      {/* LAYOUT */}
      <div className="layout">

        {/* LEFT PANEL */}
        <div className={`left-panel ${leftOpen ? "open" : ""}`}>

          <h3>🎯 Actividades</h3>

          {actividades.length === 0 && (
            <p>No tienes actividades registradas</p>
          )}

          {actividades.map((act) => (
            <div
              key={act.id_registro}
              className={`activity-card ${
                selectedActivity?.id_registro === act.id_registro
                  ? "selected"
                  : ""
              }`}
              onClick={() => selectActivity(act)}
            >
              <strong>{act.nombre_actividad}</strong>

              <p>
                ⭐ {act.puntaje_agrado || 5}/10
              </p>
            </div>
          ))}

          <hr />

          <h3>➕ Crear rutina</h3>

          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <label>Hora</label>

          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
          />

          <label>Duración (min)</label>

          <input
            type="number"
            min="5"
            value={duracion}
            onChange={(e) =>
              setDuracion(Number(e.target.value))
            }
          />

          <button onClick={createEvent}>
            Guardar rutina
          </button>

        </div>

        {/* CENTER */}
        <div className="center-panel">

          <h2>
            📅 {selectedDate.toLocaleDateString()}
          </h2>

          {eventosDia.length === 0 ? (
            <div className="empty-events">
              <p>No hay rutinas este día</p>
            </div>
          ) : (
            eventosDia.map((evento) => (
              <div
                key={evento.id_evento}
                className={`event-card ${
                  evento.completado ? "completed" : ""
                }`}
              >

                <input
                  type="checkbox"
                  checked={evento.completado}
                  onChange={() =>
                    toggleComplete(evento)
                  }
                />

                <div className="event-info">

                  <h4>{evento.titulo}</h4>

                  <p>🕒 {evento.hora}</p>

                  <p>
                    ⏳ {evento.duracion} minutos
                  </p>

                  {evento.descripcion && (
                    <p>{evento.descripcion}</p>
                  )}

                </div>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteEvent(evento.id_evento)
                  }
                >
                  🗑
                </button>

              </div>
            ))
          )}

        </div>

        {/* RIGHT PANEL */}
        <div className={`right-panel ${rightOpen ? "open" : ""}`}>

          <h3>📆 Calendario</h3>

          <div className="month-nav">

            <button onClick={() => changeMonth(-1)}>
              ◀
            </button>

            <h4>
              {[
                "Enero",
                "Febrero",
                "Marzo",
                "Abril",
                "Mayo",
                "Junio",
                "Julio",
                "Agosto",
                "Septiembre",
                "Octubre",
                "Noviembre",
                "Diciembre",
              ][currentMonth]}{" "}
              {currentYear}
            </h4>

            <button onClick={() => changeMonth(1)}>
              ▶
            </button>

          </div>

          <div className="calendar-grid">

            {["L","M","M","J","V","S","D"].map((d) => (
              <div
                key={d}
                className="calendar-header"
              >
                {d}
              </div>
            ))}

            {days.map((d, i) => {
              const dateString = d
                ? formatDateLocal(
                    new Date(
                      currentYear,
                      currentMonth,
                      d
                    )
                  )
                : null;

              const hasEvents =
                dateString &&
                eventos.some(
                  (e) => e.fecha === dateString
                );

              const isSelected =
                d &&
                selectedDate.getDate() === d &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getFullYear() === currentYear;

              return (
                <div
                  key={i}
                  className={`
                    calendar-day
                    ${isSelected ? "selected-day" : ""}
                    ${hasEvents ? "has-events" : ""}
                    ${!d ? "empty" : ""}
                  `}
                  onClick={() =>
                    d &&
                    setSelectedDate(
                      new Date(
                        currentYear,
                        currentMonth,
                        d
                      )
                    )
                  }
                >
                  {d}

                  {hasEvents && (
                    <span className="dot"></span>
                  )}

                </div>
              );
            })}

          </div>

        </div>

      </div>

    </div>
  );
}
