import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const API_USERS = "https://empatia-backend.onrender.com/api/users";
  const API_CHAT = "https://empatia-backend.onrender.com/chat";

  const navigate = useNavigate();

  const session = JSON.parse(localStorage.getItem("usuario"));

  const [users, setUsers] = useState([]);
  const [systemStatus, setSystemStatus] = useState("checking");
  const [aiStatus, setAiStatus] = useState("checking");
  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD USERS (BD REAL)
  // =========================
  const loadUsers = async () => {
    try {
      const res = await fetch(API_USERS);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  // =========================
  // CHECK BACKEND STATUS
  // =========================
  const checkSystem = async () => {
    try {
      const res = await fetch("https://empatia-backend.onrender.com/");
      if (res.ok) setSystemStatus("online");
      else setSystemStatus("error");
    } catch {
      setSystemStatus("offline");
    }
  };

  // =========================
  // CHECK IA STATUS REAL
  // =========================
  const checkAI = async () => {
    try {
      const res = await fetch(API_CHAT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "test" }),
      });

      const data = await res.json();

      if (data?.reply) setAiStatus("online");
      else setAiStatus("error");
    } catch {
      setAiStatus("offline");
    }
  };

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    loadUsers();
    checkSystem();
    checkAI();
  }, []);

  // =========================
  // DELETE USER
  // =========================
  const deleteUser = async (id) => {
    if (!confirm("¿Eliminar usuario?")) return;

    setLoading(true);

    await fetch(`${API_USERS}/${id}`, {
      method: "DELETE",
    });

    await loadUsers();
    setLoading(false);
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>🛠 EMPATIA ADMIN PANEL</h1>

          <div style={styles.sessionBox}>
            <span>👤 {session?.nombre}</span>
            <span style={styles.token}>
              {session?.role}
            </span>
          </div>

          <button style={styles.logoutBtn} onClick={logout}>
            Cerrar sesión
          </button>
        </div>

        {/* STATUS BAR */}
        <div style={styles.statusBar}>
          <div>
            🟢 Backend:
            <b style={{ marginLeft: 6 }}>
              {systemStatus}
            </b>
          </div>

          <div>
            🤖 IA:
            <b style={{ marginLeft: 6 }}>
              {aiStatus}
            </b>
          </div>

          <div>
            👥 Usuarios:
            <b style={{ marginLeft: 6 }}>
              {users.length}
            </b>
          </div>
        </div>

        {/* USERS */}
        <h2 style={styles.section}>Usuarios en BD</h2>

        <div style={styles.list}>
          {users.map((u) => (
            <div key={u.id_usuario} style={styles.card}>
              <div>
                <h3 style={styles.name}>{u.nombre}</h3>
                <p style={styles.text}>{u.email}</p>

                <span style={styles.role}>{u.role}</span>
              </div>

              <button
                style={styles.deleteBtn}
                onClick={() => deleteUser(u.id_usuario)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div style={styles.loading}>
            Procesando...
          </div>
        )}

      </div>
    </div>
  );
}

/* =========================
   ESTILO EMPATIA
========================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #05070a, #000)",
    display: "flex",
    justifyContent: "center",
    padding: 20,
    fontFamily: "Arial",
  },

  container: {
    width: "100%",
    maxWidth: 1100,
    background: "rgba(10,15,20,0.95)",
    borderRadius: 20,
    padding: 20,
    border: "1px solid rgba(0,229,255,0.15)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    color: "#00e5ff",
    textShadow: "0 0 10px rgba(0,229,255,0.5)",
  },

  sessionBox: {
    display: "flex",
    flexDirection: "column",
    color: "#aaa",
  },

  token: {
    color: "#00e5ff",
    fontSize: 12,
  },

  logoutBtn: {
    background: "#ff3b3b",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    color: "#fff",
    cursor: "pointer",
  },

  statusBar: {
    display: "flex",
    justifyContent: "space-between",
    padding: 15,
    background: "rgba(0,229,255,0.08)",
    borderRadius: 12,
    marginBottom: 20,
    color: "#ccc",
  },

  section: {
    color: "#00e5ff",
    marginBottom: 10,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#0b0f14",
    padding: 15,
    borderRadius: 12,
    border: "1px solid rgba(0,229,255,0.1)",
  },

  name: {
    color: "#fff",
    margin: 0,
  },

  text: {
    color: "#aaa",
    fontSize: 13,
  },

  role: {
    color: "#00e5ff",
    fontSize: 12,
  },

  deleteBtn: {
    background: "#ff3b3b",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
  },

  loading: {
    marginTop: 15,
    color: "#00e5ff",
  },
};
