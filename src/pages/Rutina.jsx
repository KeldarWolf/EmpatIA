import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Rutina() {
  const navigate = useNavigate();
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split("T")[0]);

  const [note, setNote] = useState("");
  const [time, setTime] = useState("");
  const [tasks, setTasks] = useState([]);
  const [savedActivities, setSavedActivities] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  // Modo de agregar
  const [addMode, setAddMode] = useState("single"); // "single" o "multiple"
  const [selectedDaysForAdd, setSelectedDaysForAdd] = useState([]); // índices de días (0-6)

  const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const daysShort = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const daysFull = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  // Cargar datos
  useEffect(() => {
    const rutinaData = JSON.parse(localStorage.getItem("rutinaTasks") || "[]");
    const actividadesData = JSON.parse(localStorage.getItem("actividades") || "[]");

    const tasksWithCompleted = rutinaData.map(task => ({
      ...task,
      completed: task.completed ?? false
    }));

    setTasks(tasksWithCompleted);

    const normalized = actividadesData.map(a => ({
      ...a,
      gusto: a.gusto ?? 5,
      pasos: a.pasos ?? "Realiza la actividad con calma y atención.",
    }));

    setSavedActivities(normalized);
  }, []);

  const saveRutinaTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem("rutinaTasks", JSON.stringify(newTasks));
  };

  // Toggle completado
  const toggleCompleted = (taskId) => {
    const updated = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveRutinaTasks(updated);
  };

  // Agregar actividad manual (single o multiple)
  const addCustomTask = () => {
    if (!note.trim()) return;

    let newTasks = [];

    if (addMode === "single") {
      newTasks.push({
        id: Date.now(),
        text: note,
        date: selectedDate,
        dayName: daysFull[new Date(selectedDate).getDay() === 0 ? 6 : new Date(selectedDate).getDay() - 1],
        time: time || "09:00",
        completed: false,
      });
    } else {
      // Modo múltiple
      const weekDates = getCurrentWeekDates();
      weekDates.forEach((dateStr, index) => {
        if (selectedDaysForAdd.includes(index)) {
          newTasks.push({
            id: Date.now() + index,
            text: note,
            date: dateStr,
            dayName: daysFull[index],
            time: time || "09:00",
            completed: false,
          });
        }
      });
    }

    saveRutinaTasks([...tasks, ...newTasks]);
    setNote("");
    setTime("");
    alert(addMode === "single" ? "Actividad agregada" : "Actividad agregada a los días seleccionados");
  };

  // Agregar desde Actividades guardadas
  const addActivityToRutina = (activity) => {
    const newTask = {
      id: Date.now(),
      text: activity.texto,
      date: selectedDate,
      dayName: daysFull[new Date(selectedDate).getDay() === 0 ? 6 : new Date(selectedDate).getDay() - 1],
      time: time || "09:00",
      pasos: activity.pasos,
      gusto: activity.gusto,
      completed: false,
    };

    saveRutinaTasks([...tasks, newTask]);
    alert(`"${activity.texto}" agregada al día`);
  };

  const dayTasks = tasks
    .filter(t => t.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const showTaskDetail = (task) => {
    setSelectedTask(task);
  };

  // Obtener fechas de la semana actual
  const getCurrentWeekDates = () => {
    const date = new Date(selectedDate);
    const startOfWeek = new Date(date);
    const dayOfWeek = date.getDay();
    startOfWeek.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      week.push(d.toISOString().split("T")[0]);
    }
    return week;
  };

  const currentWeek = getCurrentWeekDates().map((date, i) => ({
    date,
    short: daysShort[i],
    full: daysFull[i],
    index: i
  }));

  const weekWithTasks = currentWeek.map(day => ({
    ...day,
    tasksCount: tasks.filter(t => t.date === day.date).length
  }));

  // Calendario mensual
  const getWeeksForMonth = (m, y) => {
    const weeks = [];
    const firstDay = new Date(y, m, 1);
    let current = new Date(firstDay);
    current.setDate(current.getDate() - (current.getDay() === 0 ? 6 : current.getDay() - 1));

    while (current.getMonth() === m || weeks.length === 0) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(current);
        if (d.getMonth() === m && d.getFullYear() === y) {
          week.push(d.toISOString().split("T")[0]);
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

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1>🧘 Rutina</h1>
          <p style={{ opacity: 0.7 }}>Planifica y marca lo que completas</p>
        </div>
        <button onClick={() => navigate("/user")} style={styles.backBtn}>⬅ Volver</button>
      </div>

      <div style={styles.grid}>
        {/* ====================== IZQUIERDA - Agregar Actividades ====================== */}
        <div style={styles.left}>
          <h3>➕ Agregar Actividad</h3>

          <div style={styles.modeSelector}>
            <button
              onClick={() => setAddMode("single")}
              style={{ ...styles.modeBtn, backgroundColor: addMode === "single" ? "#1d9bf0" : "#111827" }}
            >
              Solo este día
            </button>
            <button
              onClick={() => setAddMode("multiple")}
              style={{ ...styles.modeBtn, backgroundColor: addMode === "multiple" ? "#1d9bf0" : "#111827" }}
            >
              Varios días
            </button>
          </div>

          {/* Selector de días cuando es modo múltiple */}
          {addMode === "multiple" && (
            <div style={styles.daysSelector}>
              <p style={{ margin: "8px 0", fontSize: 14 }}>Días de la semana:</p>
              <div style={styles.daysGrid}>
                {daysShort.map((day, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedDaysForAdd(prev =>
                        prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]
                      );
                    }}
                    style={{
                      ...styles.dayToggle,
                      backgroundColor: selectedDaysForAdd.includes(i) ? "#22c55e" : "#111827",
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          )}

          <input
            placeholder="Nombre de la actividad"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={styles.input}
          />

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={styles.timeInput}
          />

          <button onClick={addCustomTask} style={styles.addButton}>
            Agregar Actividad
          </button>

          <hr style={{ borderColor: "#1f2a37", margin: "20px 0" }} />

          <h4>Actividades Guardadas</h4>
          {savedActivities.map((act, i) => (
            <div
              key={i}
              style={styles.activityCard}
              onClick={() => addActivityToRutina(act)}
            >
              <span>{act.texto}</span>
              <span style={{ fontSize: 12, opacity: 0.6 }}>⭐ {act.gusto}</span>
            </div>
          ))}
        </div>

        {/* ====================== CENTRO - Día con completado ====================== */}
        <div style={styles.center}>
          <h2>
            {daysFull[new Date(selectedDate).getDay() === 0 ? 6 : new Date(selectedDate).getDay() - 1]}
            <span style={{ fontSize: "1rem", opacity: 0.6, marginLeft: 12 }}>{selectedDate}</span>
          </h2>

          <div style={styles.taskList}>
            {dayTasks.length === 0 ? (
              <p style={{ opacity: 0.5, textAlign: "center", padding: "60px 0" }}>
                No hay actividades para este día
              </p>
            ) : (
              dayTasks.map((t) => (
                <div key={t.id} style={styles.task}>
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleCompleted(t.id)}
                    style={styles.checkbox}
                  />
                  <span style={{
                    ...styles.taskTime,
                    textDecoration: t.completed ? "line-through" : "none",
                    opacity: t.completed ? 0.6 : 1
                  }}>
                    {t.time}
                  </span>
                  <p
                    style={{
                      flex: 1,
                      textDecoration: t.completed ? "line-through" : "none",
                      opacity: t.completed ? 0.6 : 1,
                      cursor: "pointer"
                    }}
                    onClick={() => showTaskDetail(t)}
                  >
                    {t.text}
                  </p>
                  {t.gusto && <span>⭐{t.gusto}</span>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ====================== DERECHA - Calendario + Esta Semana ====================== */}
        <div style={styles.right}>
          <div style={styles.calendarHeader}>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={styles.selectSmall}>
              {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={styles.selectSmall}>
              {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>

          <h3 style={{ textAlign: "center", margin: "12px 0 10px" }}>{months[month]} {year}</h3>

          <div style={styles.weekHeader}>
            {daysShort.map(d => <div key={d} style={styles.weekDayHeader}>{d}</div>)}
          </div>

          <div style={styles.calendar}>
            {monthWeeks.map((week, i) => (
              <div key={i} style={styles.weekRow}>
                {week.map((dateStr, j) => (
                  <div
                    key={j}
                    onClick={() => dateStr && setSelectedDate(dateStr)}
                    style={{
                      ...styles.dayCell,
                      backgroundColor: dateStr === selectedDate ? "#1d9bf0" : "#111827",
                    }}
                  >
                    {dateStr ? parseInt(dateStr.slice(8)) : ""}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <h3 style={{ margin: "25px 0 10px 0" }}>📅 Esta Semana</h3>
          <div style={styles.weekContainer}>
            {weekWithTasks.map((day, i) => (
              <div
                key={i}
                onClick={() => setSelectedDate(day.date)}
                style={{
                  ...styles.weekDayCard,
                  backgroundColor: day.date === selectedDate ? "#1d9bf0" : "#111827",
                }}
              >
                <div style={styles.dayInfo}>
                  <strong>{day.short}</strong>
                  <span style={styles.dayNumber}>{day.date.slice(8)}</span>
                </div>
                <span style={styles.taskCount}>{day.tasksCount} act.</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Descripción */}
      {selectedTask && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>{selectedTask.text}</h3>
            <p><strong>Hora:</strong> {selectedTask.time}</p>
            {selectedTask.pasos && (
              <div style={{ marginTop: 15 }}>
                <strong>Cómo hacerlo:</strong>
                <p style={{ marginTop: 8, lineHeight: 1.6 }}>{selectedTask.pasos}</p>
              </div>
            )}
            <button onClick={() => setSelectedTask(null)} style={styles.closeBtn}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= ESTILOS ================= */
const styles = {
  page: { height: "100vh", background: "#0b0f14", color: "white", display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", padding: 20, borderBottom: "1px solid #1f2a37" },
  backBtn: { padding: "8px 16px", borderRadius: 8, background: "#1f2937", color: "white", border: "none" },
  grid: { flex: 1, display: "flex", gap: 15, padding: 15 },

  left: { width: "290px", background: "#0f1620", padding: 18, borderRadius: 12, overflowY: "auto" },
  center: { flex: 1, background: "#0f1620", padding: 20, borderRadius: 12, position: "relative" },
  right: { width: "340px", background: "#0f1620", padding: 12, borderRadius: 12, overflowY: "auto" },

  modeSelector: { display: "flex", gap: 8, marginBottom: 12 },
  modeBtn: { flex: 1, padding: 10, borderRadius: 8, border: "none", color: "white", cursor: "pointer" },

  daysSelector: { margin: "12px 0" },
  daysGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 },
  dayToggle: { padding: 9, textAlign: "center", borderRadius: 6, cursor: "pointer", fontSize: 13 },

  input: { width: "100%", padding: 12, borderRadius: 8, border: "none", background: "#111827", color: "white", marginBottom: 10 },
  timeInput: { width: "100%", padding: 12, borderRadius: 8, border: "none", background: "#111827", color: "white", marginBottom: 12 },
  addButton: { width: "100%", padding: 14, background: "#22c55e", color: "white", border: "none", borderRadius: 8, cursor: "pointer", marginTop: 8 },

  activityCard: {
    background: "#111827",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
  },

  taskList: { display: "flex", flexDirection: "column", gap: 10 },
  task: {
    background: "#111827",
    padding: 14,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  checkbox: { width: 20, height: 20, accentColor: "#22c55e", cursor: "pointer" },
  taskTime: { minWidth: 72, fontSize: 15 },

  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modalContent: { background: "#0f1620", padding: 25, borderRadius: 12, maxWidth: 520, width: "90%" },
  closeBtn: { marginTop: 20, padding: "10px 24px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer" },

  // Calendario
  calendarHeader: { display: "flex", gap: 8, marginBottom: 8 },
  selectSmall: { flex: 1, padding: 8, background: "#111827", color: "white", border: "none", borderRadius: 8 },
  weekHeader: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6, textAlign: "center", fontSize: 12, opacity: 0.7 },
  weekDayHeader: { padding: 2 },
  calendar: {},
  weekRow: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 3 },
  dayCell: { padding: 7, textAlign: "center", borderRadius: 5, fontSize: 13, height: 36, display: "flex", alignItems: "center", justifyContent: "center" },

  weekContainer: { display: "flex", flexDirection: "column", gap: 6 },
  weekDayCard: { padding: 10, borderRadius: 9, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" },
  dayInfo: { display: "flex", flexDirection: "column" },
  dayNumber: { fontSize: 16, fontWeight: "bold" },
  taskCount: { fontSize: 12, opacity: 0.75 },
};