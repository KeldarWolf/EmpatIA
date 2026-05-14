import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URLS = [
  "http://localhost:3001",
  "https://empatia-backend.onrender.com"
];

// =========================
// PROMPT IA
// =========================
const SYSTEM_PROMPT = `
Eres una IA de acompañamiento emocional.

Reglas:
- Responde SIEMPRE corto (máximo 1–2 frases).
- Tono humano, cercano, calmado.
- Evita respuestas largas o técnicas.
- Si el usuario está triste o mal:
  valida emoción y pregunta suavemente si quiere hablar más.
- Si el usuario dice:
  "no sé qué hacer", "estoy aburrido", "actividades", "actividad"
  sugiere acompañarlo a una actividad sin imponer.
- Mantén conversación natural, no listes demasiado.
- Nunca seas robótico.
`;

// =========================
// IA REQUEST
// =========================
const askAI = async (message, userName) => {
  for (const url of API_URLS) {
    try {
      const res = await fetch(`${url}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `${SYSTEM_PROMPT}\n\nUsuario ${userName || "anónimo"}: ${message}`
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();
      if (data?.reply) return data.reply;

    } catch (e) {
      console.warn("Error conexión:", url);
    }
  }

  return "Te escucho 🤍";
};

export default function User() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre || "🤍"} estoy contigo` },
      { role: "ai", text: "Cuéntame cómo te sientes" },
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  // =========================
  // CHAT IA
  // =========================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const reply = await askAI(text, user?.nombre);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: reply }
      ]);

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Te escucho 🤍" }
      ]);
    }

    setLoading(false);
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="app-layout">

      {/* LEFT PANEL */}
      <div className="left-panel">
        <h4>💡 Acompañamiento</h4>

        <div className="quote-box">{frase}</div>

        <div style={{ marginTop: 20, color: "#00e5ff" }}>
          👤 {user?.nombre || "Usuario"}
        </div>

        <button
          onClick={logout}
          style={{
            marginTop: 10,
            padding: "8px 12px",
            background: "#ff3b3b",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {/* CENTER PANEL */}
      <div className="center-panel">
        <ChatBox
          messages={messages}
          onOptionClick={() => {}}
        />

        <InputBox
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          loading={loading}
        />
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <button onClick={() => navigate("/rutina")}>🧘 Rutina</button>
        <button onClick={() => navigate("/actividades")}>🎯 Actividades</button>
        <button onClick={() => navigate("/estadisticas")}>📊 Estadísticas</button>
        <button onClick={() => navigate("/diario")}>📓 Diario</button>

        {user?.role === "admin" && (
          <button onClick={() => navigate("/admin")}>
            🛠 Admin
          </button>
        )}
      </div>

    </div>
  );
}
