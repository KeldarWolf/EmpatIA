import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://empatia-backend.onrender.com";

export default function Rutina() {
  const navigate = useNavigate();

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
     DATE
  ========================= */
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split("T")[0]
  );

  /* =========================
     STATES
  ========================= */
  const [actividades, setActividades] = useState([]);

  const [calendarEvents, setCalendarEvents] = useState([]);

  const [draggedActivity, setDraggedActivity] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [loading, setLoading] = useState(true);

  /* =========================
     CALENDAR
  ========================= */
  const months = [
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
  ];

  const daysShort = [
    "Lun",
    "Mar",
    "Mié",
    "Jue",
    "Vie",
    "Sáb",
    "Dom",
  ];

  const daysFull = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  /* =========================
     LOAD DATA
  ========================= */
  const loadData = async () => {
    try {
      setLoading(true);

      /* ACTIVIDADES */
      const actividadesRes = await fetch(
        `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
      );

      const actividadesData = await actividadesRes.json();

      setActividades(
        Array.isArray(actividadesData)
          ? actividadesData
          : []
      );

      /* EVENTOS */
      const eventosRes = await fetch(
        `${API_URL}/api/rutina-evento/${user.id_usuario}`
      );

      const eventosData = await eventosRes.json();

      setCalendarEvents(
        Array.isArray(eventosData)
          ? eventosData
          : []
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id_usuario) {
      loadData();
    }
  }, []);

  /* =========================
     HANDLE DROP
  ========================= */
  const handleDrop = async (dateStr) => {
    try {
      if (!draggedActivity) return;

      const hora =
        prompt("Hora del evento", "08:00") || "08:00";

      const repeticion =
        prompt(
          "Repetición: none | diario | semanal | mensual",
          "none"
        ) || "none";

      const body = {
        id_usuario: user.id_usuario,
        id_registro: draggedActivity.id_registro,
        titulo: draggedActivity.nombre_actividad,
        descripcion:
          draggedActivity.instrucciones_usuario || "",
        fecha: dateStr,
        hora,
        repeticion,
      };

      const res = await fetch(
        `${API_URL}/api/rutina-evento`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      setCalendarEvents((prev) => [...prev, data]);

      setDraggedActivity(null);
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
     TOGGLE COMPLETADO
  ========================= */
  const toggleCompleted = async (evento) => {
    try {
      await fetch(
        `${API_URL}/api/rutina-evento/${evento.id_evento}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completado: !evento.completado,
          }),
        }
      );

      setCalendarEvents((prev) =>
        prev.map((e) =>
          e.id_evento === evento.id_evento
            ? {
                ...e,
                completado: !e.completado,
              }
            : e
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
     EVENTS DAY
  ========================= */
  const dayEvents = calendarEvents
    .filter((e) => e.fecha === selectedDate)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  /* =========================
     CALENDAR LOGIC
  ========================= */
  const getWeeksForMonth = (m, y) => {
    const weeks = [];

    const firstDay = new Date(y, m, 1);

    let current = new Date(firstDay);

    current.setDate(
      current.getDate() -
        (current.getDay() === 0
          ? 6
          : current.getDay() - 1)
    );

    while (
      current.getMonth() === m ||
      weeks.length === 0
    ) {
      const week = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(current);

        if (
          d.getMonth() === m &&
          d.getFullYear() === y
        ) {
          week.push(
            d.toISOString().split("T")[0]
          );
        } else {
          week.push(null);
        }

        current.setDate(current.getDate() + 1);
      }

      weeks.push(week);

      if (current.getMonth() !== m) break;
    }

    return weeks;
  };

  const monthWeeks = getWeeksForMonth(
    month,
    year
  );

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div style={styles.loading}>
        ⏳ Cargando rutina...
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* =========================
         HEADER
      ========================= */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0 }}>
            🧘 Rutina Inteligente
          </h1>

          <p style={{ opacity: 0.7 }}>
            Arrastra actividades al calendario
          </p>
        </div>

        <button
          onClick={() => navigate("/user")}
          style={styles.backBtn}
        >
          ⬅ Volver
        </button>
      </div>

      {/* =========================
         GRID
      ========================= */}
      <div style={styles.grid}>

        {/* =========================
           LEFT
        ========================= */}
        <div style={styles.left}>

          <h3>🎯 Actividades</h3>

          {actividades.length === 0 ? (
            <div style={styles.empty}>
              No hay actividades
            </div>
          ) : (
            actividades.map((a) => (
              <div
                key={a.id_registro}
                draggable
                onDragStart={() =>
                  setDraggedActivity(a)
                }
                style={styles.activityCard}
              >
                <div>
                  <h4 style={{ margin: 0 }}>
                    {a.nombre_actividad}
                  </h4>

                  <small style={{ opacity: 0.7 }}>
                    ⭐ {a.puntaje_agrado || 0}/10
                  </small>
                </div>

                <div style={styles.drag}>
                  ☰
                </div>
              </div>
            ))
          )}
        </div>

        {/* =========================
           CENTER
        ========================= */}
        <div style={styles.center}>

          <h2>
            {
              daysFull[
                new Date(selectedDate).getDay() === 0
                  ? 6
                  : new Date(selectedDate).getDay() - 1
              ]
            }

            <span style={styles.dateText}>
              {selectedDate}
            </span>
          </h2>

          <div style={styles.eventsContainer}>

            {dayEvents.length === 0 ? (
              <div style={styles.emptyDay}>
                Arrastra actividades aquí
              </div>
            ) : (
              dayEvents.map((e) => (
                <div
                  key={e.id_evento}
                  style={{
                    ...styles.eventCard,
                    opacity:
                      e.completado ? 0.5 : 1,
                  }}
                  onClick={() =>
                    setSelectedEvent(e)
                  }
                >
                  <div
                    style={styles.checkbox}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      toggleCompleted(e);
                    }}
                  >
                    {e.completado
                      ? "✅"
                      : "⬜"}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        margin: 0,
                        textDecoration:
                          e.completado
                            ? "line-through"
                            : "none",
                      }}
                    >
                      {e.titulo}
                    </h4>

                    <small>
                      🕒 {e.hora}
                    </small>

                    <div style={styles.repeat}>
                      🔁 {e.repeticion}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* =========================
           RIGHT
        ========================= */}
        <div style={styles.right}>

          <div style={styles.calendarHeader}>
            <select
              value={year}
              onChange={(e) =>
                setYear(Number(e.target.value))
              }
              style={styles.select}
            >
              {[2025, 2026, 2027, 2028].map(
                (y) => (
                  <option
                    key={y}
                    value={y}
                  >
                    {y}
                  </option>
                )
              )}
            </select>

            <select
              value={month}
              onChange={(e) =>
                setMonth(Number(e.target.value))
              }
              style={styles.select}
            >
              {months.map((m, i) => (
                <option
                  key={i}
                  value={i}
                >
                  {m}
                </option>
              ))}
            </select>
          </div>

          <h3 style={styles.monthTitle}>
            {months[month]} {year}
          </h3>

          {/* WEEK */}
          <div style={styles.weekHeader}>
            {daysShort.map((d) => (
              <div
                key={d}
                style={styles.weekDay}
              >
                {d}
              </div>
            ))}
          </div>

          {/* CALENDAR */}
          <div style={styles.calendar}>
            {monthWeeks.map((week, i) => (
              <div
                key={i}
                style={styles.weekRow}
              >
                {week.map((dateStr, j) => {
                  const count =
                    calendarEvents.filter(
                      (e) =>
                        e.fecha === dateStr
                    ).length;

                  return (
                    <div
                      key={j}
                      onClick={() =>
                        dateStr &&
                        setSelectedDate(
                          dateStr
                        )
                      }
                      onDragOver={(e) =>
                        e.preventDefault()
                      }
                      onDrop={() =>
                        dateStr &&
                        handleDrop(dateStr)
                      }
                      style={{
                        ...styles.dayCell,
                        background:
                          dateStr ===
                          selectedDate
                            ? "#2563eb"
                            : "#111827",
                      }}
                    >
                      <div>
                        {dateStr
                          ? parseInt(
                              dateStr.slice(8)
                            )
                          : ""}
                      </div>

                      {count > 0 && (
                        <small
                          style={{
                            fontSize: 10,
                          }}
                        >
                          {count}
                        </small>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* =========================
         MODAL
      ========================= */}
      {selectedEvent && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>

            <h2>{selectedEvent.titulo}</h2>

            <p>
              📅 {selectedEvent.fecha}
            </p>

            <p>
              🕒 {selectedEvent.hora}
            </p>

            <p>
              🔁 {selectedEvent.repeticion}
            </p>

            <div style={styles.modalDesc}>
              {selectedEvent.descripcion ||
                "Sin descripción"}
            </div>

            <button
              onClick={() =>
                setSelectedEvent(null)
              }
              style={styles.closeBtn}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b0f14",
    color: "white",
    fontFamily: "Arial",
  },

  loading: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 24,
    background: "#0b0f14",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: 20,
    borderBottom: "1px solid #1f2937",
  },

  backBtn: {
    background: "#1f2937",
    border: "none",
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "280px 1fr 360px",
    gap: 15,
    padding: 15,
  },

  left: {
    background: "#111827",
    padding: 15,
    borderRadius: 14,
    overflowY: "auto",
  },

  center: {
    background: "#111827",
    padding: 20,
    borderRadius: 14,
  },

  right: {
    background: "#111827",
    padding: 15,
    borderRadius: 14,
  },

  empty: {
    opacity: 0.6,
    marginTop: 20,
  },

  activityCard: {
    background: "#1f2937",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    cursor: "grab",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  drag: {
    fontSize: 20,
    opacity: 0.5,
  },

  dateText: {
    marginLeft: 10,
    opacity: 0.6,
    fontSize: 16,
  },

  eventsContainer: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  emptyDay: {
    height: 300,
    border: "2px dashed #374151",
    borderRadius: 14,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.6,
  },

  eventCard: {
    background: "#1f2937",
    padding: 14,
    borderRadius: 12,
    display: "flex",
    gap: 12,
    cursor: "pointer",
  },

  checkbox: {
    fontSize: 22,
  },

  repeat: {
    marginTop: 5,
    opacity: 0.7,
    fontSize: 12,
  },

  calendarHeader: {
    display: "flex",
    gap: 8,
  },

  select: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#1f2937",
    color: "white",
  },

  monthTitle: {
    textAlign: "center",
    margin: "15px 0",
  },

  weekHeader: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    marginBottom: 5,
  },

  weekDay: {
    textAlign: "center",
    opacity: 0.7,
    fontSize: 12,
  },

  calendar: {},

  weekRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    gap: 5,
    marginBottom: 5,
  },

  dayCell: {
    height: 60,
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none",
  },

  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    background: "#111827",
    padding: 25,
    borderRadius: 14,
    width: 400,
  },

  modalDesc: {
    marginTop: 15,
    background: "#1f2937",
    padding: 12,
    borderRadius: 10,
  },

  closeBtn: {
    marginTop: 20,
    width: "100%",
    padding: 12,
    border: "none",
    borderRadius: 10,
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
  },
};
