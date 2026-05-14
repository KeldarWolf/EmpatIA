import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";
import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URLS = [
  "https://empatia-backend.onrender.com",   // ← Prioridad a la nube
  "http://localhost:3001"
];

const SYSTEM_PROMPT = "Eres un acompañante emocional cálido. Responde breve y natural.";

export default function User() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(false);

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
        console.warn(`API no disponible: ${url}`);
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

    const reply = await askAI(text);

    if (reply) {
      setMessages(prev => [...prev, { role: "ai", text: reply }]);
    } else {
      setMessages(prev => [...prev, { 
        role: "ai", 
        text: "Lo siento, no puedo responder ahora pero puedo ayudarte con actividades. ¿Quieres?" 
      }]);
    }

    setLoading(false);
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
      </div>
    </div>
  );
}
