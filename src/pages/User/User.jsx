// ============================================
// src/pages/User/User.jsx
// ============================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URL = "https://empatia-backend.onrender.com";

// ============================================
// MENU PRINCIPAL
// ============================================

const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
  "✍️ Escribir actividad",
  "❓ No sé cuál",
];

// ============================================
// SUBMENUS
// ============================================

const subOptions = {
  "🎵 Música": [
    "Lo-fi",
    "Piano suave",
    "Música relajante",
    "Sonidos lluvia",
    "Cantar",
  ],

  "🧘 Relajación": [
    "Respirar profundo",
    "Meditar",
    "Estiramientos",
    "Cerrar ojos",
    "Ducha relajante",
  ],

  "🏃 Actividad física": [
    "Caminar",
    "Yoga",
    "Bailar",
    "Mover cuerpo",
    "Trotar suave",
  ],
};

export default function User() {
  const navigate = useNavigate();

  // ============================================
  // PROTECCIÓN REAL (SIN useEffect / SIN BUGS)
  // ============================================

  const user = JSON.parse(
    sessionStorage.getItem("usuario") || "null"
  );

  if (!user) {
    navigate("/", { replace: true });
    return null;
  }

  // ============================================
  // STATES
  // ============================================

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [writingActivity, setWritingActivity] = useState(false);
  const [frase, setFrase] = useState("");

  // ============================================
  // INIT
  // ============================================

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

  // ============================================
  // IA REQUEST
  // ============================================

  const askAI = async (message) => {
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      return await res.json();
    } catch (err) {
      console.log(err);

      return {
        ok: false,
        error: true,
        messages: [
          "⚠️ Error de conexión.",
          "🤍 No puedo responder ahora.",
          "✨ ¿Quieres iniciar una actividad?",
        ],
        options: ["Sí", "No"],
      };
    }
  };

  // ============================================
  // SAVE ACTIVITY
  // ============================================

  const saveActivity = async (activityName) => {
    try {
      const data = JSON.parse(
        sessionStorage.getItem("actividades") || "[]"
      );

      const nueva = {
        texto: activityName,
        fecha: new Date().toISOString(),
      };

      sessionStorage.setItem(
        "actividades",
        JSON.stringify([...data, nueva])
      );
    } catch {
      console.log("Error guardando actividad");
    }
  };

  // ============================================
  // SEND MESSAGE
  // ============================================

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", text },
    ]);

    setInput("");
    setLoading(true);

    const lower = text.toLowerCase();

    const triggerWords = [
      "actividad",
      "triste",
      "solo",
      "vacío",
      "deprimido",
      "ansioso",
      "estresado",
      "ayuda",
      "no sé qué hacer",
    ];

    const detected = triggerWords.some((w) =>
      lower.includes(w)
    );

    if (detected) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🤍 ¿Deseas iniciar una actividad?",
          options: ["Sí", "No"],
        },
      ]);

      setLoading(false);
      return;
    }

    if (writingActivity) {
      await saveActivity(text);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `✅ Actividad guardada: ${text}`,
        },
        {
          role: "ai",
          text: "⏳ Redirigiendo...",
        },
      ]);

      setWritingActivity(false);
      setLoading(false);

      setTimeout(() => {
        navigate("/actividades", { replace: true });
      }, 2000);

      return;
    }

    const response = await askAI(text);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: response.reply || "🤍 No pude responder.",
        options: response.options || [],
      },
    ]);

    setLoading(false);
  };

  // ============================================
  // OPTIONS HANDLER
  // ============================================

  const handleOptionClick = async (opt) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", text: opt },
    ]);

    if (opt === "No") {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "🤍 Estoy contigo." },
      ]);
      return;
    }

    if (opt === "Sí") {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "✨ Elige una categoría:",
          options: mainOptions,
        },
      ]);
      return;
    }

    if (subOptions[opt]) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `✨ Opciones de ${opt}:`,
          options: subOptions[opt],
        },
      ]);
      return;
    }

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

    await saveActivity(opt);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: `✅ Guardado: ${opt}`,
      },
      {
        role: "ai",
        text: "⏳ Redirigiendo...",
      },
    ]);

    setTimeout(() => {
      navigate("/actividades", { replace: true });
    }, 2000);
  };

  // ============================================
  // UI
  // ============================================

  return (
    <div className="app-layout">

      <div className="left-panel">
        <h4>💡 Acompañamiento</h4>

        <div className="quote-box">{frase}</div>

        <div style={{ marginTop: 20, color: "#00e5ff" }}>
          👤 {user?.nombre || "Usuario"}
        </div>
      </div>

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

      <div className="right-panel">
        <button onClick={() => navigate("/rutina")}>
          🧘 Rutina
        </button>

        <button onClick={() => navigate("/actividades")}>
          🎯 Actividades
        </button>

        <button onClick={() => navigate("/estadisticas")}>
          📊 Estadísticas
        </button>

        <button onClick={() => navigate("/diario")}>
          📓 Diario
        </button>
      </div>

    </div>
  );
}
