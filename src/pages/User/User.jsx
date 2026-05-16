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
  "🤍 Hablar un poco",
  "❓ No sé qué hacer",
  "✍️ Escribir actividad",
];

export default function User() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("usuario") || "null"
  );

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [writingActivity, setWritingActivity] = useState(false);
  const [frase, setFrase] = useState("");

  // =====================================
  // INIT
  // =====================================
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

    setFrase(
      frases[Math.floor(Math.random() * frases.length)]
    );

    const interval = setInterval(() => {
      setFrase(
        frases[Math.floor(Math.random() * frases.length)]
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // =====================================
  // IA
  // =====================================
  const askAI = async (message) => {
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      return await res.json();
    } catch (err) {
      console.log(err);

      return {
        reply: "🤍 Error de conexión.",
      };
    }
  };

  // =====================================
  // SAVE ACTIVITY
  // =====================================
  const saveActivity = async (activityName) => {
    try {
      const data = JSON.parse(
        localStorage.getItem("actividades") || "[]"
      );

      const nueva = {
        texto: activityName,
        fecha: new Date().toISOString(),
      };

      localStorage.setItem(
        "actividades",
        JSON.stringify([...data, nueva])
      );

    } catch (err) {
      console.log("Error guardando actividad");
    }
  };

  // =====================================
  // SEND MESSAGE
  // =====================================
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text,
      },
    ]);

    setInput("");
    setLoading(true);

    // =========================
    // ACTIVIDADES
    // =========================
    if (
      text.toLowerCase().includes("actividad") ||
      text.toLowerCase().includes("actividades")
    ) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "✨ Elige una actividad:",
          options: mainOptions,
        },
      ]);

      setLoading(false);
      return;
    }

    // =========================
    // ESCRIBIR ACTIVIDAD
    // =========================
    if (writingActivity) {
      await saveActivity(text);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `✅ Actividad guardada: ${text}`,
        },
      ]);

      setWritingActivity(false);

      setTimeout(() => {
        navigate("/actividades");
      }, 1200);

      setLoading(false);
      return;
    }

    // =========================
    // IA
    // =========================
    const response = await askAI(text);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: response.reply || "🤍 No pude responder.",
      },
    ]);

    setLoading(false);
  };

  // =====================================
  // OPTIONS
  // =====================================
  const handleOptionClick = async (opt) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: opt,
      },
    ]);

    // =========================
    // ESCRIBIR
    // =========================
    if (opt.includes("Escribir")) {
      setWritingActivity(true);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "✍️ Escribe tu actividad:",
        },
      ]);

      return;
    }

    // =========================
    // GUARDAR
    // =========================
    await saveActivity(opt);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: `✅ Actividad guardada: ${opt}`,
      },
    ]);

    setTimeout(() => {
      navigate("/actividades");
    }, 1200);
  };

  // =====================================
  // UI
  // =====================================
  return (
    <div className="app-layout">

      {/* LEFT */}
      <div className="left-panel">
        <h4>💡 Acompañamiento</h4>

        <div className="quote-box">
          {frase}
        </div>

        <div
          style={{
            marginTop: 20,
            color: "#00e5ff",
          }}
        >
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

        <button
          onClick={() => navigate("/rutina")}
        >
          🧘 Rutina
        </button>

        <button
          onClick={() => navigate("/actividades")}
        >
          🎯 AActividades
        </button>

        <button
          onClick={() => navigate("/estadisticas")}
        >
          📊 Estadísticas
        </button>

        <button
          onClick={() => navigate("/diario")}
        >
          📓 Diario
        </button>

      </div>
    </div>
  );
}
