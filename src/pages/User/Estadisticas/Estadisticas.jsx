import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Estadisticas() {
  const navigate = useNavigate();

  const [actividades, setActividades] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("actividades") || "[]");
    setActividades(data);
  }, []);

  // =========================
  // 📌 ESTADÍSTICAS BASE
  // =========================
  const total = actividades.length;

  const enRutina = actividades.filter((a) => a.enRutina).length;

  const promedioGusto =
    total > 0
      ? (
          actividades.reduce((acc, a) => acc + (a.gusto || 0), 0) / total
        ).toFixed(1)
      : 0;

  const completionRate =
    total > 0 ? Math.round((enRutina / total) * 100) : 0;

  // =========================
  // 📅 ÚLTIMOS 7 DÍAS
  // =========================
  const last7Days = () => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const key = d.toISOString().split("T")[0];

      const count = actividades.filter((a) =>
        a.fecha?.startsWith(key)
      ).length;

      days.push({
        date: key,
        count,
      });
    }

    return days;
  };

  const weekData = last7Days();

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1>📊 Tu progreso</h1>
          <p style={{ opacity: 0.6 }}>
            Visualiza cómo estás avanzando día a día
          </p>
        </div>

        <button onClick={() => navigate("/user")} style={styles.back}>
          ⬅ Volver
        </button>
      </div>

      {/* 🔵 CÍRCULO PROGRESO */}
      <div style={styles.circleContainer}>

        <div style={styles.circle}>
          <div style={styles.circleInner}>
            <h2>{completionRate}%</h2>
            <p>Progreso</p>
          </div>
        </div>

        <div style={styles.miniStats}>
          <div style={styles.miniCard}>
            <h3>{total}</h3>
            <p>Actividades</p>
          </div>

          <div style={styles.miniCard}>
            <h3>{enRutina}</h3>
            <p>En rutina</p>
          </div>

          <div style={styles.miniCard}>
            <h3>{promedioGusto}</h3>
            <p>Gusto promedio</p>
          </div>
        </div>

      </div>

      {/* 📈 SEMANA */}
      <div style={styles.section}>
        <h3>📅 Actividad semanal</h3>

        <div style={styles.week}>
          {weekData.map((d, i) => (
            <div key={i} style={styles.weekItem}>
              <div
                style={{
                  ...styles.weekBar,
                  height: `${d.count * 25}px`,
                }}
              />
              <span style={{ fontSize: 12 }}>
                {d.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 🏆 LOGROS */}
      <div style={styles.section}>
        <h3>🏆 Últimos logros</h3>

        {actividades.length === 0 && (
          <p style={{ opacity: 0.6 }}>
            Aún no tienes actividades registradas
          </p>
        )}

        {actividades.slice(-3).map((a, i) => (
          <div key={i} style={styles.achievement}>
            <span>✨ {a.texto}</span>
            <span>⭐ {a.gusto}/10</span>
          </div>
        ))}
      </div>

    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    background: "#0b0f14",
    minHeight: "100vh",
    color: "white",
    padding: 20,
    fontFamily: "Arial",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  back: {
    background: "#1f2937",
    border: "none",
    color: "white",
    padding: "8px 12px",
    borderRadius: 8,
  },

  // 🔵 PROGRESO CÍRCULO
  circleContainer: {
    display: "flex",
    gap: 30,
    alignItems: "center",
    marginBottom: 30,
  },

  circle: {
    width: 160,
    height: 160,
    borderRadius: "50%",
    background: "conic-gradient(#22c55e 0%, #22c55e 70%, #1f2937 70%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  circleInner: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: "#0b0f14",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  miniStats: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  miniCard: {
    background: "#111827",
    padding: 10,
    borderRadius: 10,
    width: 140,
  },

  // 📈 SEMANA
  section: {
    marginTop: 25,
    background: "#0f1620",
    padding: 15,
    borderRadius: 12,
  },

  week: {
    display: "flex",
    alignItems: "flex-end",
    gap: 10,
    height: 120,
    marginTop: 10,
  },

  weekItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },

  weekBar: {
    width: 20,
    background: "#22c55e",
    borderRadius: 6,
    transition: "0.3s",
  },

  // 🏆 LOGROS
  achievement: {
    background: "#111827",
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    display: "flex",
    justifyContent: "space-between",
  },
};