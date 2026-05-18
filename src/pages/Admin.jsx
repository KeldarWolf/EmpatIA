import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://empatia-backend.onrender.com/api/users";

export default function Admin() {
  const navigate = useNavigate();

  /* =========================
     PROTECCIÓN SEGURA
  ========================= */

  useEffect(() => {
    const session = sessionStorage.getItem("usuario");

    if (!session) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  /* =========================
     STATES
  ========================= */

  const [tab, setTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState("checking");

  /* =========================
     LOG SYSTEM
  ========================= */

  const addLog = (msg) => {
    setLogs((prev) => [
      {
        msg,
        time: new Date().toLocaleTimeString(),
      },
      ...prev,
    ].slice(0, 50));
  };

  /* =========================
     SERVER CHECK
  ========================= */

  const checkServer = async () => {
    try {
      const res = await fetch(API);

      setServerStatus(res.ok ? "online" : "offline");

      addLog(res.ok ? "🟢 Servidor ONLINE" : "🔴 Servidor OFFLINE");
    } catch {
      setServerStatus("offline");
      addLog("🔴 Servidor OFFLINE");
    }
  };

  /* =========================
     LOAD USERS
  ========================= */

  const loadUsers = async () => {
    setLoading(true);

    try {
      const res = await fetch(API);

      const data = await res.json();

      setUsers(Array.isArray(data) ? data : []);

      addLog(`👤 ${data.length} usuarios cargados`);
    } catch {
      setUsers([]);
      addLog("❌ Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     INIT
  ========================= */

  useEffect(() => {
    loadUsers();
    checkServer();
  }, []);

  /* =========================
     FILTER
  ========================= */

  const filtered = useMemo(() => {
    const t = search.toLowerCase();

    return users.filter(
      (u) =>
        u.nombre?.toLowerCase().includes(t) ||
        u.email?.toLowerCase().includes(t)
    );
  }, [users, search]);

  /* =========================
     DELETE USER (FIX REAL ID)
  ========================= */

  const deleteUser = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;

    try {
      await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      setUsers((prev) =>
        prev.filter((u) => u.id_usuario !== id)
      );

      addLog(`🗑 Usuario eliminado: ${id}`);
    } catch {
      addLog("❌ Error eliminando usuario");
    }
  };

  /* =========================
     LOGOUT
  ========================= */

  const logout = () => {
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  /* =========================
     UI
  ========================= */

  return (
    <div style={styles.layout}>
      <div style={styles.topbar}>
        <h2 style={styles.title}>🛠 EmpatIA Admin</h2>

        <div style={styles.tabs}>
          <button onClick={() => setTab("dashboard")} style={tab === "dashboard" ? styles.tabActive : styles.tab}>
            📊 Dashboard
          </button>

          <button onClick={() => setTab("users")} style={tab === "users" ? styles.tabActive : styles.tab}>
            👤 Usuarios
          </button>

          <button onClick={() => setTab("logs")} style={tab === "logs" ? styles.tabActive : styles.tab}>
            📜 Logs
          </button>

          <button onClick={loadUsers} style={styles.tab}>
            🔄 Recargar
          </button>

          <button onClick={logout} style={styles.danger}>
            🚪 Salir
          </button>
        </div>
      </div>

      <div style={styles.main}>
        {/* =========================
            DASHBOARD
        ========================= */}
        {tab === "dashboard" && (
          <div style={styles.cards}>
            <div style={styles.card}>
              👤 Usuarios<br />
              <b>{users.length}</b>
            </div>

            <div style={styles.card}>
              ⚡ Servidor:{" "}
              {serverStatus === "online" && <b style={{ color: "#00ff88" }}>🟢 ONLINE</b>}
              {serverStatus === "offline" && <b style={{ color: "#ff3b3b" }}>🔴 OFFLINE</b>}
              {serverStatus === "checking" && <b>⏳ Checking...</b>}
            </div>
          </div>
        )}

        {/* =========================
            USERS TABLE
        ========================= */}
        {tab === "users" && (
          <>
            <input
              style={styles.input}
              placeholder="🔎 Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {loading ? (
              <p>Loading...</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id_usuario}>
                      <td>{u.nombre}</td>
                      <td>{u.email}</td>
                      <td>
                        <button
                          style={styles.danger}
                          onClick={() => deleteUser(u.id_usuario)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* =========================
            LOGS
        ========================= */}
        {tab === "logs" && (
          <div style={styles.logsBox}>
            {logs.map((l, i) => (
              <div key={i}>
                {l.time} — {l.msg}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   STYLES
========================= */

const styles = {
  layout: {
    minHeight: "100vh",
    background: "#0f0f1a",
    color: "#fff",
    fontFamily: "Arial",
  },

  topbar: {
    padding: "15px",
    background: "#1a1a2e",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: { margin: 0 },

  tabs: {
    display: "flex",
    gap: "10px",
  },

  tab: {
    padding: "10px 15px",
    background: "#16213e",
    border: "none",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
  },

  tabActive: {
    padding: "10px 15px",
    background: "#00e5ff",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  main: {
    padding: "20px",
  },

  cards: {
    display: "flex",
    gap: "20px",
  },

  card: {
    background: "#16213e",
    padding: "20px",
    borderRadius: "8px",
    minWidth: "180px",
  },

  input: {
    padding: "12px",
    width: "100%",
    maxWidth: "400px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "none",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#16213e",
  },

  danger: {
    background: "#ff3b3b",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
  },

  logsBox: {
    background: "#16213e",
    padding: "15px",
    borderRadius: "8px",
    maxHeight: "70vh",
    overflowY: "auto",
  },
};
