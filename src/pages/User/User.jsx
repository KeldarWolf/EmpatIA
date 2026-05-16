// ============================================
// src/pages/User/User.jsx
// ============================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URL =
  "https://empatia-backend.onrender.com";

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

  const user = JSON.parse(
    localStorage.getItem("usuario") || "null"
  );

  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [writingActivity, setWritingActivity] =
    useState(false);

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
  // IA
  // ============================================

  const askAI = async (message) => {

    try {

      const res = await fetch(
        `${API_URL}/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message,
          }),
        }
      );

      return await res.json();

    } catch (err) {

      console.log(err);

      return {
        ok: false,

        error: true,

        messages: [
          "⚠️ Error de conexión.",
          "🤍 Lo siento, ahora mismo no puedo conversar contigo.",
          "✨ ¿Quieres iniciar una actividad para sentirte mejor?",
        ],

        options: ["Sí", "No"],
      };
    }
  };

  // ============================================
  // SAVE ACTIVITY
  // ============================================

  const saveActivity = async (
    activityName
  ) => {

    try {

      const data = JSON.parse(
        localStorage.getItem("actividades")
        || "[]"
      );

      const nueva = {
        texto: activityName,
        fecha: new Date().toISOString(),
      };

      localStorage.setItem(
        "actividades",
        JSON.stringify([
          ...data,
          nueva,
        ])
      );

    } catch (err) {

      console.log(
        "Error guardando actividad"
      );
    }
  };

  // ============================================
  // SEND MESSAGE
  // ============================================

  const sendMessage = async () => {

    if (!input.trim() || loading)
      return;

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

    // =====================================
    // DETECTAR ACTIVIDADES
    // =====================================

    const lower = text.toLowerCase();

    const triggerWords = [
      "actividad",
      "actividades",
      "me siento mal",
      "mal",
      "triste",
      "solo",
      "vacío",
      "deprimido",
      "ansioso",
      "estresado",
      "no sé qué hacer",
      "nose que hacer",
      "ayuda",
    ];

    const detected =
      triggerWords.some((word) =>
        lower.includes(word)
      );

    if (detected) {

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "🤍 ¿Deseas iniciar una actividad para sentirte mejor?",
          options: ["Sí", "No"],
        },
      ]);

      setLoading(false);

      return;
    }

    // =====================================
    // WRITE ACTIVITY
    // =====================================

    if (writingActivity) {

      await saveActivity(text);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            `✅ Actividad guardada: ${text}`,
        },
        {
          role: "ai",
          text:
            "⏳ Redirigiendo a actividades...",
        },
      ]);

      setWritingActivity(false);

      setLoading(false);

      // =====================================
      // REDIRECT
      // =====================================

      setTimeout(() => {

        navigate("/actividades");

      }, 3000);

      return;
    }

    // =====================================
    // IA RESPONSE
    // =====================================

    const response =
      await askAI(text);

    // =====================================
    // ERROR IA
    // =====================================

    if (
      response?.error ||
      response?.ok === false
    ) {

      const msgs =
        response.messages || [];

      const opts =
        response.options || [];

      setMessages((prev) => [

        ...prev,

        ...msgs.map((m) => ({
          role: "ai",
          text: m,
        })),

        {
          role: "ai",
          text: "👇",
          options: opts,
        },
      ]);

      setLoading(false);

      return;
    }

    // =====================================
    // NORMAL RESPONSE
    // =====================================

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text:
          response.reply ||
          "🤍 No pude responder.",
      },
    ]);

    setLoading(false);
  };

  // ============================================
  // OPTIONS
  // ============================================

  const handleOptionClick = async (
    opt
  ) => {

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: opt,
      },
    ]);

    // =====================================
    // RESPUESTA ERROR IA
    // =====================================

    if (opt === "No") {

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "🤍 Está bien, sigo aquí contigo.",
        },
      ]);

      return;
    }

    if (opt === "Sí") {

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "✨ Elige una categoría:",
          options: mainOptions,
        },
      ]);

      return;
    }

    // =====================================
    // SUBMENUS
    // =====================================

    if (subOptions[opt]) {

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            `✨ Opciones de ${opt}:`,
          options:
            subOptions[opt],
        },
      ]);

      return;
    }

    // =====================================
    // ESCRIBIR ACTIVIDAD
    // =====================================

    if (
      opt.includes("Escribir")
    ) {

      setWritingActivity(true);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "✍️ Escribe tu actividad:",
        },
      ]);

      return;
    }

    // =====================================
    // NO SABE CUAL
    // =====================================

    if (
      opt.includes("No sé")
    ) {

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "✨ Aquí tienes opciones:",
          options:
            mainOptions,
        },
      ]);

      return;
    }

    // =====================================
    // GUARDAR ACTIVIDAD
    // =====================================

    await saveActivity(opt);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text:
          `✅ Actividad guardada: ${opt}`,
      },
      {
        role: "ai",
        text:
          "⏳ Redirigiendo a actividades...",
      },
    ]);

    // =====================================
    // REDIRECT
    // =====================================

    setTimeout(() => {

      navigate("/actividades");

    }, 3000);
  };

  // ============================================
  // UI
  // ============================================

  return (
    <div className="app-layout">

      {/* LEFT */}

      <div className="left-panel">

        <h4>
          💡 Acompañamiento
        </h4>

        <div className="quote-box">
          {frase}
        </div>

        <div
          style={{
            marginTop: 20,
            color: "#00e5ff",
          }}
        >
          👤 {
            user?.nombre ||
            "Usuario"
          }
        </div>

      </div>

      {/* CENTER */}

      <div className="center-panel">

        <ChatBox
          messages={messages}
          onOptionClick={
            handleOptionClick
          }
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
          onClick={() =>
            navigate("/rutina")
          }
        >
          🧘 Rutina
        </button>

        <button
          onClick={() =>
            navigate("/actividades")
          }
        >
          🎯 Actividades
        </button>

        <button
          onClick={() =>
            navigate("/estadisticas")
          }
        >
          📊 Estadísticas
        </button>

        <button
          onClick={() =>
            navigate("/diario")
          }
        >
          📓 Diario
        </button>

      </div>

    </div>
  );
}
