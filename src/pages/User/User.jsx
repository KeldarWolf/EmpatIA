import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URL = "https://empatia-backend.onrender.com";

// =========================
// ACTIVADORES
// =========================
const activityTriggers = [
  "aburrido",
  "aburrida",
  "no sé qué hacer",
  "que hago",
  "actividad",
  "actividades",
];

// =========================
// OPCIONES BASE (SI/NO + MENU)
// =========================
const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
  "✍️ Escribir actividad",
  "❓ No sé cuál",
];

// =========================
// SUB OPCIONES (LAS QUE TE FALTABAN)
// =========================
const activityGroups = {
  musica: [
    "Cantar",
    "Lo-fi",
    "Música relajante",
    "Piano suave",
    "Sonidos lluvia",
    "Playlist feliz",
  ],
  relajacion: [
    "Respirar profundo",
    "Meditar",
    "Estiramientos",
    "Ducha relajante",
    "Cerrar ojos",
    "Tomar agua",
  ],
  fisica: [
    "Caminar",
    "Bailar",
    "Trotar suave",
    "Yoga",
    "Mover brazos",
    "Estiramientos",
  ],
};

export default function User() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [waitingYesNo, setWaitingYesNo] = useState(false);
  const [step, setStep] = useState(null);
  const [frase, setFrase] = useState("");

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre || "🤍"}, estoy aquí contigo` },
      { role: "ai", text: "Cuéntame cómo te sientes..." },
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // DETECTOR
  // =========================
  const shouldTrigger = (text) =>
    activityTriggers.some((w) => text.toLowerCase().includes(w));

  // =========================
  // IA
  // =========================
  const askAI = async (message) => {
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      return await res.json();
    } catch {
      return null;
    }
  };

  // =========================
  // GUARDAR BD (REAL)
  // =========================
  const saveActivity = async (nombre) => {
    try {
      if (!user?.id_usuario) return;

      await fetch(`${API_URL}/registro-actividad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          nombre_actividad: nombre,
          puntaje_agrado: 7,
          frecuencia_deseada: "media",
          reaccion: "positiva",
        }),
      });
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input.trim();
    const lower = text.toLowerCase();

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    // 🔥 TRIGGER ACTIVIDAD
    if (shouldTrigger(text)) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "¿Quieres ayuda con una actividad?",
          options: ["Sí", "No"],
        },
      ]);
      setWaitingYesNo(true);
      setLoading(false);
      return;
    }

    const response = await askAI(text);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: response?.reply || "🤍 Estoy contigo",
      },
    ]);

    setLoading(false);
  };

  // =========================
  // CLICK OPTIONS
  // =========================
  const handleOptionClick = async (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    // YES / NO
    if (opt === "Sí") {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Elige una categoría:", options: mainOptions },
      ]);
      setWaitingYesNo(false);
      return;
    }

    if (opt === "No") {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "🤍 Está bien, sigo aquí contigo" },
      ]);
      setWaitingYesNo(false);
      return;
    }

    // MENU PRINCIPAL
    if (opt === "🎵 Música") {
      setStep("musica");
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Elige música:", options: activityGroups.musica },
      ]);
      return;
    }

    if (opt === "🧘 Relajación") {
      setStep("relajacion");
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Elige relajación:",
          options: activityGroups.relajacion,
        },
      ]);
      return;
    }

    if (opt === "🏃 Actividad física") {
      setStep("fisica");
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Elige actividad física:",
          options: activityGroups.fisica,
        },
      ]);
      return;
    }

    if (opt === "❓ No sé cuál") {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Está bien 🤍 prueba esto:",
          options: mainOptions,
        },
      ]);
      return;
    }

    // ✍️ escribir actividad
    if (opt.includes("Escribir")) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "✍️ Escríbela ahora:" },
      ]);
      return;
    }

    // 🎯 guardar actividad final
    await saveActivity(opt);

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: `✅ Actividad guardada: ${opt}` },
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
        <div style={{ marginTop: 20 }}>
          👤 {user?.nombre || "Usuario"}
        </div>
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
