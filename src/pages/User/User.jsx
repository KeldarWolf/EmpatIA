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
  const [step, setStep] = useState("start");
  const [options, setOptions] = useState([]);

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre || "🤍"} estoy contigo` },
      { role: "ai", text: "¿Qué te gustaría hacer hoy?" },
    ]);

    setOptions(getMainOptions());

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // OPCIONES BASE (5)
  // =========================
  const getMainOptions = () => [
    "Caminar",
    "Meditar",
    "Música",
    "No sé cuál",
    "Cambiar opciones",
  ];

  const getAltOptions = () => [
    "Respirar profundo",
    "Estiramientos",
    "Ducha relajante",
    "Escribir lo que siento",
    "Cambiar opciones",
  ];

  // =========================
  // SUBMENÚ EMOCIONAL
  // =========================
  const getEmotionOptions = () => [
    "Más tranquilo/a",
    "Con energía",
    "Despejar la mente",
  ];

  const getActivitiesByEmotion = (emotion) => {
    const map = {
      "Más tranquilo/a": [
        "Respirar profundo",
        "Ducha relajante",
        "Meditar",
      ],
      "Con energía": [
        "Caminar",
        "Estiramientos",
        "Música",
      ],
      "Despejar la mente": [
        "Escribir lo que siento",
        "Caminar",
        "Música",
      ],
    };

    return map[emotion] || [];
  };

  // =========================
  // PASOS ACTIVIDAD
  // =========================
  const getSteps = (act) => {
    const map = {
      Caminar: "Camina 10 minutos sin distracciones.",
      Meditar: "Respira profundo 5 minutos.",
      Música: "Escucha música que te relaje o motive.",
      "Respirar profundo": "Inhala 4s, exhala 6s.",
      Estiramientos: "Estira todo tu cuerpo lentamente.",
      "Ducha relajante": "Ducha consciente sin prisa.",
      "Escribir lo que siento": "Escribe sin filtro lo que sientes.",
    };

    return map[act] || "Hazlo a tu ritmo 🤍";
  };

  // =========================
  // CLICK OPCIONES (ÁRBOL)
  // =========================
  const handleOptionClick = (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    // 🔁 cambiar set de opciones
    if (opt === "Cambiar opciones") {
      const newOptions =
        options[0] === "Caminar"
          ? getAltOptions()
          : getMainOptions();

      setOptions(newOptions);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Aquí tienes otras opciones 🤍", options: newOptions },
      ]);

      return;
    }

    // ❓ NO SÉ
    if (opt === "No sé cuál") {
      setStep("emotion");

      const emotions = getEmotionOptions();
      setOptions(emotions);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Está bien 🤍 dime cómo te quieres sentir:",
          options: emotions,
        },
      ]);

      return;
    }

    // 🧠 NIVEL EMOCIÓN
    if (step === "emotion") {
      const acts = getActivitiesByEmotion(opt);

      setStep("activity");
      setOptions(acts);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Perfecto 🤍 aquí tienes actividades para ayudarte:",
          options: acts,
        },
      ]);

      return;
    }

    // 🎯 CREAR ACTIVIDAD FINAL
    if (step === "activity") {
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
        { role: "ai", text: "👉 Redirigiendo..." },
      ]);

      setStep("start");

      setTimeout(() => navigate("/actividades"), 2000);
      return;
    }

    // 🟢 FLUJO NORMAL (opciones base)
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
      { role: "ai", text: "👉 Redirigiendo..." },
    ]);

    setTimeout(() => navigate("/actividades"), 2000);
  };

  // =========================
  // UI
  // =========================
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
          sendMessage={() => {}}
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
