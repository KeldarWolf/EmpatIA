import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://empatia-backend.onrender.com/api/users";

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState("checking");

  const addLog = (msg) => {
    setLogs((prev) => [
      { msg, time: new Date().toLocaleTimeString() },
      ...prev,
    ].slice(0, 50)); // limitar logs
  };

  const checkServer = async () => {
    try {
      const res = await fetch(API, { method: "HEAD" });
      setServerStatus(res.ok ? "online" : "offline");
      addLog(res.ok ? "Servidor ONLINE" : "Servidor OFFLINE");
    } catch (e) {
      setServerStatus("offline");
      addLog("Servidor OFFLINE");
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Error del servidor");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      addLog(`✅ ${data.length} usuarios cargados`);
    } catch (e) {
      console.error(e);
      addLog("❌ Error cargando usuarios");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    checkServer();
  }, []);

  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    return users.filter((u) =>
      u.nombre?.toLowerCase().includes(t) || 
      u.email?.toLowerCase().includes(t)
    );
  }, [users, search]);

  const deleteUser = (id) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    setUsers((prev) => prev.filter((u) => u._id !== id));
    addLog(`Usuario eliminado (local): ${id}`);
    // Luego implementaremos delete real en backend
  };

  return (
    <div style={styles.layout}>
      <div style={styles.topbar}>
        <h2 style={styles.title}>🛠 EmpatIA Admin</h2>
        <div style={styles.tabs}>
          <button style={tab === "dashboard" ? styles.tabActive : styles.tab} onClick={() => setTab("dashboard")}>📊 Dashboard</button>
          <button style={tab === "users" ? styles.tabActive : styles.tab} onClick={() => setTab("users")}>👤 Usuarios</button>
          <button style={tab === "logs" ? styles.tabActive : styles.tab} onClick={() => setTab("logs")}>📜 Logs</button>
          <button style={styles.tab} onClick={loadUsers}>🔄 Recargar</button>
          <button style={styles.tab} onClick={() => navigate("/")}>⬅ Salir</button>
        </div>
      </div>

      <div style={styles.main}>
        {tab === "dashboard" && (
          <div style={styles.cards}>
            <div style={styles.card}>👤 Usuarios <b>{users.length}</b></div>
            <div style={styles.card}>
              ⚡ Servidor: {" "}
              {serverStatus === "online" && <b style={{color: "#00ff88"}}>🟢 ONLINE</b>}
              {serverStatus === "offline" && <b style={{color: "#ff3b3b"}}>🔴 OFFLINE</b>}
              {serverStatus === "checking" && <b>⏳ Checking...</b>}
            </div>
          </div>
        )}

        {tab === "users" && (
          <>
            <input
              style={styles.input}
              placeholder="🔎 Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {loading ? <p>Cargando usuarios...</p> : (
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
                    <tr key={u._id}>
                      <td>{u.nombre || "Sin nombre"}</td>
                      <td>{u.email}</td>
                      <td>
                        <button style={styles.danger} onClick={() => deleteUser(u._id)}>
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

        {tab === "logs" && (
          <div style={styles.logsBox}>
            {logs.map((l, i) => (
              <div key={i}>{l.time} — {l.msg}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== ESTILOS ====================
const styles = {
  layout: { minHeight: "100vh", background: "#0f0f1a", color: "#fff", fontFamily: "Arial" },
  topbar: { padding: "15px", background: "#1a1a2e", display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { margin: 0 },
  tabs: { display: "flex", gap: "10px" },
  tab: { padding: "10px 15px", background: "#16213e", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer" },
  tabActive: { padding: "10px 15px", background: "#00e5ff", color: "#000", border: "none", borderRadius: "6px", cursor: "pointer" },
  main: { padding: "20px" },
  cards: { display: "flex", gap: "20px", flexWrap: "wrap" },
  card: { background: "#16213e", padding: "20px", borderRadius: "8px", minWidth: "180px" },
  input: { padding: "12px", width: "100%", maxWidth: "400px", marginBottom: "15px", borderRadius: "6px", border: "none" },
  table: { width: "100%", borderCollapse: "collapse", background: "#16213e" },
  th: { padding: "12px", textAlign: "left", background: "#1a1a2e" },
  td: { padding: "12px", borderBottom: "1px solid #333" },
  danger: { background: "#ff3b3b", color: "white", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer" },
  logsBox: { background: "#16213e", padding: "15px", borderRadius: "8px", maxHeight: "70vh", overflowY: "auto" }
};
