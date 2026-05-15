import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URL = "https://empatia-backend.onrender.com";

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

// 🎯 opciones principales
const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
  "🤍 Hablar un poco",
  "❓ No sé qué hacer",
  "🔄 Cambiar respuestas rápidas",
];

const yesNoOptions = ["Sí", "No"];

// 🧠 actividades
const activityGroups = {
  musica: [
    [
      "Playlist relajante",
      "Escuchar lo-fi",
      "Música instrumental",
      "Escuchar lluvia",
      "Canción favorita",
      "Música energética",
      "Sonidos naturaleza",
      "Cerrar ojos y escuchar",
      "Descubrir música nueva",
      "Escuchar piano",
      "Cantar una canción",
    ],
  ],

  relajacion: [
    [
      "Respirar profundo",
      "Ducha relajante",
      "Cerrar los ojos",
      "Tomar agua",
      "Estiramientos suaves",
      "Meditar 5 minutos",
      "Escuchar sonidos lluvia",
      "Apagar pantallas",
      "Descansar un momento",
      "Escribir lo que siento",
      "Relajar hombros",
    ],
  ],

  fisica: [
    [
      "Salir a caminar",
      "Ejercicio ligero",
      "Estiramientos",
      "Mover brazos",
      "Mover piernas",
      "Bailar una canción",
      "Salir a tomar aire",
      "Subir escaleras",
      "Caminar con música",
      "Rutina corta",
      "Mover cuello y hombros",
    ],
  ],
};

export default function User() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("usuario") || "null"
  );

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(false);

  const [waitingForYes, setWaitingForYes] =
    useState(false);

  const [writingActivity, setWritingActivity] =
    useState(false);

  const [currentCategory, setCurrentCategory] =
    useState(null);

  const [currentPage, setCurrentPage] =
    useState(0);

  // INIT
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
      setFrase(
        frases[Math.floor(Math.random() * frases.length)]
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [user?.nombre]);

  // DETECTAR
  const shouldTriggerActivity = (text) =>
    activityTriggers.some((w) =>
      text.toLowerCase().includes(w)
    );

  // IA
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
  // SEND MESSAGE
  // ======================
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", text },
    ]);

    setInput("");
    setLoading(true);

    // ✍️ escribir actividad
    if (writingActivity) {
      const nueva = {
        texto: text,
        tipo: "Personalizada",
        fecha: new Date().toISOString(),
      };

      const data = JSON.parse(
        localStorage.getItem("actividades") || "[]"
      );

      localStorage.setItem(
        "actividades",
        JSON.stringify([...data, nueva])
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `✅ Actividad guardada: ${text}`,
        },
      ]);

      setWritingActivity(false);

      setTimeout(() => {
        navigate("/actividades");
      }, 1200);

      setLoading(false);
      return;
    }

    // SI
    if (waitingForYes && ["si", "sí"].includes(text.toLowerCase())) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "¿Qué te gustaría probar?",
          options: mainOptions,
        },
      ]);

      setWaitingForYes(false);
      setLoading(false);
      return;
    }

    // NO
    if (waitingForYes && text.toLowerCase() === "no") {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🤍 Está bien, aquí estoy si me necesitas.",
        },
      ]);

      setWaitingForYes(false);
      setLoading(false);
      return;
    }

    // trigger actividad
    if (shouldTriggerActivity(text)) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "🤍 ¿Quieres que te acompañe con una actividad?",
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
            "🤍 Ahora mismo no puedo conversar, pero puedo acompañarte con una actividad.",
          options: yesNoOptions,
        },
      ]);

      setWaitingForYes(true);
      setLoading(false);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: reply },
    ]);

    setLoading(false);
  };

  // ======================
  // BOTONES
  // ======================
  const handleOptionClick = (opt) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", text: opt },
    ]);

    // YES
    if (opt === "Sí") {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "¿Qué te gustaría probar?",
          options: mainOptions,
        },
      ]);

      setWaitingForYes(false);
      return;
    }

    // NO
    if (opt === "No") {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🤍 Está bien, aquí estoy.",
        },
      ]);

      setWaitingForYes(false);
      return;
    }

    // categorías
    if (opt.includes("Música")) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🎵 Opciones de música:",
          options: activityGroups.musica[0],
        },
      ]);
      return;
    }

    if (opt.includes("Relajación")) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🧘 Opciones de relajación:",
          options: activityGroups.relajacion[0],
        },
      ]);
      return;
    }

    if (opt.includes("Actividad física")) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🏃 Opciones físicas:",
          options: activityGroups.fisica[0],
        },
      ]);
      return;
    }

    if (opt.includes("Escribir actividad")) {
      setWritingActivity(true);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "✍️ Escribe la actividad que quieres hacer.",
        },
      ]);

      return;
    }

    // guardar actividad
    const data = JSON.parse(
      localStorage.getItem("actividades") || "[]"
    );

    const nueva = {
      texto: opt,
      tipo: "Actividad",
      fecha: new Date().toISOString(),
    };

    localStorage.setItem(
      "actividades",
      JSON.stringify([...data, nueva])
    );

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: `✅ Guardado: ${opt}`,
      },
    ]);
  };

  return (
    <div className="app-layout">
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
    </div>
  );
}
