import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";

const API_URL = "https://empatia-backend.onrender.com";

const yesNoOptions = ["Sí", "No"];

const mainOptions = ["🎵 Música", "🧘 Relajación", "🏃 Actividad física"];

const groups = {
  musica: ["Lo-fi", "Piano", "Jazz", "Cantar"],
  relajacion: ["Respirar profundo", "Meditar", "Estiramientos"],
  fisica: ["Caminar", "Bailar", "Yoga"],
};

export default function User() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario"));

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState("normal");

  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre || "🤍"}` },
      { role: "ai", text: "Cuéntame cómo te sientes..." },
    ]);
  }, []);

  // =========================
  // GUARDAR
  // =========================
  const saveActivity = async (name) => {
    await fetch(`${API_URL}/registro-actividad`, {
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
  };

  // =========================
  // SEND
  // =========================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;
    setInput("");

    setMessages((p) => [...p, { role: "user", text }]);

    if (step === "confirm") {
      if (text.includes("si")) {
        setMessages((p) => [
          ...p,
          { role: "ai", text: "Elige categoría:", options: mainOptions },
        ]);
        setStep("menu");
      } else {
        setMessages((p) => [...p, { role: "ai", text: "🤍 ok" }]);
        setStep("normal");
      }
      return;
    }

    if (text.toLowerCase().includes("aburr")) {
      setMessages((p) => [
        ...p,
        { role: "ai", text: "¿Quieres actividad?", options: yesNoOptions },
      ]);
      setStep("confirm");
      return;
    }

    setMessages((p) => [...p, { role: "ai", text: "🤍 ..." }]);
  };

  // =========================
  // CLICK OPCIONES
  // =========================
  const click = async (opt) => {
    setMessages((p) => [...p, { role: "user", text: opt }]);

    if (opt === "Sí") {
      setMessages((p) => [
        ...p,
        { role: "ai", text: "Elige:", options: mainOptions },
      ]);
      return;
    }

    if (opt === "No") {
      setMessages((p) => [
        ...p,
        { role: "ai", text: "🤍 aquí estoy" },
      ]);
      return;
    }

    const group =
      opt.includes("Música")
        ? "musica"
        : opt.includes("Relajación")
        ? "relajacion"
        : "fisica";

    if (groups[group]?.includes(opt)) {
      await saveActivity(opt);

      setMessages((p) => [
        ...p,
        { role: "ai", text: `✅ Guardado: ${opt}` },
      ]);

      setTimeout(() => navigate("/actividades"), 1000);
      return;
    }

    setMessages((p) => [
      ...p,
      { role: "ai", text: "Elige:", options: groups[group] },
    ]);
  };

  return (
    <div className="app-layout">

      <div className="left-panel">
        <h4>💡 EmpatIA</h4>
      </div>

      <div className="center-panel">
        <ChatBox messages={messages} onOptionClick={click} />

        <InputBox
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
        />
      </div>

      <div className="right-panel">
        <button onClick={() => navigate("/actividades")}>
          🎯 Actividades
        </button>
      </div>

    </div>
  );
}
