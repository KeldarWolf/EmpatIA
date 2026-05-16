import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URL = "https://empatia-backend.onrender.com";

const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
  "🤍 Hablar",
  "✍️ Escribir actividad",
];

export default function User() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(false);

  const [waiting, setWaiting] = useState(false);
  const [writing, setWriting] = useState(false);

  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre || "🤍"}, estoy aquí.` },
      { role: "ai", text: "Cuéntame cómo te sientes..." },
    ]);

    const i = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 8000);

    return () => clearInterval(i);
  }, []);

  const askAI = async (msg) => {
    try {
      const r = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      const data = await r.json();
      return data;
    } catch {
      return null;
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;

    setMessages((p) => [...p, { role: "user", text }]);
    setInput("");
    setLoading(true);

    // escribir actividad
    if (writing) {
      const old = JSON.parse(localStorage.getItem("actividades") || "[]");

      localStorage.setItem(
        "actividades",
        JSON.stringify([
          ...old,
          { texto: text, fecha: new Date().toISOString() },
        ])
      );

      setMessages((p) => [
        ...p,
        { role: "ai", text: "✅ Guardado" },
      ]);

      setWriting(false);
      setLoading(false);
      return;
    }

    const res = await askAI(text);

    if (!res) {
      setMessages((p) => [
        ...p,
        {
          role: "ai",
          text: "🤍 IA no disponible. ¿Quieres una actividad?",
          options: mainOptions,
        },
      ]);

      setWaiting(true);
      setLoading(false);
      return;
    }

    if (res.errorType === "TOKEN_LIMIT") {
      setMessages((p) => [
        ...p,
        {
          role: "ai",
          text: res.reply,
          options: ["Sí", "No"],
        },
      ]);

      setWaiting(true);
      setLoading(false);
      return;
    }

    setMessages((p) => [
      ...p,
      { role: "ai", text: res.reply },
    ]);

    setLoading(false);
  };

  const handleOptionClick = (opt) => {
    setMessages((p) => [...p, { role: "user", text: opt }]);

    if (opt === "Sí") {
      setMessages((p) => [
        ...p,
        { role: "ai", text: "Elige actividad:", options: mainOptions },
      ]);
      setWaiting(false);
      return;
    }

    if (opt === "No") {
      setMessages((p) => [
        ...p,
        { role: "ai", text: "🤍 Aquí sigo contigo." },
      ]);
      setWaiting(false);
      return;
    }

    if (opt.includes("Escribir")) {
      setWriting(true);
      setMessages((p) => [
        ...p,
        { role: "ai", text: "✍️ Escribe la actividad" },
      ]);
      return;
    }

    const old = JSON.parse(localStorage.getItem("actividades") || "[]");

    localStorage.setItem(
      "actividades",
      JSON.stringify([
        ...old,
        { texto: opt, fecha: new Date().toISOString() },
      ])
    );

    setTimeout(() => navigate("/actividades"), 1000);
  };

  return (
    <div className="app-layout">
      <div className="left-panel">
        <h4>💡 EmpatIA</h4>
        <div className="quote-box">{frase}</div>
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
        <button onClick={() => navigate("/actividades")}>
          🎯 Actividades
        </button>
      </div>
    </div>
  );
}
