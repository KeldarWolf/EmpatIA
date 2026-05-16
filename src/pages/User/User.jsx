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

  // =========================
  // INIT
  // =========================
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
        body: JSON.stringify({
          message,
          id_usuario: user?.id_usuario,
        }),
      });

      const data = await res.json();

      return data;
    } catch {
      return null;
    }
  };

  // =========================
  // ERROR HANDLER IA
  // =========================
  const handleAIError = (replyText) => {
    setMessages((prev) => [
      ...prev,
      { role: "ai", text: replyText },
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

    const text = input.trim().toLowerCase();

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
    setLoading(true);

    // =========================
    // ACTIVIDADES DIRECTAS
    // =========================
    if (text.includes("actividad")) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Elige una actividad:", options: mainOptions },
      ]);

      setLoading(false);
      return;
    }

    // =========================
    // ESCRIBIR ACTIVIDAD
    // =========================
    if (writingActivity) {
      const data = JSON.parse(localStorage.getItem("actividades") || "[]");

      const nueva = {
        texto: input,
        fecha: new Date().toISOString(),
        tipo: "personalizada",
      };

      localStorage.setItem("actividades", JSON.stringify([...data, nueva]));

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `✅ Actividad guardada: ${input}` },
      ]);

      setWritingActivity(false);

      setTimeout(() => navigate("/actividades"), 1000);

      setLoading(false);
      return;
    }

    // =========================
    // IA CALL
    // =========================
    const response = await askAI(text);

    if (!response) {
      handleAIError("🤍 Error de conexión con la IA.");
      setLoading(false);
      return;
    }

    if (response.errorType) {
      handleAIError(response.reply);
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
  const handleOptionClick = (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    // YES NO FLOW
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
        { role: "ai", text: "🤍 Estoy contigo." },
      ]);

      setWaitingYesNo(false);
      return;
    }

    // WRITE ACTIVITY MODE
    if (opt.includes("Escribir")) {
      setWritingActivity(true);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "✍️ Escribe la actividad:" },
      ]);

      return;
    }

    // SAVE ACTIVITY LOCAL
    const data = JSON.parse(localStorage.getItem("actividades") || "[]");

    const nueva = {
      texto: opt,
      fecha: new Date().toISOString(),
      tipo: "actividad",
    };

    localStorage.setItem("actividades", JSON.stringify([...data, nueva]));

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: `✅ Actividad guardada: ${opt}` },
    ]);

    setTimeout(() => navigate("/actividades"), 1000);
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
      </div>

      {/* CENTER */}
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

      {/* RIGHT */}
      <div className="right-panel">
        <button onClick={() => navigate("/rutina")}>🧘 Rutina</button>
        <button onClick={() => navigate("/actividades")}>🎯 Actividades</button>
        <button onClick={() => navigate("/estadisticas")}>📊 Estadísticas</button>
        <button onClick={() => navigate("/diario")}>📓 Diario</button>
      </div>

    </div>
  );
}
