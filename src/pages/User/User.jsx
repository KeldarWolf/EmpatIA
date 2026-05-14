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

// Prompt mínimo
const SYSTEM_PROMPT = "Eres un acompañante emocional cálido y breve. Responde máximo 2 frases.";

const activityTriggers = [
  "aburrido", "aburrida", "no sé qué hacer", "no se que hacer", 
  "qué hago", "que hago", "actividad", "actividades", "aburrimiento"
];

const activityOptions = [
  "Caminar", "Meditar", "Música", "Respirar", "Estiramientos",
  "Escribir lo que siento", "Ducha relajante", "Ordenar espacio",
  "Salir a tomar aire", "Ejercicio ligero"
];

const fallbackMessages = [
  "Lo siento, no puedo responder ahora pero puedo ayudarte con actividades. ¿Quieres?",
  "Estoy con problemas en este momento. ¿Te ayudo proponiendo una actividad?",
];

export default function User() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [frase, setFrase] = useState("");
  const [waitingForYes, setWaitingForYes] = useState(false); // ← Nuevo estado clave

  // Init
  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre || "🤍"}, estoy aquí contigo.` },
      { role: "ai", text: "Cuéntame cómo te sientes..." },
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 7000);

    return () => clearInterval(interval);
  }, [user?.nombre]);

  // Detectar si quiere actividad
  const shouldTriggerActivity = (text) => {
    const lower = text.toLowerCase();
    return activityTriggers.some(word => lower.includes(word));
  };

  // Detectar respuesta positiva (sí)
  const isPositiveResponse = (text) => {
    const lower = text.toLowerCase().trim();
    return ["si", "sí", "vale", "ok", "quiero", "dale", "claro", "sí por favor"].some(word => 
      lower === word || lower.includes(word)
    );
  };

  const askAI = async (message) => {
    for (const url of API_URLS) {
      try {
        const res = await fetch(`${url}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `${SYSTEM_PROMPT}\nUsuario: ${message}`
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.reply) return data.reply;
        }
      } catch (e) {
        console.warn("API caída");
      }
    }
    return null;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();
    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    // Si estamos esperando confirmación de actividad
    if (waitingForYes && isPositiveResponse(text)) {
      setMessages(prev => [
        ...prev,
        { 
          role: "ai", 
          text: "¡Genial! Aquí tienes algunas actividades:", 
          options: activityOptions 
        }
      ]);
      setWaitingForYes(false);
      setLoading(false);
      return;
    }

    // Detectar necesidad de actividad
    if (shouldTriggerActivity(text)) {
      setMessages(prev => [
        ...prev,
        { 
          role: "ai", 
          text: "Entiendo... ¿Quieres que te acompañe con una actividad ahora?" 
        }
      ]);
      setWaitingForYes(true);
      setLoading(false);
      return;
    }

    // IA normal
    const reply = await askAI(text);

    if (!reply) {
      setMessages(prev => [
        ...prev,
        { role: "ai", text: fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)] }
      ]);
    } else {
      setMessages(prev => [...prev, { role: "ai", text: reply }]);
    }

    setWaitingForYes(false);
    setLoading(false);
  };

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
      { role: "ai", text: `✅ Guardado: ${opt}` },
      { role: "ai", text: "Redirigiendo a tus actividades..." }
    ]);

    setTimeout(() => navigate("/actividades"), 1400);
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
        {user?.role === "admin" && <button onClick={() => navigate("/admin")}>🛠 Admin</button>}
      </div>
    </div>
  );
}
