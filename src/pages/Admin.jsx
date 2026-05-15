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

  // 🆕 ESTADO SERVIDOR
  const [serverStatus, setServerStatus] = useState("checking");

  // =========================
  // CHECK SERVER STATUS
  // =========================
  const checkServer = async () => {
    try {
      const res = await fetch(API);
      if (res.ok) {
        setServerStatus("online");
        addLog("Servidor ONLINE");
      } else {
        setServerStatus("offline");
        addLog("Servidor OFFLINE");
      }
    } catch (e) {
      setServerStatus("offline");
      addLog("Servidor OFFLINE");
    }
  };

  // =========================
  // LOAD USERS
  // =========================
  const loadUsers = async () => {
    setLoading(true);

    try {
      const res = await fetch(API);
      const data = await res.json();

      setUsers(data || []);
      addLog("Usuarios cargados");
    } catch (e) {
      addLog("Error cargando usuarios");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
    checkServer(); // 🆕 se revisa al entrar
  }, []);

  const addLog = (msg) => {
    setLogs((prev) => [
      { msg, time: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  };

  // =========================
  // FILTER USERS
  // =========================
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const t = search.toLowerCase();
      return (
        u.nombre?.toLowerCase().includes(t) ||
        u.email?.toLowerCase().includes(t)
      );
    });
  }, [users, search]);

  // =========================
  // DELETE (UI ONLY)
  // =========================
  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u._id !== id));
    addLog(`Usuario eliminado ${id}`);
  };

  return (
    <div style={styles.layout}>

      {/* TOP BAR */}
      <div style={styles.topbar}>
        <h2 style={styles.title}>🛠 EmpatIA Admin</h2>

        <div style={styles.tabs}>
          <button
            style={tab === "dashboard" ? styles.tabActive : styles.tab}
            onClick={() => setTab("dashboard")}
          >
            📊 Dashboard
          </button>

          <button
            style={tab === "users" ? styles.tabActive : styles.tab}
            onClick={() => setTab("users")}
          >
            👤 Usuarios
          </button>

          <button
            style={tab === "logs" ? styles.tabActive : styles.tab}
            onClick={() => setTab("logs")}
          >
            📜 Logs
          </button>

          <button style={styles.tab} onClick={loadUsers}>
            🔄 Recargar
          </button>

          <button style={styles.tab} onClick={() => navigate("/")}>
            ⬅ Salir
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div style={styles.cards}>

            <div style={styles.card}>
              👤 Usuarios <b>{users.length}</b>
            </div>

            <div style={styles.card}>
              ⚡ Estado servidor <br />
              {serverStatus === "online" && <b style={{ color: "#00ff88" }}>🟢 ONLINE</b>}
              {serverStatus === "offline" && <b style={{ color: "#ff3b3b" }}>🔴 OFFLINE</b>}
              {serverStatus === "checking" && <b>⏳ CHECKING...</b>}
            </div>

            <div style={styles.card}>
              📜 Logs <b>{logs.length}</b>
            </div>

          </div>
        )}

        {/* USERS */}
        {tab === "users" && (
          <>
            <input
              style={styles.input}
              placeholder="🔎 Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div style={styles.tableBox}>
              {loading ? (
                <p style={{ color: "#00e5ff" }}>Cargando...</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Nombre</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Estado</th>
                      <th style={styles.th}>Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u._id}>
                        <td style={styles.td}>{u.nombre || "Sin nombre"}</td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>🟢 activo</td>
                        <td style={styles.td}>
                          <button
                            style={styles.danger}
                            onClick={() => deleteUser(u._id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* LOGS */}
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
