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
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
  ];

  const daysShort = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

  const daysFull = [
    "Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo",
  ];

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
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id_usuario) loadData();
  }, []);

  const toggleActivity = (act) => {
    setSelectedActivities((prev) => {
      const exists = prev.find(
        (a) => a.id_registro === act.id_registro
      );

      if (exists) {
        return prev.filter(
          (a) => a.id_registro !== act.id_registro
        );
      }

      return [...prev, act];
    });
  };

  const currentWeek = useMemo(() => {
    const base = new Date(selectedDate);
    const monday = new Date(base);

    const day = base.getDay();

    monday.setDate(
      base.getDate() - (day === 0 ? 6 : day - 1)
    );

    const week = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      week.push({
        date: d.toISOString().split("T")[0],
        name: daysShort[i],
        full: daysFull[i],
        index: i,
      });
    }

    return week;
  }, [selectedDate]);

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const crearEventos = async () => {
    if (selectedActivities.length === 0) {
      return alert("Selecciona actividades");
    }

    if (selectedDays.length === 0) {
      return alert("Selecciona días");
    }

    const requests = [];

    selectedDays.forEach((date) => {
      selectedActivities.forEach((act) => {
        requests.push(
          fetch(`${API_URL}/api/rutina-eventos`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
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

  const deleteEvent = async (id) => {
    await fetch(`${API_URL}/api/rutina-eventos/${id}`, {
      method: "DELETE",
    });

    setEventos((prev) =>
      prev.filter((e) => e.id_evento !== id)
    );
  };

  const eventosDelDia = eventos
    .filter((e) => {
      if (!e.fecha) return false;
      return e.fecha.split("T")[0] === selectedDate;
    })
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const getWeeksForMonth = (m, y) => {
    const weeks = [];

    const firstDay = new Date(y, m, 1);
    let current = new Date(firstDay);

    current.setDate(
      current.getDate() -
        (current.getDay() === 0 ? 6 : current.getDay() - 1)
    );

    while (weeks.length === 0 || current.getMonth() === m) {
      const week = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(current);

        week.push(
          d.getMonth() === m
            ? d.toISOString().split("T")[0]
            : null
        );

        current.setDate(current.getDate() + 1);
      }

      weeks.push(week);
      if (current.getMonth() !== m) break;
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

        <button onClick={() => navigate("/user")} className="backBtn">
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
                onClick={() => toggleActivity(act)}
                className={`activityCard ${selected ? "selected" : ""}`}
              >
                <b>{act.nombre_actividad}</b>
                <p>⭐ {act.puntaje_agrado}/10</p>
              </div>
            );
          })}

          <hr className="hr" />

          <h3>📅 Días seleccionados</h3>

          <div className="selectedContainer">
            {selectedDays.map((d) => (
              <div key={d} className="selectedDay">
                {d}
              </div>
            ))}
          </div>

          <hr className="hr" />

          <h3>⏰ Configuración</h3>

          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="input" />
          <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="input" />
          <input type="number" value={duracion} onChange={(e) => setDuracion(Number(e.target.value))} className="input" />

          <select value={repeticion} onChange={(e) => setRepeticion(e.target.value)} className="input">
            <option value="dia">Diario</option>
            <option value="semana">Semanal</option>
            <option value="mes">Mensual</option>
          </select>

          <button onClick={crearEventos} className="createBtn">
            ✅ Crear rutina
          </button>
        </div>

        {/* CENTER */}
        <div className="center">
          <h2>📅 Planificación del día</h2>

          {eventosDelDia.length === 0 ? (
            <div className="empty">No hay actividades</div>
          ) : (
            eventosDelDia.map((evento) => (
              <div key={evento.id_evento} className="eventCard">
                <input
                  type="checkbox"
                  checked={evento.completado}
                  onChange={() => toggleComplete(evento)}
                />

                <div>
                  <h3>{evento.titulo}</h3>
                  <p>{evento.hora} → {evento.hora_fin}</p>
                </div>

                <button onClick={() => deleteEvent(evento.id_evento)}>
                  🗑
                </button>
              </div>
            ))
          )}
        </div>

        {/* RIGHT */}
        <div className="right">
          <h3>📅 Calendario</h3>

          {monthWeeks.map((week, i) => (
            <div key={i} className="weekRow">
              {week.map((date, j) => {
                const active = selectedDate === date;
                const selected = selectedDays.includes(date);

                return (
                  <div
                    key={j}
                    onClick={() => {
                      if (!date) return;
                      setSelectedDate(date);
                      toggleDay(date);
                    }}
                    className={`dayCell ${
                      active ? "active" : selected ? "selectedDayCell" : ""
                    }`}
                  >
                    {date ? parseInt(date.slice(8)) : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
