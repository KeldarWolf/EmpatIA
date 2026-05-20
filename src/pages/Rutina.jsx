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
     HELPERS
  ========================= */

  const formatDateLocal = (date) => {

    const y = date.getFullYear();

    const m = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const d = String(
      date.getDate()
    ).padStart(2, "0");

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

    now.setMinutes(
      now.getMinutes() + 30
    );

    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  };

  /* =========================
     MOBILE PANELS
  ========================= */

  const [leftOpen, setLeftOpen] =
    useState(false);

  const [rightOpen, setRightOpen] =
    useState(false);

  /* =========================
     DATA
  ========================= */

  const [actividades, setActividades] =
    useState([]);

  const [eventos, setEventos] =
    useState([]);

  const [selectedActivity,
    setSelectedActivity] =
    useState(null);

  /* =========================
     FORM
  ========================= */

  const [titulo, setTitulo] =
    useState("");

  const [descripcion,
    setDescripcion] =
    useState("");

  const [hora, setHora] =
    useState(getNowTime());

  const [horaFin, setHoraFin] =
    useState(getPlus30());

  const [duracion, setDuracion] =
    useState(30);

  /* =========================
     MULTI DATE
  ========================= */

  const [selectedDates,
    setSelectedDates] =
    useState([]);

  const [activeDate,
    setActiveDate] =
    useState(
      formatDateLocal(new Date())
    );

  /* =========================
     MONTH / YEAR
  ========================= */

  const today = new Date();

  const [calendarMonth,
    setCalendarMonth] =
    useState(today.getMonth());

  const [calendarYear,
    setCalendarYear] =
    useState(today.getFullYear());

  /* =========================
     LOAD DATA
  ========================= */

  const loadActivities = async () => {

    const res = await fetch(
      `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
    );

    const data = await res.json();

    setActividades(
      Array.isArray(data) ? data : []
    );

  };

  const loadEvents = async () => {

    const res = await fetch(
      `${API_URL}/api/rutina-eventos/${user.id_usuario}`
    );

    const data = await res.json();

    setEventos(
      Array.isArray(data) ? data : []
    );

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

    setTitulo(
      act.nombre_actividad || ""
    );

  };

  /* =========================
     TOGGLE DATE
  ========================= */

  const toggleDate = (date) => {

    const formatted =
      formatDateLocal(date);

    setActiveDate(formatted);

    setSelectedDates((prev) => {

      if (prev.includes(formatted)) {

        return prev.filter(
          (d) => d !== formatted
        );

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
      return alert(
        "Seleccione al menos un día"
      );
    }

    for (const fecha of selectedDates) {

      const payload = {

        id_usuario:
          user.id_usuario,

        id_registro:
          selectedActivity?.id_registro ||
          null,

        titulo,

        descripcion,

        fecha,

        hora,

        hora_fin: horaFin || null,

        duracion,

      };

      await fetch(
        `${API_URL}/api/rutina-eventos`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

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

  /* =========================
     DELETE EVENT
  ========================= */

  const deleteEvent = async (id) => {

    await fetch(
      `${API_URL}/api/rutina-eventos/${id}`,
      {
        method: "DELETE",
      }
    );

    await loadEvents();

  };

  /* =========================
     COMPLETE EVENT
  ========================= */

  const toggleComplete =
    async (evento) => {

      await fetch(
        `${API_URL}/api/rutina-eventos/${evento.id_evento}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            completado:
              !evento.completado,
          }),
        }
      );

      await loadEvents();

    };

  /* =========================
     CURRENT DATE
  ========================= */

  const currentDate = activeDate;

  /* =========================
     EVENTS DAY
  ========================= */

  const eventosDia = useMemo(() => {

    return eventos
      .filter(
        (e) =>
          e.fecha?.slice(0, 10) ===
          currentDate
      )
      .sort((a, b) =>
        a.hora.localeCompare(b.hora)
      );

  }, [eventos, currentDate]);

  /* =========================
     CALENDAR
  ========================= */

  const month = calendarMonth;
  const year = calendarYear;

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  let firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  firstDay =
    firstDay === 0
      ? 6
      : firstDay - 1;

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  /* =========================
     CHANGE MONTH
  ========================= */

  const changeMonth = (dir) => {

    let newMonth =
      calendarMonth + dir;

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

  /* =========================
     CHANGE YEAR
  ========================= */

  const changeYear = (dir) => {

    setCalendarYear(
      (prev) => prev + dir
    );

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

          <h1>
            🧘 Rutina Inteligente
          </h1>

          <p>
            Organiza tu día
          </p>

        </div>

        <button
          className="back-btn"
          onClick={() =>
            navigate("/user")
          }
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

      {/* MOBILE TABS */}

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

          <h3>
            🎯 Actividades
          </h3>

          {actividades.map((act) => (

            <div
              key={act.id_registro}
              className={`activity-card ${
                selectedActivity
                  ?.id_registro ===
                act.id_registro
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                selectActivity(act)
              }
            >

              <strong>
                {act.nombre_actividad}
              </strong>

            </div>

          ))}

          <hr />

          <h3>
            ⚙ Crear
          </h3>

          <input
            className="input"
            value={titulo}
            onChange={(e) =>
              setTitulo(
                e.target.value
              )
            }
            placeholder="Título"
          />

          <textarea
            className="input"
            value={descripcion}
            onChange={(e) =>
              setDescripcion(
                e.target.value
              )
            }
            placeholder="Descripción"
          />

          <div className="time-row">

            <input
              type="time"
              className="input"
              value={hora}
              onChange={(e) =>
                setHora(
                  e.target.value
                )
              }
            />

            <input
              type="time"
              className="input"
              value={horaFin}
              onChange={(e) =>
                setHoraFin(
                  e.target.value
                )
              }
            />

          </div>

          <input
            type="number"
            className="input"
            value={duracion}
            onChange={(e) =>
              setDuracion(
                Number(e.target.value)
              )
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
                    checked={
                      evento.completado
                    }
                    onChange={() =>
                      toggleComplete(
                        evento
                      )
                    }
                  />

                  <strong>
                    {evento.titulo}
                  </strong>

                  <p>
                    {evento.hora}
                    {" → "}
                    {evento.hora_fin}
                  </p>

                </div>

                <button
                  onClick={() =>
                    deleteEvent(
                      evento.id_evento
                    )
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

          {/* HEADER */}

          <div className="calendar-header">

            <div>

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
                }
              </h3>

              <p>
                Año {year}
              </p>

            </div>

            <div className="calendar-nav">

              <button
                onClick={() =>
                  changeYear(-1)
                }
              >
                ⏪
              </button>

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

              <button
                onClick={() =>
                  changeYear(1)
                }
              >
                ⏩
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
                new Date(
                  year,
                  month,
                  d
                );

              const full =
                formatDateLocal(date);

              const hasEvent =
                eventos.some(
                  (e) =>
                    e.fecha?.slice(
                      0,
                      10
                    ) === full
                );

              const selected =
                selectedDates.includes(
                  full
                );

              const isToday =
                today.getDate() === d &&
                today.getMonth() ===
                  month &&
                today.getFullYear() ===
                  year;

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
