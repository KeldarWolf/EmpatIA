import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://empatia-backend.onrender.com/api/users";

export default function Admin() {
  const navigate = useNavigate();

  /* =========================
     PROTECCIÓN
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

  const [editingUser, setEditingUser] = useState(null);

  /* =========================
     LOGS
  ========================= */
  const addLog = (msg) => {
    setLogs((prev) => [
      { msg, time: new Date().toLocaleTimeString() },
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
     DELETE USER
  ========================= */
  const deleteUser = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;

    try {
      await fetch(`${API}/${id}`, { method: "DELETE" });

      setUsers((prev) =>
        prev.filter((u) => u.id_usuario !== id)
      );

      addLog(`🗑 Usuario eliminado: ${id}`);
    } catch {
      addLog("❌ Error eliminando usuario");
    }
  };

  /* =========================
     UPDATE USER
  ========================= */
  const updateUser = async () => {
    try {
      const res = await fetch(
        `${API}/${editingUser.id_usuario}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingUser),
        }
      );

      const updated = await res.json();

      setUsers((prev) =>
        prev.map((u) =>
          u.id_usuario === updated.id_usuario
            ? updated
            : u
        )
      );

      setEditingUser(null);
      addLog("✏️ Usuario actualizado");
    } catch {
      addLog("❌ Error actualizando usuario");
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
        <h2>🛠 EmpatIA Admin</h2>

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
              👤 Usuarios <br />
              <b>{users.length}</b>
            </div>

            <div style={styles.card}>
              ⚡ Servidor:{" "}
              {serverStatus === "online" && (
                <b style={{ color: "#00ff88" }}>🟢 ONLINE</b>
              )}
              {serverStatus === "offline" && (
                <b style={{ color: "#ff3b3b" }}>🔴 OFFLINE</b>
              )}
              {serverStatus === "checking" && <b>⏳ Checking...</b>}
            </div>
          </div>
        )}

        {/* =========================
            USERS
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
              <p>Cargando...</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id_usuario}>
                      <td>{u.nombre}</td>
                      <td>{u.email}</td>
                      <td>
                        <button onClick={() => setEditingUser(u)}>
                          ✏️ Editar
                        </button>

                        <button
                          style={styles.danger}
                          onClick={() =>
                            deleteUser(u.id_usuario)
                          }
                        >
                          🗑 Eliminar
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

      {/* =========================
          EDIT MODAL
      ========================= */}
      {editingUser && (
        <div style={styles.modal}>
          <h3>✏️ Editar Usuario</h3>

          <input
            value={editingUser.nombre}
            onChange={(e) =>
              setEditingUser({
                ...editingUser,
                nombre: e.target.value,
              })
            }
          />

          <input
            value={editingUser.email || ""}
            onChange={(e) =>
              setEditingUser({
                ...editingUser,
                email: e.target.value,
              })
            }
          />

          <select
            value={editingUser.role || "user"}
            onChange={(e) =>
              setEditingUser({
                ...editingUser,
                role: e.target.value,
              })
            }
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>

          <button onClick={updateUser}>💾 Guardar</button>
          <button onClick={() => setEditingUser(null)}>
            ❌ Cancelar
          </button>
        </div>
      )}
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
  },

  tabs: { display: "flex", gap: 10 },

  tab: {
    padding: "10px",
    background: "#16213e",
    border: "none",
    color: "#fff",
    borderRadius: 6,
  },

  tabActive: {
    padding: "10px",
    background: "#00e5ff",
    border: "none",
    color: "#000",
    borderRadius: 6,
  },

  danger: {
    background: "#ff3b3b",
    color: "#fff",
    border: "none",
    padding: "8px",
    borderRadius: 6,
  },

  main: { padding: 20 },

  cards: { display: "flex", gap: 20 },

  card: {
    background: "#16213e",
    padding: 20,
    borderRadius: 8,
  },

  input: {
    padding: 10,
    width: "100%",
    maxWidth: 400,
    marginBottom: 10,
  },

  table: {
    width: "100%",
    background: "#16213e",
    borderCollapse: "collapse",
  },

  logsBox: {
    background: "#16213e",
    padding: 15,
    borderRadius: 8,
    height: "70vh",
    overflowY: "auto",
  },

  modal: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#1a1a2e",
    padding: 20,
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
};
