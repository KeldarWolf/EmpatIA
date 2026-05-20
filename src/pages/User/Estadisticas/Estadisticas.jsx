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

  /* =========================
     LOAD STATS
  ========================= */
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
    if (id_usuario) {
      loadStats();
    }
  }, [id_usuario]);

  /* =========================
     INSIGHTS IA
  ========================= */
  const insights = useMemo(() => {
    const arr = [];

    if (data.bienestar >= 80) {
      arr.push(
        "✨ Excelente progreso emocional y constancia en tus rutinas."
      );
    }

    if (data.bienestar >= 50 && data.bienestar < 80) {
      arr.push(
        "📈 Tu progreso es positivo, sigue manteniendo tus hábitos."
      );
    }

    if (data.bienestar < 50) {
      arr.push(
        "🧠 Intenta completar más actividades para mejorar tu bienestar."
      );
    }

    if (
      data.emocionesPositivas >
      data.emocionesBajas
    ) {
      arr.push(
        "😊 Tus actividades generan más emociones positivas."
      );
    }

    if (
      data.emocionesBajas >
      data.emocionesPositivas
    ) {
      arr.push(
        "💙 Considera actividades más relajantes o motivadoras."
      );
    }

    if (data.diasActivos >= 5) {
      arr.push(
        "🔥 Has tenido una excelente constancia esta semana."
      );
    }

    if (data.actividadFavorita !== "Sin datos") {
      arr.push(
        `⭐ Tu actividad favorita es: ${data.actividadFavorita}`
      );
    }

    return arr;
  }, [data]);

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="stats-page">
        <div className="loading-box">
          <div className="loader"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-page">

      {/* HEADER */}
      <div className="stats-header">

        <div>
          <h1>📊 Estadísticas</h1>

          <p>
            Seguimiento emocional y progreso personal
          </p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/user")}
        >
          ⬅ Volver
        </button>
      </div>

      {/* MAIN GRID */}
      <div className="stats-grid">

        {/* LEFT */}
        <div className="stats-column">

          <div className="glass-card emotion-card positive">
            <span>😊 Positivas</span>
            <h2>{data.emocionesPositivas}</h2>
          </div>

          <div className="glass-card emotion-card neutral">
            <span>😐 Neutras</span>
            <h2>{data.emocionesNeutras}</h2>
          </div>

          <div className="glass-card emotion-card negative">
            <span>💙 Bajas</span>
            <h2>{data.emocionesBajas}</h2>
          </div>

          <div className="glass-card favorite-card">
            <span>⭐ Actividad favorita</span>

            <h3>
              {data.actividadFavorita}
            </h3>
          </div>

        </div>

        {/* CENTER */}
        <div className="stats-center">

          {/* WELLBEING */}
          <div className="glass-card wellbeing-card">

            <div className="wellbeing-top">

              <div>
                <h2>🧠 Bienestar general</h2>

                <p>
                  Basado en actividades completadas
                </p>
              </div>

              <div className="wellbeing-number">
                {data.bienestar}%
              </div>

            </div>

            <div className="progress-container">

              <div
                className="progress-bar"
                style={{
                  width: `${data.bienestar}%`,
                }}
              />

            </div>

          </div>

          {/* SUMMARY */}
          <div className="summary-grid">

            <div className="summary-card">
              <h2>{data.totalTareas}</h2>
              <p>Total tareas</p>
            </div>

            <div className="summary-card">
              <h2>{data.completadas}</h2>
              <p>Completadas</p>
            </div>

            <div className="summary-card">
              <h2>{data.pendientes}</h2>
              <p>Pendientes</p>
            </div>

            <div className="summary-card">
              <h2>{data.diasActivos}</h2>
              <p>Días activos</p>
            </div>

          </div>

          {/* EXTRA */}
          <div className="glass-card extra-card">

            <h3>📈 Resumen</h3>

            <div className="extra-grid">

              <div className="mini-box">
                <span>✔ Completadas</span>

                <strong>
                  {data.completadas}
                </strong>
              </div>

              <div className="mini-box">
                <span>⏳ Pendientes</span>

                <strong>
                  {data.pendientes}
                </strong>
              </div>

              <div className="mini-box">
                <span>🔥 Constancia</span>

                <strong>
                  {data.diasActivos} días
                </strong>
              </div>

              <div className="mini-box">
                <span>💯 Bienestar</span>

                <strong>
                  {data.bienestar}%
                </strong>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT */}
        <div className="stats-column">

          <div className="glass-card insights-card">

            <h3>🤖 Insights IA</h3>

            {insights.map((tip, i) => (
              <div
                key={i}
                className="insight-item"
              >
                {tip}
              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}
