import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Diario() {
  const navigate = useNavigate();

  const [input, setInput] = useState("");

  const [entries, setEntries] = useState([
    {
      text: "Hoy fue un día normal, pero estoy intentando mejorar 🤍",
      time: "08:30",
    },
  ]);

  const [messages, setMessages] = useState([
    { role: "ai", text: "Este es tu espacio seguro 🤍 escribe lo que sientes" },
    { role: "ai", text: "No hay juicios, solo acompañamiento." },
  ]);

  const addEntry = () => {
    if (!input.trim()) return;

    const newEntry = {
      text: input,
      time: new Date().toLocaleTimeString().slice(0, 5),
    };

    setEntries((prev) => [newEntry, ...prev]);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: input },
      { role: "ai", text: "Gracias por compartirlo 🤍 lo guardo contigo" },
    ]);

    setInput("");
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0 }}>📓 Diario</h1>
          <p style={{ margin: 0, opacity: 0.7 }}>
            Un espacio para expresarte libremente
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

        {/* IZQUIERDA - CHAT IA */}
        <div style={styles.left}>
          <h3>💬 Acompañamiento</h3>

          <div style={styles.chat}>
            {messages.map((m, i) => (
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

          <div style={styles.tip}>
            💡 Puedes escribir lo que sientes sin filtro
          </div>
        </div>

        {/* CENTRO - ESCRITURA */}
        <div style={styles.center}>
          <h3>✍️ Escribe tu día</h3>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hoy me sentí..."
            style={styles.textarea}
          />

          <button onClick={addEntry} style={styles.saveBtn}>
            Guardar entrada
          </button>
        </div>

        {/* DERECHA - HISTORIAL */}
        <div style={styles.right}>
          <h3>📜 Historial</h3>

          <div style={styles.list}>
            {entries.map((e, i) => (
              <div key={i} style={styles.card}>
                <div style={styles.time}>{e.time}</div>
                <div>{e.text}</div>
              </div>
            ))}
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
    width: "30%",
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
  },

  msg: {
    padding: "10px",
    borderRadius: "10px",
    fontSize: "13px",
  },

  tip: {
    marginTop: "10px",
    fontSize: "13px",
    opacity: 0.7,
  },

  center: {
    flex: 1,
    background: "#0f1620",
    borderRadius: "12px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
  },

  textarea: {
    flex: 1,
    background: "#111827",
    border: "none",
    borderRadius: "10px",
    padding: "10px",
    color: "white",
    resize: "none",
    outline: "none",
  },

  saveBtn: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#1d9bf0",
    color: "white",
    cursor: "pointer",
  },

  right: {
    width: "25%",
    background: "#0f1620",
    borderRadius: "12px",
    padding: "15px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflowY: "auto",
  },

  card: {
    background: "#111827",
    padding: "10px",
    borderRadius: "10px",
    fontSize: "13px",
  },

  time: {
    fontSize: "11px",
    opacity: 0.6,
    marginBottom: "5px",
  },
};