import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split("T")[0]
  );

  const [actividades, setActividades] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [horaInicio, setHoraInicio] = useState("09:00");
  const [duracion, setDuracion] = useState(30);

  const [modo, setModo] = useState("dia");

  const [selectedDays, setSelectedDays] = useState([]);

  const [eventos, setEventos] = useState([]);

  /* =========================================================
     LOAD
  ========================================================= */

  const loadData = async () => {
    try {
      const [actRes, eventosRes] = await Promise.all([
        fetch(
          `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
        ),
        fetch(
          `${API_URL}/api/rutina-eventos/${user.id_usuario}`
        ),
      ]);

      const actData = await actRes.json();
      const eventosData = await eventosRes.json();

      setActividades(Array.isArray(actData) ? actData : []);
      setEventos(Array.isArray(eventosData) ? eventosData : []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user?.id_usuario) {
      loadData();
    }
  }, []);

  /* =========================================================
     GENERAR HORA FIN
  ========================================================= */

  const calcularHoraFin = () => {
    const [h, m] = horaInicio.split(":").map(Number);

    const total = h * 60 + m + Number(duracion);

    const hh = String(Math.floor(total / 60)).padStart(2, "0");
    const mm = String(total % 60).padStart(2, "0");

    return `${hh}:${mm}`;
  };

  /* =========================================================
     SELECT ACTIVIDAD
  ========================================================= */

  const toggleActivity = (actividad) => {
    setSelectedActivities((prev) => {
      const exists = prev.find(
        (a) => a.id_registro === actividad.id_registro
      );

      if (exists) {
        return prev.filter(
          (a) => a.id_registro !== actividad.id_registro
        );
      }

      return [...prev, actividad];
    });
  };

  /* =========================================================
     SELECT DAY
  ========================================================= */

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  /* =========================================================
     WEEK DATES
  ========================================================= */

  const getCurrentWeekDates = () => {
    const date = new Date(selectedDate);

    const start = new Date(date);

    const day = date.getDay();

    start.setDate(
      date.getDate() - (day === 0 ? 6 : day - 1)
    );

    const dates = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);

      d.setDate(start.getDate() + i);

      dates.push(d.toISOString().split("T")[0]);
    }

    return dates;
  };

  const weekDates = getCurrentWeekDates();

  /* =========================================================
     CREATE EVENTS
  ========================================================= */

  const saveRutina = async () => {
    try {
      let fechas = [];

      if (modo === "dia") {
        fechas = [selectedDate];
      }

      if (modo === "semana") {
        fechas = weekDates.filter((_, index) =>
          selectedDays.includes(index)
        );
      }

      const nuevosEventos = [];

      for (const fecha of fechas) {
        for (const act of selectedActivities) {
          const body = {
            id_usuario: user.id_usuario,
            titulo:
              titulo ||
              act.nombre_actividad ||
              "Actividad",
            descripcion:
              descripcion ||
              act.instrucciones_usuario ||
              "",
            fecha,
            hora: horaInicio,
            hora_fin: calcularHoraFin(),
            duracion,
            repeticion: modo,
            completado: false,
          };

          const res = await fetch(
            `${API_URL}/api/rutina-eventos`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            }
          );

          const data = await res.json();

          nuevosEventos.push(data);
        }
      }

      setEventos((prev) => [...nuevosEventos, ...prev]);

      setTitulo("");
      setDescripcion("");
      setSelectedActivities([]);
      setSelectedDays([]);

      alert("✔ Rutina guardada");
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================================================
     TOGGLE COMPLETED
  ========================================================= */

  const toggleCompleted = async (evento) => {
    try {
      await fetch(
        `${API_URL}/api/rutina-eventos/${evento.id_evento}`,
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

      setEventos((prev) =>
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

  /* =========================================================
     DELETE EVENT
  ========================================================= */

  const deleteEvent = async (id) => {
    try {
      await fetch(
        `${API_URL}/api/rutina-eventos/${id}`,
        {
          method: "DELETE",
        }
      );

      setEventos((prev) =>
        prev.filter((e) => e.id_evento !== id)
      );
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================================================
     EVENTOS DIA
  ========================================================= */

  const eventosDelDia = useMemo(() => {
    return eventos
      .filter((e) => e.fecha === selectedDate)
      .sort((a, b) =>
        a.hora.localeCompare(b.hora)
      );
  }, [eventos, selectedDate]);

  const horasDelDia = [
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
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

  return (
    <div style={styles.page}>
      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <h1>🧘 Rutina Inteligente</h1>

          <p style={{ opacity: 0.7 }}>
            Organiza actividades y planificación
          </p>
        </div>

        <button
          onClick={() => navigate("/user")}
          style={styles.backBtn}
        >
          ⬅ Volver
        </button>
      </div>

      {/* GRID */}

      <div style={styles.grid}>
        {/* LEFT */}

        <div style={styles.left}>
          <h3>➕ Crear rutina</h3>

          <input
            placeholder="Título"
            value={titulo}
            onChange={(e) =>
              setTitulo(e.target.value)
            }
            style={styles.input}
          />

          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) =>
              setDescripcion(e.target.value)
            }
            style={styles.textarea}
          />

          <label>⏰ Hora inicio</label>

          <input
            type="time"
            value={horaInicio}
            onChange={(e) =>
              setHoraInicio(e.target.value)
            }
            style={styles.input}
          />

          <label>⌛ Duración</label>

          <select
            value={duracion}
            onChange={(e) =>
              setDuracion(e.target.value)
            }
            style={styles.input}
          >
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>1 hora</option>
            <option value={90}>1h 30m</option>
            <option value={120}>2 horas</option>
          </select>

          <label>🔁 Repetición</label>

          <div style={styles.modeContainer}>
            <button
              onClick={() => setModo("dia")}
              style={{
                ...styles.modeBtn,
                background:
                  modo === "dia"
                    ? "#2563eb"
                    : "#111827",
              }}
            >
              Día
            </button>

            <button
              onClick={() => setModo("semana")}
              style={{
                ...styles.modeBtn,
                background:
                  modo === "semana"
                    ? "#2563eb"
                    : "#111827",
              }}
            >
              Semana
            </button>
          </div>

          {modo === "semana" && (
            <div style={styles.daysGrid}>
              {daysShort.map((d, i) => (
                <div
                  key={i}
                  onClick={() => toggleDay(i)}
                  style={{
                    ...styles.dayBtn,
                    background:
                      selectedDays.includes(i)
                        ? "#22c55e"
                        : "#111827",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
          )}

          <hr style={styles.hr} />

          <h3>🎯 Actividades</h3>

          <div style={styles.activitiesContainer}>
            {actividades.map((act) => {
              const active =
                selectedActivities.find(
                  (a) =>
                    a.id_registro === act.id_registro
                );

              return (
                <div
                  key={act.id_registro}
                  onClick={() =>
                    toggleActivity(act)
                  }
                  style={{
                    ...styles.activityCard,
                    border: active
                      ? "2px solid #22c55e"
                      : "1px solid #1f2937",
                  }}
                >
                  <div>
                    <b>
                      {act.nombre_actividad}
                    </b>

                    <p style={styles.smallText}>
                      ⭐ {act.puntaje_agrado}/10
                    </p>
                  </div>

                  {active && <span>✔</span>}
                </div>
              );
            })}
          </div>

          <button
            onClick={saveRutina}
            style={styles.saveBtn}
          >
            💾 Guardar rutina
          </button>
        </div>

        {/* CENTER */}

        <div style={styles.center}>
          <div style={styles.dayHeader}>
            <div>
              <h2>📅 Planificación del día</h2>

              <p style={{ opacity: 0.7 }}>
                {selectedDate}
              </p>
            </div>

            <div style={styles.resumeBox}>
              📝 {eventosDelDia.length} actividades
            </div>
          </div>

          <div style={styles.timeline}>
            {horasDelDia.map((horaBase) => {
              const eventosHora =
                eventosDelDia.filter(
                  (e) =>
                    e.hora.slice(0, 2) ===
                    horaBase.slice(0, 2)
                );

              return (
                <div
                  key={horaBase}
                  style={styles.timelineRow}
                >
                  <div style={styles.timelineHour}>
                    {horaBase}
                  </div>

                  <div
                    style={styles.timelineContent}
                  >
                    {eventosHora.length ===
                    0 ? (
                      <div
                        style={styles.emptySlot}
                      >
                        Sin actividades
                      </div>
                    ) : (
                      eventosHora.map(
                        (evento) => (
                          <div
                            key={
                              evento.id_evento
                            }
                            style={{
                              ...styles.timelineCard,
                              opacity:
                                evento.completado
                                  ? 0.5
                                  : 1,
                            }}
                          >
                            <div
                              style={
                                styles.timelineTop
                              }
                            >
                              <div>
                                <h3
                                  style={{
                                    margin: 0,
                                  }}
                                >
                                  {
                                    evento.titulo
                                  }
                                </h3>

                                <small>
                                  ⏰{" "}
                                  {
                                    evento.hora
                                  }{" "}
                                  -{" "}
                                  {
                                    evento.hora_fin
                                  }
                                </small>
                              </div>

                              <div
                                style={
                                  styles.actions
                                }
                              >
                                <button
                                  onClick={() =>
                                    toggleCompleted(
                                      evento
                                    )
                                  }
                                  style={{
                                    ...styles.doneBtn,
                                    background:
                                      evento.completado
                                        ? "#22c55e"
                                        : "#374151",
                                  }}
                                >
                                  {evento.completado
                                    ? "✔"
                                    : "○"}
                                </button>

                                <button
                                  onClick={() =>
                                    deleteEvent(
                                      evento.id_evento
                                    )
                                  }
                                  style={
                                    styles.deleteBtn
                                  }
                                >
                                  🗑
                                </button>
                              </div>
                            </div>

                            <p
                              style={
                                styles.eventDesc
                              }
                            >
                              {
                                evento.descripcion
                              }
                            </p>

                            <div
                              style={
                                styles.badges
                              }
                            >
                              <div
                                style={
                                  styles.badge
                                }
                              >
                                ⌛{" "}
                                {
                                  evento.duracion
                                }{" "}
                                min
                              </div>

                              <div
                                style={
                                  styles.badge
                                }
                              >
                                🔁{" "}
                                {
                                  evento.repeticion
                                }
                              </div>
                            </div>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}

        <div style={styles.right}>
          <h3>📅 Semana</h3>

          <div style={styles.weekList}>
            {weekDates.map((date, i) => (
              <div
                key={date}
                onClick={() =>
                  setSelectedDate(date)
                }
                style={{
                  ...styles.weekCard,
                  background:
                    selectedDate === date
                      ? "#2563eb"
                      : "#111827",
                }}
              >
                <div>
                  <b>{daysShort[i]}</b>

                  <p
                    style={{
                      margin: 0,
                      opacity: 0.7,
                    }}
                  >
                    {date}
                  </p>
                </div>

                <span>
                  {
                    eventos.filter(
                      (e) =>
                        e.fecha === date
                    ).length
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {
  page: {
    height: "100vh",
    background: "#0b0f14",
    color: "white",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Arial",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottom: "1px solid #1f2937",
  },

  backBtn: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    background: "#1f2937",
    color: "white",
    cursor: "pointer",
  },

  grid: {
    flex: 1,
    display: "flex",
    gap: 14,
    padding: 14,
    overflow: "hidden",
  },

  left: {
    width: 340,
    background: "#0f172a",
    borderRadius: 16,
    padding: 16,
    overflowY: "auto",
  },

  center: {
    flex: 1,
    background: "#0f172a",
    borderRadius: 16,
    padding: 20,
    overflowY: "auto",
  },

  right: {
    width: 260,
    background: "#0f172a",
    borderRadius: 16,
    padding: 16,
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#111827",
    color: "white",
    marginTop: 8,
    marginBottom: 12,
  },

  textarea: {
    width: "100%",
    height: 90,
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#111827",
    color: "white",
    marginTop: 8,
    marginBottom: 12,
  },

  modeContainer: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },

  modeBtn: {
    flex: 1,
    padding: 12,
    border: "none",
    borderRadius: 10,
    color: "white",
    cursor: "pointer",
  },

  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    gap: 6,
    marginTop: 14,
  },

  dayBtn: {
    padding: 10,
    borderRadius: 8,
    textAlign: "center",
    cursor: "pointer",
    fontSize: 13,
  },

  hr: {
    borderColor: "#1f2937",
    margin: "18px 0",
  },

  activitiesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 10,
  },

  activityCard: {
    background: "#111827",
    padding: 12,
    borderRadius: 12,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  smallText: {
    margin: 0,
    opacity: 0.7,
    fontSize: 12,
  },

  saveBtn: {
    width: "100%",
    padding: 14,
    background: "#22c55e",
    border: "none",
    borderRadius: 12,
    color: "white",
    marginTop: 18,
    cursor: "pointer",
    fontWeight: "bold",
  },

  dayHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  resumeBox: {
    background: "#111827",
    padding: "10px 14px",
    borderRadius: 10,
  },

  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  timelineRow: {
    display: "flex",
    gap: 14,
    minHeight: 90,
  },

  timelineHour: {
    width: 80,
    fontSize: 14,
    opacity: 0.7,
    paddingTop: 10,
  },

  timelineContent: {
    flex: 1,
    borderLeft: "2px solid #1f2937",
    paddingLeft: 18,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  emptySlot: {
    opacity: 0.3,
    fontSize: 13,
    paddingTop: 10,
  },

  timelineCard: {
    background: "#111827",
    padding: 14,
    borderRadius: 14,
    border: "1px solid #1f2937",
  },

  timelineTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  actions: {
    display: "flex",
    gap: 8,
  },

  doneBtn: {
    border: "none",
    width: 36,
    height: 36,
    borderRadius: 10,
    color: "white",
    cursor: "pointer",
  },

  deleteBtn: {
    border: "none",
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
  },

  eventDesc: {
    marginTop: 10,
    lineHeight: 1.5,
    opacity: 0.9,
  },

  badges: {
    display: "flex",
    gap: 8,
    marginTop: 12,
  },

  badge: {
    background: "#1f2937",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
  },

  weekList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 12,
  },

  weekCard: {
    padding: 14,
    borderRadius: 12,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
};
