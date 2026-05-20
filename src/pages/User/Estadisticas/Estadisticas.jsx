import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Estadisticas.css";

const API_URL = "https://empatia-backend.onrender.com";

export default function Estadisticas() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(
    sessionStorage.getItem("usuario") || "null"
  );

  const id_usuario =
    storedUser?.id_usuario ||
    storedUser?.user?.id_usuario ||
    storedUser?.id;

  const [loading, setLoading] = useState(true);

  // =========================
  // PANEL STATES
  // =========================
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const [data, setData] = useState({
    totalTareas: 0,
    completadas: 0,
    pendientes: 0,
    diasActivos: 0,
    emocionesPositivas: 0,
    emocionesNeutras: 0,
    emocionesBajas: 0,
    actividadFavorita: "Sin datos",
    bienestar: 0,
  });

  // =========================
  // LOAD DATA
  // =========================
  const loadStats = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/stats/${id_usuario}`
      );

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id_usuario) loadStats();
  }, [id_usuario]);

  // =========================
  // INSIGHTS IA
  // =========================
  const insights = useMemo(() => {
    const arr = [];

    if (data.bienestar >= 80) {
      arr.push("✨ Excelente progreso emocional.");
    }

    if (data.bienestar < 50) {
      arr.push("🧠 Intenta mejorar tus hábitos.");
    }

    if (data.emocionesPositivas > data.emocionesBajas) {
      arr.push("😊 Predominan emociones positivas.");
    }

    if (data.diasActivos >= 5) {
      arr.push("🔥 Muy buena constancia semanal.");
    }

    if (data.actividadFavorita !== "Sin datos") {
      arr.push(`⭐ Favorita: ${data.actividadFavorita}`);
    }

    return arr;
  }, [data]);

  // =========================
  // CLOSE PANELS
  // =========================
  const closePanels = () => {
    setLeftOpen(false);
    setRightOpen(false);
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="stats-page">
        <div className="loading-box">
          <div className="loader" />
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-page">

      {/* ================= OVERLAY ================= */}
      {(leftOpen || rightOpen) && (
        <div
          className="panel-overlay"
          onClick={closePanels}
        />
      )}

      {/* ================= TOGGLE BUTTONS ================= */}

      <button
        className="mobile-toggle left-toggle"
        onClick={() => {
          setLeftOpen(!leftOpen);
          setRightOpen(false);
        }}
      >
        ☰
      </button>

      <button
        className="mobile-toggle right-toggle"
        onClick={() => {
          setRightOpen(!rightOpen);
          setLeftOpen(false);
        }}
      >
        🤖
      </button>

      {/* ================= HEADER ================= */}

      <div className="stats-header">

        <div>
          <h1>📊 Estadísticas</h1>
          <p>Seguimiento emocional y progreso personal</p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/user")}
        >
          ⬅ Volver
        </button>

      </div>

      {/* ================= GRID ================= */}

      <div className="stats-grid">

        {/* LEFT PANEL */}
        <div className={`stats-column left-panel ${leftOpen ? "show-panel" : ""}`}>

          <div className="glass-card">
            <h3>😊 Emociones positivas</h3>
            <h2>{data.emocionesPositivas}</h2>
          </div>

          <div className="glass-card">
            <h3>😐 Neutras</h3>
            <h2>{data.emocionesNeutras}</h2>
          </div>

          <div className="glass-card">
            <h3>💙 Bajas</h3>
            <h2>{data.emocionesBajas}</h2>
          </div>

          <div className="glass-card">
            <h3>⭐ Favorita</h3>
            <h2>{data.actividadFavorita}</h2>
          </div>

        </div>

        {/* CENTER */}
        <div className="stats-center">

          <div className="glass-card">

            <h2>🧠 Bienestar: {data.bienestar}%</h2>

            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${data.bienestar}%` }}
              />
            </div>

          </div>

          <div className="glass-card">

            <h3>📈 Resumen</h3>

            <p>Total tareas: {data.totalTareas}</p>
            <p>Completadas: {data.completadas}</p>
            <p>Pendientes: {data.pendientes}</p>
            <p>Días activos: {data.diasActivos}</p>

          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className={`stats-column right-panel ${rightOpen ? "show-panel" : ""}`}>

          <div className="glass-card">
            <h3>🤖 Insights IA</h3>

            {insights.map((item, i) => (
              <div key={i} className="insight-item">
                {item}
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
