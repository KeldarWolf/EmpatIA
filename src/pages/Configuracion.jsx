import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Configuracion() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState("theme1");
  const [name, setName] = useState("Usuario");
  const [aiMode, setAiMode] = useState("normal");

  const resetAll = () => {
    localStorage.clear();
    alert("Datos eliminados 🤍");
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0 }}>⚙️ Configuración</h1>
          <p style={{ margin: 0, opacity: 0.7 }}>
            Personaliza tu experiencia
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
          <h3>🧠 IA</h3>

          <select
            value={aiMode}
            onChange={(e) => setAiMode(e.target.value)}
            style={styles.select}
          >
            <option value="suave">Suave</option>
            <option value="normal">Normal</option>
            <option value="profunda">Profunda</option>
          </select>

          <div style={styles.tip}>
            Ajusta cómo responde la IA contigo 🤍
          </div>
        </div>

        {/* CENTRO */}
        <div style={styles.center}>
          <h3>👤 Perfil</h3>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            placeholder="Tu nombre"
          />

          <h3 style={{ marginTop: "15px" }}>🎨 Tema</h3>

          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={styles.select}
          >
            <option value="theme1">Día</option>
            <option value="theme2">Noche</option>
            <option value="theme3">Oscuro</option>
            <option value="theme4">Personal</option>
          </select>

          <div style={styles.tip}>
            El tema se aplica visualmente en toda la app
          </div>
        </div>

        {/* DERECHA */}
        <div style={styles.right}>
          <h3>💾 Datos</h3>

          <button style={styles.dangerBtn} onClick={resetAll}>
            🗑 Borrar todo
          </button>

          <div style={styles.tip}>
            Esto elimina chat, rutina, estadísticas y más
          </div>

          <button style={styles.secondaryBtn}>
            📦 Exportar (próximamente)
          </button>
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

  center: {
    flex: 1,
    background: "#0f1620",
    borderRadius: "12px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
  },

  right: {
    width: "25%",
    background: "#0f1620",
    borderRadius: "12px",
    padding: "15px",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#111827",
    color: "white",
  },

  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#111827",
    color: "white",
    marginTop: "10px",
  },

  dangerBtn: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    width: "100%",
  },

  secondaryBtn: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#1d9bf0",
    color: "white",
    cursor: "pointer",
    width: "100%",
    marginTop: "10px",
  },

  tip: {
    marginTop: "10px",
    fontSize: "13px",
    opacity: 0.7,
  },
};