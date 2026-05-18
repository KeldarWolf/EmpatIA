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
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  const daysShort = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
  const daysFull = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

  /* ========================= LOAD ========================= */
  const loadData = async () => {
    try {
      setLoading(true);

      const [actRes, eventRes] = await Promise.all([
        fetch(`${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`),
        fetch(`${API_URL}/api/rutina-eventos/${user.id_usuario}`)
      ]);

      const actData = await actRes.json();
      const eventData = await eventRes.json();

      setActividades(Array.isArray(actData) ? actData : []);
      setEventos(Array.isArray(eventData) ? eventData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id_usuario) loadData();
  }, []);

  /* ========================= TOGGLES ========================= */
  const toggleActivity = (act) => {
    setSelectedActivities((prev) =>
      prev.find((a) => a.id_registro === act.id_registro)
        ? prev.filter((a) => a.id_registro !== act.id_registro)
        : [...prev, act]
    );
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  /* ========================= CREATE ========================= */
  const crearEventos = async () => {
    if (!selectedActivities.length) return alert("Selecciona actividades");
    if (!selectedDays.length) return alert("Selecciona días");

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

    alert("Rutina creada");
    setSelectedActivities([]);
    setSelectedDays([]);
    loadData();
  };

  /* ========================= COMPLETE ========================= */
  const toggleComplete = async (evento) => {
    await fetch(`${API_URL}/api/rutina-eventos/${evento.id_evento}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completado: !evento.completado,
      }),
    });

    setEventos((prev) =>
      prev.map((e) =>
        e.id_evento === evento.id_evento
          ? { ...e, completado: !e.completado }
          : e
      )
    );
  };

  /* ========================= DELETE ========================= */
  const deleteEvent = async (id) => {
    await fetch(`${API_URL}/api/rutina-eventos/${id}`, {
      method: "DELETE",
    });

    setEventos((prev) =>
      prev.filter((e) => e.id_evento !== id)
    );
  };

  /* ========================= EVENTS DAY ========================= */
  const eventosDelDia = eventos
    .filter((e) => e.fecha?.split("T")[0] === selectedDate)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  /* ========================= WEEK ========================= */
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

  /* ========================= LOADING ========================= */
  if (loading) {
    return (
      <div className="loading">
        Cargando rutina...
      </div>
    );
  }

  /* ========================= UI ========================= */
  return (
    <div className="page">

      {/* HEADER */}
      <div className="header">
        <div>
          <h1>🧘 Rutina Inteligente</h1>
          <p>Organiza actividades por día, semana o mes</p>
        </div>

        <button
          onClick={() => navigate("/user")}
          className="backBtn"
        >
          ⬅ Volver
        </button>
      </div>

      <div className="layout">

        {/* LEFT */}
        <div className="left">
          <h3>🎯 Actividades</h3>

          {actividades.map((act) => {
            const selected = selectedActivities.find(
              (a) => a.id_registro === act.id_registro
            );

            return (
              <div
                key={act.id_registro}
                className={`activityCard ${selected ? "active" : ""}`}
                onClick={() => toggleActivity(act)}
              >
                <b>{act.nombre_actividad}</b>
                <p>⭐ {act.puntaje_agrado}/10</p>
              </div>
            );
          })}

          <hr />

          <h3>📅 Días seleccionados</h3>

          <div className="selectedContainer">
            {selectedDays.map((d) => (
              <div
                key={d}
                className="selectedDay"
                onClick={() => toggleDay(d)}
              >
                {d}
              </div>
            ))}
          </div>

          <hr />

          <h3>⏰ Configuración</h3>

          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
          <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
          <input
            type="number"
            value={duracion}
            onChange={(e) => setDuracion(Number(e.target.value))}
          />

          <select
            value={repeticion}
            onChange={(e) => setRepeticion(e.target.value)}
          >
            <option value="dia">Diario</option>
            <option value="semana">Semanal</option>
            <option value="mes">Mensual</option>
          </select>

          <button className="createBtn" onClick={crearEventos}>
            ✅ Crear rutina
          </button>
        </div>

        {/* CENTER */}
        <div className="center">
          <div className="centerHeader">
            <div>
              <h2>📅 Planificación del día</h2>
              <p>
                {
                  daysFull[
                    new Date(selectedDate).getDay() === 0
                      ? 6
                      : new Date(selectedDate).getDay() - 1
                  ]
                }
              </p>
            </div>

            <div className="dateBadge">
              {selectedDate}
            </div>
          </div>

          <div className="timeline">
            {eventosDelDia.length === 0 ? (
              <div className="emptyDay">
                <h3>😴 Día libre</h3>
                <p>No hay actividades planificadas</p>
              </div>
            ) : (
              eventosDelDia.map((evento) => (
                <div
                  key={evento.id_evento}
                  className="eventCard"
                  style={{
                    opacity: evento.completado ? 0.6 : 1,
                    borderLeft: evento.completado
                      ? "6px solid #22c55e"
                      : "6px solid #2563eb",
                  }}
                >
                  <div className="eventLeft">
                    <input
                      type="checkbox"
                      checked={evento.completado}
                      onChange={() => toggleComplete(evento)}
                    />

                    <div>
                      <h3
                        style={{
                          textDecoration: evento.completado
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {evento.titulo}
                      </h3>

                      <p>⏰ {evento.hora} → {evento.hora_fin}</p>
                      <p>🕒 {evento.duracion} min</p>

                      {evento.descripcion && (
                        <p>{evento.descripcion}</p>
                      )}

                      <div className="repeatBadge">
                        🔁 {evento.repeticion}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => deleteEvent(evento.id_evento)}>
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="calendarHeader">
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>

            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <h2 style={{ textAlign: "center" }}>
            {months[month]} {year}
          </h2>

          <div className="weekHeader">
            {daysShort.map((d) => (
              <div key={d} className="weekDay">{d}</div>
            ))}
          </div>

          {getWeeksForMonth(month, year).map((week, i) => (
            <div key={i} className="weekRow">
              {week.map((date, j) => {
                const active = selectedDate === date;
                const selected = selectedDays.includes(date);

                return (
                  <div
                    key={j}
                    className="dayCell"
                    onClick={() => {
                      if (!date) return;
                      setSelectedDate(date);
                      toggleDay(date);
                    }}
                    style={{
                      background: active
                        ? "#2563eb"
                        : selected
                        ? "#22c55e"
                        : "#111827",
                    }}
                  >
                    {date ? parseInt(date.slice(8)) : ""}
                  </div>
                );
              })}
            </div>
          ))}

          <hr />

          <h3>📅 Semana actual</h3>

          <div className="weekContainer">
            {currentWeek.map((d) => {
              const count = eventos.filter(
                (e) => e.fecha?.split("T")[0] === d.date
              ).length;

              return (
                <div
                  key={d.date}
                  className="weekCard"
                  onClick={() => setSelectedDate(d.date)}
                  style={{
                    background:
                      selectedDate === d.date ? "#2563eb" : "#111827",
                  }}
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
