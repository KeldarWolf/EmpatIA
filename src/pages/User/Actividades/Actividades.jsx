import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

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
  const user = JSON.parse(localStorage.getItem("usuario"));

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState("chat");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre}` },
      { role: "ai", text: "Cuéntame cómo te sientes..." },
    ]);
  }, []);

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
          "🤍 La IA no está disponible, pero puedo ayudarte con una actividad.",
      };
    }
  };

  const saveActivity = async (name) => {
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
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input.toLowerCase();

    setMessages((p) => [...p, { role: "user", text: input }]);
    setInput("");

    if (
      text.includes("actividad") ||
      text.includes("no sé")
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

    const res = await askAI(text);

    setMessages((p) => [...p, { role: "ai", text: res.reply }]);
  };

  const handleOption = async (opt) => {
    setMessages((p) => [...p, { role: "user", text: opt }]);

    if (step === "confirm") {
      if (opt === "Sí") {
        setStep("menu");

        setMessages((p) => [
          ...p,
          { role: "ai", text: "Elige una categoría:", options: mainOptions },
        ]);
      } else {
        setStep("chat");
        setMessages((p) => [
          ...p,
          { role: "ai", text: "Estoy aquí si me necesitas 🤍" },
        ]);
      }
      return;
    }

    if (subOptions[opt]) {
      setMessages((p) => [
        ...p,
        { role: "ai", text: "Elige una actividad:", options: subOptions[opt] },
      ]);
      return;
    }

    await saveActivity(opt);

    setMessages((p) => [
      ...p,
      { role: "ai", text: "✅ Actividad guardada, redirigiendo..." },
    ]);
  };

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
