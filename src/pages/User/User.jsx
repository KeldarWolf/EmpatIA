import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://empatia-backend.onrender.com";

// =========================
// OPCIONES PRINCIPALES (6)
// =========================
const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
  "🤍 Hablar un poco",
  "⚙️ Cambiar preguntas fáciles",
  "❓ No sé qué hacer",
];

// =========================
// SUB OPCIONES
// =========================
const subOptions = {
  musica: ["Lo-fi", "Piano", "Jazz", "Música feliz", "Naturaleza"],
  relajacion: ["Respirar profundo", "Meditar", "Cerrar ojos", "Tomar agua"],
  fisico: ["Caminar", "Yoga", "Estiramientos", "Bailar", "Mover cuerpo"],
};

export default function User() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState("main");
  const [category, setCategory] = useState(null);

  // =========================
  // INIT CHAT
  // =========================
  useEffect(() => {
    setMessages([
      { role: "ai", text: `Hola ${user?.nombre || "🤍"}, estoy contigo.` },
      { role: "ai", text: "Elige una opción:" },
      { role: "ai", options: mainOptions },
    ]);
  }, []);

  // =========================
  // IA CALL
  // =========================
  const askAI = async (message) => {
    try {
      const res = await fetch(`${API}/chat`, {
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
  // SUPABASE SAVE
  // =========================
  const saveActivity = async (text) => {
    if (!user?.id_usuario) return;

    try {
      await fetch(`${API}/registro-actividad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          id_actividad: null,
          puntaje_agrado: 6,
          frecuencia_deseada: "media",
          reaccion: text,
        }),
      });
    } catch (e) {
      console.log("Error guardando actividad");
    }
  };

  // =========================
  // HANDLER PRINCIPAL
  // =========================
  const handleOption = async (opt) => {
    setMessages((prev) => [...prev, { role: "user", text: opt }]);

    // =========================
    // MENÚ PRINCIPAL
    // =========================
    if (opt === "🎵 Música") {
      setMode("sub");
      setCategory("musica");

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Elige música:" },
        { role: "ai", options: subOptions.musica },
      ]);
      return;
    }

    if (opt === "🧘 Relajación") {
      setMode("sub");
      setCategory("relajacion");

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Elige relajación:" },
        { role: "ai", options: subOptions.relajacion },
      ]);
      return;
    }

    if (opt === "🏃 Actividad física") {
      setMode("sub");
      setCategory("fisico");

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Elige actividad física:" },
        { role: "ai", options: subOptions.fisico },
      ]);
      return;
    }

    // =========================
    // CAMBIAR PREGUNTAS
    // =========================
    if (opt === "⚙️ Cambiar preguntas fáciles") {
      setMode("main");
      setCategory(null);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "🔄 Reiniciando menú..." },
        { role: "ai", options: mainOptions },
      ]);
      return;
    }

    // =========================
    // NO SÉ
    // =========================
    if (opt === "❓ No sé qué hacer") {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Te ayudo 🤍 elige una:",
          options: mainOptions,
        },
      ]);
      return;
    }

    // =========================
    // HABLAR
    // =========================
    if (opt === "🤍 Hablar un poco") {
      const response = await askAI("habla conmigo");

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: response?.reply || "Estoy contigo 🤍" },
      ]);

      await saveActivity("hablar");
      return;
    }

    // =========================
    // SUB OPCIONES (ACTIVIDAD FINAL)
    // =========================
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: `✔ Actividad seleccionada: ${opt}`,
      },
      {
        role: "ai",
        text: "La he guardado para ti 🤍",
      },
    ]);

    await saveActivity(opt);

    setTimeout(() => navigate("/actividades"), 1000);
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: 20, background: "#0b0f14", color: "white" }}>

      <h2>🤍 EmpatIA</h2>

      <div>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 12 }}>

            <div>
              {m.role === "ai" ? "🤖 " : "👤 "}
              {m.text}
            </div>

            {m.options && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {m.options.map((opt, j) => (
                  <button
                    key={j}
                    onClick={() => handleOption(opt)}
                    style={{
                      padding: 10,
                      marginTop: 5,
                      borderRadius: 8,
                      border: "none",
                      background: "#1f2937",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/actividades")}
        style={{
          marginTop: 20,
          padding: 10,
          background: "#1d9bf0",
          border: "none",
          color: "white",
          borderRadius: 8,
        }}
      >
        🎯 Ver actividades
      </button>

    </div>
  );
}
