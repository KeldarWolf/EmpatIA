// =========================
// ACTIVIDADES.JSX COMPLETO MOD
// =========================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://empatia-backend.onrender.com";

export default function Actividades() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [savedActivities, setSavedActivities] = useState([]);
  const [selected, setSelected] = useState(null);

  // ===============================
  // IA
  // ===============================
  const askAI = async (message) => {
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      return data.reply;
    } catch {
      return "Error de conexión 😢";
    }
  };

  // ===============================
  // CARGAR ACTIVIDADES USER
  // ===============================
  const loadActivities = async () => {
    try {
      if (!user?.id_usuario) {
        console.log("❌ SIN USER");
        return;
      }

      console.log("👤 USER:", user);

      const res = await fetch(
        `${API}/mis-actividades/${user.id_usuario}`
      );

      const data = await res.json();

      console.log("📦 DATA:", data);

      setSavedActivities(data || []);

      setMessages([
        {
          role: "ai",
          text: "Aquí puedes ver tus actividades 🤍",
        },
        {
          role: "ai",
          text: "Haz click en una para ver cómo hacerlo",
        },
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  // ===============================
  // CHAT
  // ===============================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
    ]);

    setInput("");

    const reply = await askAI(userText);

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: reply },
    ]);
  };

  // ===============================
  // CLICK ACTIVIDAD
  // ===============================
  const openActivity = async (activity) => {
    if (
      selected &&
      selected.nombre_actividad === activity.nombre_actividad
    ) {
      return;
    }

    setSelected(activity);

    setMessages([
      {
        role: "ai",
        text: `🧠 Actividad: ${activity.nombre_actividad}`,
      },
      {
        role: "ai",
        text: "Estoy preparando cómo ayudarte...",
      },
    ]);

    const reply = await askAI(
      `Explícame paso a paso cómo hacer esta actividad: ${activity.nombre_actividad}`
    );

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "👉 Cómo hacerlo:",
      },
      {
        role: "ai",
        text: reply,
      },
    ]);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1>🎯 Actividades</h1>

          <p style={{ opacity: 0.7 }}>
            Haz click en una actividad
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
        <div style={styles.left}>
          <h3>💬 Acompañamiento</h3>

          <div style={styles.chatBox}>
            {messages.map((m, i) => (
              <div key={i} style={styles.msg}>
                {m.role === "ai" ? "🤖 " : "👤 "}
                {m.text}
              </div>
            ))}
          </div>

          <div style={styles.inputRow}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={styles.input}
              placeholder="Escribe..."
            />

            <button
              onClick={sendMessage}
              style={styles.send}
            >
              Enviar
            </button>
          </div>
        </div>

        <div style={styles.center}>
          <h3>📌 Tus actividades</h3>

          {savedActivities.length === 0 && (
            <p>No tienes actividades aún</p>
          )}

          {savedActivities.map((a, i) => (
            <div
              key={i}
              style={styles.card}
              onClick={() => openActivity(a)}
            >
              <h4>{a.nombre_actividad}</h4>

              <p>
                ⭐ Gusto: {a.puntaje_agrado || 7}/10
              </p>

              <p>
                📅 {a.fecha}
              </p>
            </div>
          ))}
        </div>

        <div style={styles.right}>
          <h3>🧠 Ayuda</h3>

          <div style={styles.tip}>
            Haz click en una actividad y la IA te
            explicará cómo hacerla
          </div>
        </div>
      </div>
    </div>
  );
}

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
    padding: 20,
    borderBottom: "1px solid #1f2a37",
  },

  backBtn: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    background: "#1f2937",
    color: "white",
  },

  grid: {
    flex: 1,
    display: "flex",
    gap: 15,
    padding: 15,
  },

  left: {
    width: "30%",
    background: "#0f1620",
    padding: 15,
    borderRadius: 12,
  },

  center: {
    flex: 1,
    background: "#0f1620",
    padding: 15,
    borderRadius: 12,
    overflowY: "auto",
  },

  right: {
    width: "25%",
    background: "#0f1620",
    padding: 15,
    borderRadius: 12,
  },

  chatBox: {
    height: "60%",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  msg: {
    padding: 8,
    background: "#111827",
    borderRadius: 8,
    fontSize: 13,
  },

  inputRow: {
    display: "flex",
    gap: 8,
    marginTop: 10,
  },

  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    background: "#111827",
    color: "white",
    border: "none",
  },

  send: {
    padding: 10,
    background: "#1d9bf0",
    borderRadius: 8,
    border: "none",
    color: "white",
  },

  card: {
    background: "#111827",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    cursor: "pointer",
  },

  tip: {
    background: "#111827",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    fontSize: 13,
  },
};
