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

// Prompt muy corto para ahorrar tokens
const SYSTEM_PROMPT = "Eres un acompañante emocional cálido. Responde siempre muy breve (1-2 frases máximo).";

const activityTriggers = [
  "no sé qué hacer", "no se que hacer", "estoy aburrido", "estoy aburrida",
  "actividades", "actividad", "qué hago", "que hago", "aburrimiento"
];

const activityOptions = [
  "Caminar", "Meditar", "Música", "Respirar", "Estiramientos",
  "Escribir lo que siento", "Ducha relajante", "Ordenar espacio",
  "Salir a tomar aire", "Ejercicio ligero"
];

const fallbackAI = [
  "Lo siento, no puedo responder ahora pero puedo ayudarte a crear actividades. ¿Quieres?",
  "Estoy con problemas en este momento. ¿Te ayudo con una actividad?",
  "No puedo conversar ahora, pero sí puedo sugerirte actividades. ¿Te parece bien?"
];

export default function User() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(false);

  // ========================= INIT =========================
  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre || "🤍"}, estoy contigo.` },
      { role: "ai", text: "Cuéntame cómo te sientes..." },
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 7000);

    return () => clearInterval(interval);
  }, [user?.nombre]);

  // ========================= ASK AI =========================
  const askAI = async (message) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    for (const url of API_URLS) {
      try {
        const res = await fetch(`${url}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            message: `${SYSTEM_PROMPT}\n\nUsuario: ${message}`
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.reply?.trim()) {
            clearTimeout(timeout);
            return data.reply;
          }
        }
      } catch (e) {
        console.warn("IA caída:", url);
      }
    }

    clearTimeout(timeout);
    return null; // null = IA caída
  };

  // ========================= SEND MESSAGE =========================
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();
    const lower = text.toLowerCase();

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    // Trigger de actividad
    const wantsActivity = activityTriggers.some((w) => lower.includes(w));

    if (wantsActivity) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Estoy contigo 🤍 ¿Quieres que te ayude con una actividad?",
          options: activityOptions
        }
      ]);
      setLoading(false);
      return;
    }

    // Llamada normal a IA
    const reply = await askAI(text);

    if (!reply) {
      // IA caída → mensaje útil
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: fallbackAI[Math.floor(Math.random() * fallbackAI.length)],
          options: activityOptions  // ofrezco botones directamente
        }
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: reply.split(".")[0] + "." }
      ]);
    }

    setLoading(false);
  };

  // ========================= SELECT ACTIVITY =========================
  const handleOptionClick = (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    const nueva = {
      texto: opt,
      tipo: "Actividad",
      fecha: new Date().toISOString()
    };

    const data = JSON.parse(localStorage.getItem("actividades") || "[]");
    localStorage.setItem("actividades", JSON.stringify([...data, nueva]));

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: `✅ Actividad guardada: ${opt}` },
      { role: "ai", text: "Redirigiendo..." }
    ]);

    setTimeout(() => navigate("/actividades"), 1500);
  };

  const logout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <div className="app-layout">
      {/* LEFT PANEL */}
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

      {/* CENTER PANEL */}
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

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <button onClick={() => navigate("/rutina")}>🧘 Rutina</button>
        <button onClick={() => navigate("/actividades")}>🎯 Actividades</button>
        <button onClick={() => navigate("/estadisticas")}>📊 Estadísticas</button>
        <button onClick={() => navigate("/diario")}>📓 Diario</button>
        {user?.role === "admin" && (
          <button onClick={() => navigate("/admin")}>🛠 Admin</button>
        )}
      </div>
    </div>
  );
}
