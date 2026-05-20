import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Rutina.css";

const API_URL = "https://empatia-backend.onrender.com";

export default function Rutina() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(sessionStorage.getItem("usuario") || "null");

  const user = {
    id_usuario:
      storedUser?.id_usuario ||
      storedUser?.user?.id_usuario ||
      storedUser?.id ||
      null,
  };

  const formatDateLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getNowTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getPlus30 = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const [actividades, setActividades] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [hora, setHora] = useState(getNowTime());
  const [horaFin, setHoraFin] = useState(getPlus30());
  const [duracion, setDuracion] = useState(30);

  const [selectedDates, setSelectedDates] = useState([]);
  const [activeDate, setActiveDate] = useState(formatDateLocal(new Date()));

  const today = new Date();

  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  const loadActivities = async () => {
    const res = await fetch(`${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`);
    const data = await res.json();
    setActividades(Array.isArray(data) ? data : []);
  };

  const loadEvents = async () => {
    const res = await fetch(`${API_URL}/api/rutina-eventos/${user.id_usuario}`);
    const data = await res.json();
    setEventos(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (user?.id_usuario) {
      loadActivities();
      loadEvents();
    }
  }, [user?.id_usuario]);

  const selectActivity = (act) => {
    setSelectedActivity(act);
    setTitulo(act.nombre_actividad || "");
  };

  const toggleDate = (date) => {
    const formatted = formatDateLocal(date);
    setActiveDate(formatted);

    setSelectedDates((prev) =>
      prev.includes(formatted)
        ? prev.filter((d) => d !== formatted)
        : [...prev, formatted]
    );
  };

  const createEvent = async () => {
    if (!titulo.trim()) return alert("Ingrese título");
    if (!hora) return alert("Seleccione hora");
    if (selectedDates.length === 0) return alert("Seleccione al menos un día");

    for (const fecha of selectedDates) {
      const payload = {
        id_usuario: user.id_usuario,
        id_registro: selectedActivity?.id_registro || null,
        titulo,
        descripcion,
        fecha,
        hora,
        hora_fin: horaFin || null,
        duracion,
      };

      await fetch(`${API_URL}/api/rutina-eventos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    await loadEvents();

    setTitulo("");
    setDescripcion("");
    setHora(getNowTime());
    setHoraFin(getPlus30());
    setDuracion(30);
    setSelectedDates([]);
    setSelectedActivity(null);

    alert("Rutina creada");
  };

  const deleteEvent = async (id) => {
    await fetch(`${API_URL}/api/rutina-eventos/${id}`, {
      method: "DELETE",
    });
    await loadEvents();
  };

  const toggleComplete = async (evento) => {
    await fetch(`${API_URL}/api/rutina-eventos/${evento.id_evento}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completado: !evento.completado }),
    });
    await loadEvents();
  };

  const currentDate = activeDate;

  const eventosDia = useMemo(() => {
    return eventos
      .filter((e) => e.fecha?.slice(0, 10) === currentDate)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [eventos, currentDate]);

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

  let firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const changeMonth = (dir) => {
    let newMonth = calendarMonth + dir;
    let newYear = calendarYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
  };

  const changeYear = (dir) => {
    setCalendarYear((p) => p + dir);
  };

  const closeAll = () => {
    setLeftOpen(false);
    setRightOpen(false);
  };

  return (
    <div className="page">

      <div className="header">
        <div>
          <h1>🧘 Rutina Inteligente</h1>
          <p>Organiza tu día</p>
        </div>

        <button className="back-btn" onClick={() => navigate("/user")}>
          ⬅ Volver
        </button>
      </div>

      {(leftOpen || rightOpen) && (
        <div className="overlay show" onClick={closeAll} />
      )}

      <button
        className="mobile-toggle left"
        onClick={() => {
          setRightOpen(false);
          setLeftOpen((v) => !v);
        }}
      >
        🎯
      </button>

      <button
        className="mobile-toggle right"
        onClick={() => {
          setLeftOpen(false);
          setRightOpen((v) => !v);
        }}
      >
        📅
      </button>

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
            </div>
          ))}

          <h3>⚙ Crear</h3>

          <input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <textarea className="input" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />

          <div className="time-row">
            <input type="time" className="input" value={hora} onChange={(e) => setHora(e.target.value)} />
            <input type="time" className="input" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
          </div>

          <input type="number" className="input" value={duracion} onChange={(e) => setDuracion(Number(e.target.value))} />

          <button className="create-btn" onClick={createEvent}>
            Guardar
          </button>
        </div>

        {/* CENTER */}
        <div className="center-panel">
          <h2>📅 {currentDate}</h2>

          {eventosDia.length === 0 ? (
            <div className="empty-planner">Sin rutinas</div>
          ) : (
            eventosDia.map((evento) => (
              <div key={evento.id_evento} className={`planner-card ${evento.completado ? "completed" : ""}`}>
                <div>
                  <input type="checkbox" checked={evento.completado} onChange={() => toggleComplete(evento)} />
                  <strong>{evento.titulo}</strong>
                  <p>{evento.hora} → {evento.hora_fin}</p>
                </div>

                <button onClick={() => deleteEvent(evento.id_evento)}>🗑</button>
              </div>
            ))
          )}
        </div>

        {/* RIGHT */}
        <div className={`right-panel ${rightOpen ? "open" : ""}`}>

          <div className="calendar-header">
            <div>
              <select
                value={calendarMonth}
                onChange={(e) => setCalendarMonth(Number(e.target.value))}
                className="input small"
              >
                {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
                  .map((m,i)=>(
                    <option key={i} value={i}>{m}</option>
                  ))}
              </select>

              <input
                type="number"
                value={calendarYear}
                onChange={(e) => setCalendarYear(Number(e.target.value))}
                className="input small"
              />
            </div>
          </div>

          <div className="calendar-grid">
            {days.map((d, i) => {
              if (!d) return <div key={i} className="calendar-day empty" />;

              const dateObj = new Date(calendarYear, calendarMonth, d);
              const formatted = formatDateLocal(dateObj);

              const isSelected = selectedDates.includes(formatted);
              const isToday = formatted === formatDateLocal(new Date());
              const hasEvents = eventos.some(e => e.fecha?.slice(0,10) === formatted);

              return (
                <div
                  key={i}
                  className={`calendar-day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                  onClick={() => toggleDate(dateObj)}
                >
                  {d}
                  {hasEvents && <div className="event-dot" />}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
