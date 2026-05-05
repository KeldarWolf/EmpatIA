import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Motivacion() {
  const navigate = useNavigate();

  const frases = [
    "Hoy es un buen día para empezar de nuevo 🤍",
    "No tienes que poder con todo, solo con el siguiente paso",
    "Lo estás haciendo mejor de lo que crees",
    "Respira… estás avanzando aunque no lo veas",
    "Tu proceso es válido, incluso si es lento",
    "No estás solo/a en esto",
    "Cada pequeño avance cuenta",
    "Confía en tu ritmo",
  ];

  const acciones = [
    "Respirar profundo 1 minuto",
    "Tomar agua y descansar",
    "Salir a caminar un poco",
    "Escuchar música tranquila",
    "Escribir lo que sientes",
    "Estirarte suavemente",
  ];

  const [msg, setMsg] = useState([
    { role: "ai", text: "Estoy aquí contigo 🤍" },
    { role: "ai", text: "Vamos paso a paso, sin presión." },
  ]);

  const [input, setInput] = useState("");

  const randomFrase = () => {
    const f = frases[Math.floor(Math.random() * frases.length)];

    setMsg((prev) => [
      ...prev,
      { role: "ai", text: f },
    ]);
  };

  const randomAccion = () => {
    const a = acciones[Math.floor(Math.random() * acciones.length)];

    setMsg((prev) => [
      ...prev,
      { role: "ai", text: `Podrías intentar: ${a} 🤍` },
    ]);
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    setMsg((prev) => [
      ...prev,
      { role: "user", text: input },
      { role: "ai", text: "Te escucho 🤍 estoy contigo" },
    ]);

    setInput("");
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0 }}>🔥 Motivación</h1>
          <p style={{ margin: 0, opacity: 0.7 }}>
            Un impulso suave cuando lo necesitas
          </p>
        </div>

        <button
          onClick={() => navigate("/user")}
          style={styles.backBtn}
        >
          ⬅ Volver
        </button>
      </div>

      {/* BODY */}
      <div style={styles.grid}>

        {/* IZQUIERDA - CHAT */}
        <div style={styles.left}>
          <h3>💬 Acompañamiento</h3>

          <div style={styles.chat}>
            {msg.map((m, i) => (
              <div
                key={i}
                style={{
                  ...styles.msg,
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background:
                    m.role === "user" ? "#1d9bf0" : "#111827",
                }}
              >
                {m.role === "ai" ? "🤖 " : "👤 "}
                {m.text}
              </div>
            ))}
          </div>

          <div style={styles.inputRow}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe aquí..."
              style={styles.input}
            />
            <button onClick={sendMessage} style={styles.send}>
              Enviar
            </button>
          </div>
        </div>

        {/* CENTRO */}
        <div style={styles.center}>
          <h3>⚡ Impulsos rápidos</h3>

          <button onClick={randomFrase} style={styles.card}>
            💡 Darme una frase motivadora
          </button>

          <button onClick={randomAccion} style={styles.card}>
            🎯 Sugerir una acción pequeña
          </button>

          <div style={styles.note}>
            Puedes presionar tantas veces como quieras 🤍
          </div>
        </div>

        {/* DERECHA */}
        <div style={styles.right}>
          <h3>🧠 Recordatorio</h3>

          <div style={styles.tip}>
            “No necesitas estar bien todo el tiempo”
          </div>

          <div style={styles.tip}>
            “Descansar también es progreso”
          </div>

          <div style={styles.tip}>
            “Estás haciendo lo mejor que puedes”
          </div>

          <div style={styles.tip}>
            “Un día difícil no define tu vida”
          </div>
        </div>

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    height: "100vh",
    background: "#0b0f14",
    color: "white",
    fontFamily: "Arial",
    display: "flex",
    flexDirection: "column",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #1f2a37",
  },

  backBtn: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#1f2937",
    color: "white",
    cursor: "pointer",
  },

  grid: {
    flex: 1,
    display: "flex",
    gap: "15px",
    padding: "15px",
  },

  left: {
    width: "35%",
    background: "#0f1620",
    borderRadius: "12px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
  },

  chat: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "10px",
  },

  msg: {
    padding: "10px",
    borderRadius: "10px",
    fontSize: "13px",
  },

  inputRow: {
    display: "flex",
    gap: "10px",
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#111827",
    color: "white",
  },

  send: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#1d9bf0",
    color: "white",
    cursor: "pointer",
  },

  center: {
    flex: 1,
    background: "#0f1620",
    borderRadius: "12px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  card: {
    padding: "15px",
    background: "#111827",
    borderRadius: "10px",
    border: "none",
    color: "white",
    cursor: "pointer",
    textAlign: "left",
  },

  note: {
    marginTop: "10px",
    fontSize: "13px",
    opacity: 0.6,
    textAlign: "center",
  },

  right: {
    width: "25%",
    background: "#0f1620",
    borderRadius: "12px",
    padding: "15px",
  },

  tip: {
    background: "#111827",
    padding: "10px",
    borderRadius: "10px",
    marginTop: "10px",
    fontSize: "13px",
    color: "#cbd5e1",
  },
};