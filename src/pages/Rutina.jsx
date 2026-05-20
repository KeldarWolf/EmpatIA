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

  /* =========================
     MOBILE PANELS
  ========================= */

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  /* =========================
     DATA
  ========================= */

  const [actividades, setActividades] = useState([]);
  const [eventos, setEventos] = useState([]);

  const [selectedActivity, setSelectedActivity] = useState(null);

  /* =========================
     FORM
  ========================= */

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [hora, setHora] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [duracion, setDuracion] = useState(30);

  /* =========================
     MULTI FECHAS
  ========================= */

  const [selectedDates, setSelectedDates] = useState([]);

  /* =========================
     DATE FORMAT
  ========================= */

  const formatDateLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  };

  /* =========================
     LOAD DATA
  ========================= */

  const loadActivities = async () => {

    const res = await fetch(
      `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
    );

    const data = await res.json();

    setActividades(Array.isArray(data) ? data : []);
  };

  const loadEvents = async () => {

    const res = await fetch(
      `${API_URL}/api/rutina-eventos/${user.id_usuario}`
    );

    const data = await res.json();

    setEventos(Array.isArray(data) ? data : []);
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

  };

  /* =========================
     TOGGLE DATE
  ========================= */

  const toggleDate = (date) => {

    const formatted = formatDateLocal(date);

    setSelectedDates((prev) => {

      if (prev.includes(formatted)) {
        return prev.filter((d) => d !== formatted);
      }

      return [...prev, formatted];

    });

  };

  /* =========================
     CREATE EVENT
  ========================= */

  const createEvent = async () => {

    if (!titulo.trim()) {
      return alert("Ingrese título");
    }

    if (!hora) {
      return alert("Seleccione hora");
    }

    if (selectedDates.length === 0) {
      return alert("Seleccione al menos un día");
    }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

    }

    await loadEvents();

    setTitulo("");
    setDescripcion("");
    setHora("");
    setHoraFin("");
    setDuracion(30);

    setSelectedDates([]);
    setSelectedActivity(null);

    alert("Rutina creada");

  };

  /* =========================
     DELETE EVENT
  ========================= */

  const deleteEvent = async (id) => {

    await fetch(`${API_URL}/api/rutina-eventos/${id}`, {
      method: "DELETE",
    });

    await loadEvents();

  };

  /* =========================
     COMPLETE EVENT
  ========================= */

  const toggleComplete = async (evento) => {

    await fetch(`${API_URL}/api/rutina-eventos/${evento.id_evento}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completado: !evento.completado,
      }),
    });

    await loadEvents();

  };

  /* =========================
     CURRENT DATE
  ========================= */

  const currentDate =
    selectedDates[0] || formatDateLocal(new Date());

  /* =========================
     EVENTOS DEL DIA
  ========================= */

  const eventosDia = useMemo(() => {

    return eventos
      .filter((e) => e.fecha?.slice(0, 10) === currentDate)
      .sort((a, b) => a.hora.localeCompare(b.hora));

  }, [eventos, currentDate]);

  /* =========================
     CALENDAR
  ========================= */

  const today = new Date();

  const currentCalendarDate =
    selectedDates.length > 0
      ? new Date(selectedDates[0])
      : new Date();

  const month = currentCalendarDate.getMonth();
  const year = currentCalendarDate.getFullYear();

  const daysInMonth =
    new Date(year, month + 1, 0).getDate();

  let firstDay =
    new Date(year, month, 1).getDay();

  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const changeMonth = (dir) => {

    const newDate = new Date(year, month + dir, 1);

    setSelectedDates([
      formatDateLocal(newDate),
    ]);

  };

  /* =========================
     CLOSE PANELS
  ========================= */

  const closeAll = () => {

    setLeftOpen(false);
    setRightOpen(false);

  };

  return (

    <div className="page">

      {/* HEADER */}

      <div className="header">

        <div>
          <h1>🧘 Rutina Inteligente</h1>
          <p>Organiza tu día</p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/user")}
        >
          ⬅ Volver
        </button>

      </div>

      {/* OVERLAY */}

      {(leftOpen || rightOpen) && (
        <div
          className="overlay show"
          onClick={closeAll}
        />
      )}

      {/* MOBILE BUTTONS */}

      <button
        className="mobile-toggle left"
        onClick={() => {

          setRightOpen(false);
          setLeftOpen(!leftOpen);

        }}
      >
        🎯
      </button>

      <button
        className="mobile-toggle right"
        onClick={() => {

          setLeftOpen(false);
          setRightOpen(!rightOpen);

        }}
      >
        📅
      </button>

      {/* LAYOUT */}

      <div className="layout">

        {/* =========================
           LEFT PANEL
        ========================= */}

        <div
          className={`left-panel ${
            leftOpen ? "open" : ""
          }`}
        >

          <h3>🎯 Actividades</h3>

          {actividades.map((act) => (

            <div
              key={act.id_registro}
              className={`activity-card ${
                selectedActivity?.id_registro ===
                act.id_registro
                  ? "selected"
                  : ""
              }`}
              onClick={() => selectActivity(act)}
            >

              <strong>
                {act.nombre_actividad}
              </strong>

            </div>

          ))}

          <hr />

          <h3>⚙ Crear</h3>

          <input
            className="input"
            value={titulo}
            onChange={(e) =>
              setTitulo(e.target.value)
            }
            placeholder="Título"
          />

          <textarea
            className="input"
            value={descripcion}
            onChange={(e) =>
              setDescripcion(e.target.value)
            }
            placeholder="Descripción"
          />

          <div className="time-row">

            <input
              type="time"
              className="input"
              value={hora}
              onChange={(e) =>
                setHora(e.target.value)
              }
            />

            <input
              type="time"
              className="input"
              value={horaFin}
              onChange={(e) =>
                setHoraFin(e.target.value)
              }
            />

          </div>

          <input
            type="number"
            className="input"
            value={duracion}
            onChange={(e) =>
              setDuracion(Number(e.target.value))
            }
            placeholder="Duración"
          />

          <button
            className="create-btn"
            onClick={createEvent}
          >
            Guardar
          </button>

        </div>

        {/* =========================
           CENTER PANEL
        ========================= */}

        <div className="center-panel">

          <h2>
            📅 {currentDate}
          </h2>

          {eventosDia.length === 0 ? (

            <div className="empty-planner">
              Sin rutinas
            </div>

          ) : (

            eventosDia.map((evento) => (

              <div
                key={evento.id_evento}
                className={`planner-card ${
                  evento.completado
                    ? "completed"
                    : ""
                }`}
              >

                <div>

                  <input
                    type="checkbox"
                    checked={evento.completado}
                    onChange={() =>
                      toggleComplete(evento)
                    }
                  />

                  <strong>
                    {evento.titulo}
                  </strong>

                  <p>
                    {evento.hora} →{" "}
                    {evento.hora_fin}
                  </p>

                </div>

                <button
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

        {/* =========================
           RIGHT PANEL
        ========================= */}

        <div
          className={`right-panel ${
            rightOpen ? "open" : ""
          }`}
        >

          <div className="calendar-header">

            <h3>
              {
                [
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
                ][month]
              }{" "}
              {year}
            </h3>

            <div className="calendar-nav">

              <button
                onClick={() =>
                  changeMonth(-1)
                }
              >
                ◀
              </button>

              <button
                onClick={() =>
                  changeMonth(1)
                }
              >
                ▶
              </button>

            </div>

          </div>

          {/* CALENDAR */}

          <div className="calendar-grid">

            {days.map((d, i) => {

              if (!d) {
                return (
                  <div
                    key={i}
                    className="calendar-day empty"
                  />
                );
              }

              const date =
                new Date(year, month, d);

              const full =
                formatDateLocal(date);

              const hasEvent =
                eventos.some(
                  (e) =>
                    e.fecha?.slice(0, 10) ===
                    full
                );

              const selected =
                selectedDates.includes(full);

              const isToday =
                today.getDate() === d &&
                today.getMonth() === month &&
                today.getFullYear() === year;

              return (

                <div
                  key={i}
                  className={`calendar-day ${
                    selected
                      ? "selected"
                      : ""
                  } ${
                    isToday
                      ? "today"
                      : ""
                  }`}
                  onClick={() =>
                    toggleDate(date)
                  }
                >

                  {d}

                  {hasEvent && (
                    <div className="event-dot" />
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
