import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Rutina.css";

const API_URL = "https://empatia-backend.onrender.com";

export default function Rutina() {

  const navigate = useNavigate();

  /* =========================
     MOBILE SIDEBARS
  ========================= */

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  /* =========================
     USER
  ========================= */

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
     STATES
  ========================= */

  const [actividades, setActividades] = useState([]);
  const [eventos, setEventos] = useState([]);

  const [selectedActivity, setSelectedActivity] =
    useState(null);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] =
    useState("");

  const [hora, setHora] = useState("");
  const [horaFin, setHoraFin] = useState("");

  const [duracion, setDuracion] = useState(30);

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  /* =========================
     FORMAT DATE
  ========================= */

  const formatDateLocal = (date) => {

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /* =========================
     LOAD ACTIVITIES
  ========================= */

  const loadActivities = async () => {

    try {

      const res = await fetch(
        `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
      );

      const data = await res.json();

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

  const loadEvents = async () => {

    try {

      const res = await fetch(
        `${API_URL}/api/rutina-eventos/${user.id_usuario}`
      );

      const data = await res.json();

      setEventos(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.log(err);
    }
  };

  /* =========================
     INIT
  ========================= */

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

    setLeftOpen(true);
  };

  /* =========================
     CREATE EVENT
  ========================= */

  const createEvent = async () => {

    if (!user?.id_usuario) {

      alert("Usuario no encontrado");

      return;
    }

    if (!titulo.trim()) {

      alert("Ingrese un título");

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

      const data = await res.json();

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

      alert(
        "Rutina creada"
      );

      await loadEvents();

      setTitulo("");
      setDescripcion("");

      setHora("");
      setHoraFin("");

      setDuracion(30);

      setSelectedActivity(null);

      setLeftOpen(false);

    } catch (err) {

      console.log(err);

      alert(
        "Error conexión servidor"
      );
    }
  };

  /* =========================
     DELETE EVENT
  ========================= */

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

      loadEvents();

    } catch (err) {

      console.log(err);
    }
  };

  /* =========================
     TOGGLE COMPLETE
  ========================= */

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

      loadEvents();

    } catch (err) {

      console.log(err);
    }
  };

  /* =========================
     FILTER EVENTS
  ========================= */

  const currentDate =
    formatDateLocal(
      selectedDate
    );

  const eventosDia =
    eventos.filter(
      (e) =>
        e.fecha === currentDate
    );

  /* =========================
     CALENDAR
  ========================= */

  const currentMonth =
    selectedDate.getMonth();

  const currentYear =
    selectedDate.getFullYear();

  const today = new Date();

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

  /* =========================
     CHANGE MONTH
  ========================= */

  const changeMonth = (
    direction
  ) => {

    setSelectedDate(
      new Date(
        currentYear,
        currentMonth +
          direction,
        1
      )
    );
  };

  return (
    <div className="page">

      {/* MOBILE BUTTONS */}

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

      {/* OVERLAY */}

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

      {/* HEADER */}

      <div className="header">

        <div>

          <h1>
            🧘 Rutina Inteligente
          </h1>

          <p>
            Organiza tus
            actividades
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

      {/* LAYOUT */}

      <div className="layout">

        {/* LEFT PANEL */}

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

          {actividades.length ===
            0 && (
            <p>
              No hay
              actividades
            </p>
          )}

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
            ➕ Crear rutina
          </h3>

          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) =>
              setTitulo(
                e.target.value
              )
            }
          />

          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) =>
              setDescripcion(
                e.target.value
              )
            }
          />

          {/* HORAS */}

          <div className="time-row">

            <div>

              <label>
                Hora inicio
              </label>

              <input
                type="time"
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
            (minutos)
          </label>

          <input
            type="number"
            min="5"
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
            onClick={
              createEvent
            }
          >
            Guardar rutina
          </button>

        </div>

        {/* CENTER PANEL */}

        <div className="center-panel">

          <div className="day-header">

            <h2>
              📅{" "}
              {selectedDate.toLocaleDateString()}
            </h2>

          </div>

          <div className="events-container">

            {eventosDia.length ===
            0 ? (

              <div className="empty-events">

                <p>
                  No hay
                  rutinas
                  este día
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
                      event-card
                      ${
                        evento.completado
                          ? "completed"
                          : ""
                      }
                    `}
                  >

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

                    <div className="event-info">

                      <h4>
                        {
                          evento.titulo
                        }
                      </h4>

                      <p>
                        🕒{" "}
                        {
                          evento.hora
                        }
                        {" - "}
                        {evento.hora_fin ||
                          "--:--"}
                      </p>

                      <p>
                        ⏳{" "}
                        {
                          evento.duracion
                        }{" "}
                        min
                      </p>

                      {evento.descripcion && (
                        <p>
                          {
                            evento.descripcion
                          }
                        </p>
                      )}

                    </div>

                    <button
                      className="delete-btn"
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

        {/* RIGHT PANEL */}

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

          {/* TOP */}

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

          {/* CALENDAR */}

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
              ][currentMonth]}{" "}
              {
                currentYear
              }
            </h2>

            {/* DAYS */}

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
                    key={
                      day
                    }
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

                  const fullDate =
                    formatDateLocal(
                      new Date(
                        currentYear,
                        currentMonth,
                        d
                      )
                    );

                  const hasEvents =
                    eventos.some(
                      (
                        e
                      ) =>
                        e.fecha ===
                        fullDate
                    );

                  const isSelected =
                    selectedDate.getDate() ===
                      d &&
                    selectedDate.getMonth() ===
                      currentMonth;

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
                          new Date(
                            currentYear,
                            currentMonth,
                            d
                          )
                        )
                      }
                    >

                      {d}

                      {hasEvents && (
                        <div className="calendar-events">

                          <div className="event-dot" />

                          <div className="event-dot" />

                        </div>
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
