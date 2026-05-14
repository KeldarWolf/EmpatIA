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

const ACTIVITY_KEYWORDS = [
  "aburrido", "aburrida", "no sé", "no se", "qué hago", "qué hacer",
  "actividad", "actividades", "hacer algo", "aburrimiento", "entretenerme"
];

const FALLBACK_WHEN_AI_DOWN = [
  "Lo siento, no puedo responder ahora pero puedo ayudarte a crear actividades. ¿Quieres?",
  "En este momento no puedo conversar, pero sí puedo ayudarte con una actividad. ¿Te parece?",
  "Estoy con problemas para responder, pero puedo sugerirte actividades. ¿Quieres que te proponga alguna?",
];

const getRandomActivityFallback = () => {
  return FALLBACK_WHEN_AI_DOWN[Math.floor(Math.random() * FALLBACK_WHEN_AI_DOWN.length)];
};

const getActivityOffer = () => {
  const options = [
    "¿Quieres que te sugiera una actividad ahora?",
    "¿Te ayudo creando una actividad?",
    "¿Hacemos una actividad juntos?",
  ];
  return options[Math.floor(Math.random() * options.length)];
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
      { role: "ai", text: `Hola ${user?.nombre || ""}, estoy aquí.` },
      { role: "ai", text: "Cómo te sientes?" },
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 10000);

    return () => clearInterval(interval);
  }, [user?.nombre]);

  const shouldOfferActivity = (text: string) => {
    const lower = text.toLowerCase();
    return ACTIVITY_KEYWORDS.some(kw => lower.includes(kw));
  };

  const askAI = async (userMessage: string) => {
    for (const url of API_URLS) {
      try {
        const res = await fetch(`${url}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.reply && data.reply.length > 3) {
            return data.reply;
          }
        }
      } catch (e) {
        console.warn("API caída:", url);
      }
    }
    // ← Aquí es donde se cae la IA
    return getRandomActivityFallback();
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    let reply;

    if (shouldOfferActivity(userMessage)) {
      reply = getActivityOffer();
    } else {
      reply = await askAI(userMessage);
    }

    setMessages(prev => [...prev, { role: "ai", text: reply }]);
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
