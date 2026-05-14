import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const isConfused = (text) => {
  const t = text.toLowerCase();
  return (
    t.includes("no se") ||
    t.includes("no sé") ||
    t.includes("nose") ||
    t.includes("que hacer") ||
    t.includes("qué hacer") ||
    t.includes("aburrido") ||
    t.includes("no tengo idea")
  );
};

export default function User() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(null);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setMessages([
      {
        role: "ai",
        text: `Hola ${user?.nombre || "🤍"} estoy contigo`,
      },
      {
        role: "ai",
        text: "Cuéntame cómo te sientes o si quieres hacer algo",
      },
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSteps = (act) => {
    const map = {
      Caminar: "Camina 10 minutos sin distracciones.",
      Meditar: "Respira profundo 5 minutos.",
      Música: "Escucha música que te calme o motive.",
      "Respirar profundo": "Inhala 4s, exhala 6s.",
      Estiramientos: "Estira lentamente todo tu cuerpo.",
      "Ducha relajante": "Ducha consciente sin prisa.",
      "Escribir lo que siento": "Escribe todo sin filtro.",
    };

    return map[act] || "Hazlo a tu ritmo 🤍";
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    // 🧠 CASO: usuario perdido
    if (isConfused(text)) {
      const opts = [
        "Caminar",
        "Respirar profundo",
        "Escuchar música",
        "Escribir lo que siento",
      ];

      setStep("select_activity");
      setOptions(opts);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Está bien 🤍 elige algo simple para empezar:",
          options: opts,
        },
      ]);

      setLoading(false);
      return;
    }

    // 🧠 respuesta normal corta y natural
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "Te entiendo 🤍 si quieres puedo sugerirte algo para sentirte mejor",
      },
    ]);

    setLoading(false);
  };

  const handleOptionClick = (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    const nueva = {
      texto: opt,
      tipo: "Actividad",
      pasos: getSteps(opt),
      fecha: new Date().toISOString(),
    };

    const data = JSON.parse(localStorage.getItem("actividades") || "[]");
    localStorage.setItem("actividades", JSON.stringify([...data, nueva]));

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: `✅ Actividad creada: ${opt}` },
      { role: "ai", text: "👉 Te llevo a actividades..." },
    ]);

    setStep(null);

    setTimeout(() => navigate("/actividades"), 2000);
  };

  const logout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <div className="app-layout">

      {/* LEFT */}
      <div className="left-panel">
        <h4>💡 Acompañamiento</h4>
        <div className="quote-box">{frase}</div>

        <div style={{ marginTop: 20, color: "#00e5ff" }}>
          👤 {user?.nombre || "Usuario"}
        </div>

        <button
          onClick={logout}
          style={{
            marginTop: 10,
            padding: "8px 12px",
            background: "#ff3b3b",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
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
