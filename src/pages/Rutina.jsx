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
  const daysShort = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const daysFull = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  /* =====================================================
     LOAD DATA
     LOAD
  ===================================================== */
  const loadData = async () => {
    try {
      setLoading(true);
      const [actRes, eventRes] = await Promise.all([
        fetch(
          `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
        ),
        fetch(
          `${API_URL}/api/rutina-eventos/${user.id_usuario}`
        ),
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
    if (user?.id_usuario) {
      loadData();
    }
  }, []);
  /* =====================================================
     TOGGLE ACTIVIDAD
  ===================================================== */
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
  /* =====================================================
     CURRENT WEEK
  ===================================================== */
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
  /* =====================================================
     TOGGLE DAY
  ===================================================== */
  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };
  /* =====================================================
     CREATE EVENTS
  ===================================================== */
  const crearEventos = async () => {
    if (selectedActivities.length === 0) {
      return alert("Selecciona actividades");
    }
    if (selectedDays.length === 0) {
      return alert("Selecciona días");
    }
    try {
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
                descripcion:
                  act.instrucciones_usuario || "",
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
      alert("✅ Rutina creada");
      setSelectedActivities([]);
      setSelectedDays([]);
      loadData();
    } catch (err) {
      console.log(err);
    }
  };
  /* =====================================================
     COMPLETE EVENT
  ===================================================== */
  const toggleComplete = async (evento) => {
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
  /* =====================================================
     DELETE EVENT
  ===================================================== */
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
  /* =====================================================
     EVENTOS DEL DÍA
  ===================================================== */
  const eventosDelDia = eventos
    .filter((e) => e.fecha === selectedDate)
    .sort((a, b) => a.hora.localeCompare(b.hora));
    .filter((e) => {
      if (!e.fecha) return false;
      const fechaEvento = e.fecha
        .split("T")[0]
        .trim();
      return fechaEvento === selectedDate;
    })
    .sort((a, b) =>
      a.hora.localeCompare(b.hora)
    );
  /* =====================================================
     CALENDARIO
  ===================================================== */
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
  if (loading) {
    return (
      <div style={styles.loading}>
        Cargando rutina...
      </div>
    );
  }
  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1>🧘 Rutina Inteligente</h1>
          <p style={{ opacity: 0.7 }}>
            Organiza actividades por día,
            semana o mes
          </p>
        </div>
        <button
          onClick={() => navigate("/user")}
          style={styles.backBtn}
        >
          ⬅ Volver
        </button>
      </div>
      <div style={styles.layout}>
        {/* =====================================================
            LEFT
        ===================================================== */}
        <div style={styles.left}>
          <h3>🎯 Actividades</h3>
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
                }}
              >
                <b>{act.nombre_actividad}</b>
                <p style={{ opacity: 0.7 }}>
                  ⭐ {act.puntaje_agrado}/10
                </p>
              </div>
            );
          })}
          <hr style={styles.hr} />
          <h3>📅 Días seleccionados</h3>
          <div style={styles.selectedContainer}>
            {selectedDays.map((d) => (
              <div
                key={d}
                style={styles.selectedDay}
              >
                {d}
              </div>
            ))}
          </div>
          <hr style={styles.hr} />
          <h3>⏰ Configuración</h3>
          <label>Hora inicio</label>
          <input
            type="time"
            value={hora}
            onChange={(e) =>
              setHora(e.target.value)
            }
            style={styles.input}
          />
          <label>Hora fin</label>
          <input
            type="time"
            value={horaFin}
            onChange={(e) =>
              setHoraFin(e.target.value)
            }
            style={styles.input}
          />
          <label>Duración (min)</label>
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
          <label>Repetición</label>
          <select
            value={repeticion}
            onChange={(e) =>
              setRepeticion(
                e.target.value
              )
            }
            style={styles.input}
          >
            <option value="dia">
              Diario
            </option>
            <option value="semana">
              Semanal
            </option>
            <option value="mes">
              Mensual
            </option>
          </select>
          <button
            onClick={crearEventos}
            style={styles.createBtn}
          >
            ✅ Crear rutina
          </button>
        </div>
        {/* =====================================================
            CENTER
        ===================================================== */}
        <div style={styles.center}>
          <h2>
            📅 Planificación del día
          </h2>
          <div style={styles.centerHeader}>
            <div>
              <h2>
                📅 Planificación del día
              </h2>
              <p style={{ opacity: 0.7 }}>
                {
                  daysFull[
                    new Date(
                      selectedDate
                    ).getDay() === 0
                      ? 6
                      : new Date(
                          selectedDate
                        ).getDay() - 1
                  ]
                }
              </p>
            </div>
          <div style={styles.selectedDate}>
            {selectedDate}
            <div style={styles.dateBadge}>
              {selectedDate}
            </div>
          </div>
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
                  opacity: evento.completado
                    ? 0.6
                    : 1,
                }}
              >
                <div style={styles.timeline}>
                  {eventosDelDia.length === 0 ? (
                    <div style={styles.emptyDay}>
                      <h3>😴 Día libre</h3>
                      <p>
                        No hay actividades
                        planificadas
                      </p>
                    </div>
                  ) : (
                    eventosDelDia.map((evento) => (
                      <div
                        key={evento.id_evento}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          ...styles.eventCard,
                          opacity:
                            evento.completado
                              ? 0.6
                              : 1,
                          borderLeft:
                            evento.completado
                              ? "6px solid #22c55e"
                              : "6px solid #2563eb",
                        }}
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
                          style={
                            styles.checkbox
                          }
                        />
                        <div>
                          <h3
                            style={{
                              margin: 0,
                              textDecoration:
                                evento.completado
                                  ? "line-through"
                                  : "none",
                            }}
                          >
                            {evento.titulo}
                          </h3>
                          <p
                            style={
                              styles.eventTime
                            }
                          >
                            ⏰ {evento.hora} →{" "}
                            {evento.hora_fin}
                          </p>
                          <p
                            style={
                              styles.eventDuration
                            }
                          >
                            🕒{" "}
                            {evento.duracion} min
                          </p>
                          {evento.descripcion && (
                            <p
                              style={
                                styles.eventDescription
                              }
                            >
                              {
                                evento.descripcion
                              }
                            </p>
                          )}
                          <div
                            style={
                              styles.repeatBadge
                            }
                          >
                            🔁{" "}
                            {evento.repeticion}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            deleteEvent(
                              evento.id_evento
                            )
                          }
                          style={styles.deleteBtn}
                        >
                          🗑
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {/* =====================================================
            RIGHT
        ===================================================== */}
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
          </div>
          <h2 style={{ textAlign: "center" }}>
            {months[month]} {year}
          </h2>
          {/* DIAS */}
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
          {/* CALENDARIO */}
          {monthWeeks.map((week, i) => (
            <div
              key={i}
              style={styles.weekRow}
            >
              {week.map((date, j) => {
                const active =
                  selectedDate === date;
                const selected =
                  selectedDays.includes(
                    date
                  );
                return (
                  <div
                    key={j}
                    onClick={() => {
                      if (!date) return;
                      setSelectedDate(
                        date
                      );
                      toggleDay(date);
                    }}
                    style={{
                      ...styles.dayCell,
                      background: active
                        ? "#2563eb"
                        : selected
                        ? "#22c55e"
                        : "#111827",
                    }}
                  >
                    {date
                      ? parseInt(
                          date.slice(8)
                        )
                      : ""}
                  </div>
                );
              })}
            </div>
          ))}
          <hr style={styles.hr} />
          <h3>📌 Días seleccionados</h3>
          <div style={styles.selectedContainer}>
            {selectedDays.map((d) => (
              <div
                key={d}
                style={styles.selectedDay}
              >
                {d}
              </div>
            ))}
          </div>
          <hr style={styles.hr} />
          <h3>📅 Semana actual</h3>
          <div style={styles.weekContainer}>
            {currentWeek.map((d) => {
              const count = eventos.filter(
                (e) =>
                  e.fecha?.split(
                    "T"
                  )[0] === d.date
              ).length;
              return (
                <div
                  key={d.date}
                  onClick={() =>
                    setSelectedDate(
                      d.date
                    )
                  }
                  style={{
                    ...styles.weekCard,
                    background:
                      selectedDate ===
                      d.date
                        ? "#2563eb"
                        : "#111827",
                  }}
                >
                  <div>
                    <b>{d.name}</b>
                    <p>{d.date}</p>
                  </div>
                  <span>
                    {count} act.
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   STYLES
===================================================== */
const styles = {
  page: {
    height: "100vh",
    background: "#0b0f14",
    color: "white",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Arial",
  },
  loading: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0b0f14",
    color: "white",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: 20,
    borderBottom: "1px solid #1f2937",
  },
  layout: {
    flex: 1,
    display: "flex",
    gap: 15,
    padding: 15,
    overflow: "hidden",
  },
  left: {
    width: 320,
    background: "#0f172a",
    padding: 15,
    borderRadius: 12,
    overflowY: "auto",
  },
  center: {
    flex: 1,
    background: "#0f172a",
    padding: 20,
    borderRadius: 12,
    overflowY: "auto",
  },
  right: {
    width: 360,
    background: "#0f172a",
    padding: 15,
    borderRadius: 12,
    overflowY: "auto",
  },
  activityCard: {
    background: "#111827",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    cursor: "pointer",
  },
  input: {
    width: "100%",
    padding: 10,
    marginTop: 5,
    marginBottom: 15,
    borderRadius: 8,
    border: "none",
    background: "#111827",
    color: "white",
  },
  createBtn: {
    width: "100%",
    padding: 14,
    background: "#22c55e",
    border: "none",
    borderRadius: 10,
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },

eventCard: {
    background: "#111827",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
      
  deleteBtn: {
    background: "#ef4444",
    border: "none",
    color: "white",
    padding: 10,
    borderRadius: 8,
    cursor: "pointer",
  },
  selectedDate: {
    background: "#111827",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    marginTop: 10,
  },
  empty: {
    padding: 40,
    textAlign: "center",
    opacity: 0.6,
  },
  calendarHeader: {
    display: "flex",
    gap: 10,
    marginBottom: 15,
  },
  select: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#111827",
    color: "white",
  },
  weekHeader: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    gap: 5,
    marginBottom: 10,
  },
  weekDay: {
    textAlign: "center",
    opacity: 0.7,
  },
  weekRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    gap: 5,
    marginBottom: 5,
  },
  dayCell: {
    height: 45,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    cursor: "pointer",
    userSelect: "none",
  },
  selectedContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  selectedDay: {
    background: "#22c55e",
    padding: "6px 10px",
    borderRadius: 8,
    fontSize: 12,
  },
  hr: {
    borderColor: "#1f2937",
    margin: "20px 0",
  },
  weekContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  weekCard: {
    padding: 12,
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    background: "#1f2937",
    color: "white",
    cursor: "pointer",
  },
  centerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dateBadge: {
    background: "#111827",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: "bold",
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  emptyDay: {
    height: 300,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.6,
  },
  eventLeft: {
    display: "flex",
    gap: 15,
    alignItems: "flex-start",
  },
  checkbox: {
    width: 22,
    height: 22,
    marginTop: 4,
  },
  eventTime: {
    marginTop: 6,
    opacity: 0.8,
  },
  eventDuration: {
    opacity: 0.7,
    fontSize: 14,
  },
  eventDescription: {
    marginTop: 10,
    lineHeight: 1.5,
    opacity: 0.8,
  },
  repeatBadge: {
    marginTop: 10,
    background: "#1e293b",
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 8,
    fontSize: 12,
  },
};
