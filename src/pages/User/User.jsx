import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

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
  // DETECCIÓN DE INTENCIÓN
  // =========================
  const detectIntent = (text) => {
    const t = text.toLowerCase();

    if (
      t.includes("no sé") ||
      t.includes("no se") ||
      t.includes("que hacer") ||
      t.includes("aburrido") ||
      t.includes("sin idea")
    ) {
      return "needs_help";
    }

    if (t.includes("estres") || t.includes("ansiedad")) {
      return "calm";
    }

    if (t.includes("energia") || t.includes("cansado")) {
      return "energy";
    }

    return "normal";
  };

  // =========================
  // OPCIONES SEGÚN INTENCIÓN
  // =========================
  const getOptions = (type) => {
    if (type === "needs_help") {
      return ["Caminar", "Respirar", "Música", "Escribir lo que siento"];
    }

    if (type === "calm") {
      return ["Respiración profunda", "Meditar", "Ducha relajante"];
    }

    if (type === "energy") {
      return ["Caminar", "Estiramientos", "Música motivante"];
    }

    return [];
  };

  // =========================
  // CREAR ACTIVIDAD
  // =========================
  const createActivity = (opt) => {
    const nueva = {
      texto: opt,
      tipo: "Actividad",
      fecha: new Date().toISOString(),
    };

    const data = JSON.parse(localStorage.getItem("actividades") || "[]");
    localStorage.setItem("actividades", JSON.stringify([...data, nueva]));

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: `✅ Actividad creada: ${opt}` },
      { role: "ai", text: "👉 Te llevo a actividades..." },
    ]);

    setTimeout(() => navigate("/actividades"), 2000);
  };

  // =========================
  // CLICK BOTÓN
  // =========================
  const handleOptionClick = (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);
    createActivity(opt);
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

    const intent = detectIntent(text);
    const options = getOptions(intent);

    // 🤖 RESPUESTA IA (SIEMPRE CORTA)
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text:
          intent === "needs_help"
            ? "Estoy contigo 🤍 elige algo que te ayude"
            : "Te entiendo 🤍",
        options: options.length > 0 ? options : undefined,
      },
    ]);

    setLoading(false);
  };

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

        {user?.role === "admin" && (
          <button onClick={() => navigate("/admin")}>🛠 Admin</button>
        )}
      </div>

    </div>
  );
}
