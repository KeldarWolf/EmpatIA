import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API = "https://empatia-backend.onrender.com";

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
  // IA
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
  // CREAR ACTIVIDAD EN BD SI NO EXISTE
  // =========================
  const createActivityIfNeeded = async (nombre) => {
    try {
      const res = await fetch(`${API}/actividades`);
      const data = await res.json();

      const exists = data.find((a) => a.nombre === nombre);
      if (exists) return exists;

      const create = await fetch(`${API}/actividades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          descripcion: "Actividad creada por usuario",
          categoria: "personal",
        }),
      });

      return await create.json();
    } catch {
      return null;
    }
  };

  // =========================
  // REGISTRAR ACTIVIDAD USUARIO
  // =========================
  const registerActivity = async (actividad) => {
    if (!user?.id_usuario || !actividad?.id_actividad) return;

    await fetch(`${API}/registro-actividad`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: user.id_usuario,
        id_actividad: actividad.id_actividad,
        puntaje_agrado: 5,
        frecuencia_deseada: "media",
        reaccion: "creada",
      }),
    });
  };

  // =========================
  // SEND
  // =========================
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    if (
      text.toLowerCase().includes("actividad") ||
      text.toLowerCase().includes("actividades")
    ) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Elige una actividad:", options: mainOptions },
      ]);
      setLoading(false);
      return;
    }

    if (writingActivity) {
      const actividad = await createActivityIfNeeded(text);
      await registerActivity(actividad);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `✔ Guardado en BD: ${text}` },
      ]);

      setWritingActivity(false);
      setTimeout(() => navigate("/actividades"), 1000);

      setLoading(false);
      return;
    }

    const response = await askAI(text);

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: response?.reply || "Error IA" },
    ]);

    setLoading(false);
  };

  // =========================
  // OPTIONS
  // =========================
  const handleOptionClick = async (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    if (opt.includes("Escribir")) {
      setWritingActivity(true);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "✍️ Escribe la actividad:" },
      ]);
      return;
    }

    const actividad = await createActivityIfNeeded(opt);
    await registerActivity(actividad);

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: `✔ Guardado en BD: ${opt}` },
    ]);

    setTimeout(() => navigate("/actividades"), 1000);
  };

  return (
    <div className="app-layout">
      <div className="left-panel">
        <h4>💡 Acompañamiento</h4>
        <div className="quote-box">{frase}</div>
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
        <button onClick={() => navigate("/actividades")}>🎯 Actividades</button>
      </div>
    </div>
  );
}
