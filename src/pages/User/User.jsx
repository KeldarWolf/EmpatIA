import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";
import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URLS = [
  "http://localhost:3001",
  "https://empatia-backend.onrender.com"
];

// Instrucción mínima (muy ligera)
const MINIMAL_PROMPT = "Eres un acompañante emocional cálido y breve. Responde siempre en máximo 1-2 frases cortas y cercanas.";

const ACTIVITY_KEYWORDS = [
  "aburrido", "aburrida", "no sé", "qué hago", "no se", 
  "actividad", "actividades", "qué hacer", "hacer algo", 
  "aburrimiento", "solo", "sola", "no tengo nada"
];

const getRandomActivityOffer = () => {
  const options = [
    "¿Te gustaría que te proponga una actividad para hacer ahora?",
    "¿Quieres que te ayude con una actividad rápida?",
    "Puedo sugerirte una actividad si quieres, ¿te parece?",
    "¿Te acompaño haciendo una actividad juntos?"
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
      { role: "ai", text: `Hola ${user?.nombre || "🤍"}, estoy aquí contigo.` },
      { role: "ai", text: "Cuéntame cómo te sientes..." },
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 8000);

    return () => clearInterval(interval);
  }, [user?.nombre]);

  // Detecta si debe ofrecer actividad
  const shouldOfferActivity = (text: string) => {
    const lowerText = text.toLowerCase();
    return ACTIVITY_KEYWORDS.some(keyword => lowerText.includes(keyword));
  };

  const askAI = useCallback(async (history) => {
    const conversation = history.map(m => 
      m.role === "user" ? `Usuario: ${m.text}` : `Asistente: ${m.text}`
    ).join("\n\n");

    for (const url of API_URLS) {
      try {
        const res = await fetch(`${url}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `${MINIMAL_PROMPT}\n\n${conversation}\n\nAsistente:`
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
    return "Te escucho 🤍";
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: "user", text: userMessage }];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    let reply;

    // Si detecta palabras clave → ofrecer actividad
    if (shouldOfferActivity(userMessage)) {
      reply = getRandomActivityOffer();
    } else {
      reply = await askAI(newMessages);
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
