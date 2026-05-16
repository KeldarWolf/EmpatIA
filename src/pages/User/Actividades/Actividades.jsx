// ===============================
// User.jsx
// ===============================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URL = "http://localhost:3001";

// 🔎 triggers
const activityTriggers = [
  "aburrido",
  "aburrida",
  "no sé qué hacer",
  "no se que hacer",
  "qué hago",
  "que hago",
  "actividad",
  "actividades",
  "aburrimiento",
];

// 🎯 opciones base
const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
  "🤍 Hablar un poco",
  "❓ No sé qué hacer",
  "🔄 Cambiar respuestas rápidas",
];

// Sí / No
const yesNoOptions = ["Sí", "No"];

// 🧠 actividades
const activityGroups = {
  musica: [
    "Playlist relajante",
    "Lo-fi",
    "Música instrumental",
    "Sonidos lluvia",
    "Piano",
    "Jazz",
    "Música feliz",
    "Música triste",
    "Descubrir música nueva",
    "Cantar",
    "Música energética",
  ],
  relajacion: [
    "Respirar profundo",
    "Ducha relajante",
    "Cerrar los ojos",
    "Meditar",
    "Estiramientos",
    "Tomar agua",
    "Escuchar lluvia",
    "Descansar",
    "Relajar hombros",
    "Escribir lo que siento",
    "Pausar mente",
  ],
  fisica: [
    "Caminar",
    "Ejercicio ligero",
    "Estiramientos",
    "Bailar",
    "Mover brazos",
    "Mover piernas",
    "Salir a tomar aire",
    "Subir escaleras",
    "Yoga",
    "Trotar suave",
    "Mover cuello",
  ],
};

export default function User() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(false);

  const [waitingForYes, setWaitingForYes] = useState(false);
  const [writingActivity, setWritingActivity] = useState(false);

  const [currentCategory, setCurrentCategory] = useState(null);

  // INIT
  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre || "🤍"}, estoy aquí.` },
      { role: "ai", text: "Cuéntame cómo te sientes..." },
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 8000);

    return () => clearInterval(interval);
  }, [user?.nombre]);

  const shouldTriggerActivity = (text) =>
    activityTriggers.some((w) => text.toLowerCase().includes(w));

  // ======================
  // IA
  // ======================
  const askAI = async (message) => {
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      return data?.reply || null;
    } catch {
      return null;
    }
  };

  // ======================
  // GUARDAR BD
  // ======================
  const saveActivityToDB = async (texto) => {
    try {
      await fetch(`${API_URL}/guardar-actividad-usuario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: user?.id_usuario,
          texto,
        }),
      });
    } catch (err) {
      console.log(err);
    }
  };

  // ======================
  // SEND MESSAGE
  // ======================
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    // ✍️ escribir actividad
    if (writingActivity) {
      await saveActivityToDB(text);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `✅ Actividad guardada: ${text}` },
      ]);

      setWritingActivity(false);
      setLoading(false);

      setTimeout(() => navigate("/actividades"), 1200);
      return;
    }

    // SI / NO por texto
    if (waitingForYes) {
      const lower = text.toLowerCase();

      if (lower.includes("si") || lower.includes("sí")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "¿Qué te gustaría hacer?",
            options: mainOptions,
          },
        ]);

        setWaitingForYes(false);
        setLoading(false);
        return;
      }

      if (lower.includes("no")) {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "🤍 Está bien, aquí estoy." },
        ]);

        setWaitingForYes(false);
        setLoading(false);
        return;
      }
    }

    // trigger actividad
    if (shouldTriggerActivity(text)) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🤍 ¿Quieres que te ayude con una actividad?",
          options: yesNoOptions,
        },
      ]);

      setWaitingForYes(true);
      setLoading(false);
      return;
    }

    // IA
    const reply = await askAI(text);

    if (!reply) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "🤍 Ahora mismo no puedo responder, pero puedo ayudarte con una actividad.",
          options: yesNoOptions,
        },
      ]);

      setWaitingForYes(true);
      setLoading(false);
      return;
    }

    setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    setLoading(false);
  };

  // ======================
  // BOTONES
  // ======================
  const handleOptionClick = async (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    // Sí
    if (opt === "Sí") {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "¿Qué te gustaría hacer?", options: mainOptions },
      ]);

      setWaitingForYes(false);
      return;
    }

    // No
    if (opt === "No") {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "🤍 Está bien, aquí estoy contigo." },
      ]);

      setWaitingForYes(false);
      return;
    }

    // cambiar respuestas
    if (opt.includes("Cambiar")) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "✨ Puedes elegir otra categoría:",
          options: [
            "🎵 Música",
            "🧘 Relajación",
            "🏃 Actividad física",
            "❓ No sé qué hacer",
          ],
        },
      ]);

      return;
    }

    // no sé qué hacer
    if (opt.includes("No sé")) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🤍 Probemos algo suave:",
          options: [
            "Respirar profundo",
            "Escuchar música",
            "Caminar",
            "Tomar agua",
            "Cerrar los ojos",
            "Estiramientos",
          ],
        },
      ]);

      return;
    }

    // categorías
    const groupKey =
      opt.includes("Música")
        ? "musica"
        : opt.includes("Relajación")
        ? "relajacion"
        : opt.includes("Actividad física")
        ? "fisica"
        : null;

    if (groupKey) {
      setCurrentCategory(groupKey);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🤍 Opciones:",
          options: activityGroups[groupKey],
        },
      ]);

      return;
    }

    // guardar actividad
    await saveActivityToDB(opt);

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: `✅ Guardado: ${opt}` },
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

        <button onClick={() => navigate("/actividades")}>
          🎯 Actividades
        </button>

        <button onClick={() => navigate("/estadisticas")}>
          📊 Estadísticas
        </button>

        <button onClick={() => navigate("/diario")}>
          📓 Diario
        </button>
      </div>
    </div>
  );
}
