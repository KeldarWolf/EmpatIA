import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Estadisticas() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const resize = () => {
      setMobile(window.innerWidth < 900);
    };

    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  /* =========================================
     DATOS
  ========================================= */

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

  /* =========================================
     STYLES
  ========================================= */

  const styles = {
    page: {
      minHeight: "100dvh",
      background:
        "linear-gradient(180deg, #020617 0%, #081028 100%)",
      color: "white",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      overflowX: "hidden",
    },

    /* ================= HEADER ================= */

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: mobile ? "flex-start" : "center",
      flexDirection: mobile ? "column" : "row",
      gap: "16px",
      padding: mobile ? "18px" : "24px 32px",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(2,6,23,0.92)",
      backdropFilter: "blur(10px)",
    },

    title: {
      margin: 0,
      fontSize: mobile ? "1.6rem" : "2.1rem",
      fontWeight: 700,
    },

    subtitle: {
      marginTop: "8px",
      opacity: 0.7,
      fontSize: mobile ? "0.9rem" : "1rem",
    },

    backBtn: {
      border: "none",
      background: "#172036",
      color: "white",
      padding: mobile ? "12px 18px" : "14px 22px",
      borderRadius: "14px",
      cursor: "pointer",
      fontSize: mobile ? "0.9rem" : "1rem",
      transition: "0.2s",
      width: mobile ? "100%" : "auto",
    },

    /* ================= GRID ================= */

    grid: {
      flex: 1,
      display: "grid",
      gridTemplateColumns: mobile
        ? "1fr"
        : "280px 1fr 320px",
      gap: mobile ? "14px" : "18px",
      padding: mobile ? "14px" : "18px",
      overflow: "auto",
    },

    /* ================= PANELS ================= */

    panel: {
      background:
        "linear-gradient(145deg, #08112b, #091633)",
      borderRadius: "24px",
      border: "1px solid rgba(255,255,255,0.05)",
      padding: mobile ? "18px" : "24px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
    },

    sectionTitle: {
      margin: 0,
      marginBottom: "20px",
      fontSize: mobile ? "1.1rem" : "1.35rem",
      color: "#dbeafe",
    },

    /* ================= EMOTION CARD ================= */

    emotionCard: {
      background:
        "linear-gradient(145deg, #0c1738, #09122b)",
      padding: mobile ? "16px" : "18px",
      borderRadius: "18px",
      marginBottom: "14px",
      border: "1px solid rgba(255,255,255,0.04)",
    },

    emotionLabel: {
      margin: 0,
      opacity: 0.75,
      fontSize: mobile ? "0.85rem" : "0.95rem",
    },

    emotionValue: {
      margin: "10px 0 0",
      fontSize: mobile ? "1.7rem" : "2rem",
      fontWeight: "bold",
    },

    /* ================= CENTER ================= */

    progressWrapper: {
      marginTop: "10px",
    },

    progressTop: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "12px",
      fontSize: mobile ? "0.9rem" : "1rem",
    },

    progressBarBg: {
      width: "100%",
      height: mobile ? "12px" : "16px",
      background: "#111827",
      borderRadius: "999px",
      overflow: "hidden",
    },

    progressBar: {
      height: "100%",
      width: `${progress}%`,
      background:
        "linear-gradient(90deg, #2563eb, #3b82f6)",
      borderRadius: "999px",
      transition: "0.3s",
    },

    /* ================= SUMMARY ================= */

    summary: {
      display: "grid",
      gridTemplateColumns: mobile
        ? "repeat(2, 1fr)"
        : "repeat(4, 1fr)",
      gap: mobile ? "12px" : "16px",
      marginTop: mobile ? "24px" : "32px",
    },

    summaryBox: {
      background:
        "linear-gradient(145deg, #0c1738, #09122b)",
      padding: mobile ? "18px 14px" : "24px",
      borderRadius: "20px",
      textAlign: "center",
      border: "1px solid rgba(255,255,255,0.04)",
    },

    summaryNumber: {
      margin: 0,
      fontSize: mobile ? "1.7rem" : "2.1rem",
      fontWeight: "bold",
    },

    summaryText: {
      marginTop: "8px",
      opacity: 0.75,
      fontSize: mobile ? "0.82rem" : "0.95rem",
    },

    /* ================= NOTE ================= */

    note: {
      marginTop: mobile ? "24px" : "34px",
      background:
        "linear-gradient(145deg, #132347, #10203d)",
      padding: mobile ? "16px" : "20px",
      borderRadius: "18px",
      lineHeight: 1.6,
      opacity: 0.88,
      fontSize: mobile ? "0.9rem" : "1rem",
      textAlign: "center",
    },

    /* ================= INSIGHTS ================= */

    insightCard: {
      background:
        "linear-gradient(145deg, #0c1738, #09122b)",
      padding: mobile ? "16px" : "18px",
      borderRadius: "18px",
      marginBottom: "14px",
      lineHeight: 1.5,
      color: "#cbd5e1",
      fontSize: mobile ? "0.88rem" : "0.96rem",
      border: "1px solid rgba(255,255,255,0.04)",
    },
  };

  return (
    <div style={styles.page}>

      {/* =========================================
          HEADER
      ========================================= */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            📊 Estadísticas
          </h1>

          <p style={styles.subtitle}>
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

      {/* =========================================
          GRID
      ========================================= */}

      <div style={styles.grid}>

        {/* =====================================
            IZQUIERDA
        ===================================== */}

        <div style={styles.panel}>
          <h3 style={styles.sectionTitle}>
            💬 Estado emocional
          </h3>

          <div style={styles.emotionCard}>
            <p style={styles.emotionLabel}>
              Positivas
            </p>

            <h2 style={styles.emotionValue}>
              {data.emocionesPositivas}
            </h2>
          </div>

          <div style={styles.emotionCard}>
            <p style={styles.emotionLabel}>
              Neutras
            </p>

            <h2 style={styles.emotionValue}>
              {data.emocionesNeutras}
            </h2>
          </div>

          <div style={styles.emotionCard}>
            <p style={styles.emotionLabel}>
              Bajas
            </p>

            <h2 style={styles.emotionValue}>
              {data.emocionesBajas}
            </h2>
          </div>
        </div>

        {/* =====================================
            CENTRO
        ===================================== */}

        <div style={styles.panel}>

          <h3 style={styles.sectionTitle}>
            📈 Progreso general
          </h3>

          <div style={styles.progressWrapper}>

            <div style={styles.progressTop}>
              <span>Progreso semanal</span>
              <strong>{progress}%</strong>
            </div>

            <div style={styles.progressBarBg}>
              <div style={styles.progressBar} />
            </div>
          </div>

          {/* SUMMARY */}

          <div style={styles.summary}>

            <div style={styles.summaryBox}>
              <h2 style={styles.summaryNumber}>
                {data.totalTareas}
              </h2>

              <div style={styles.summaryText}>
                Total tareas
              </div>
            </div>

            <div style={styles.summaryBox}>
              <h2 style={styles.summaryNumber}>
                {data.completadas}
              </h2>

              <div style={styles.summaryText}>
                Completadas
              </div>
            </div>

            <div style={styles.summaryBox}>
              <h2 style={styles.summaryNumber}>
                {data.pendientes}
              </h2>

              <div style={styles.summaryText}>
                Pendientes
              </div>
            </div>

            <div style={styles.summaryBox}>
              <h2 style={styles.summaryNumber}>
                {data.diasActivos}
              </h2>

              <div style={styles.summaryText}>
                Días activos
              </div>
            </div>

          </div>

          <div style={styles.note}>
            💡 Aquí podrás visualizar tu avance
            emocional, progreso en rutinas y
            evolución diaria dentro de EmpatIA.
          </div>

        </div>

        {/* =====================================
            DERECHA
        ===================================== */}

        <div style={styles.panel}>

          <h3 style={styles.sectionTitle}>
            🧠 Insights
          </h3>

          <div style={styles.insightCard}>
            “Has tenido más días activos que
            inactivos 🤍”
          </div>

          <div style={styles.insightCard}>
            “Tu progreso emocional está creciendo
            de forma positiva”
          </div>

          <div style={styles.insightCard}>
            “Los pequeños avances diarios también
            cuentan”
          </div>

          <div style={styles.insightCard}>
            “Mantener una rutina constante ayuda a
            mejorar el bienestar”
          </div>

        </div>

      </div>
    </div>
  );
}
