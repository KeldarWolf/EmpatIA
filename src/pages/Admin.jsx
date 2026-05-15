import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();

  const [ai, setAi] = useState(null);

  const loadAI = async () => {
    try {
      const res = await fetch(
        "https://empatia-backend.onrender.com/api/ai/status"
      );
      const data = await res.json();
      setAi(data);
    } catch (err) {
      setAi({ online: false });
    }
  };

  useEffect(() => {
    loadAI();
    const interval = setInterval(loadAI, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🤖 Estado IA EmpatIA</h1>

      <div style={styles.card}>
        Estado:
        <b style={{ marginLeft: 8 }}>
          {ai?.online ? "🟢 Online" : "🔴 Offline"}
        </b>
      </div>

      <div style={styles.card}>
        💬 Requests:
        <b style={{ marginLeft: 8 }}>
          {ai?.requests || 0}
        </b>
      </div>

      <div style={styles.card}>
        ⚡ Tiempo promedio:
        <b style={{ marginLeft: 8 }}>
          {ai?.avgResponseTime || 0} ms
        </b>
      </div>

      <div style={styles.card}>
        🧠 Tokens estimados:
        <b style={{ marginLeft: 8 }}>
          {ai?.estimatedTokens || 0}
        </b>
      </div>

      <button
        style={styles.btn}
        onClick={() => navigate("/user")}
      >
        Volver
      </button>
    </div>
  );
}

/* =========================
   ESTILO EMPATIA
========================= */
const styles = {
  container: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #05070a, #000)",
    color: "#fff",
    padding: 30,
    fontFamily: "Arial",
  },

  title: {
    color: "#00e5ff",
    textShadow: "0 0 10px rgba(0,229,255,0.5)",
    marginBottom: 20,
  },

  card: {
    background: "#0b0f14",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    border: "1px solid rgba(0,229,255,0.15)",
    color: "#ccc",
  },

  btn: {
    marginTop: 20,
    background: "#00e5ff",
    border: "none",
    padding: "10px 15px",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer",
  },
};
