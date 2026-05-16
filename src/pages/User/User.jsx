import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URL = "https://empatia-backend.onrender.com";

// =========================
// ACTIVIDADES BASE
// =========================
const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
  "🤍 Hablar un poco",
  "❓ No sé qué hacer",
  "✍️ Escribir actividad",
];

// =========================
// GRUPOS ACTIVIDADES
// =========================
const activityGroups = {
  musica: [
    "Playlist relajante",
    "Lo-fi",
    "Música instrumental",
    "Piano",
    "Jazz suave",
    "Sonidos naturaleza",
    "Rock suave",
    "Música feliz",
    "Música triste",
    "Focus music",
    "Descubrir música",
  ],
  relajacion: [
    "Respirar profundo",
    "Ducha relajante",
    "Meditar",
    "Estiramientos",
    "Cerrar ojos",
    "Tomar agua",
    "Pausar pensamientos",
    "Relajar cuerpo",
    "Caminar lento",
    "Escuchar lluvia",
    "Descansar",
  ],
  fisica: [
    "Caminar",
    "Estiramientos",
    "Bailar",
    "Mover brazos",
    "Mover piernas",
    "Rutina ligera",
    "Yoga",
    "Subir escaleras",
    "Trotar suave",
    "Ejercicio corto",
    "Mover cuerpo",
  ],
};

export default function User() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");

  const [loading, setLoading] = useState(false);

  const [waitingYesNo, setWaitingYesNo] = useState(false);
  const [writingActivity, setWritingActivity] = useState(false);

  const [category, setCategory] = useState(null);

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    setMessages([
      {
        role: "ai",
        text: `Hola ${user?.nombre || "🤍"}, estoy aquí.`,
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
  }, [user?.nombre]);

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

      const data = await res.json();
      return data;
    } catch {
      return null;
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
    // ESCRIBIR ACTIVIDAD
    // =========================
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

    // =========================
    // FALLBACK
    // =========================
    if (!response) {
      showFallback();
      setLoading(false);
      return;
    }

    // =========================
    // TOKEN LIMIT
    // =========================
    if (response.errorType === "TOKEN_LIMIT") {
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
  // FALLBACK
  // =========================
  const showFallback = () => {
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "🤍 Ahora mismo no puedo responder.",
      },
      {
        role: "ai",
        text: "¿Quieres iniciar una actividad para sentirte mejor?",
        options: ["Sí", "No"],
      },
    ]);

    setWaitingYesNo(true);
  };

  // =========================
  // CLICK OPCIONES
  // =========================
  const handleOptionClick = (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    // =========================
    // SI / NO
    // =========================
    if (opt === "Sí") {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Elige una actividad:",
          options: mainOptions,
        },
      ]);

      setWaitingYesNo(false);
      return;
    }

    if (opt === "No") {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🤍 Está bien, sigo aquí contigo.",
        },
      ]);

      setWaitingYesNo(false);
      return;
    }

    // =========================
    // ESCRIBIR ACTIVIDAD
    // =========================
    if (opt.includes("Escribir")) {
      setWritingActivity(true);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "✍️ Escribe la actividad que quieras hacer:",
        },
      ]);

      return;
    }

    // =========================
    // GUARDAR ACTIVIDAD
    // =========================
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

  // =========================
  // RENDER
  // =========================
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

