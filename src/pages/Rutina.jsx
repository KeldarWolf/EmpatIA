import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Rutina.css";

const API_URL = "https://empatia-backend.onrender.com";

export default function Rutina() {
  const navigate = useNavigate();

  /* USER */
  const storedUser = JSON.parse(sessionStorage.getItem("usuario") || "null");

  const user = {
    id_usuario:
      storedUser?.id_usuario ||
      storedUser?.user?.id_usuario ||
      storedUser?.id ||
      null,
  };

  /* MOBILE */
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  /* DATA */
  const [actividades, setActividades] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  /* FORM */
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [hora, setHora] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [duracion, setDuracion] = useState(30);

  /* DATE */
  const [selectedDate, setSelectedDate] = useState(new Date());

  /* FORMAT */
  const formatDateLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  /* LOAD ACTIVITIES */
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

  /* LOAD EVENTS */
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

  /* SELECT ACTIVITY */
  const selectActivity = (act) => {
    setSelectedActivity(act);
    setTitulo(act.nombre_actividad || "");
    setLeftOpen(true);
  };

  /* CREATE EVENT */
  const createEvent = async () => {
    if (!titulo.trim()) return alert("Ingrese título");
    if (!hora) return alert("Seleccione hora");

    try {
      const payload = {
        id_usuario: user.id_usuario,
        id_registro: selectedActivity?.id_registro || null,
        titulo,
        descripcion,
        fecha: formatDateLocal(selectedDate),
        hora,
        hora_fin: horaFin || null,
        duracion,
      };

      const res = await fetch(`${API_URL}/api/rutina-eventos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) return alert(data.error || "Error creando evento");

      await loadEvents();

      setTitulo("");
      setDescripcion("");
      setHora("");
      setHoraFin("");
      setDuracion(30);
      setSelectedActivity(null);

      alert("Rutina guardada");
    } catch (err) {
      console.log(err);
      alert("Error servidor");
    }
  };

  /* DELETE */
  const deleteEvent = async (id) => {
    try {
      await fetch(`${API_URL}/api/rutina-eventos/${id}`, {
        method: "DELETE",
      });
      await loadEvents();
    } catch (err) {
      console.log(err);
    }
  };

  /* TOGGLE */
  const toggleComplete = async (evento) => {
    try {
      await fetch(`${API_URL}/api/rutina-eventos/${evento.id_evento}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completado: !evento.completado,
        }),
      });

      await loadEvents();
    } catch (err) {
      console.log(err);
    }
  };

  /* FILTER */
  const currentDate = formatDateLocal(selectedDate);

  const eventosDia = useMemo(() => {
    return eventos
      .filter((e) => e.fecha?.slice(0, 10) === currentDate)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [eventos, currentDate]);

  /* CALENDAR */
  const today = new Date();
  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let firstDay = new Date(year, month, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const changeMonth = (dir) => {
    setSelectedDate(new Date(year, month + dir, 1));
  };

  return (
    <div className="page">

      {/* MOBILE BUTTONS */}
      <button className="mobile-left-btn" onClick={() => setLeftOpen(!leftOpen)}>
        {leftOpen ? "✖" : "☰"}
      </button>

      <button className="mobile-right-btn" onClick={() => setRightOpen(!rightOpen)}>
        {rightOpen ? "✖" : "📅"}
      </button>

      {/* OVERLAY */}
      {(leftOpen || rightOpen) && (
        <div
          className="overlay"
          onClick={() => {
            setLeftOpen(false);
            setRightOpen(false);
          }}
        />
      )}

      {/* HEADER */}
      <div className="header">
        <div>
          <h1>🧘 Rutina Inteligente</h1>
          <p>Organiza actividades por día, semana o mes</p>
        </div>

        <button className="back-btn" onClick={() => navigate("/user")}>
          ⬅ Volver
        </button>
      </div>

      {/* LAYOUT */}
      <div className="layout">

        {/* LEFT */}
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
              <p>⭐ {act.puntaje_agrado || 5}/10</p>
            </div>
          ))}

          <hr />

          <h3>⚙ Configuración</h3>

          <input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" />

          <textarea
            className="input"
            rows="3"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción"
          />

          <input type="time" className="input" value={hora} onChange={(e) => setHora(e.target.value)} />

          <input type="time" className="input" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />

          <input
            type="number"
            className="input"
            value={duracion}
            onChange={(e) => setDuracion(Number(e.target.value))}
          />

          <button className="create-btn" onClick={createEvent}>
            Guardar rutina
          </button>
        </div>

        {/* CENTER */}
        <div className="center-panel">

          <h2>📅 Planificación del día</h2>

          <p>{selectedDate.toLocaleDateString("es-CL")}</p>

          {eventosDia.length === 0 ? (
            <div className="empty-planner">
              No hay rutinas
            </div>
          ) : (
            eventosDia.map((evento) => (
              <div
                key={evento.id_evento}
                className={`planner-card ${evento.completado ? "completed" : ""}`}
              >
                <div>
                  <input
                    type="checkbox"
                    checked={evento.completado}
                    onChange={() => toggleComplete(evento)}
                  />

                  <strong>{evento.titulo}</strong>

                  <p>{evento.hora} - {evento.hora_fin}</p>
                </div>

                <button onClick={() => deleteEvent(evento.id_evento)}>🗑</button>
              </div>
            ))
          )}
        </div>

        {/* RIGHT */}
        <div className={`right-panel ${rightOpen ? "open" : ""}`}>

          <h3>📆 Calendario</h3>

          <div className="calendar-grid">
            {days.map((d, i) => {
              if (!d) return <div key={i} className="calendar-day empty" />;

              const date = new Date(year, month, d);
              const full = formatDateLocal(date);

              const has = eventos.some((e) => e.fecha?.slice(0, 10) === full);

              const selected =
                selectedDate.getDate() === d &&
                selectedDate.getMonth() === month;

              const isToday =
                today.getDate() === d &&
                today.getMonth() === month;

              return (
                <div
                  key={i}
                  className={`calendar-day ${selected ? "selected" : ""} ${
                    isToday ? "today" : ""
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  {d}
                  {has && <div className="event-dot" />}
                </div>
              );
            })}
          </div>

          <div className="calendar-nav">
            <button onClick={() => changeMonth(-1)}>◀</button>
            <button onClick={() => changeMonth(1)}>▶</button>
          </div>

        </div>

      </div>
    </div>
  );
}
