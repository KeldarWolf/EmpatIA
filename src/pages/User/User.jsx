// ============================================
// src/pages/User/User.jsx
// ============================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URL = "https://empatia-backend.onrender.com";

// =========================
// MENÚ
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

  const user = JSON.parse(
    localStorage.getItem("usuario") || "null"
  );

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [writingActivity, setWritingActivity] = useState(false);
  const [waitingErrorFlow, setWaitingErrorFlow] = useState(false);
  const [frase, setFrase] = useState("");

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    setMessages([
      {
        role: "ai",
        text: `Hola ${user?.nombre || "🤍"}, estoy aquí contigo.`,
      },
      {
        role: "ai",
        text: "Cuéntame cómo te sientes...",
      },
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // IA
  // =========================
  const askAI = async (message) => {
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      return await res.json();
    } catch {
      return {
        error: true,
        messages: [
          "⚠️ No pude conectarme con la IA.",
          "🤍 Lo siento, no puedo conversar ahora.",
          "✨ Pero puedo ayudarte con una actividad.",
        ],
        options: ["Sí", "No"],
      };
    }
  };

  // =========================
  // GUARDAR EN BD
  // =========================
  const saveActivity = async (activity) => {
    try {
      if (!user?.id_usuario) return;

      await fetch(`${API_URL}/registro-actividad`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          id_actividad: activity?.id_actividad || null,
          nombre_actividad: activity?.nombre || activity,
          puntaje_agrado: 7,
          frecuencia_deseada: "media",
          reaccion: "positiva",
        }),
      });
    } catch (err) {
      console.log("Error guardando actividad", err);
    }
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

    // =========================
    // DETECTA ACTIVIDAD / ESTADO
    // =========================
    const lower = text.toLowerCase();

    const triggerWords = [
      "actividad",
      "actividades",
      "mal",
      "triste",
      "solo",
      "vacío",
      "no sé qué hacer",
      "ayuda",
    ];

    if (triggerWords.some((w) => lower.includes(w))) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🤍 ¿Quieres iniciar una actividad para sentirte mejor?",
          options: ["Sí", "No"],
        },
      ]);

      setLoading(false);
      return;
    }

    // =========================
    // ERROR FLOW ACTIVO
    // =========================
    if (waitingErrorFlow) {
      setWaitingErrorFlow(false);
    }

    // =========================
    // WRITE ACTIVITY
    // =========================
    if (writingActivity) {
      await saveActivity(text);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "✅ Actividad guardada correctamente" },
        { role: "ai", text: "⏳ Redirigiendo a actividades..." },
      ]);

      setWritingActivity(false);
      setLoading(false);

      setTimeout(() => {
        navigate("/actividades");
      }, 3000);

      return;
    }

    // =========================
    // IA NORMAL
    // =========================
    const response = await askAI(text);

    if (response?.error) {
      setWaitingErrorFlow(true);

      setMessages((prev) => [
        ...prev,
        ...response.messages.map((m) => ({
          role: "ai",
          text: m,
        })),
        {
          role: "ai",
          text: "👇",
          options: response.options,
        },
      ]);

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
  // OPTIONS CLICK
  // =========================
  const handleOptionClick = async (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    // SI
    if (opt === "Sí") {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "✍️ Escribe tu actividad:",
        },
      ]);

      setWritingActivity(true);
      return;
    }

    // NO
    if (opt === "No") {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🤍 Está bien, sigo aquí contigo.",
        },
      ]);

      return;
    }

    // GUARDAR ACTIVIDAD DIRECTA
    await saveActivity(opt);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "✅ Actividad guardada",
      },
      {
        role: "ai",
        text: "⏳ Redirigiendo a actividades...",
      },
    ]);

    setTimeout(() => {
      navigate("/actividades");
    }, 3000);
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="app-layout">

      <div className="left-panel">
        <h4>💡 Acompañamiento</h4>
        <div className="quote-box">{frase}</div>
        <div style={{ marginTop: 20 }}>
          👤 {user?.nombre || "Usuario"}
        </div>
      </div>

      <div className="center-panel">
        <ChatBox
          messages={messages}
          onOptionClick={handleOptionClick}
        />

        <InputBox
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          loading={loading}
        />
      </div>

      <div className="right-panel">
        <button onClick={() => navigate("/rutina")}>🧘 Rutina</button>
        <button onClick={() => navigate("/actividades")}>🎯 Actividades</button>
        <button onClick={() => navigate("/estadisticas")}>📊 Estadísticas</button>
        <button onClick={() => navigate("/diario")}>📓 Diario</button>
      </div>

    </div>
  );
}
