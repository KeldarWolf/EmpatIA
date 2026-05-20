import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Rutina.css";

const API_URL =
  "https://empatia-backend.onrender.com";

export default function Rutina() {
  const navigate = useNavigate();

  /* =========================
     MOBILE MENUS
  ========================= */

  const [leftOpen, setLeftOpen] =
    useState(false);

  const [rightOpen, setRightOpen] =
    useState(false);

  /* =========================
     USER
  ========================= */

  const storedUser = JSON.parse(
    sessionStorage.getItem("usuario") ||
      "null"
  );

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

  const [actividades, setActividades] =
    useState([]);

  const [eventos, setEventos] =
    useState([]);

  const [selectedActivity,
    setSelectedActivity] =
    useState(null);

  const [titulo, setTitulo] =
    useState("");

  const [descripcion,
    setDescripcion] =
    useState("");

  const [hora, setHora] =
    useState("");

  const [duracion,
    setDuracion] =
    useState(30);

  const [selectedDate,
    setSelectedDate] =
    useState(new Date());

  /* =========================
     LOAD ACTIVITIES
  ========================= */

  const loadActivities =
    async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
        );

        const data =
          await res.json();

        setActividades(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.log(err);
      }
    };

  /* =========================
     LOAD EVENTS
  ========================= */

  const loadEvents =
    async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/rutina/${user.id_usuario}`
        );

        const data =
          await res.json();

        setEventos(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.log(err);
      }
    };

  useEffect(() => {
    if (user?.id_usuario) {
      loadActivities();

      loadEvents();
    }
  }, []);

  /* =========================
     SELECT ACTIVITY
  ========================= */

  const selectActivity = (
    act
  ) => {
    setSelectedActivity(act);

    setTitulo(
      act.nombre_actividad || ""
    );

    /* abre panel mobile */

    setLeftOpen(true);

    /* cierra calendario */

    setRightOpen(false);
  };

  /* =========================
     CREATE EVENT
  ========================= */

  const createEvent =
    async () => {
      if (
        !selectedActivity ||
        !hora
      )
        return;

      try {
        await fetch(
          `${API_URL}/api/rutina`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id_usuario:
                user.id_usuario,

              id_actividad:
                selectedActivity.id_actividad,

              titulo,

              descripcion,

              hora,

              duracion,

              fecha:
                selectedDate
                  .toISOString()
                  .split("T")[0],
            }),
          }
        );

        loadEvents();

        setHora("");

        setDescripcion("");

        setSelectedActivity(
          null
        );

        /* cerrar mobile */

        setLeftOpen(false);
      } catch (err) {
        console.log(err);
      }
    };

  /* =========================
     DELETE EVENT
  ========================= */

  const deleteEvent =
    async (id) => {
      try {
        await fetch(
          `${API_URL}/api/rutina/${id}`,
          {
            method: "DELETE",
          }
        );

        loadEvents();
      } catch (err) {
        console.log(err);
      }
    };

  /* =========================
     TOGGLE COMPLETE
  ========================= */

  const toggleComplete =
    async (evento) => {
      try {
        await fetch(
          `${API_URL}/api/rutina/${evento.id_rutina}`,
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

        loadEvents();
      } catch (err) {
        console.log(err);
      }
    };

  /* =========================
     FILTER EVENTS
  ========================= */

  const currentDate =
    selectedDate
      .toISOString()
      .split("T")[0];

  const eventosDia =
    eventos.filter(
      (e) => e.fecha === currentDate
    );

  /* =========================
     CALENDAR
  ========================= */

  const today = new Date();

  const currentMonth =
    selectedDate.getMonth();

  const currentYear =
    selectedDate.getFullYear();

  const daysInMonth =
    new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();

  const firstDay =
    new Date(
      currentYear,
      currentMonth,
      1
    ).getDay();

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (
    let i = 1;
    i <= daysInMonth;
    i++
  ) {
    days.push(i);
  }

  return (
    <div className="page">

      {/* =========================
         MOBILE BUTTONS
      ========================= */}

      <button
        className="left-toggle"
        onClick={() =>
          setLeftOpen(true)
        }
      >
        ➕
      </button>

      <button
        className="right-toggle"
        onClick={() =>
          setRightOpen(true)
        }
      >
        📅
      </button>

      {/* =========================
         OVERLAY
      ========================= */}

      {(leftOpen ||
        rightOpen) && (
        <div
          className="overlay"
          onClick={() => {
            setLeftOpen(false);

            setRightOpen(false);
          }}
        />
      )}

      {/* =========================
         HEADER
      ========================= */}

      <div className="header">
        <div>
          <h1>
            🧘 Rutina Inteligente
          </h1>

          <p>
            Organiza actividades
            por día
          </p>
        </div>

        <button
          className="back-btn"
          onClick={() =>
            navigate("/home")
          }
        >
          ⬅ Volver
        </button>
      </div>

      {/* =========================
         LAYOUT
      ========================= */}

      <div className="layout">

        {/* =========================
           LEFT PANEL
        ========================= */}

        <div
          className={`left-panel ${
            leftOpen
              ? "open"
              : ""
          }`}
        >
          <h3>
            🎯 Actividades
          </h3>

          {actividades.map(
            (act) => (
              <div
                key={
                  act.id_registro
                }
                className={`activity-card ${
                  selectedActivity?.id_registro ===
                  act.id_registro
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  selectActivity(
                    act
                  )
                }
              >
                <strong>
                  {
                    act.nombre_actividad
                  }
                </strong>

                <p>
                  ⭐{" "}
                  {
                    act.puntaje_agrado
                  }
                  /10
                </p>
              </div>
            )
          )}

          <hr className="divider" />

          <h3>
            ➕ Crear evento
          </h3>

          <input
            className="input"
            placeholder="Título"
            value={titulo}
            onChange={(e) =>
              setTitulo(
                e.target.value
              )
            }
          />

          <textarea
            className="input"
            placeholder="Descripción"
            rows={4}
            value={descripcion}
            onChange={(e) =>
              setDescripcion(
                e.target.value
              )
            }
          />

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
            type="number"
            className="input"
            placeholder="Duración"
            value={duracion}
            onChange={(e) =>
              setDuracion(
                e.target.value
              )
            }
          />

          <button
            className="create-btn"
            onClick={createEvent}
          >
            Crear rutina
          </button>
        </div>

        {/* =========================
           CENTER PANEL
        ========================= */}

        <div className="center-panel">

          <div className="selected-date">
            📅{" "}
            {selectedDate.toLocaleDateString()}
          </div>

          {eventosDia.length ===
          0 ? (
            <div className="empty">
              <h3>
                No hay eventos
              </h3>

              <p>
                Crea una rutina
              </p>
            </div>
          ) : (
            eventosDia.map(
              (evento) => (
                <div
                  key={
                    evento.id_rutina
                  }
                  className={`event-card ${
                    evento.completado
                      ? "completed"
                      : ""
                  }`}
                >
                  <div className="event-left">

                    <input
                      type="checkbox"
                      checked={
                        evento.completado
                      }
                      className="checkbox"
                      onChange={() =>
                        toggleComplete(
                          evento
                        )
                      }
                    />

                    <div>
                      <h3>
                        {
                          evento.titulo
                        }
                      </h3>

                      <div className="event-time">
                        🕒{" "}
                        {
                          evento.hora
                        }
                      </div>

                      <div className="event-duration">
                        ⏳{" "}
                        {
                          evento.duracion
                        }{" "}
                        min
                      </div>

                      {evento.descripcion && (
                        <div className="event-description">
                          {
                            evento.descripcion
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteEvent(
                        evento.id_rutina
                      )
                    }
                  >
                    🗑
                  </button>
                </div>
              )
            )
          )}
        </div>

        {/* =========================
           RIGHT PANEL
        ========================= */}

        <div
          className={`right-panel ${
            rightOpen
              ? "open"
              : ""
          }`}
        >
          <div className="calendar-header">
            <select
              className="select"
              value={currentMonth}
              onChange={(e) =>
                setSelectedDate(
                  new Date(
                    currentYear,
                    Number(
                      e.target.value
                    ),
                    1
                  )
                )
              }
            >
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
              ].map(
                (m, i) => (
                  <option
                    key={i}
                    value={i}
                  >
                    {m}
                  </option>
                )
              )}
            </select>

            <select
              className="select"
              value={currentYear}
              onChange={(e) =>
                setSelectedDate(
                  new Date(
                    Number(
                      e.target.value
                    ),
                    currentMonth,
                    1
                  )
                )
              }
            >
              {Array.from({
                length: 5,
              }).map((_, i) => {
                const year =
                  today.getFullYear() -
                  2 +
                  i;

                return (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* =========================
             WEEK HEADER
          ========================= */}

          <div className="week-header">
            {[
              "D",
              "L",
              "M",
              "M",
              "J",
              "V",
              "S",
            ].map((d) => (
              <div
                key={d}
                className="week-day"
              >
                {d}
              </div>
            ))}
          </div>

          {/* =========================
             CALENDAR DAYS
          ========================= */}

          <div className="week-row">
            {days.map(
              (day, index) => {
                const isToday =
                  day ===
                    today.getDate() &&
                  currentMonth ===
                    today.getMonth() &&
                  currentYear ===
                    today.getFullYear();

                const isSelected =
                  day ===
                  selectedDate.getDate();

                return (
                  <div
                    key={index}
                    className={`day-cell ${
                      isToday
                        ? "active"
                        : ""
                    } ${
                      isSelected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => {
                      if (!day)
                        return;

                      setSelectedDate(
                        new Date(
                          currentYear,
                          currentMonth,
                          day
                        )
                      );

                      setRightOpen(
                        false
                      );
                    }}
                  >
                    {day}
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
