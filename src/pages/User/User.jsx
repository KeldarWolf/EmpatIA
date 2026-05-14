import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

export default function User() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(null);
  const [options, setOptions] = useState([]);
  const [pendingActivity, setPendingActivity] = useState(null);

  useEffect(() => {
    setMessages([
      { role: "ai", text: "Hola 🤍 estoy contigo" },
      { role: "ai", text: "Cuéntame cómo te sientes o qué quieres hacer" },
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 🧠 opciones base
  const getOptions = () => [
    "Caminar",
    "Meditar",
    "Música",
    "Cambiar opciones",
    "No sé cuál",
  ];

  const getOptionsAlt = () => [
    "Respirar profundo",
    "Estiramientos",
    "Ducha relajante",
    "Escribir lo que siento",
    "Cambiar opciones",
    "No sé cuál",
  ];

  // 🧠 pasos
  const getSteps = (act) => {
    const map = {
      Caminar: "Camina 10 min sin distracciones.",
      Meditar: "Respira profundo 5 min.",
      Música: "Escucha música relajante o motivante.",
      "Respirar profundo": "Inhala 4s, exhala 6s.",
      Estiramientos: "Estira lentamente todo el cuerpo.",
      "Ducha relajante": "Ducha consciente sin prisa.",
      "Escribir lo que siento": "Escribe todo sin filtro.",
    };
    return map[act] || "Hazlo a tu ritmo 🤍";
  };

  // 🤍 FLUJO GUIADO cuando no sabe qué elegir
  const startGuidedFlow = () => {
    setStep("guided");

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "Está bien 🤍 te ayudo a elegir",
      },
      {
        role: "ai",
        text: "Primero dime esto: ¿cómo te quieres sentir?",
        options: [
          "Más tranquilo/a",
          "Con más energía",
          "Despejar la mente",
        ],
      },
    ]);
  };

  // 🤍 segundo paso del flujo guiado
  const handleGuidedChoice = (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    let suggestions = [];

    if (opt === "Más tranquilo/a") {
      suggestions = ["Meditar", "Respirar profundo", "Ducha relajante"];
    }

    if (opt === "Con más energía") {
      suggestions = ["Caminar", "Estiramientos", "Música"];
    }

    if (opt === "Despejar la mente") {
      suggestions = ["Escribir lo que siento", "Caminar", "Música"];
    }

    setStep("select_activity");

    setOptions(suggestions);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "Perfecto 🤍 mira estas opciones que pueden ayudarte:",
        options: suggestions,
      },
    ]);
  };

  // 🔘 clicks opciones
  const handleOptionClick = (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    // cambiar opciones
    if (opt === "Cambiar opciones") {
      const newOpts = options.includes("Caminar")
        ? getOptionsAlt()
        : getOptions();

      setOptions(newOpts);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Aquí tienes otras opciones 👇", options: newOpts },
      ]);
      return;
    }

    // ❗ NO SÉ CUÁL → ahora pregunta, NO resuelve
    if (opt === "No sé cuál") {
      startGuidedFlow();
      return;
    }

    // flujo guiado emocional
    if (step === "guided") {
      handleGuidedChoice(opt);
      return;
    }

    // crear actividad
    if (step === "select_activity") {
      const nueva = {
        texto: opt,
        tipo: "Actividad",
        pasos: getSteps(opt),
        fecha: new Date().toISOString(),
      };

      const data = JSON.parse(localStorage.getItem("actividades") || "[]");
      localStorage.setItem("actividades", JSON.stringify([...data, nueva]));

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `✅ Actividad creada: ${opt}` },
        { role: "ai", text: "👉 Redirigiendo en 3 segundos..." },
      ]);

      setStep(null);

      setTimeout(() => navigate("/actividades"), 3000);
      return;
    }

    // inicio relajación
    if (opt === "Relajación") {
      setStep("select_activity");

      const base = getOptions();

      setOptions(base);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "¿Qué tipo de relajación te gustaría hacer?",
          options: base,
        },
      ]);
    }
  };

  // 💬 mensaje libre
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input.toLowerCase();

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
    setLoading(true);

    const wantsActivity =
      text.includes("actividad") ||
      text.includes("actividades") ||
      text.includes("hacer algo");

    if (wantsActivity) {
      setStep("select_activity");

      const base = getOptions();

      setOptions(base);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "¿Qué te gustaría hacer?",
          options: base,
        },
      ]);

      setLoading(false);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: "Entiendo 🤍 cuéntame un poco más" },
    ]);

    setLoading(false);
  };

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

  <button onClick={() => navigate("/estadisticas")}>
    📊 Estadísticas de progreso
  </button>
        <button onClick={() => navigate("/diario")}>📓 Diario</button>
      </div>

    </div>
  );
}
