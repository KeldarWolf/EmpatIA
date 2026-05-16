import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

// 🌐 ENDPOINTS (LOCAL + ONLINE)
const API_URLS = [
  "http://localhost:3001",
  import.meta.env.VITE_API_URL,
].filter(url => typeof url === "string" && url.startsWith("http"));

// ⏱️ Fetch con timeout
const fetchWithTimeout = (url, options, ms = 8000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
};

// 🤖 IA fallback
const askAI = async (message) => {
  for (const url of API_URLS) {
    try {
      const res = await fetchWithTimeout(`${url}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) continue;

      const data = await res.json();

      if (data?.reply) return data.reply;
    } catch (error) {
      console.warn("Error endpoint:", url, error.message);
    }
  }

  return "No pude conectar con la IA 😢";
};

export default function User() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(null);
  const [options, setOptions] = useState([]);

  // 💬 Init chat
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

  // 🔁 reset flujo
  const resetFlow = () => {
    setStep(null);
    setOptions([]);
  };

  // 🤍 flujo guiado
  const startGuidedFlow = () => {
    setStep("guided");

    setMessages(prev => [
      ...prev,
      { role: "ai", text: "Está bien 🤍 te ayudo a elegir" },
      {
        role: "ai",
        text: "¿Cómo te quieres sentir?",
        options: ["Más tranquilo/a", "Con más energía", "Despejar la mente"],
      },
    ]);
  };

  const handleGuidedChoice = (opt) => {
    setMessages(prev => [...prev, { role: "user", text: opt }]);

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

    setMessages(prev => [
      ...prev,
      {
        role: "ai",
        text: "Estas opciones pueden ayudarte:",
        options: suggestions,
      },
    ]);
  };

  // 🔘 clicks opciones
  const handleOptionClick = (opt) => {
    setMessages(prev => [...prev, { role: "user", text: opt }]);

    if (opt === "Cambiar opciones") {
      const isMain = options[0] === "Caminar";
      const newOpts = isMain ? getOptionsAlt() : getOptions();

      setOptions(newOpts);

      setMessages(prev => [
        ...prev,
        { role: "ai", text: "Otras opciones 👇", options: newOpts },
      ]);
      return;
    }

    if (opt === "No sé cuál") {
      startGuidedFlow();
      return;
    }

    if (step === "guided") {
      handleGuidedChoice(opt);
      return;
    }

    if (step === "select_activity") {
      let data = [];

      try {
        data = JSON.parse(localStorage.getItem("actividades") || "[]");
      } catch (e) {
        data = [];
      }

      const nueva = {
        texto: opt,
        pasos: getSteps(opt),
        fecha: new Date().toISOString(),
      };

      localStorage.setItem(
        "actividades",
        JSON.stringify([...data, nueva])
      );

      setMessages(prev => [
        ...prev,
        { role: "ai", text: `✅ Actividad creada: ${opt}` },
      ]);

      resetFlow();

      setTimeout(() => navigate("/actividades"), 1500);
      return;
    }
  };

  // 💬 enviar mensaje
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;

    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      if (userText.toLowerCase().includes("actividad")) {
        const base = getOptions();
        setOptions(base);

        setMessages(prev => [
          ...prev,
          { role: "ai", text: "¿Qué te gustaría hacer?", options: base },
        ]);

        setLoading(false);
        return;
      }

      const reply = await askAI(userText);

      setMessages(prev => [
        ...prev,
        { role: "ai", text: reply },
      ]);

    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: "ai", text: "Error conectando con la IA 😢" },
      ]);
    }

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
        <button onClick={() => navigate("/estadisticas")}>📊 Estadísticas</button>
        <button onClick={() => navigate("/diario")}>📓 Diario</button>
      </div>

    </div>
  );
}
