import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://empatia-backend.onrender.com";

export default function Actividades() {
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [savedActivities, setSavedActivities] = useState([]);
  const [selected, setSelected] = useState(null);

  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  // ===============================
  // CARGAR ACTIVIDADES DESDE BD
  // ===============================
  const loadActivities = async () => {
    try {
      const res = await fetch(`${API}/actividades`);
      const data = await res.json();

      setSavedActivities(data || []);
    } catch (err) {
      console.log("Error cargando actividades", err);
    }
  };

  // ===============================
  // IA
  // ===============================
  const askAI = async (message) => {
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      return data.reply || "No pude responder";
    } catch {
      return "Error de conexión 😢";
    }
  };

  // ===============================
  // INIT
  // ===============================
  useEffect(() => {
    loadActivities();

    setMessages([
      { role: "ai", text: "Aquí puedes ver tus actividades 🤍" },
      { role: "ai", text: "Haz click en una para ver cómo hacerlo" },
    ]);
  }, []);

  // ===============================
  // CHAT
  // ===============================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");

    const reply = await askAI(userText);

    setMessages((prev) => [...prev, { role: "ai", text: reply }]);
  };

  // ===============================
  // CLICK ACTIVIDAD
  // ===============================
  const openActivity = async (activity) => {
    if (!activity) return;

    setSelected(activity);

    setMessages([
      { role: "ai", text: `🧠 Actividad: ${activity.nombre}` },
      { role: "ai", text: "Estoy preparando cómo ayudarte..." },
    ]);

    const reply = await askAI(
      `Explícame paso a paso cómo hacer: ${activity.nombre}`
    );

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: "👉 Cómo hacerlo:" },
      { role: "ai", text: reply },
    ]);
  };

  // ===============================
  // GUARDAR EN BD (REAL)
  // ===============================
  const saveActivity = async (activity) => {
    if (!user?.id_usuario) {
      alert("Usuario no válido");
      return;
    }

    try {
      await fetch(`${API}/registro-actividad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          id_actividad: activity.id_actividad,
          puntaje_agrado: 5,
          frecuencia_deseada: "media",
          reaccion: "vista",
        }),
      });

      alert("✔ Actividad guardada en tu perfil");
    } catch (err) {
      console.log("Error guardando", err);
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1>🎯 Actividades</h1>
          <p style={{ opacity: 0.7 }}>
            Haz click para ver o guardar actividades
          </p>
        </div>

        <button onClick={() => navigate("/user")} style={styles.backBtn}>
          ⬅ Volver
        </button>
      </div>

      <div style={styles.grid}>
        {/* CHAT */}
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
            <button onClick={sendMessage} style={styles.send}>
              Enviar
            </button>
          </div>
        </div>

        {/* ACTIVIDADES */}
        <div style={styles.center}>
          <h3>📌 Actividades disponibles</h3>

          {savedActivities.length === 0 && (
            <p style={{ opacity: 0.6 }}>No hay actividades</p>
          )}

          {savedActivities.map((a) => (
            <div key={a.id_actividad} style={styles.card}>
              <h4>{a.nombre}</h4>
              <p style={{ fontSize: 12 }}>{a.descripcion}</p>

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  style={styles.routineBtn}
                  onClick={() => openActivity(a)}
                >
                  👁 Ver
                </button>

                <button
                  style={{ ...styles.routineBtn, background: "#1d9bf0" }}
                  onClick={() => saveActivity(a)}
                >
                  ➕ Guardar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* INFO */}
        <div style={styles.right}>
          <h3>🧠 Ayuda</h3>

          <div style={styles.tip}>
            Guarda actividades para que queden asociadas a tu usuario
          </div>

          <div style={styles.tip}>
            La IA te explica cómo realizarlas paso a paso
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
    display: "flex",
    flexDirection: "column",
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
  inputRow: { display: "flex", gap: 8, marginTop: 10 },
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
  },
  routineBtn: {
    background: "#22c55e",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    color: "white",
  },
  tip: {
    background: "#111827",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    fontSize: 13,
  },
};
