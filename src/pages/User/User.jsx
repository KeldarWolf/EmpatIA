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

  const [step, setStep] = useState("root");
  const [options, setOptions] = useState([]);

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre || "🤍"} estoy contigo` },
      { role: "ai", text: "Elige una opción o cuéntame cómo te sientes" },
    ]);

    setOptions(getRootOptions());

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // NIVEL 1 (ROOT)
  // =========================
  const getRootOptions = () => [
    "🎵 Música",
    "🧘 Relajación",
    "🏃 Actividad física",
    "❓ No sé qué hacer",
    "🔄 Cambiar respuestas",
  ];

  // =========================
  // NIVEL 2
  // =========================
  const getSubOptions = (opt) => {
    const map = {
      "🎵 Música": ["Triste", "Motivación", "Concentración"],
      "🧘 Relajación": ["Respirar", "Meditar", "Ducha relajante"],
      "🏃 Actividad física": ["Caminar", "Estiramientos", "Ejercicio ligero"],
      "❓ No sé qué hacer": ["Tranquilo", "Energía", "Despejar mente"],
    };

    return map[opt] || [];
  };

  // =========================
  // ACTIVIDADES FINALES
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
      { role: "ai", text: "👉 Redirigiendo..." },
    ]);

    setTimeout(() => navigate("/actividades"), 1500);
  };

  // =========================
  // CLICK BOTONES
  // =========================
  const handleOptionClick = (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    // 🔄 reset
    if (opt === "🔄 Cambiar respuestas") {
      setStep("root");
      setOptions(getRootOptions());

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Aquí tienes opciones nuevas 🤍", options: getRootOptions() },
      ]);
      return;
    }

    // 🌿 NIVEL 1 → muestra sub opciones
    if (step === "root") {
      const subs = getSubOptions(opt);

      if (subs.length > 0) {
        setStep("sub");
        setOptions(subs);

        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "Perfecto 🤍 elige una opción:",
            options: subs,
          },
        ]);
      }
      return;
    }

    // 🌿 NIVEL 2 → actividad final
    if (step === "sub") {
      createActivity(opt);
      return;
    }
  };

  // =========================
  // CHAT LIBRE (solo guía)
  // =========================
  const sendMessage = () => {
    if (!input.trim()) return;

    const text = input;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "Puedes elegir una opción o tocar lo que necesites 🤍",
        options: options,
      },
    ]);
  };

  return (
    <div className="app-layout">

      {/* LEFT */}
      <div className="left-panel">
        <h4>💡 Acompañamiento</h4>
        <div className="quote-box">{frase}</div>
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
