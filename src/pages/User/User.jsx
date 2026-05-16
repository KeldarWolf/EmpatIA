import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URL = "https://empatia-backend.onrender.com";

// =========================
// MENÚ
// =========================
const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
  "✍️ Escribir actividad",
  "❓ No sé qué hacer",
];

// =========================
// SUBMENÚS
// =========================
const subOptions = {
  "🎵 Música": ["Lo-fi", "Piano", "Jazz", "Lluvia"],
  "🧘 Relajación": ["Respirar", "Meditar", "Ducha", "Cerrar ojos"],
  "🏃 Actividad física": ["Caminar", "Bailar", "Yoga", "Trotar"],
};

export default function User() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState("chat"); 
  const [category, setCategory] = useState(null);
  const [frase, setFrase] = useState("");

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    setMessages([
      {
        role: "ai",
        text: `Hola ${user?.nombre || "🤍"}, estoy aquí contigo.`,
      },
      {
        role: "ai",
        text: "Cuéntame cómo te sientes...",
      },
    ]);

    setFrase(frases[Math.floor(Math.random() * frases.length)]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

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
      return {
        reply:
          "🤍 La IA no está disponible ahora. Pero puedo ayudarte con una actividad.",
      };
    }
  };

  // =========================
  // GUARDAR BD
  // =========================
  const saveActivity = async (name) => {
    try {
      await fetch(`${API_URL}/api/registro-actividad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          nombre_actividad: name,
          puntaje_agrado: 7,
          frecuencia_deseada: "media",
          reaccion: "positiva",
        }),
      });

      setTimeout(() => {
        navigate("/actividades");
      }, 3000);
    } catch (err) {
      console.log("error BD", err);
    }
  };

  // =========================
  // INPUT
  // =========================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input.trim().toLowerCase();

    setMessages((prev) => [
      ...prev,
      { role: "user", text: input },
    ]);

    setInput("");

    // =========================
    // ACTIVIDADES TRIGGER
    // =========================
    if (
      text.includes("actividad") ||
      text.includes("actividades") ||
      text.includes("no sé qué hacer")
    ) {
      setStep("confirm");

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "¿Deseas iniciar una actividad para sentirte mejor?",
          options: ["Sí", "No"],
        },
      ]);

      return;
    }

    // =========================
    // IA NORMAL
    // =========================
    setLoading(true);

    const res = await askAI(text);

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: res.reply },
    ]);

    setLoading(false);
  };

  // =========================
  // OPTIONS CLICK
  // =========================
  const handleOptionClick = async (opt) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", text: opt },
    ]);

    // =========================
    // CONFIRM
    // =========================
    if (step === "confirm") {
      if (opt === "Sí") {
        setStep("menu");

        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "Elige una categoría:",
            options: mainOptions,
          },
        ]);
      } else {
        setStep("chat");

        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "Está bien 🤍 estoy aquí si me necesitas.",
          },
        ]);
      }
      return;
    }

    // =========================
    // MENU PRINCIPAL
    // =========================
    if (subOptions[opt]) {
      setCategory(opt);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `Elige una opción de ${opt}:`,
          options: subOptions[opt],
        },
      ]);

      return;
    }

    // =========================
    // FINAL ACTIVITY
    // =========================
    await saveActivity(opt);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: `✅ Actividad guardada: ${opt}`,
      },
    ]);
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

        <div style={{ marginTop: 20 }}>
          👤 {user?.nombre || "Usuario"}
        </div>
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
      </div>

    </div>
  );
}
