import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";
import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URL = "https://empatia-backend.onrender.com";   // ← Solo el que funciona

const activityTriggers = [
  "aburrido", "aburrida", "no sé qué hacer", "no se que hacer",
  "qué hago", "que hago", "actividad", "actividades", "aburrimiento"
];

const activityOptions = [
  "Caminar", "Meditar", "Música", "Respirar", "Estiramientos",
  "Escribir lo que siento", "Ducha relajante", "Ordenar espacio",
  "Salir a tomar aire", "Ejercicio ligero"
];

export default function User() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingForYes, setWaitingForYes] = useState(false);

  // Init
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

  const shouldTriggerActivity = (text) => {
    const lower = text.toLowerCase();
    return activityTriggers.some(word => lower.includes(word));
  };

  const isPositiveResponse = (text) => {
    const lower = text.toLowerCase().trim();
    return ["si", "sí", "vale", "ok", "quiero", "dale", "claro", "sí por favor"].some(w => lower.includes(w));
  };

  const askAI = async (message) => {
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (res.ok) {
        const data = await res.json();
        return data?.reply;
      }
    } catch (e) {
      console.error("Error conexión IA", e);
    }
    return null;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();
    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    // === Flujo de Actividades ===
    if (waitingForYes && isPositiveResponse(text)) {
      setMessages(prev => [
        ...prev,
        { role: "ai", text: "¡Genial! Elige una actividad:", options: activityOptions }
      ]);
      setWaitingForYes(false);
      setLoading(false);
      return;
    }

    if (shouldTriggerActivity(text)) {
      setMessages(prev => [
        ...prev,
        { role: "ai", text: "¿Quieres que te acompañe con una actividad ahora?" }
      ]);
      setWaitingForYes(true);
      setLoading(false);
      return;
    }

    // === IA Normal ===
    const reply = await askAI(text);

    if (reply) {
      setMessages(prev => [...prev, { role: "ai", text: reply }]);
    } else {
      setMessages(prev => [
        ...prev,
        { 
          role: "ai", 
          text: "Lo siento, no puedo responder ahora pero puedo ayudarte con actividades. ¿Quieres?",
          options: activityOptions   // Ofrece botones directamente si la IA falla
        }
      ]);
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
      { role: "ai", text: `✅ Actividad guardada: ${opt}` },
      { role: "ai", text: "Redirigiendo..." }
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
        <button onClick={logout} className="logout-btn">Cerrar sesión</button>
      </div>

      <div className="center-panel">
        <ChatBox messages={messages} onOptionClick={handleOptionClick} />
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
