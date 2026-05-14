import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URLS = [
  "http://localhost:3001",
  "https://empatia-backend.onrender.com"
];

// 🤖 IA REAL
const askAI = async (message, userName) => {
  for (const url of API_URLS) {
    try {
      const res = await fetch(`${url}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Usuario ${userName || "anónimo"}: ${message}`
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();

      if (data?.reply) return data.reply;

    } catch (e) {
      console.warn("Error conexión:", url);
    }
  }

  return "Te escucho 🤍";
};

export default function User() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre || "🤍"} estoy contigo` },
      { role: "ai", text: "Cuéntame cómo te sientes" },
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // ACTIVIDADES
  // =========================
  const activityOptions = [
    "Caminar",
    "Meditar",
    "Música",
    "Respirar",
    "Estiramientos",
    "Escribir lo que siento",
    "Ducha relajante",
    "Ejercicio ligero",
    "Salir a tomar aire",
    "Ordenar espacio",
  ];

  const activityTriggers = [
    "no se que hacer",
    "no sé que hacer",
    "estoy aburrido",
    "estoy aburrida",
    "no tengo nada que hacer",
    "quiero actividades",
    "dame actividades",
  ];

  // =========================
  // CREAR ACTIVIDAD
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
  // CHAT
  // =========================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;
    const lower = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    // =========================
    // 🔥 SOLO ACTIVIDADES SI COINCIDE EXACTO
    // =========================
    const isActivity = activityTriggers.some((phrase) =>
      lower.includes(phrase)
    );

    if (isActivity) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Estoy contigo 🤍 elige una actividad:",
          options: activityOptions,
        },
      ]);

      setLoading(false);
      return;
    }

    // =========================
    // 🤖 IA NORMAL
    // =========================
    try {
      const reply = await askAI(text, user?.nombre);

      const shortReply = reply?.split(".")[0];

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: shortReply || "Te escucho 🤍",
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Te escucho 🤍",
        },
      ]);
    }

    setLoading(false);
  };

  // =========================
  // CLICK ACTIVIDAD
  // =========================
  const handleOptionClick = (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);
    createActivity(opt);
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
          sendMessage={sendMessage}
          loading={loading}
        />
      </div>

      {/* RIGHT */}
      <div className="right-panel">
        <button onClick={() => navigate("/rutina")}>🧘 Rutina</button>
        <button onClick={() => navigate("/actividades")}>🎯 Actividades</button>
        <button onClick={() => navigate("/estadisticas")}>📊 Estadísticas</button>
        <button onClick={() => navigate("/diario")}>📓 Diario</button>

        {user?.role === "admin" && (
          <button onClick={() => navigate("/admin")}>
            🛠 Admin
          </button>
        )}
      </div>

    </div>
  );
}
