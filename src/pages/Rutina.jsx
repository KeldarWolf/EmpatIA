import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Rutina.css";

const API_URL = "https://empatia-backend.onrender.com";

export default function Rutina() {

  const navigate = useNavigate();

  /* =========================================
     USER
  ========================================= */

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

  /* =========================================
     MOBILE PANELS
  ========================================= */

  const [leftOpen, setLeftOpen] =
    useState(false);

  const [rightOpen, setRightOpen] =
    useState(false);

  /* =========================================
     DATA
  ========================================= */

  const [actividades, setActividades] =
    useState([]);

  const [eventos, setEventos] =
    useState([]);

  const [selectedActivity, setSelectedActivity] =
    useState(null);

  /* =========================================
     FORM
  ========================================= */

  const [titulo, setTitulo] =
    useState("");

  const [descripcion, setDescripcion] =
    useState("");

  const [hora, setHora] =
    useState("");

  const [horaFin, setHoraFin] =
    useState("");

  const [duracion, setDuracion] =
    useState(30);

  /* =========================================
     DATE
  ========================================= */

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  /* =========================================
     FORMAT DATE LOCAL
  ========================================= */

  const formatDateLocal = (date) => {

    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /* =========================================
     LOAD ACTIVITIES
  ========================================= */

  const loadActivities = async () => {

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

  /* =========================================
     LOAD EVENTS
  ========================================= */

  const loadEvents = async () => {

    try {

      const res = await fetch(
        `${API_URL}/api/rutina-eventos/${user.id_usuario}`
      );

      const data =
        await res.json();

      console.log(
        "📅 EVENTOS:",
        data
      );

      setEventos(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.log(err);
    }
  };

  /* =========================================
     INIT
  ========================================= */

  useEffect(() => {

    if (user?.id_usuario) {

      loadActivities();
      loadEvents();
    }

  }, [user?.id_usuario]);

  /* =========================================
     SELECT ACTIVITY
  ========================================= */

  const selectActivity = (act) => {

    setSelectedActivity(act);

    setTitulo(
      act.nombre_actividad || ""
    );

    setLeftOpen(true);
  };

  /* =========================================
     CREATE EVENT
  ========================================= */

  const createEvent = async () => {

    if (!titulo.trim()) {

      alert("Ingrese título");

      return;
    }

    if (!hora) {

      alert("Seleccione hora");

      return;
    }

    try {

      const payload = {

        id_usuario:
          user.id_usuario,

        id_registro:
          selectedActivity?.id_registro ||
          null,

        titulo,

        descripcion,

        fecha:
          formatDateLocal(
            selectedDate
          ),

        hora,

        hora_fin:
          horaFin || null,

        duracion,
      };

      console.log(
        "📤 ENVIANDO",
        payload
      );

      const res = await fetch(
        `${API_URL}/api/rutina-eventos`,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await res.json();

      console.log(
        "📥 RESPUESTA",
        data
      );

      if (!res.ok) {

        alert(
          data.error ||
            "Error creando evento"
        );

        return;
      }

      await loadEvents();

      setTitulo("");
      setDescripcion("");

      setHora("");
      setHoraFin("");

      setDuracion(30);

      setSelectedActivity(null);

      alert(
        "Rutina guardada"
      );

    } catch (err) {

      console.log(err);

      alert(
        "Error conexión servidor"
      );
    }
  };

  /* =========================================
     DELETE EVENT
  ========================================= */

  const deleteEvent = async (
    id_evento
  ) => {

    try {

      await fetch(
        `${API_URL}/api/rutina-eventos/${id_evento}`,
        {
          method: "DELETE",
        }
      );

      await loadEvents();

    } catch (err) {

      console.log(err);
    }
  };

  /* =========================================
     TOGGLE COMPLETE
  ========================================= */

  const toggleComplete = async (
    evento
  ) => {

    try {

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

    } catch (err) {

      console.log(err);
    }
  };

  /* =========================================
     FILTER EVENTS
  ========================================= */

  const currentDate =
    formatDateLocal(
      selectedDate
    );

  const eventosDia = useMemo(() => {

    return eventos
      .filter((evento) => {

        return (
          evento.fecha?.slice(0, 10) ===
          currentDate
        );
      })
      .sort((a, b) =>
        a.hora.localeCompare(
          b.hora
        )
      );

  }, [eventos, currentDate]);

  console.log(
    "📌 FECHA:",
    currentDate
  );

  console.log(
    "📌 EVENTOS DEL DIA:",
    eventosDia
  );

  /* =========================================
     CALENDAR
  ========================================= */

  const currentMonth =
    selectedDate.getMonth();

  const currentYear =
    selectedDate.getFullYear();

  const today =
    new Date();

  const daysInMonth =
    new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();

  let firstDay =
    new Date(
      currentYear,
      currentMonth,
      1
    ).getDay();

  firstDay =
    firstDay === 0
      ? 6
      : firstDay - 1;

  const days = [];

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    days.push(null);
  }

  for (
    let i = 1;
    i <= daysInMonth;
    i++
  ) {

    days.push(i);
  }

  /* =========================================
     CHANGE MONTH
  ========================================= */

  const changeMonth = (
    dir
  ) => {

    setSelectedDate(
      new Date(
        currentYear,
        currentMonth + dir,
        1
      )
    );
  };

  return (
    <div className="page">

      {/* =========================================
          MOBILE BUTTONS
      ========================================= */}

      <button
        className="mobile-left-btn"
        onClick={() =>
          setLeftOpen(
            !leftOpen
          )
        }
      >
        {leftOpen
          ? "✖"
          : "☰"}
      </button>

      <button
        className="mobile-right-btn"
        onClick={() =>
          setRightOpen(
            !rightOpen
          )
        }
      >
        {rightOpen
          ? "✖"
          : "📅"}
      </button>

      {/* =========================================
          OVERLAY
      ========================================= */}

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

      {/* =========================================
          HEADER
      ========================================= */}

             <div className="header">
        
          <div>
        
            <h1>
              🧘 Rutina Inteligente
            </h1>
        
            <p>
              Organiza actividades
              por día, semana o mes
            </p>
        
          </div>
        
          <button
            className="back-btn"
            onClick={() =>
              navigate("/usuario")
            }
          >
            ⬅ Volver
          </button>
        
        </div>


      {/* =========================================
          MAIN LAYOUT
      ========================================= */}

      <div className="layout">

        {/* =========================================
            LEFT PANEL
        ========================================= */}

        <div
          className={`
            left-panel
            ${
              leftOpen
                ? "open"
                : ""
            }
          `}
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
                className={`
                  activity-card
                  ${
                    selectedActivity?.id_registro ===
                    act.id_registro
                      ? "selected"
                      : ""
                  }
                `}
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
                  {act.puntaje_agrado ||
                    5}
                  /10
                </p>

              </div>
            )
          )}

          <hr />

          <h3>
            ⚙ Configuración
          </h3>

          <label>
            Título
          </label>

          <input
            className="input"
            value={titulo}
            onChange={(e) =>
              setTitulo(
                e.target.value
              )
            }
          />

          <label>
            Descripción
          </label>

          <textarea
            className="input"
            rows="4"
            value={descripcion}
            onChange={(e) =>
              setDescripcion(
                e.target.value
              )
            }
          />

          <div className="time-row">

            <div>

              <label>
                Hora inicio
              </label>

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

            </div>

            <div>

              <label>
                Hora fin
              </label>

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

          </div>

          <label>
            Duración
          </label>

          <input
            type="number"
            className="input"
            value={duracion}
            onChange={(e) =>
              setDuracion(
                Number(
                  e.target.value
                )
              )
            }
          />

          <button
            className="create-btn"
            onClick={
              createEvent
            }
          >
            Guardar rutina
          </button>

        </div>

        {/* =========================================
            CENTER PANEL
        ========================================= */}

        <div className="center-panel">

          <div className="planner-header">

            <h2>
              📅 Planificación del día
            </h2>

            <p className="planner-date">

              {selectedDate.toLocaleDateString(
                "es-CL",
                {
                  weekday:
                    "long",
                  year:
                    "numeric",
                  month:
                    "2-digit",
                  day:
                    "2-digit",
                }
              )}

            </p>

          </div>

          {/* EVENTOS */}

          <div className="planner-events">

            {eventosDia.length ===
            0 ? (

              <div className="empty-planner">

                <h3>
                  No hay rutinas
                </h3>

                <p>
                  Selecciona un día
                  del calendario
                </p>

              </div>

            ) : (

              eventosDia.map(
                (
                  evento
                ) => (

                  <div
                    key={
                      evento.id_evento
                    }
                    className={`
                      planner-card
                      ${
                        evento.completado
                          ? "completed"
                          : ""
                      }
                    `}
                  >

                    <div className="planner-left">

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
                        className="planner-checkbox"
                      />

                      <div className="planner-info">

                        <h3>
                          {
                            evento.titulo
                          }
                        </h3>

                        <div className="planner-time">

                          ⏰{" "}
                          {
                            evento.hora
                          }
                          {" → "}
                          {evento.hora_fin ||
                            "--:--"}

                        </div>

                        <div className="planner-duration">

                          🕒{" "}
                          {
                            evento.duracion
                          }{" "}
                          min

                        </div>

                        {evento.descripcion && (

                          <p className="planner-description">

                            {
                              evento.descripcion
                            }

                          </p>
                        )}

                      </div>

                    </div>

                    <button
                      className="planner-delete"
                      onClick={() =>
                        deleteEvent(
                          evento.id_evento
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

        </div>

        {/* =========================================
            RIGHT PANEL
        ========================================= */}

        <div
          className={`
            right-panel
            ${
              rightOpen
                ? "open"
                : ""
            }
          `}
        >

          <div className="calendar-top">

            <h3>
              📆 Calendario
            </h3>

            <div className="calendar-nav">

              <button
                onClick={() =>
                  changeMonth(
                    -1
                  )
                }
              >
                ◀
              </button>

              <button
                onClick={() =>
                  changeMonth(
                    1
                  )
                }
              >
                ▶
              </button>

            </div>

          </div>

          <div className="calendar-container">

            <h2>

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
              ][currentMonth]}

              {" "}

              {
                currentYear
              }

            </h2>

            {/* WEEK */}

            <div className="weekdays">

              {[
                "Lun",
                "Mar",
                "Mié",
                "Jue",
                "Vie",
                "Sáb",
                "Dom",
              ].map(
                (day) => (

                  <div
                    key={day}
                  >
                    {day}
                  </div>
                )
              )}

            </div>

            {/* GRID */}

            <div className="calendar-grid">

              {days.map(
                (
                  d,
                  index
                ) => {

                  if (!d) {

                    return (
                      <div
                        key={
                          index
                        }
                        className="
                          calendar-day
                          empty
                        "
                      />
                    );
                  }

                  const date =
                    new Date(
                      currentYear,
                      currentMonth,
                      d
                    );

                  const fullDate =
                    formatDateLocal(
                      date
                    );

                  const hasEvents =
                    eventos.some(
                      (
                        ev
                      ) =>
                        ev.fecha?.slice(
                          0,
                          10
                        ) ===
                        fullDate
                    );

                  const isSelected =
                    selectedDate.getDate() ===
                      d &&
                    selectedDate.getMonth() ===
                      currentMonth &&
                    selectedDate.getFullYear() ===
                      currentYear;

                  const isToday =
                    today.getDate() ===
                      d &&
                    today.getMonth() ===
                      currentMonth &&
                    today.getFullYear() ===
                      currentYear;

                  return (

                    <div
                      key={
                        index
                      }
                      className={`
                        calendar-day
                        ${
                          isSelected
                            ? "selected"
                            : ""
                        }
                        ${
                          isToday
                            ? "today"
                            : ""
                        }
                      `}
                      onClick={() =>
                        setSelectedDate(
                          date
                        )
                      }
                    >

                      <span>
                        {d}
                      </span>

                      {hasEvents && (

                        <div className="event-dot" />

                      )}

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
