import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://empatia-backend.onrender.com";

export default function Actividades() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [activities, setActivities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // =========================
  // CARGAR BD
  // =========================
  const loadActivities = async () => {
    try {
      const res = await fetch(`${API}/actividades`);
      const data = await res.json();
      setActivities(data || []);
    } catch {
      setActivities([]);
    }
  };

  useEffect(() => {
    loadActivities();

    setMessages([
      { role: "ai", text: "Explora tus actividades 🤍" },
    ]);
  }, []);

  // =========================
  // IA
  // =========================
  const askAI = async (message) => {
    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    return data.reply;
  };

  // =========================
  // REGISTRAR USO
  // =========================
  const registerActivity = async (activity) => {
    if (!user?.id_usuario) return;

    await fetch(`${API}/registro-actividad`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: user.id_usuario,
        id_actividad: activity.id_actividad,
        puntaje_agrado: 7,
        frecuencia_deseada: "media",
        reaccion: "vista",
      }),
    });
  };

  // =========================
  // CLICK ACTIVIDAD
  // =========================
  const openActivity = async (activity) => {
    setMessages([
      { role: "ai", text: `🧠 ${activity.nombre}` },
      { role: "ai", text: "Preparando guía..." },
    ]);

    const reply = await askAI(
      `Explícame paso a paso: ${activity.nombre}`
    );

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: reply },
    ]);

    await registerActivity(activity);
  };

  return (
    <div style={{ padding: 20, background: "#0b0f14", color: "white" }}>
      <h1>🎯 Actividades</h1>

      <button onClick={() => navigate("/user")}>⬅ Volver</button>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        
        {/* LISTA */}
        <div style={{ width: "50%" }}>
          {activities.map((a) => (
            <div
              key={a.id_actividad}
              style={{
                background: "#111827",
                padding: 12,
                marginBottom: 10,
                borderRadius: 10,
                cursor: "pointer",
              }}
              onClick={() => openActivity(a)}
            >
              <h3>{a.nombre}</h3>
              <p>{a.descripcion}</p>
            </div>
          ))}
        </div>

        {/* CHAT */}
        <div style={{ width: "50%" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              {m.role === "ai" ? "🤖 " : "👤 "}
              {m.text}
            </div>
          ))}

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ width: "80%" }}
          />
        </div>
      </div>
    </div>
  );
}
