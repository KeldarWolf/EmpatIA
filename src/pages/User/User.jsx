import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URL = "https://empatia-backend.onrender.com";

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
  const [waitingYesNo, setWaitingYesNo] = useState(false);
  const [writingActivity, setWritingActivity] = useState(false);
  const [frase, setFrase] = useState("");

  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre || "🤍"}, estoy aquí.` },
      { role: "ai", text: "Cuéntame cómo te sientes..." },
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // IA CALL
  // =========================
  const askAI = async (message) => {
    try {
      const res = await fetch(`${API_URL}/chat`, {
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
  // ERROR HANDLER
  // =========================
  const handleAIError = (response) => {
    setMessages((prev) => [
      ...prev,
      { role: "ai", text: response.reply },
      {
        role: "ai",
        text: "¿Quieres iniciar una actividad para sentirte mejor?",
        options: ["Sí", "No"],
      },
    ]);

    setWaitingYesNo(true);
  };

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();
    const lower = text.toLowerCase();

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    // 🔥 DETECCIÓN DIRECTA ACTIVIDAD
    if (lower.includes("actividad") || lower.includes("actividades")) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Elige una actividad:", options: mainOptions },
      ]);
      setLoading(false);
      return;
    }

    // ESCRIBIR ACTIVIDAD
    if (writingActivity) {
      const data = JSON.parse(localStorage.getItem("actividades") || "[]");

      const nueva = {
        texto: text,
        fecha: new Date().toISOString(),
        tipo: "personalizada",
      };

      localStorage.setItem("actividades", JSON.stringify([...data, nueva]));

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `✅ Guardado: ${text}` },
      ]);

      setWritingActivity(false);
      setTimeout(() => navigate("/actividades"), 1200);

      setLoading(false);
      return;
    }

    const response = await askAI(text);

    if (!response) {
      handleAIError({
        reply: "🤍 Problema de conexión con la IA.",
      });
      setLoading(false);
      return;
    }

    if (response.errorType) {
      handleAIError(response);
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
  // OPTIONS
  // =========================
  const handleOptionClick = (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    if (opt === "Sí") {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Elige una actividad:", options: mainOptions },
      ]);
      setWaitingYesNo(false);
      return;
    }

    if (opt === "No") {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "🤍 Está bien, sigo aquí contigo." },
      ]);
      setWaitingYesNo(false);
      return;
    }

    if (opt.includes("Escribir")) {
      setWritingActivity(true);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "✍️ Escribe la actividad:" },
      ]);
      return;
    }

    const data = JSON.parse(localStorage.getItem("actividades") || "[]");

    const nueva = {
      texto: opt,
      fecha: new Date().toISOString(),
      tipo: "actividad",
    };

    localStorage.setItem("actividades", JSON.stringify([...data, nueva]));

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: `✅ Actividad: ${opt}` },
    ]);

    setTimeout(() => navigate("/actividades"), 1200);
  };

  return (
    <div className="app-layout">

      <div className="left-panel">
        <h4>💡 Acompañamiento</h4>
        <div className="quote-box">{frase}</div>
        <div style={{ marginTop: 20, color: "#00e5ff" }}>
          👤 {user?.nombre || "Usuario"}
        </div>
      </div>

      <div className="center-panel">
        <ChatBox messages={messages} onOptionClick={handleOptionClick} />

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
