import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const API = "https://empatia-backend.onrender.com";

  const navigate = useNavigate();

  const [section, setSection] = useState("dashboard");

  const [backendStatus, setBackendStatus] = useState("checking");
  const [aiStatus, setAiStatus] = useState("checking");
  const [aiLatency, setAiLatency] = useState(null);

  const [logs, setLogs] = useState([]);
  const [requests, setRequests] = useState(0);

  // =========================
  // CHECK BACKEND
  // =========================
  const checkBackend = async () => {
    try {
      const start = Date.now();

      const res = await fetch(`${API}/`);
      const text = await res.text();

      const ms = Date.now() - start;

      setBackendStatus(res.ok ? "online" : "error");

      setLogs((p) => [
        `🟢 Backend OK (${ms}ms)`,
        ...p.slice(0, 10),
      ]);

      setRequests((p) => p + 1);
    } catch {
      setBackendStatus("offline");

      setLogs((p) => [
        "🔴 Backend OFFLINE",
        ...p.slice(0, 10),
      ]);
    }
  };

  // =========================
  // CHECK IA REAL
  // =========================
  const checkAI = async () => {
    try {
      const start = Date.now();

      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "test",
        }),
      });

      const data = await res.json();

      const ms = Date.now() - start;

      setAiLatency(ms);
      setAiStatus("online");

      setLogs((p) => [
        `🤖 IA OK (${ms}ms)`,
        ...p.slice(0, 10),
      ]);

      setRequests((p) => p + 1);
    } catch {
      setAiStatus("offline");

      setLogs((p) => [
        "🤖 IA ERROR",
        ...p.slice(0, 10),
      ]);
    }
  };

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    checkBackend();
    checkAI();

    const interval = setInterval(() => {
      checkBackend();
      checkAI();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  // =========================
  // UI STATUS COLOR
  // =========================
  const statusColor = (status) => {
    if (status === "online") return "#00ff9d";
    if (status === "offline") return "#ff3b3b";
    return "#ffaa00";
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            🛠 EMPATIA ADMIN
          </h1>

          <button style={styles.logout} onClick={logout}>
            Salir
          </button>
        </div>

        {/* MENU */}
        <div style={styles.menu}>
          {["dashboard", "users", "ai", "logs"].map((s) => (
            <button
              key={s}
              style={styles.btn}
              onClick={() => setSection(s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {section === "dashboard" && (
          <div style={styles.grid}>

            <div style={styles.card}>
              <h3>Backend</h3>
              <p style={{ color: statusColor(backendStatus) }}>
                {backendStatus}
              </p>
            </div>

            <div style={styles.card}>
              <h3>IA</h3>
              <p style={{ color: statusColor(aiStatus) }}>
                {aiStatus}
              </p>
              <small>
                {aiLatency ? `${aiLatency} ms` : ""}
              </small>
            </div>

            <div style={styles.card}>
              <h3>Requests</h3>
              <p>{requests}</p>
            </div>

            <div style={styles.card}>
              <h3>Logs</h3>
              <p>{logs.length}</p>
            </div>

          </div>
        )}

        {/* IA */}
        {section === "ai" && (
          <div style={styles.box}>
            <h2>🤖 IA Status REAL</h2>

            <p>
              Estado:{" "}
              <b style={{ color: statusColor(aiStatus) }}>
                {aiStatus}
              </b>
            </p>

            <p>
              Latencia: {aiLatency || "--"} ms
            </p>

            <button style={styles.testBtn} onClick={checkAI}>
              Probar IA ahora
            </button>
          </div>
        )}

        {/* LOGS */}
        {section === "logs" && (
          <div style={styles.box}>
            <h2>📜 Logs reales</h2>

            {logs.map((l, i) => (
              <div key={i} style={styles.log}>
                {l}
              </div>
            ))}
          </div>
        )}

        {/* USERS MOCK (sin BD obligatorio) */}
        {section === "users" && (
          <div style={styles.box}>
            <h2>👥 Usuarios</h2>
            <p>No depende de BD aquí (solo API real si quieres).</p>
          </div>
        )}

      </div>
    </div>
  );
}

/* =========================
   STYLES (EMPATIA CYBER)
========================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#05070a",
    display: "flex",
    justifyContent: "center",
    padding: 20,
    fontFamily: "Arial",
  },

  container: {
    width: "100%",
    maxWidth: 1000,
    background: "#0b0f14",
    border: "1px solid #00e5ff22",
    borderRadius: 16,
    padding: 20,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "#00e5ff",
  },

  logout: {
    background: "#ff3b3b",
    border: "none",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 8,
  },

  menu: {
    display: "flex",
    gap: 10,
    marginTop: 20,
  },

  btn: {
    background: "#00e5ff22",
    border: "1px solid #00e5ff55",
    color: "#00e5ff",
    padding: "8px 10px",
    borderRadius: 8,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 15,
    marginTop: 20,
  },

  card: {
    background: "#111820",
    padding: 15,
    borderRadius: 12,
    border: "1px solid #00e5ff22",
    color: "#fff",
  },

  box: {
    marginTop: 20,
    background: "#111820",
    padding: 20,
    borderRadius: 12,
    color: "#fff",
  },

  log: {
    padding: 8,
    borderBottom: "1px solid #222",
    color: "#ccc",
  },

  testBtn: {
    marginTop: 10,
    background: "#00e5ff",
    border: "none",
    padding: 10,
    borderRadius: 8,
    fontWeight: "bold",
  },
};
