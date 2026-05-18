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

  // FIX LOGIN
  useEffect(() => {
    if (!user.id_usuario) {
      console.log("❌ NO HAY USUARIO");
      navigate("/", { replace: true });
    }
  }, []);

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
        options: ["Sí", "No"],
      };
    }
  };

  // ============================================
  // SAVE ACTIVITY
  // ============================================

  const saveActivity = async (activityName) => {
    try {
      console.log("🟢 GUARDANDO ACTIVIDAD");

      const payload = {
        id_usuario: Number(user.id_usuario),
        nombre_actividad: activityName,
        puntaje_agrado: 5,
        frecuencia_deseada: "media",
        reaccion: "",
      };

      console.log("📦 PAYLOAD:", payload);

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

      console.log("✅ RESPUESTA:", data);

      if (!res.ok) {
        throw new Error(data.error || "error");
      }

      return data;
    } catch (err) {
      console.log("❌ ERROR SAVE ACTIVITY:", err);

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
      "triste",
      "solo",
      "vacío",
      "deprimido",
      "ansioso",
      "estresado",
      "ayuda",
      "mal",
      "aburrido",
      "aburrida",
      "no sé qué hacer",
    ];

    const detected = triggerWords.some((w) =>
      lower.includes(w)
    );

    // ============================================
    // DETECTA ACTIVIDAD
    // ============================================

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
    // IA NORMAL
    // ============================================

    const response = await askAI(text);

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
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "🤍 Estoy contigo.",
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
    // GUARDAR ACTIVIDAD DIRECTA
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
