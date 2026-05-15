import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Actividades() {
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [savedActivities, setSavedActivities] = useState([]);
  const [selected, setSelected] = useState(null);

  const API_URLS = [
    "http://localhost:3001",
    "https://empatia-backend.onrender.com"
  ];

  // ===============================
  // IA
  // ===============================
  const askAI = async (message) => {
    for (const url of API_URLS) {
      try {
        const res = await fetch(`${url}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });

        if (!res.ok) continue;

        const data = await res.json();
        if (data?.reply) return data.reply;

      } catch {
        console.warn("Error conexión:", url);
      }
    }

    return "Error de conexión 😢";
  };

  // ===============================
  // CARGA LOCALSTORAGE
  // ===============================
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("actividades") || "[]");

    const normalized = data.map((a) => ({
      ...a,
      gusto: a.gusto ?? 5,
      pasos: a.pasos ?? "Respira profundo y realiza la actividad a tu ritmo.",
      enRutina: a.enRutina ?? false,
    }));

    setSavedActivities(normalized);

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
    if (selected && selected.texto === activity.texto) return;

    setSelected(activity);

    setMessages([
      { role: "ai", text: `🧠 Actividad: ${activity.texto}` },
      { role: "ai", text: "Estoy preparando cómo ayudarte..." },
    ]);

    const reply = await askAI(
      `Explícame paso a paso cómo hacer esta actividad: ${activity.texto}`
    );

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: "👉 Cómo hacerlo:" },
      { role: "ai", text: reply },
    ]);
  };

  // ===============================
  // GUSTO
  // ===============================
  const changeGusto = (index, value) => {
    const updated = [...savedActivities];
    updated[index].gusto = value;

    setSavedActivities(updated);
    localStorage.setItem("actividades", JSON.stringify(updated));
  };

  // ===============================
  // ELIMINAR
  // ===============================
  const deleteActivity = (index) => {
    const confirmDelete = window.confirm(
      "⚠️ ¿Seguro que quieres eliminarla?"
    );

    if (!confirmDelete) return;

    const updated = savedActivities.filter((_, i) => i !== index);

    setSavedActivities(updated);
    localStorage.setItem("actividades", JSON.stringify(updated));
  };

  // ===============================
  // RUTINA
  // ===============================
  const addToRoutine = (index) => {
    const updated = [...savedActivities];
    updated[index].enRutina = true;

    setSavedActivities(updated);
    localStorage.setItem("actividades", JSON.stringify(updated));
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <h1>🎯 Actividades</h1>

        <button onClick={() => navigate("/user")} style={styles.backBtn}>
          ⬅ Volver
        </button>
      </div>

      <div style={styles.grid}>

        {/* CHAT */}
        <div style={styles.left}>
          <h3>💬 IA</h3>

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
          <h3>📌 Actividades</h3>

          {savedActivities.map((a, i) => (
            <div key={i} style={styles.card} onClick={() => openActivity(a)}>
              <h4>{a.texto}</h4>

              <div style={styles.barContainer}>
                {Array.from({ length: 10 }, (_, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      changeGusto(i, idx + 1);
                    }}
                    style={{
                      ...styles.bar,
                      background:
                        idx + 1 <= a.gusto ? "#22c55e" : "#374151",
                    }}
                  />
                ))}
              </div>

              {a.enRutina && (
                <p style={{ color: "#22c55e", fontSize: 12 }}>
                  ✔ En rutina
                </p>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToRoutine(i);
                  }}
                  style={styles.routineBtn}
                >
                  ➕ Rutina
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteActivity(i);
                  }}
                  style={styles.deleteBtn}
                >
                  🗑 Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* INFO */}
        <div style={styles.right}>
          <h3>🧠 Ayuda</h3>

          <div style={styles.tip}>
            Haz click en una actividad para ver cómo realizarla
          </div>

          <div style={styles.tip}>
            La IA te acompaña mientras exploras
          </div>
        </div>

      </div>
    </div>
  );
}

/* estilos igual que tu versión original */
const styles = {
  page: { height: "100vh", background: "#0b0f14", color: "white" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: 20,
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    border: "none",
    background: "#1f2937",
    color: "white",
  },
  grid: { display: "flex", gap: 15, padding: 15 },
  left: { width: "30%", background: "#0f1620", padding: 15 },
  center: { flex: 1, background: "#0f1620", padding: 15 },
  right: { width: "25%", background: "#0f1620", padding: 15 },

  chatBox: { height: "60%", overflowY: "auto" },
  msg: { padding: 8, background: "#111827", marginBottom: 6 },

  inputRow: { display: "flex", gap: 8 },
  input: { flex: 1, padding: 10, background: "#111827", color: "white" },
  send: { background: "#1d9bf0", padding: 10 },

  card: { background: "#111827", padding: 12, marginBottom: 10 },
  barContainer: { display: "flex", gap: 3 },
  bar: { width: 18, height: 8 },

  routineBtn: { background: "#22c55e", padding: 6 },
  deleteBtn: { background: "#ef4444", padding: 6 },

  tip: { background: "#111827", padding: 10, marginTop: 10 },
};
