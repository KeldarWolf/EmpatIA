import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://empatia-backend.onrender.com";

export default function Rutina() {
  const navigate = useNavigate();

  const today = new Date();

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

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split("T")[0]
  );

  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);

  const [actividades, setActividades] = useState([]);
  const [eventos, setEventos] = useState([]);

  const [horaInicio, setHoraInicio] = useState("09:00");
  const [duracion, setDuracion] = useState(30);

  const [repeatMode, setRepeatMode] = useState("none");

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

  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData = async () => {
    try {
      const [actRes, eventRes] = await Promise.all([
        fetch(
          `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
        ),
        fetch(
          `${API_URL}/api/rutina-evento/${user.id_usuario}`
        ),
      ]);

      const actividadesData = await actRes.json();
      const eventosData = await eventRes.json();

      setActividades(
        Array.isArray(actividadesData)
          ? actividadesData
          : []
      );

      setEventos(
        Array.isArray(eventosData)
          ? eventosData
          : []
      );
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
     MULTI SELECT ACTIVITIES
  ========================================================= */

  const toggleActivity = (activity) => {
    setSelectedActivities((prev) => {
      const exists = prev.find(
        (a) => a.id_registro === activity.id_registro
      );

      if (exists) {
        return prev.filter(
          (a) => a.id_registro !== activity.id_registro
        );
      }

      return [...prev, activity];
    });
  };

  /* =========================================================
     MULTI SELECT DATES
  ========================================================= */

  const toggleDate = (date) => {
    setSelectedDate(date);

    setSelectedDates((prev) => {
      if (prev.includes(date)) {
        return prev.filter((d) => d !== date);
      }

      return [...prev, date];
    });
  };

  /* =========================================================
     CALC HORA FIN
  ========================================================= */

  const calcularHoraFin = (inicio, mins) => {
    const [h, m] = inicio.split(":").map(Number);

    const total = h * 60 + m + mins;

    const hh = String(Math.floor(total / 60)).padStart(
      2,
      "0"
    );

    const mm = String(total % 60).padStart(2, "0");

    return `${hh}:${mm}`;
  };

  /* =========================================================
     SAVE EVENTS
  ========================================================= */

  const guardarEventos = async () => {
    if (selectedActivities.length === 0) {
      return alert("Selecciona actividades");
    }

    if (selectedDates.length === 0) {
      return alert("Selecciona días");
    }

    try {
      const nuevos = [];

      for (const fecha of selectedDates) {
        for (const activity of selectedActivities) {
          const horaFin = calcularHoraFin(
            horaInicio,
            duracion
          );

          const body = {
            id_usuario: user.id_usuario,
            id_registro: activity.id_registro,
            titulo: activity.nombre_actividad,
            descripcion:
              activity.instrucciones_usuario || "",
            fecha,
            hora: horaInicio,
            hora_fin: horaFin,
            duracion,
            repeticion: repeatMode,
            completado: false,
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

          nuevos.push(data);
        }
      }

      setEventos((prev) => [...prev, ...nuevos]);

      setSelectedActivities([]);
      setSelectedDates([]);

      alert("✅ Actividades agregadas");
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================================================
     COMPLETE EVENT
  ========================================================= */

  const toggleCompleted = async (evento) => {
    try {
      const res = await fetch(
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

      const updated = await res.json();

      setEventos((prev) =>
        prev.map((e) =>
          e.id_evento === evento.id_evento
            ? updated
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
        `${API_URL}/api/rutina-evento/${id}`,
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
     CALENDAR
  ========================================================= */

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

  const monthWeeks = getWeeksForMonth(month, year);

  /* =========================================================
     EVENTOS DEL DIA
  ========================================================= */

  const eventosDelDia = eventos
    .filter((e) => e.fecha === selectedDate)
    .sort((a, b) =>
      a.hora.localeCompare(b.hora)
    );

  return (
    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <h1>🧘 Rutina Inteligente</h1>

          <p style={{ opacity: 0.7 }}>
            Organiza actividades, horarios y hábitos
          </p>
        </div>

        <button
          onClick={() => navigate("/user")}
          style={styles.backBtn}
        >
          ⬅ Volver
        </button>
      </div>

      <div style={styles.grid}>

        {/* LEFT */}

        <div style={styles.left}>

          <h3>🎯 Actividades</h3>

          <p style={styles.label}>
            Selecciona varias actividades
          </p>

          <div style={styles.activitiesList}>
            {actividades.map((act) => {
              const selected =
                selectedActivities.find(
                  (a) =>
                    a.id_registro ===
                    act.id_registro
                );

              return (
                <div
                  key={act.id_registro}
                  onClick={() =>
                    toggleActivity(act)
                  }
                  style={{
                    ...styles.activityCard,
                    border: selected
                      ? "2px solid #22c55e"
                      : "2px solid transparent",

                    background: selected
                      ? "#14532d"
                      : "#111827",
                  }}
                >
                  <h4>
                    {act.nombre_actividad}
                  </h4>

                  <p>
                    ⭐ {act.puntaje_agrado}/10
                  </p>

                  <small>
                    {act.instrucciones_usuario?.slice(
                      0,
                      80
                    )}
                  </small>
                </div>
              );
            })}
          </div>

          <hr style={styles.hr} />

          <h3>⏰ Configuración</h3>

          <div style={styles.timeBox}>
            <div>
              <p style={styles.label}>
                Hora inicio
              </p>

              <input
                type="time"
                value={horaInicio}
                onChange={(e) =>
                  setHoraInicio(
                    e.target.value
                  )
                }
                style={styles.input}
              />
            </div>

            <div>
              <p style={styles.label}>
                Duración
              </p>

              <input
                type="number"
                value={duracion}
                onChange={(e) =>
                  setDuracion(
                    Number(e.target.value)
                  )
                }
                style={styles.input}
              />
            </div>
          </div>

          <p style={styles.label}>
            Repetición
          </p>

          <select
            value={repeatMode}
            onChange={(e) =>
              setRepeatMode(
                e.target.value
              )
            }
            style={styles.input}
          >
            <option value="none">
              Sin repetir
            </option>

            <option value="daily">
              Diario
            </option>

            <option value="weekly">
              Semanal
            </option>

            <option value="monthly">
              Mensual
            </option>
          </select>

          <button
            onClick={guardarEventos}
            style={styles.saveBtn}
          >
            ✅ Agregar a rutina
          </button>

        </div>

        {/* CENTER */}

        <div style={styles.center}>

          <h2>
            📅 {selectedDate}
          </h2>

          <p style={styles.label}>
            Eventos del día
          </p>

          {eventosDelDia.length === 0 ? (
            <div style={styles.empty}>
              No hay actividades
            </div>
          ) : (
            eventosDelDia.map((evento) => (
              <div
                key={evento.id_evento}
                style={{
                  ...styles.eventCard,
                  opacity:
                    evento.completado
                      ? 0.6
                      : 1,
                }}
              >

                <div style={styles.eventTop}>

                  <div>
                    <h4>
                      {evento.titulo}
                    </h4>

                    <small>
                      {evento.hora}
                      {" - "}
                      {evento.hora_fin}
                    </small>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                    }}
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
                        ? "✔ Hecho"
                        : "Pendiente"}
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
                  style={{
                    marginTop: 10,
                  }}
                >
                  {evento.descripcion}
                </p>

              </div>
            ))
          )}

        </div>

        {/* RIGHT */}

        <div style={styles.right}>

          <div style={styles.calendarHeader}>

            <select
              value={month}
              onChange={(e) =>
                setMonth(
                  Number(e.target.value)
                )
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

            <select
              value={year}
              onChange={(e) =>
                setYear(
                  Number(e.target.value)
                )
              }
              style={styles.select}
            >
              {[2024, 2025, 2026, 2027].map(
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

          </div>

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

          <div>
            {monthWeeks.map((week, i) => (
              <div
                key={i}
                style={styles.weekRow}
              >
                {week.map(
                  (dateStr, j) => (
                    <div
                      key={j}
                      onClick={() =>
                        dateStr &&
                        toggleDate(
                          dateStr
                        )
                      }
                      style={{
                        ...styles.dayCell,

                        backgroundColor:
                          selectedDates.includes(
                            dateStr
                          )
                            ? "#22c55e"
                            : dateStr ===
                              selectedDate
                            ? "#2563eb"
                            : "#111827",
                      }}
                    >
                      {dateStr
                        ? parseInt(
                            dateStr.slice(
                              8
                            )
                          )
                        : ""}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>

          <div style={styles.selectedInfo}>
            <h4>
              📌 Días seleccionados
            </h4>

            <p>
              {selectedDates.length}
            </p>
          </div>

          <div style={styles.selectedInfo}>
            <h4>
              🎯 Actividades seleccionadas
            </h4>

            <p>
              {
                selectedActivities.length
              }
            </p>
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
    border: "none",
    borderRadius: 10,
    background: "#1f2937",
    color: "white",
    cursor: "pointer",
  },

  grid: {
    flex: 1,
    display: "flex",
    gap: 15,
    padding: 15,
    overflow: "hidden",
  },

  left: {
    width: 320,
    background: "#0f172a",
    borderRadius: 14,
    padding: 18,
    overflowY: "auto",
  },

  center: {
    flex: 1,
    background: "#0f172a",
    borderRadius: 14,
    padding: 20,
    overflowY: "auto",
  },

  right: {
    width: 340,
    background: "#0f172a",
    borderRadius: 14,
    padding: 18,
    overflowY: "auto",
  },

  activitiesList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  activityCard: {
    padding: 14,
    borderRadius: 12,
    cursor: "pointer",
    transition: "0.2s",
  },

  timeBox: {
    display: "flex",
    gap: 10,
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#111827",
    color: "white",
    marginBottom: 10,
  },

  label: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 6,
  },

  saveBtn: {
    width: "100%",
    padding: 14,
    background: "#22c55e",
    border: "none",
    borderRadius: 12,
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: 10,
  },

  hr: {
    borderColor: "#1f2937",
    margin: "20px 0",
  },

  empty: {
    padding: 30,
    opacity: 0.6,
    textAlign: "center",
  },

  eventCard: {
    background: "#111827",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  eventTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  doneBtn: {
    padding: "8px 12px",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
  },

  deleteBtn: {
    padding: "8px 12px",
    border: "none",
    borderRadius: 8,
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
  },

  calendarHeader: {
    display: "flex",
    gap: 10,
    marginBottom: 15,
  },

  select: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#111827",
    color: "white",
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

  weekRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    gap: 4,
    marginBottom: 4,
  },

  dayCell: {
    height: 42,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    cursor: "pointer",
    userSelect: "none",
  },

  selectedInfo: {
    background: "#111827",
    padding: 14,
    borderRadius: 12,
    marginTop: 15,
  },
};
