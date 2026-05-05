import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Estadisticas() {
  const navigate = useNavigate();

  // datos simulados (después los conectas con Rutina / IA)
  const [data] = useState({
    totalTareas: 12,
    completadas: 7,
    pendientes: 5,
    diasActivos: 4,
    emocionesPositivas: 6,
    emocionesNeutras: 3,
    emocionesBajas: 3,
  });

  const progress = Math.round(
    (data.completadas / data.totalTareas) * 100
  );

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0 }}>📊 Estadísticas</h1>
          <p style={{ margin: 0, opacity: 0.7 }}>
            Tu progreso emocional y actividades
          </p>
        </div>

        <button
          onClick={() => navigate("/user")}
          style={styles.backBtn}
        >
          ⬅ Volver
        </button>
      </div>

      {/* BODY */}
      <div style={styles.grid}>

        {/* IZQUIERDA */}
        <div style={styles.left}>
          <h3>💬 Estado emocional</h3>

          <div style={styles.card}>
            <p>Positivas</p>
            <h2>{data.emocionesPositivas}</h2>
          </div>

          <div style={styles.card}>
            <p>Neutras</p>
            <h2>{data.emocionesNeutras}</h2>
          </div>

          <div style={styles.card}>
            <p>Bajas</p>
            <h2>{data.emocionesBajas}</h2>
          </div>
        </div>

        {/* CENTRO */}
        <div style={styles.center}>
          <h3>📈 Progreso general</h3>

          {/* barra */}
          <div style={styles.barContainer}>
            <div
              style={{
                ...styles.bar,
                width: `${progress}%`,
              }}
            />
          </div>

          <p style={{ textAlign: "center", marginTop: "10px" }}>
            {progress}% completado
          </p>

          <div style={styles.summary}>
            <div style={styles.box}>
              <h2>{data.totalTareas}</h2>
              <p>Total tareas</p>
            </div>

            <div style={styles.box}>
              <h2>{data.completadas}</h2>
              <p>Completadas</p>
            </div>

            <div style={styles.box}>
              <h2>{data.pendientes}</h2>
              <p>Pendientes</p>
            </div>

            <div style={styles.box}>
              <h2>{data.diasActivos}</h2>
              <p>Días activos</p>
            </div>
          </div>

          <div style={styles.note}>
            💡 Aquí podrás ver cómo vas avanzando con tu rutina y emociones
          </div>
        </div>

        {/* DERECHA */}
        <div style={styles.right}>
          <h3>🧠 Insights</h3>

          <div style={styles.tip}>
            “Has tenido más días activos que inactivos 🤍”
          </div>

          <div style={styles.tip}>
            “Tu progreso emocional está en crecimiento”
          </div>

          <div style={styles.tip}>
            “Pequeños avances también son progreso”
          </div>

          <div style={styles.tip}>
            “Sigue así, vas en buen camino”
          </div>
        </div>

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    height: "100vh",
    background: "#0b0f14",
    color: "white",
    fontFamily: "Arial",
    display: "flex",
    flexDirection: "column",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #1f2a37",
  },

  backBtn: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#1f2937",
    color: "white",
    cursor: "pointer",
  },

  grid: {
    flex: 1,
    display: "flex",
    gap: "15px",
    padding: "15px",
  },

  left: {
    width: "25%",
    background: "#0f1620",
    borderRadius: "12px",
    padding: "15px",
  },

  card: {
    background: "#111827",
    padding: "10px",
    borderRadius: "10px",
    marginTop: "10px",
    textAlign: "center",
  },

  center: {
    flex: 1,
    background: "#0f1620",
    borderRadius: "12px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
  },

  barContainer: {
    width: "100%",
    height: "12px",
    background: "#111827",
    borderRadius: "10px",
    overflow: "hidden",
    marginTop: "10px",
  },

  bar: {
    height: "100%",
    background: "#1d9bf0",
    transition: "0.3s",
  },

  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
    marginTop: "20px",
  },

  box: {
    background: "#111827",
    padding: "12px",
    borderRadius: "10px",
    textAlign: "center",
  },

  note: {
    marginTop: "20px",
    fontSize: "13px",
    opacity: 0.6,
    textAlign: "center",
  },

  right: {
    width: "25%",
    background: "#0f1620",
    borderRadius: "12px",
    padding: "15px",
  },

  tip: {
    background: "#111827",
    padding: "10px",
    borderRadius: "10px",
    marginTop: "10px",
    fontSize: "13px",
    color: "#cbd5e1",
  },
};