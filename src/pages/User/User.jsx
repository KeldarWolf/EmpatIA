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

// 🎯 opciones base
const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
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
    "Cantar",
  ],
  relajacion: [
    "Respirar profundo",
    "Ducha relajante",
    "Meditar",
    "Estiramientos",
    "Cerrar los ojos",
  ],
  fisica: [
    "Caminar",
    "Ejercicio ligero",
    "Bailar",
    "Yoga",
    "Trotar suave",
  ],
};

export default function User() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState("normal");

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

  // IA
  const askAI = async (message) => {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    return data?.reply;
  };

  // GUARDAR BD (FIX REAL)
  const saveActivityToDB = async (nombreActividad) => {
    if (!user?.id_usuario) {
      console.log("❌ no id_usuario");
      return;
    }

    await fetch(`${API_URL}/registro-actividad`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: user.id_usuario,
        nombre_actividad: nombreActividad,
        puntaje_agrado: 7,
        frecuencia_deseada: "media",
        reaccion: "positiva",
      }),
    });
  };

  // SEND
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;
    setInput("");

    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    if (step === "confirm") {
      if (text.toLowerCase().includes("si")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "¿Qué te gustaría hacer?",
            options: mainOptions,
          },
        ]);
        setStep("menu");
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "🤍 Está bien, aquí estoy contigo." },
        ]);
        setStep("normal");
      }

      setLoading(false);
      return;
    }

    if (activityTriggers.some((w) => text.toLowerCase().includes(w))) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🤍 ¿Quieres que te ayude con una actividad?",
          options: yesNoOptions,
        },
      ]);

      setStep("confirm");
      setLoading(false);
      return;
    }

    const reply = await askAI(text);

    setMessages((prev) => [...prev, { role: "ai", text: reply }]);

    setLoading(false);
  };

  // CLICK OPCIONES
  const handleOptionClick = async (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    if (opt === "Sí") {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Elige una categoría:", options: mainOptions },
      ]);
      setStep("menu");
      return;
    }

    if (opt === "No") {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "🤍 Está bien, aquí estoy." },
      ]);
      setStep("normal");
      return;
    }

    const group =
      opt.includes("Música")
        ? "musica"
        : opt.includes("Relajación")
        ? "relajacion"
        : opt.includes("Actividad física")
        ? "fisica"
        : null;

    if (group) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "👉 Elige una actividad:",
          options: activityGroups[group],
        },
      ]);
      return;
    }

    await saveActivityToDB(opt);

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: `✅ Actividad guardada: ${opt}` },
    ]);

    setTimeout(() => navigate("/actividades"), 1000);
  };

  return (
    <div className="app-layout">

      <div className="left-panel">
        <h4>💡 Acompañamiento</h4>
        <div className="quote-box">{frase}</div>
        <div style={{ marginTop: 20 }}>👤 {user?.nombre}</div>
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
