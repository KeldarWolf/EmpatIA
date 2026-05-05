import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Gustos() {
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [mode, setMode] = useState("like"); // like | dislike

  const [likes, setLikes] = useState([
    "Música tranquila",
    "Caminar",
  ]);

  const [dislikes, setDislikes] = useState([
    "Ruido fuerte",
  ]);

  const addItem = () => {
    if (!input.trim()) return;

    if (mode === "like") {
      setLikes((prev) => [input, ...prev]);
    } else {
      setDislikes((prev) => [input, ...prev]);
    }

    setInput("");
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0 }}>❤️ Gustos</h1>
          <p style={{ margin: 0, opacity: 0.7 }}>
            Conocerte mejor ayuda a acompañarte mejor
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

        {/* IZQUIERDA */}
        <div style={styles.left}>
          <h3>💬 Acompañamiento</h3>

          <div style={styles.tip}>
            “Tus gustos pueden cambiar con el tiempo 🤍”
          </div>

          <div style={styles.tip}>
            “Saber lo que no te gusta también es importante”
          </div>

          <div style={styles.tip}>
            “Esto no es juicio, es autoconocimiento”
          </div>
        </div>

        {/* CENTRO */}
        <div style={styles.center}>

          <h3>➕ Agregar elemento</h3>

          {/* selector */}
          <div style={styles.toggle}>
            <button
              onClick={() => setMode("like")}
              style={{
                ...styles.toggleBtn,
                background: mode === "like" ? "#1d9bf0" : "#111827",
              }}
            >
              ❤️ Me gusta
            </button>

            <button
              onClick={() => setMode("dislike")}
              style={{
                ...styles.toggleBtn,
                background: mode === "dislike" ? "#ef4444" : "#111827",
              }}
            >
              ❌ No me gusta
            </button>
          </div>

          <div style={styles.inputRow}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe algo..."
              style={styles.input}
            />

            <button onClick={addItem} style={styles.addBtn}>
              Agregar
            </button>
          </div>

          {/* LISTAS */}
          <div style={styles.lists}>
            <div style={styles.box}>
              <h4>❤️ Gustos</h4>
              {likes.map((l, i) => (
                <div key={i} style={styles.item}>
                  {l}
                </div>
              ))}
            </div>

            <div style={styles.box}>
              <h4>❌ No gustos</h4>
              {dislikes.map((d, i) => (
                <div key={i} style={styles.item}>
                  {d}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* DERECHA */}
        <div style={styles.right}>
          <h3>🧠 Perfil emocional</h3>

          <div style={styles.card}>
            <p>Total gustos</p>
            <h2>{likes.length}</h2>
          </div>

          <div style={styles.card}>
            <p>Total no gustos</p>
            <h2>{dislikes.length}</h2>
          </div>

          <div style={styles.card}>
            <p>Estado</p>
            <h2>
              {likes.length > dislikes.length ? "Positivo" : "Neutral"}
            </h2>
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

  center: {
    flex: 1,
    background: "#0f1620",
    borderRadius: "12px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
  },

  toggle: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },

  toggleBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    color: "white",
    cursor: "pointer",
  },

  inputRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#111827",
    color: "white",
  },

  addBtn: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#1d9bf0",
    color: "white",
    cursor: "pointer",
  },

  lists: {
    display: "flex",
    gap: "10px",
    flex: 1,
  },

  box: {
    flex: 1,
    background: "#111827",
    padding: "10px",
    borderRadius: "10px",
    overflowY: "auto",
  },

  item: {
    background: "#0f1620",
    padding: "8px",
    borderRadius: "8px",
    marginTop: "5px",
    fontSize: "13px",
  },

  right: {
    width: "25%",
    background: "#0f1620",
    borderRadius: "12px",
    padding: "15px",
  },

  card: {
    background: "#111827",
    padding: "10px",
    borderRadius: "10px",
    marginTop: "10px",
    textAlign: "center",
  },
};