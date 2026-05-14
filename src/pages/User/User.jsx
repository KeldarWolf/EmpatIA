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

// =========================
// IA PROMPT SIMPLE
// =========================import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";
import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URLS = [
  "http://localhost:3001",
  "https://empatia-backend.onrender.com"
];

const SYSTEM_PROMPT = `...`; // tu prompt actual

// ==================== MENSAJES FALLBACK ====================
const FALLBACK_MESSAGES = [
  "Lo siento, ahora no puedo mantener una conversación larga. ¿Te gustaría que te ayude creando una actividad?",
  "Parece que estoy con limitaciones en este momento. ¿Quieres que te proponga una actividad para que te sientas mejor?",
  "No puedo conversar mucho ahora, pero estoy aquí. ¿Te ayudo buscando una actividad agradable?",
  "Lo siento ❤️, en este momento tengo restricciones. ¿Quieres que te sugiera algo para hacer?",
  "Entiendo que quieres hablar, pero por ahora solo puedo ayudarte con actividades. ¿Te parece bien?"
];

const getRandomFallback = () => {
  return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
};

export default function User() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre || "🤍"}, estoy contigo.` },
      { role: "ai", text: "Cuéntame cómo te sientes hoy..." },
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 8000);

    return () => clearInterval(interval);
  }, [user?.nombre]);

  // ====================== IA ======================
  const askAI = useCallback(async (history) => {
    const conversation = history.map(m => 
      m.role === "user" 
        ? `Usuario: ${m.text}`
        : `Asistente: ${m.text}`
    ).join("\n\n");

    for (const url of API_URLS) {
      try {
        const res = await fetch(`${url}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `${SYSTEM_PROMPT}\n\n${conversation}\n\nAsistente:`
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.reply) return data.reply;
        }
      } catch (e) {
        console.warn(`Error con ${url}`);
      }
    }
    // Si llega aquí → falló la IA o se consumieron tokens
    return getRandomFallback();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const reply = await askAI([...messages, { role: "user", text: userMessage }]);
      setMessages(prev => [...prev, { role: "ai", text: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "ai", 
        text: "Lo siento, estoy con limitaciones ahora. ¿Quieres que te ayude con una actividad?" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <div className="app-layout">
      <div className="left-panel">
        <h4>💡 Acompañamiento</h4>
        <div className="quote-box">{frase}</div>
        <div style={{ marginTop: 20, color: "#00e5ff" }}>
          👤 {user?.nombre || "Usuario"}
        </div>
        <button onClick={logout} className="logout-btn">
          Cerrar sesión
        </button>
      </div>

      <div className="center-panel">
        <ChatBox messages={messages} onOptionClick={() => {}} />
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
        {user?.role === "admin" && <button onClick={() => navigate("/admin")}>🛠 Admin</button>}
      </div>
    </div>
  );
}
const SYSTEM_PROMPT = `
Eres una IA de acompañamiento emocional.

Reglas:
- Responde SIEMPRE breve (1 o 2 frases máximo).
- Tono humano, cercano y calmado.
- Acompaña emocionalmente, valida lo que siente la persona.
- Haz preguntas suaves para seguir la conversación.
- NO des listas largas.
- NO respondas como robot.
`;

// =========================
// IA REQUEST
// =========================
const askAI = async (message, userName) => {
  for (const url of API_URLS) {
    try {
      const res = await fetch(`${url}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `${SYSTEM_PROMPT}\n\nUsuario ${userName || "anónimo"}: ${message}`
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();
      if (data?.reply) return data.reply;

    } catch (e) {
      console.warn("Error conexión:", url);
    }
  }

  return "Estoy contigo 🤍";
};

export default function User() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // ACTIVIDAD TRIGGERS
  // =========================
  const activityTriggers = [
    "no sé qué hacer",
    "no se que hacer",
    "estoy aburrido",
    "estoy aburrida",
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
      { role: "ai", text: "Cuéntame cómo te sientes" },
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;
    const lower = text.toLowerCase();

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    // =========================
    // 🔥 SOLO ACTIVIDADES SI DETECTA PALABRA CLAVE
    // =========================
    const wantsActivity = activityTriggers.some((w) =>
      lower.includes(w)
    );

    if (wantsActivity) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Te acompaño 🤍 ¿te gustaría hacer algo para sentirte mejor?",
          options: activityOptions
        }
      ]);

      setLoading(false);
      return;
    }

    // =========================
    // 🤖 IA NORMAL (CONVERSACIÓN)
    // =========================
    try {
      const reply = await askAI(text, user?.nombre);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: reply?.split(".")[0] // breve
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Estoy contigo 🤍" }
      ]);
    }

    setLoading(false);
  };

  // =========================
  // CLICK ACTIVIDAD
  // =========================
  const handleOptionClick = (opt) => {
    const nueva = {
      texto: opt,
      tipo: "Actividad",
      fecha: new Date().toISOString()
    };

    const data = JSON.parse(localStorage.getItem("actividades") || "[]");
    localStorage.setItem("actividades", JSON.stringify([...data, nueva]));

    setMessages((prev) => [
      ...prev,
      { role: "user", text: opt },
      { role: "ai", text: `✅ Actividad creada: ${opt}` },
      { role: "ai", text: "👉 Te llevo a actividades" }
    ]);

    setTimeout(() => navigate("/actividades"), 1200);
  };

  // =========================
  // UI
  // =========================
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
