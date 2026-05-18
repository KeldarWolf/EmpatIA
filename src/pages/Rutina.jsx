import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Rutina.css";

const API_URL = "https://empatia-backend.onrender.com";

export default function Rutina() {
  const navigate = useNavigate();
  
  const storedUser = JSON.parse(
    sessionStorage.getItem("usuario") || "null"
  );

  const user = {
    id_usuario:
      storedUser?.id_usuario ||
      storedUser?.user?.id_usuario ||
      storedUser?.id ||
      null,
  };

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split("T")[0]
  );

  const [actividades, setActividades] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  
  const [hora, setHora] = useState("09:00");
  const [horaFin, setHoraFin] = useState("10:00");
  const [duracion, setDuracion] = useState(60);
  const [repeticion, setRepeticion] = useState("dia");
  const [loading, setLoading] = useState(true);

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const daysShort = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const daysFull = [
    "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
  ];

  /* =====================================================
     LOAD DATA
  ===================================================== */
  const loadData = async () => {
    try {
      setLoading(true);
      const [actRes, eventRes] = await Promise.all([
        fetch(`${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`),
        fetch(`${API_URL}/api/rutina-eventos/${user.id_usuario}`),
      ]);

      const actData = await actRes.json();
      const eventData = await eventRes.json();

      setActividades(Array.isArray(actData) ? actData : []);
      setEventos(Array.isArray(eventData) ? eventData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id_usuario) {
      loadData();
    }
  }, [user?.id_usuario]);

  /* =====================================================
     HELPERS
  ===================================================== */
  const toggleActivity = (act) => {
    setSelectedActivities((prev) =>
      prev.some((a) => a.id_registro === act.id_registro)
        ? prev.filter((a) => a.id_registro !== act.id_registro)
        : [...prev, act]
    );
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const currentWeek = useMemo(() => {
    const base = new Date(selectedDate);
    const monday = new Date(base);
    const day = base.getDay();
    monday.setDate(base.getDate() - (day === 0 ? 6 : day - 1));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push({
        date: d.toISOString().split("T")[0],
        name: daysShort[i],
        full: daysFull[i],
      });
    }
    return week;
  }, [selectedDate]);

  /* =====================================================
     CREATE EVENTS
  ===================================================== */
  const crearEventos = async () => {
    if (selectedActivities.length === 0) return alert("Selecciona al menos una actividad");
    if (selectedDays.length === 0) return alert("Selecciona al menos un día");

    try {
      const requests = [];
      selectedDays.forEach((date) => {
        selectedActivities.forEach((act) => {
          requests.push(
            fetch(`${API_URL}/api/rutina-eventos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id_usuario: user.id_usuario,
                id_registro: act.id_registro,
                titulo: act.nombre_actividad,
                descripcion: act.instrucciones_usuario || "",
                fecha: date,
                hora,
                hora_fin: horaFin,
                duracion,
                repeticion,
              }),
            })
          );
        });
      });

      await Promise.all(requests);
      alert("✅ Rutina creada exitosamente");
      setSelectedActivities([]);
      setSelectedDays([]);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error al crear la rutina");
    }
  };

  const toggleComplete = async (evento) => {
    try {
      await fetch(`${API_URL}/api/rutina-eventos/${evento.id_evento}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completado: !evento.completado }),
      });

      setEventos((prev) =>
        prev.map((e) =>
          e.id_evento === evento.id_evento
            ? { ...e, completado: !e.completado }
            : e
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("¿Eliminar este evento?")) return;
    try {
      await fetch(`${API_URL}/api/rutina-eventos/${id}`, { method: "DELETE" });
      setEventos((prev) => prev.filter((e) => e.id_evento !== id));
    } catch (err) {
      console.error(err);
    }
  };

  /* =====================================================
     FILTERED EVENTS
  ===================================================== */
  const eventosDelDia = eventos
    .filter((e) => e.fecha?.split("T")[0] === selectedDate)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  /* =====================================================
     CALENDAR
  ===================================================== */
  const getWeeksForMonth = (m, y) => {
    const weeks = [];
    const firstDay = new Date(y, m, 1);
    let current = new Date(firstDay);
    current.setDate(current.getDate() - (current.getDay() === 0 ? 6 : current.getDay() - 1));

    while (current.getMonth() === m || weeks.length === 0) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(current);
        if (d.getMonth() === m && d.getFullYear() === y) {
          week.push(d.toISOString().split("T")[0]);
        } else {
          week.push(null);
        }
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
      if (current.getMonth() !== m && weeks.length > 1) break;
    }
    return weeks;
  };

  const monthWeeks = getWeeksForMonth(month, year);

  if (loading) {
    return <div className="loading">Cargando rutina...</div>;
  }

  return (
    <div className="page">
      {/* HEADER */}
      <div className="header">
        <div>
          <h1>🧘 Rutina Inteligente</h1>
          <p>Organiza actividades por día, semana o mes</p>
        </div>
        <button onClick={() => navigate("/user")} className="back-btn">
          ⬅ Volver
        </button>
      </div>

      <div className="layout">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <h3>🎯 Actividades</h3>
          {actividades.map((act) => {
            const isSelected = selectedActivities.some(
              (a) => a.id_registro === act.id_registro
            );
            return (
              <div
                key={act.id_registro}
                onClick={() => toggleActivity(act)}
                className={`activity-card ${isSelected ? "selected" : ""}`}
              >
                <b>{act.nombre_actividad}</b>
                <p>⭐ {act.puntaje_agrado}/10</p>
              </div>
            );
          })}

          <hr className="divider" />

          <h3>📅 Días seleccionados</h3>
          <div className="selected-container">
            {selectedDays.map((d) => (
              <div key={d} className="selected-day">{d}</div>
            ))}
          </div>

          <hr className="divider" />

          <h3>⏰ Configuración</h3>
          <label>Hora inicio</label>
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="input" />

          <label>Hora fin</label>
          <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="input" />

          <label>Duración (min)</label>
          <input
            type="number"
            value={duracion}
            onChange={(e) => setDuracion(Number(e.target.value))}
            className="input"
          />

          <label>Repetición</label>
          <select value={repeticion} onChange={(e) => setRepeticion(e.target.value)} className="input">
            <option value="dia">Diario</option>
            <option value="semana">Semanal</option>
            <option value="mes">Mensual</option>
          </select>

          <button onClick={crearEventos} className="create-btn">
            ✅ Crear rutina
          </button>
        </div>

        {/* CENTER PANEL */}
        <div className="center-panel">
          <h2>📅 Planificación del día</h2>
          <div className="selected-date">
            {selectedDate} — {daysFull[new Date(selectedDate).getDay() === 0 ? 6 : new Date(selectedDate).getDay() - 1]}
          </div>

          {eventosDelDia.length === 0 ? (
            <div className="empty">
              <h3>😴 Día libre</h3>
              <p>No hay actividades planificadas</p>
            </div>
          ) : (
            eventosDelDia.map((evento) => (
              <div
                key={evento.id_evento}
                className={`event-card ${evento.completado ? "completed" : ""}`}
              >
                <div className="event-left">
                  <input
                    type="checkbox"
                    checked={evento.completado}
                    onChange={() => toggleComplete(evento)}
                    className="checkbox"
                  />
                  <div>
                    <h3 style={{ textDecoration: evento.completado ? "line-through" : "none" }}>
                      {evento.titulo}
                    </h3>
                    <p className="event-time">
                      ⏰ {evento.hora} → {evento.hora_fin}
                    </p>
                    <p className="event-duration">🕒 {evento.duracion} min</p>
                    {evento.descripcion && <p className="event-description">{evento.descripcion}</p>}
                    <div className="repeat-badge">🔁 {evento.repeticion}</div>
                  </div>
                </div>

                <button onClick={() => deleteEvent(evento.id_evento)} className="delete-btn">
                  🗑
                </button>
              </div>
            ))
          )}
        </div>

        {/* RIGHT PANEL - CALENDAR */}
        <div className="right-panel">
          <div className="calendar-header">
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="select">
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="select">
              {[2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <h2 style={{ textAlign: "center" }}>{months[month]} {year}</h2>

          <div className="week-header">
            {daysShort.map((d) => <div key={d} className="week-day">{d}</div>)}
          </div>

          {monthWeeks.map((week, i) => (
            <div key={i} className="week-row">
              {week.map((date, j) => {
                const isActive = selectedDate === date;
                const isSelected = selectedDays.includes(date);
                return (
                  <div
                    key={j}
                    onClick={() => {
                      if (!date) return;
                      setSelectedDate(date);
                      toggleDay(date);
                    }}
                    className={`day-cell ${isActive ? "active" : ""} ${isSelected ? "selected" : ""}`}
                  >
                    {date ? parseInt(date.slice(8)) : ""}
                  </div>
                );
              })}
            </div>
          ))}

          <hr className="divider" />
          <h3>📌 Días seleccionados</h3>
          <div className="selected-container">
            {selectedDays.map((d) => (
              <div key={d} className="selected-day">{d}</div>
            ))}
          </div>

          <hr className="divider" />
          <h3>📅 Semana actual</h3>
          <div className="week-container">
            {currentWeek.map((d) => {
              const count = eventos.filter((e) => e.fecha?.split("T")[0] === d.date).length;
              return (
                <div
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={`week-card ${selectedDate === d.date ? "active" : ""}`}
                >
                  <div>
                    <b>{d.name}</b>
                    <p>{d.date}</p>
                  </div>
                  <span>{count} act.</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
