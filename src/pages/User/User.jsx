import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://empatia-backend.onrender.com";

// =========================
// MENÚ ORIGINAL (6 OPCIONES)
// =========================
const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
  "🤍 Hablar un poco",
  "❓ No sé qué hacer",
  "✍️ Escribir actividad",
];

export default function User() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre || "🤍"}, estoy contigo.` },
      { role: "ai", text: "Cuéntame cómo te sientes..." },
    ]);
  }, []);

  // =========================
  // IA CALL
  // =========================
  const askAI = async (message) => {
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      return await res.json();
    } catch {
      return null;
    }
  };

  // =========================
  // ERROR IA → MENÚ ACTIVIDADES
  // =========================
  const handleAIError = () => {
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "🤍 Lo siento, tuve un problema respondiendo.",
      },
      {
        role: "ai",
        text: "¿Quieres hacer una actividad conmigo?",
        options: mainOptions,
      },
    ]);

    setShowMenu(true);
  };

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    const response = await askAI(text);

    if (!response || response.errorType) {
      handleAIError();
      setLoading(false);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: response.reply },
    ]);

    setLoading(false);
  };

  // =========================
  // CLICK OPCIONES (LAS 6 RESPUESTAS)
  // =========================
  const handleOption = (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    // Sí / No (flujo emocional)
    if (opt === "Sí") {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Elige una actividad:", options: mainOptions },
      ]);
      return;
    }

    if (opt === "No") {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "🤍 Estoy contigo, no estás solo." },
      ]);
      return;
    }

    // guardar actividad local
    const data = JSON.parse(localStorage.getItem("actividades") || "[]");

    const nueva = {
      texto: opt,
      fecha: new Date().toISOString(),
      tipo: "actividad",
    };

    localStorage.setItem("actividades", JSON.stringify([...data, nueva]));

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: `✔ Actividad guardada: ${opt}` },
    ]);

    setTimeout(() => navigate("/actividades"), 900);
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={styles.container}>

      {/* CHAT */}
      <div style={styles.center}>
        <div style={styles.chat}>
          {messages.map((m, i) => (
            <div key={i} style={styles.msg}>
              {m.role === "ai" ? "🤖 " : "👤 "}
              {m.text}

              {m.options && (
                <div style={styles.options}>
                  {m.options.map((o) => (
                    <button
                      key={o}
                      onClick={() => handleOption(o)}
                      style={styles.btnOpt}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={styles.inputBox}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={styles.input}
            placeholder="Escribe..."
          />
          <button onClick={sendMessage} style={styles.btn}>
            Enviar
          </button>
        </div>
      </div>

      {/* MENU LATERAL */}
      <div style={styles.right}>
        <button onClick={() => navigate("/actividades")}>
          🎯 Actividades
        </button>
        <button onClick={() => navigate("/rutina")}>🧘 Rutina</button>
      </div>

    </div>
  );
}

// =========================
// STYLES
// =========================
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#0b0f14",
    color: "white",
  },
  center: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  chat: {
    flex: 1,
    padding: 20,
    overflowY: "auto",
  },
  msg: {
    marginBottom: 10,
    padding: 10,
    background: "#111827",
    borderRadius: 10,
  },
  inputBox: {
    display: "flex",
    padding: 10,
    borderTop: "1px solid #1f2a37",
  },
  input: {
    flex: 1,
    padding: 10,
    background: "#111827",
    color: "white",
    border: "none",
  },
  btn: {
    padding: 10,
    background: "#1d9bf0",
    border: "none",
    color: "white",
  },
  right: {
    width: "200px",
    padding: 15,
    borderLeft: "1px solid #1f2a37",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  options: {
    marginTop: 8,
    display: "flex",
    flexWrap: "wrap",
    gap: 5,
  },
  btnOpt: {
    padding: "6px 10px",
    background: "#22c55e",
    border: "none",
    borderRadius: 6,
    color: "white",
  },
};
