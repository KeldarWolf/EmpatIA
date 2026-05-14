import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URL = "https://empatia-backend.onrender.com/api/chat";

// 🤖 IA REAL (SIN FALLBACK ROTO)
const askAI = async (message, user) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        user, // 👈 IMPORTANTE: enviamos usuario a la IA
      }),
    });

    const data = await res.json();

    if (res.ok && data?.reply) {
      return data.reply;
    }

    return "No pude entender la respuesta de la IA 😢";

  } catch (error) {
    console.warn("Error IA:", error);
    return "No pude conectar con la IA 😢";
  }
};

export default function User() {
  const navigate = useNavigate();

  // 🔐 usuario real
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
      {
        role: "ai",
        text: `Hola ${user?.nombre || "🤍"} estoy contigo`,
      },
      {
        role: "ai",
        text: "Cuéntame cómo te sientes o qué necesitas",
      },
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
  // SEND MESSAGE
  // =========================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    const reply = await askAI(text, user);

    setMessages((prev) => [...prev, { role: "ai", text: reply }]);

    setLoading(false);
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="app-layout">

      {/* LEFT */}
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

      {/* CENTER */}
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

      {/* RIGHT */}
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
