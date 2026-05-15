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

// 🎯 menú principal
const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
  "🤍 Hablar un poco",
  "❓ No sé qué hacer",
  "🔄 Cambiar respuestas rápidas",
];

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
    "Descubrir música nueva",
    "Cantar",
  ],
  relajacion: [
    "Respirar profundo",
    "Ducha relajante",
    "Meditar",
    "Estiramientos suaves",
    "Tomar agua",
    "Escuchar lluvia",
    "Descansar",
    "Escribir lo que siento",
  ],
  fisica: [
    "Caminar",
    "Ejercicio ligero",
    "Bailar",
    "Estiramientos",
    "Salir a tomar aire",
    "Yoga",
    "Mover el cuerpo",
  ],
};

export default function User() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentCategory, setCurrentCategory] = useState(null);

  // =====================
  // INIT
  // =====================
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

  // =====================
  // MENU ACTIVIDADES (CLAVE)
  // =====================
  const showActivityMenu = () => {
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text:
          "🤍 Ahora mismo la IA no está disponible. Pero puedo ayudarte con una actividad.",
        options: mainOptions,
      },
    ]);
  };

  // =====================
  // IA
  // =====================
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

  // =====================
  // SEND MESSAGE
  // =====================
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    // detectar actividad
    if (activityTriggers.some((w) => text.toLowerCase().includes(w))) {
      showActivityMenu();
      setLoading(false);
      return;
    }

    // IA
    const reply = await askAI(text);

    if (!reply) {
      showActivityMenu(); // 🔥 AQUÍ ESTÁ EL CAMBIO CLAVE
      setLoading(false);
      return;
    }

    setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    setLoading(false);
  };

  // =====================
  // CLICK BOTONES
  // =====================
  const handleOptionClick = (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    // HABLAR
    if (opt.includes("Hablar")) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🤍 Estoy aquí contigo, cuéntame.",
        },
      ]);
      return;
    }

    // NO SÉ
    if (opt.includes("No sé")) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🤍 Elige lo primero que te llame la atención.",
        },
      ]);
      return;
    }

    // CATEGORÍAS
    if (opt.includes("Música")) {
      setCurrentCategory("musica");
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🎵 Opciones de música:",
          options: activityGroups.musica,
        },
      ]);
      return;
    }

    if (opt.includes("Relajación")) {
      setCurrentCategory("relajacion");
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🧘 Opciones de relajación:",
          options: activityGroups.relajacion,
        },
      ]);
      return;
    }

    if (opt.includes("Actividad física")) {
      setCurrentCategory("fisica");
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🏃 Opciones físicas:",
          options: activityGroups.fisica,
        },
      ]);
      return;
    }

    // guardar actividad
    const data = JSON.parse(localStorage.getItem("actividades") || "[]");

    const nueva = {
      texto: opt,
      tipo: "Actividad",
      fecha: new Date().toISOString(),
    };

    localStorage.setItem("actividades", JSON.stringify([...data, nueva]));

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: `✅ Guardado: ${opt}` },
    ]);

    setTimeout(() => navigate("/actividades"), 1200);
  };

  // =====================
  // UI
  // =====================
  return (
    <div className="app-layout">
      <div className="left-panel">
        <h4>💡 Acompañamiento</h4>
        <div className="quote-box">{frase}</div>
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
