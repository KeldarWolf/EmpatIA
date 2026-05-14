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

// 🤖 IA fallback
const askAI = async (message) => {
  for (const url of API_URLS) {
    try {
      const res = await fetch(`${url}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (res.ok && data?.reply) {
        return data.reply;
      }
    } catch (e) {}
  }

  return "No pude conectar con la IA 😢";
};

export default function User() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("usuario"));

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(null);
  const [options, setOptions] = useState([]);

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    setMessages([
      {
        role: "ai",
        text: `Hola ${user?.nombre || "🤍"} estoy contigo`,
      },
      {
        role: "ai",
        text: "Cuéntame cómo te sientes",
      },
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  // =========================
  // ACTIVIDADES
  // =========================
  const getOptions = () => [
    "Caminar",
    "Meditar",
    "Música",
    "Cambiar opciones",
    "No sé cuál",
  ];

  const getOptionsAlt = () => [
    "Respirar profundo",
    "Estiramientos",
    "Ducha relajante",
    "Escribir lo que siento",
    "Cambiar opciones",
    "No sé cuál",
  ];

  const getSteps = (act) => {
    const map = {
      Caminar: "Camina 10 min sin distracciones.",
      Meditar: "Respira profundo 5 min.",
      Música: "Escucha música relajante.",
      "Respirar profundo": "Inhala 4s, exhala 6s.",
      Estiramientos: "Estira todo el cuerpo.",
      "Ducha relajante": "Ducha consciente.",
      "Escribir lo que siento": "Escribe sin filtro.",
    };
    return map[act] || "Hazlo a tu ritmo 🤍";
  };

  // =========================
  // CHAT IA
  // =========================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;

    setMessages((p) => [...p, { role: "user", text }]);
    setInput("");
    setLoading(true);

    const reply = await askAI(text);

    setMessages((p) => [...p, { role: "ai", text: reply }]);

    setLoading(false);
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
          👤 {user?.nombre}
        </div>

        <button onClick={logout} style={{ marginTop: 10 }}>
          Cerrar sesión
        </button>
      </div>

      {/* CENTER */}
      <div className="center-panel">
        <ChatBox
          messages={messages}
          onOptionClick={() => {}}
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
        <button onClick={() => navigate("/admin")}>🛠 Admin</button>
      </div>

    </div>
  );
}
