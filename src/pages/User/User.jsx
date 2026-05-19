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
// MENÚS
// ============================================

const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
  "✍️ Escribir actividad",
  "❓ No sé cuál",
];

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

// ============================================
// FRASES ACTIVIDAD
// ============================================

const activityPrompts = [
  "🤍 ¿Te gustaría probar una actividad?",

  "🌱 A veces ayuda hacer algo pequeño, ¿quieres intentar una actividad?",

  "✨ Podemos probar una actividad para distraerte un rato, ¿te gustaría?",

  "🤍 Quizás una actividad podría ayudarte un poco, ¿quieres probar?",

  "🌿 Podemos hacer algo tranquilo juntos, ¿te gustaría?",
];

// ============================================
// FRASES CONTINUAR CONVERSACIÓN
// ============================================

const continuePrompts = [
  "🤍 Entiendo, podemos seguir hablando.",

  "🌱 comprendo, cuéntame un poco más.",

  "🤍 Estoy aquí contigo, si quieres seguir conversando te leo.",

  "🌿 Entiendo, Podemos conversar un rato si quieres.",

];

export default function User() {
  const navigate = useNavigate();

  // ============================================
  // SESSION
  // ============================================

  const storedUser = JSON.parse(
    sessionStorage.getItem("usuario") || "null"
  );

  const user = {
    id_usuario:
      storedUser?.id_usuario ||
      storedUser?.user?.id_usuario ||
      storedUser?.id ||
      null,

    nombre:
      storedUser?.nombre ||
      storedUser?.user?.nombre ||
      "Usuario",
  };

  // ============================================
  // FIX LOGIN
  // ============================================

  useEffect(() => {
    if (!user.id_usuario) {
      navigate("/", { replace: true });
    }
  }, []);

  // ============================================
  // STATES
  // ============================================

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
        text: `Hola ${user.nombre}, estoy aquí contigo.`,
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
        reply: "🤍 No puedo responder ahora.",
        options: [],
      };
    }
  };

  // ============================================
  // SAVE ACTIVITY
  // ============================================

  const saveActivity = async (activityName) => {
    try {
      const payload = {
        id_usuario: Number(user.id_usuario),
        nombre_actividad: activityName,
        puntaje_agrado: 5,
        frecuencia_deseada: "media",
        reaccion: "",
      };

      const res = await fetch(
        `${API_URL}/api/registro-actividad`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "error");
      }

      return data;
    } catch (err) {
      console.log(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "❌ No pude guardar la actividad",
        },
      ]);

      return null;
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
      {
        role: "user",
        text,
      },
    ]);

    setInput("");
    setLoading(true);

    const lower = text.toLowerCase();

    // ============================================
    // ACTIVADORES
    // ============================================

    const triggerWords = [
      "actividad",
      "actividades",
      "activdad",
      "hacer algo",
      "algo para hacer",
      "qué hago",
      "que hago",
      "q hago",
      "no sé qué hacer",
      "no se que hacer",
      "nose que hacer",
      "que puedo hacer",
      "q puedo hacer",
      "quiero hacer algo",
      "algo entretenido",
      "algo divertido",
      "panorama",
      "panoramas",
      "plan",
      "planes",
      "salir",
      "quiero salir",
      "distraerme",
      "quiero distraerme",
      "despejarme",
      "quiero despejarme",
      "relajarme",
      "quiero relajarme",
      "pasatiempo",
      "hobby",
      "recomiendame algo",
      "recomienda algo",
      "dame ideas",
      "ideas",
      "algo nuevo",
      "que actividad hago",
      "actividad para hoy",
      "actividad para hacer",
      "que hago hoy",
      "hacer alguna cosa",
      "quiero un panorama",
      "algo interesante",
      "algo distinto",

      // MODISMOS CHILENOS
      "toy pato",
      "toy libre",
      "que se hace",
      "que se puede hacer",
      "sus panoramas",
      "algun panorama",
      "alguna actividad",
      "apañar",
      "quien apaña",
      "algo piola",
      "algo tranqui",
      "algo pa hacer",
      "panorama piola",
      "panorama tranqui",
      "salir un rato",
      "hacer alguna wea",
      "algo pa hoy",
      "que hay pa hacer",
      "que hay para hacer",
    ];

    const detected = triggerWords.some((w) =>
      lower.includes(w)
    );

    // ============================================
    // ESCRIBIR ACTIVIDAD
    // ============================================

    if (writingActivity) {
      const saved = await saveActivity(text);

      if (saved) {
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

        setTimeout(() => {
          navigate("/actividades", {
            replace: true,
          });
        }, 1200);
      }

      setLoading(false);
      return;
    }

    // ============================================
    // IA
    // ============================================

    const response = await askAI(text);

    // ============================================
    // DETECTA ACTIVIDAD
    // ============================================
// ============================================
// DETECTA ACTIVIDAD
// ============================================

if (detected) {

  const randomActivityPrompt =
    activityPrompts[
      Math.floor(
        Math.random() * activityPrompts.length
      )
    ];

  const randomContinuePrompt =
    continuePrompts[
      Math.floor(
        Math.random() * continuePrompts.length
      )
    ];

  const aiReply =
    response.reply ||
    "🤍 Estoy aquí contigo.";

  setMessages((prev) => [
    ...prev,
    {
      role: "ai",

      text:
        `${aiReply}\n\n` +
        `${randomContinuePrompt}\n\n` +
        `${randomActivityPrompt}`,

      options: ["Sí", "No"],
    },
  ]);

  setLoading(false);
  return;
}
    // ============================================
    // RESPUESTA NORMAL
    // ============================================

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: response.reply,
        options: response.options || [],
      },
    ]);

    setLoading(false);
  };

  // ============================================
  // OPTIONS
  // ============================================

  const handleOptionClick = async (opt) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: opt,
      },
    ]);

    // ============================================
    // NO
    // ============================================

    if (opt === "No") {

      const randomContinuePrompt =
        continuePrompts[
          Math.floor(
            Math.random() * continuePrompts.length
          )
        ];

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: randomContinuePrompt,
        },
      ]);

      return;
    }

    // ============================================
    // SI
    // ============================================

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

    // ============================================
    // SUB MENÚ
    // ============================================

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

    // ============================================
    // ESCRIBIR ACTIVIDAD
    // ============================================

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

    // ============================================
    // NO SÉ CUÁL
    // ============================================

    if (opt === "❓ No sé cuál") {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "🤍 Podrías probar algo suave como escuchar música o caminar un rato.",
          options: [
            "🎵 Música",
            "🏃 Actividad física",
          ],
        },
      ]);

      return;
    }

    // ============================================
    // GUARDAR ACTIVIDAD
    // ============================================

    const saved = await saveActivity(opt);

    if (saved) {
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
        navigate("/actividades", {
          replace: true,
        });
      }, 1200);
    }
  };

  // ============================================
  // UI
  // ============================================

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
          👤 {user.nombre}
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
          🎯 Actividades
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
