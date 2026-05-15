import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://empatia-backend.onrender.com";

export default function Actividades() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("usuario"));

  const [actividades, setActividades] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // CARGAR ACTIVIDADES BD
  // =========================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/actividades`);
        const data = await res.json();

        setActividades(data || []);

        setMessages([
          { role: "ai", text: "Aquí están tus actividades 🤍" },
          { role: "ai", text: "Haz click en una para ver detalles" },
        ]);
      } catch (err) {
        setMessages([
          { role: "ai", text: "Error cargando actividades 😢" },
        ]);
      }
    };

    load();
  }, []);

  // =========================
  // IA (fallback backend)
  // =========================
  const askAI = async (message) => {
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      return data.reply || "No pude responder";
    } catch {
      return "Error de conexión 😢";
    }
  };

  // =========================
  // ENVIAR MENSAJE
  // =========================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    const reply = await askAI(text);

    setMessages((prev) => [...prev, { role: "ai", text: reply }]);

    setLoading(false);
  };

  // =========================
  // CLICK ACTIVIDAD
  // =========================
  const openActivity = async (act) => {
    setSelected(act);

    setMessages([
      { role: "ai", text: `🧠 ${act.nombre}` },
      { role: "ai", text: "Preparando guía..." },
    ]);

    const reply = await askAI(
      `Explícame paso a paso cómo hacer: ${act.nombre}. ${act.descripcion || ""}`
    );

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: "👉 Guía:" },
      { role: "ai", text: reply },
    ]);

    // =========================
    // GUARDAR EN BD
    // =========================
    await fetch(`${API}/registro-actividad`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: user.id_usuario,
        id_actividad: act.id_actividad,
        puntaje_agrado: 5,
        frecuencia_deseada: "media",
        reaccion: "vista",
      }),
    });
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <h2>🎯 Actividades</h2>

        <button
          style={styles.back}
          onClick={() => navigate("/user")}
        >
          ⬅ Volver
        </button>
      </div>

      <div style={styles.container}>

        {/* CHAT */}
        <div style={styles.chat}>
          <h3>💬 IA</h3>

          <div style={styles.box}>
            {messages.map((m, i) => (
              <div key={i} style={styles.msg}>
                {m.role === "ai" ? "🤖 " : "👤 "}
                {m.text}
              </div>
            ))}
          </div>

          <div style={styles.row}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={styles.input}
              placeholder="Escribe..."
            />

            <button onClick={sendMessage} style={styles.btn}>
              Enviar
            </button>
          </div>
        </div>

        {/* LISTA ACTIVIDADES */}
        <div style={styles.list}>
          <h3>📌 Catálogo</h3>

          {actividades.map((a) => (
            <div
              key={a.id_actividad}
              style={styles.card}
              onClick={() => openActivity(a)}
            >
              <h4>{a.nombre}</h4>
              <p style={{ fontSize: 12, opacity: 0.7 }}>
                {a.categoria}
              </p>
              <p style={{ fontSize: 12 }}>
                {a.descripcion}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// =========================
// ESTILOS
// =========================
const styles = {
  page: {
    height: "100vh",
    background: "#0b0f14",
    color: "white",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: 15,
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #1f2937",
  },
  back: {
    background: "#1f2937",
    color: "white",
    border: "none",
    padding: 8,
    borderRadius: 8,
  },
  container: {
    display: "flex",
    flex: 1,
    gap: 10,
    padding: 10,
  },
  chat: {
    width: "30%",
    background: "#111827",
    padding: 10,
    borderRadius: 10,
  },
  list: {
    flex: 1,
    background: "#111827",
    padding: 10,
    borderRadius: 10,
  },
  box: {
    height: "60%",
    overflowY: "auto",
    marginBottom: 10,
  },
  msg: {
    padding: 8,
    marginBottom: 5,
    background: "#0f172a",
    borderRadius: 8,
    fontSize: 13,
  },
  row: {
    display: "flex",
    gap: 8,
  },
  input: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    border: "none",
    background: "#0f172a",
    color: "white",
  },
  btn: {
    padding: 8,
    background: "#1d9bf0",
    border: "none",
    borderRadius: 8,
    color: "white",
  },
  card: {
    padding: 10,
    background: "#0f172a",
    marginBottom: 10,
    borderRadius: 10,
    cursor: "pointer",
  },
};
