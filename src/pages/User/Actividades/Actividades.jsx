import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URL = "https://empatia-backend.onrender.com";

// =========================
// ACTIVIDADES BASE (MENÚ 6 OPCIONES)
// =========================
const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
  "🤍 Hablar un poco",
  "❓ No sé qué hacer",
  "✍️ Escribir actividad",
];

// =========================
// GRUPOS (IA ayuda opcional)
// =========================
const activityGroups = {
  musica: [
    "Playlist relajante",
    "Lo-fi",
    "Música instrumental",
    "Piano",
    "Jazz suave",
  ],
  relajacion: [
    "Respirar profundo",
    "Meditar",
    "Estiramientos",
    "Tomar agua",
    "Relajar cuerpo",
  ],
  fisica: [
    "Caminar",
    "Bailar",
    "Yoga",
    "Trotar suave",
    "Mover cuerpo",
  ],
};

export default function User() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");

  const [loading, setLoading] = useState(false);
  const [waitingYesNo, setWaitingYesNo] = useState(false);
  const [writingActivity, setWritingActivity] = useState(false);

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre || "🤍"}, estoy aquí.` },
      { role: "ai", text: "Cuéntame cómo te sientes..." },
    ]);

    const interval = setInterval(() => {
      setFrase(frases[Math.floor(Math.random() * frases.length)]);
    }, 8000);

    return () => clearInterval(interval);
  }, [user?.nombre]);

  // =========================
  // IA CALL
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
  // GUARDAR EN SUPABASE (INTERACCION)
  // =========================
  const saveInteraction = async (userMsg, aiReply) => {
    if (!user?.id_usuario) return;

    try {
      await fetch(`${API_URL}/api/interaccion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          mensaje_usuario: userMsg,
          respuesta_sistema: aiReply,
          fecha_hora: new Date().toISOString(),
          emocion_detectada: null,
        }),
      });
    } catch (e) {
      console.log("Error guardando interacción");
    }
  };

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    // =========================
    // ESCRIBIR ACTIVIDAD (BD)
    // =========================
    if (writingActivity) {
      try {
        await fetch(`${API_URL}/actividades-personalizadas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_usuario: user.id_usuario,
            nombre: text,
            descripcion: "Actividad personalizada por usuario",
            categoria: "personalizada",
          }),
        });

        setMessages((prev) => [
          ...prev,
          { role: "ai", text: `✅ Guardado en BD: ${text}` },
        ]);

        setWritingActivity(false);
        setTimeout(() => navigate("/actividades"), 1200);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "❌ Error guardando actividad" },
        ]);
      }

      setLoading(false);
      return;
    }

    // =========================
    // IA
    // =========================
    const response = await askAI(text);

    if (!response) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "🤍 No pude conectar con la IA" },
        {
          role: "ai",
          text: "¿Quieres hacer una actividad?",
          options: ["Sí", "No"],
        },
      ]);

      setWaitingYesNo(true);
      setLoading(false);
      return;
    }

    // =========================
    // ERROR IA
    // =========================
    if (response.errorType) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: response.reply },
        {
          role: "ai",
          text: "¿Quieres iniciar una actividad?",
          options: ["Sí", "No"],
        },
      ]);

      setWaitingYesNo(true);
      setLoading(false);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: response.reply },
    ]);

    // guardar conversación en BD
    await saveInteraction(text, response.reply);

    setLoading(false);
  };

  // =========================
  // OPTIONS FLOW (6 OPCIONES)
  // =========================
  const handleOptionClick = async (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    // SI / NO
    if (opt === "Sí") {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Elige una actividad:",
          options: mainOptions,
        },
      ]);
      setWaitingYesNo(false);
      return;
    }

    if (opt === "No") {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "🤍 Estoy contigo igual." },
      ]);
      setWaitingYesNo(false);
      return;
    }

    // ESCRIBIR
    if (opt.includes("Escribir")) {
      setWritingActivity(true);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "✍️ Escribe tu actividad:" },
      ]);

      return;
    }

    // =========================
    // GUARDAR ACTIVIDAD EN SUPABASE
    // =========================
    try {
      await fetch(`${API_URL}/registro-actividad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          id_actividad: null,
          puntaje_agrado: 5,
          frecuencia_deseada: "media",
          reaccion: opt,
        }),
      });

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `✅ Actividad registrada: ${opt}` },
      ]);

      setTimeout(() => navigate("/actividades"), 1200);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "❌ Error guardando actividad" },
      ]);
    }
  };

  // =========================
  // UI
  // =========================
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
        <button onClick={() => navigate("/rutina")}>🧘 Rutina</button>
        <button onClick={() => navigate("/actividades")}>🎯 Actividades</button>
        <button onClick={() => navigate("/estadisticas")}>📊 Estadísticas</button>
        <button onClick={() => navigate("/diario")}>📓 Diario</button>
      </div>

    </div>
  );
}
