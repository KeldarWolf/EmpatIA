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
  const storedUser = JSON.parse(sessionStorage.getItem("usuario") || "null");

  const user = {
    id_usuario:
      storedUser?.id_usuario ||
      storedUser?.user?.id_usuario ||
      storedUser?.id ||
      null,
  };

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
     LOAD ACTIVITIES
  ========================= */
  const loadActivities = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
      );

      const data = await res.json();
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
      setEventos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

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
     CREATE EVENT (FIX REAL)
  ========================= */
  const createEvent = async () => {
    if (!user?.id_usuario || !titulo || !hora) return;

    try {
      const res = await fetch(`${API_URL}/api/rutina-eventos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          id_registro: selectedActivity?.id_registro || null,
          titulo,
          descripcion,
          hora,
          duracion,
          fecha: selectedDate.toISOString().split("T")[0],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("ERROR BACKEND:", data);
        return;
      }

      await loadEvents();

      setTitulo("");
      setDescripcion("");
      setHora("");
      setSelectedActivity(null);
      setLeftOpen(false);
    } catch (err) {
      console.log(err);
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
  const currentDate = selectedDate.toISOString().split("T")[0];
  const eventosDia = eventos.filter((e) => e.fecha === currentDate);

  /* =========================
     CALENDAR
  ========================= */
  const today = new Date();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const days = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="page">

      {/* HEADER */}
      <div className="header">
        <div>
          <h1>🧘 Rutina Inteligente</h1>
          <p>Organiza actividades por día</p>
        </div>

        <button className="back-btn" onClick={() => navigate("/home")}>
          ⬅ Volver
        </button>
      </div>

      {/* LAYOUT */}
      <div className="layout">

        {/* LEFT PANEL */}
        <div className={`left-panel ${leftOpen ? "open" : ""}`}>
          <h3>🎯 Actividades</h3>

          {actividades.map((act) => (
            <div
              key={act.id_registro}
              className={`activity-card ${
                selectedActivity?.id_registro === act.id_registro ? "selected" : ""
              }`}
              onClick={() => selectActivity(act)}
            >
              <strong>{act.nombre_actividad}</strong>
              <p>⭐ {act.puntaje_agrado}/10</p>
            </div>
          ))}

          <hr />

          <h3>➕ Crear evento</h3>

          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título"
          />

          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción"
          />

          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
          />

          <input
            type="number"
            value={duracion}
            onChange={(e) => setDuracion(e.target.value)}
          />

          <button onClick={createEvent}>Crear rutina</button>
        </div>

        {/* CENTER PANEL */}
        <div className="center-panel">
          <h3>📅 {selectedDate.toLocaleDateString()}</h3>

          {eventosDia.length === 0 ? (
            <p>No hay eventos</p>
          ) : (
            eventosDia.map((evento) => (
              <div
                key={evento.id_evento}
                className={`event-card ${evento.completado ? "completed" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={evento.completado}
                  onChange={() => toggleComplete(evento)}
                />

                <div>
                  <h4>{evento.titulo}</h4>
                  <p>🕒 {evento.hora}</p>
                  <p>⏳ {evento.duracion} min</p>
                  <p>{evento.descripcion}</p>
                </div>

                <button onClick={() => deleteEvent(evento.id_evento)}>
                  🗑
                </button>
              </div>
            ))
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className={`right-panel ${rightOpen ? "open" : ""}`}>
          <h3>📆 Calendario</h3>

          <select
            value={currentMonth}
            onChange={(e) =>
              setSelectedDate(
                new Date(currentYear, Number(e.target.value), 1)
              )
            }
          >
            {[
              "Enero","Febrero","Marzo","Abril","Mayo","Junio",
              "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
            ].map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>

          <div className="week">
            {days.map((d, i) => (
              <div
                key={i}
                onClick={() =>
                  d && setSelectedDate(new Date(currentYear, currentMonth, d))
                }
              >
                {d}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
