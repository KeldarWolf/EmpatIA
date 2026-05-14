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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Usuario ${userName || "anónimo"}: ${message}`
        })
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

  // 👉 control de flujo actividades
  const [activityStep, setActivityStep] = useState("chat"); 
  // chat | confirm | select

  const activityTriggers = [
    "no se que hacer",
    "no sé que hacer",
    "estoy aburrido",
    "estoy aburrida",
    "no tengo nada que hacer",
    "quiero actividades",
    "actividades",
    "actividad"
  ];

  const activityOptions = [
    "Caminar",
    "Meditar",
    "Música",
    "Respirar",
    "Estiramientos",
    "Escribir lo que siento",
    "Ducha relajante",
    "Ordenar espacio",
    "Salir a tomar aire",
    "Ejercicio ligero"
  ];

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre || "🤍"} estoy contigo` },
      { role: "ai", text: "Cuéntame cómo te sientes" }
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // CREAR ACTIVIDAD
  // =========================
  const createActivities = () => {
    setActivityStep("select");

    setMessages(prev => [
      ...prev,
      {
        role: "ai",
        text: "Perfecto 🤍 elige una actividad:",
        options: activityOptions
      }
    ]);
  };

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;
    const lower = text.toLowerCase();

    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    // =========================
    // 1. SI YA ESTÁ EN SELECCIÓN
    // =========================
    if (activityStep === "select") {
      const nueva = {
        texto: text,
        tipo: "Actividad",
        fecha: new Date().toISOString()
      };

      const data = JSON.parse(localStorage.getItem("actividades") || "[]");
      localStorage.setItem("actividades", JSON.stringify([...data, nueva]));

      setMessages(prev => [
        ...prev,
        { role: "ai", text: `✅ Actividad creada: ${text}` },
        { role: "ai", text: "👉 Redirigiendo..." }
      ]);

      setActivityStep("chat");

      setTimeout(() => navigate("/actividades"), 1500);
      setLoading(false);
      return;
    }

    // =========================
    // 2. CONFIRMACIÓN
    // =========================
    if (activityStep === "confirm") {
      const yes = ["si", "sí", "dale", "ok", "claro", "ya", "vale"];

      if (yes.some(w => lower.includes(w))) {
        createActivities();
      } else {
        setMessages(prev => [
          ...prev,
          { role: "ai", text: "Está bien 🤍 seguimos conversando" }
        ]);
        setActivityStep("chat");
      }

      setLoading(false);
      return;
    }

    // =========================
    // 3. DETECTAR INTENCIÓN ACTIVIDAD
    // =========================
    const wantsActivity = activityTriggers.some(t =>
      lower.includes(t)
    );

    if (wantsActivity) {
      setActivityStep("confirm");

      setMessages(prev => [
        ...prev,
        {
          role: "ai",
          text: "Te acompaño 🤍 ¿quieres que hagamos una actividad juntos?"
        }
      ]);

      setLoading(false);
      return;
    }

    // =========================
    // 4. IA NORMAL (CONVERSACIÓN)
    // =========================
    const reply = await askAI(text, user?.nombre);

    const shortReply = reply?.split(".")[0];

    setMessages(prev => [
      ...prev,
      { role: "ai", text: shortReply }
    ]);

    setLoading(false);
  };

  // =========================
  // CLICK ACTIVIDAD
  // =========================
  const handleOptionClick = (opt) => {
    setMessages(prev => [...prev, { role: "user", text: opt }]);

    const nueva = {
      texto: opt,
      tipo: "Actividad",
      fecha: new Date().toISOString()
    };

    const data = JSON.parse(localStorage.getItem("actividades") || "[]");
    localStorage.setItem("actividades", JSON.stringify([...data, nueva]));

    setMessages(prev => [
      ...prev,
      { role: "ai", text: `✅ Actividad creada: ${opt}` },
      { role: "ai", text: "👉 Redirigiendo..." }
    ]);

    setActivityStep("chat");

    setTimeout(() => navigate("/actividades"), 1500);
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
