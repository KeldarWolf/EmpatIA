import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatBox from "./ChatBox";
import InputBox from "./InputBox";

const API_URL = "https://empatia-backend.onrender.com";

const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
  "✍️ Escribir actividad",
  "❓ No sé qué hacer",
];

const subOptions = {
  "🎵 Música": ["Lo-fi", "Piano", "Jazz"],
  "🧘 Relajación": ["Respirar", "Meditar", "Ducha"],
  "🏃 Actividad física": ["Caminar", "Bailar", "Yoga"],
};

export default function User() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState("chat");
  const [loading, setLoading] = useState(false);

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    setMessages([
      {
        role: "ai",
        text: `Hola ${user?.nombre || "Usuario"}`,
      },
      {
        role: "ai",
        text: "Cuéntame cómo te sientes...",
      },
    ]);
  }, []);

  // =========================
  // VALIDAR USER
  // =========================
  const ensureUser = () => {
    if (!user?.id_usuario) {
      console.log("❌ Usuario no logueado");
      return false;
    }
    return true;
  };

  // =========================
  // IA (backend)
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
        reply: "🤍 La IA no está disponible ahora.",
      };
    }
  };

  // =========================
  // GUARDAR ACTIVIDAD BD
  // =========================
  const saveActivity = async (name) => {
    if (!ensureUser()) return;

    try {
      const res = await fetch(`${API_URL}/api/registro-actividad`, {
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

      const data = await res.json();

      if (!res.ok) {
        console.log("❌ Error backend:", data);
        return;
      }

      console.log("✅ Guardado:", data);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "✅ Actividad guardada correctamente" },
      ]);

      navigate("/actividades");

    } catch (err) {
      console.log("❌ Error fetch:", err);
    }
  };

  // =========================
  // INPUT
  // =========================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input.trim().toLowerCase();

    setMessages((p) => [...p, { role: "user", text: input }]);
    setInput("");

    // trigger actividad
    if (
      text.includes("actividad") ||
      text.includes("no sé") ||
      text.includes("nose")
    ) {
      setStep("confirm");

      setMessages((p) => [
        ...p,
        {
          role: "ai",
          text: "¿Deseas iniciar una actividad para sentirte mejor?",
          options: ["Sí", "No"],
        },
      ]);

      return;
    }

    setLoading(true);

    const res = await askAI(text);

    setMessages((p) => [...p, { role: "ai", text: res.reply }]);

    setLoading(false);
  };

  // =========================
  // OPTIONS CLICK
  // =========================
  const handleOption = async (opt) => {
    const clean = opt.trim();

    setMessages((p) => [...p, { role: "user", text: clean }]);

    // CONFIRM FLOW
    if (step === "confirm") {
      if (clean === "Sí") {
        setStep("menu");

        setMessages((p) => [
          ...p,
          {
            role: "ai",
            text: "Elige una categoría:",
            options: mainOptions,
          },
        ]);
      } else {
        setStep("chat");

        setMessages((p) => [
          ...p,
          {
            role: "ai",
            text: "Estoy aquí si me necesitas 🤍",
          },
        ]);
      }
      return;
    }

    // SUBMENU
    if (subOptions[clean]) {
      setMessages((p) => [
        ...p,
        {
          role: "ai",
          text: "Elige una actividad:",
          options: subOptions[clean],
        },
      ]);
      return;
    }

    // FINAL SAVE
    await saveActivity(clean);
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="app-layout">
      <ChatBox messages={messages} onOptionClick={handleOption} />

      <InputBox
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        loading={loading}
      />
    </div>
  );
}
