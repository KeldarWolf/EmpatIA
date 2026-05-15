import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();

  const USERS_API =
    "https://empatia-backend.onrender.com/api/users";

  const AI_API =
    "https://empatia-backend.onrender.com/api/ai-status";

  const SYSTEM_API =
    "https://empatia-backend.onrender.com/api/system-status";

  const [users, setUsers] = useState([]);
  const [edit, setEdit] = useState(null);

  const [view, setView] = useState("dashboard");

  const [ai, setAi] = useState({
    online: false,
    token: false,
    model: "",
    message: "",
  });

  const [system, setSystem] = useState({
    server: "",
    ram: "",
    uptime: "",
    database: false,
  });

  const [logs, setLogs] = useState([]);

  // =========================
  // SECURITY
  // =========================
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, []);

  // =========================
  // LOGS
  // =========================
  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`${time} - ${msg}`, ...prev]);
  };

  // =========================
  // USERS
  // =========================
  const loadUsers = async () => {
    try {
      const res = await fetch(USERS_API);
      const data = await res.json();
      setUsers(data);
      addLog("Usuarios cargados");
    } catch (e) {
      addLog("Error usuarios");
    }
  };

  // =========================
  // AI STATUS
  // =========================
  const loadAI = async () => {
    try {
      const res = await fetch(AI_API);
      const data = await res.json();
      setAi(data);
      addLog("IA verificada");
    } catch {
      addLog("Error IA");
    }
  };

  // =========================
  // SYSTEM STATUS
  // =========================
  const loadSystem = async () => {
    try {
      const res = await fetch(SYSTEM_API);
      const data = await res.json();
      setSystem(data);
      addLog("Sistema verificado");
    } catch {
      addLog("Error sistema");
    }
  };

  // =========================
  // INIT LIVE
  // =========================
  useEffect(() => {
    loadUsers();
    loadAI();
    loadSystem();

    const interval = setInterval(() => {
      loadAI();
      loadSystem();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // DELETE USER
  // =========================
  const deleteUser = async (id) => {
    if (!confirm("¿Eliminar usuario?")) return;

    await fetch(`${USERS_API}/${id}`, {
      method: "DELETE",
    });

    addLog(`Usuario eliminado ${id}`);
    loadUsers();
  };

  // =========================
  // SAVE USER
  // =========================
  const saveUser = async () => {
    await fetch(`${USERS_API}/${edit.id_usuario}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(edit),
    });

    addLog(`Usuario editado ${edit.nombre}`);
    setEdit(null);
    loadUsers();
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>🛠 EMPATIA ADMIN PANEL</h1>

          <button style={styles.logout} onClick={logout}>
            Logout
          </button>
        </div>

        {/* MENU */}
        <div style={styles.menu}>
          <button onClick={() => setView("dashboard")}>Dashboard</button>
          <button onClick={() => setView("users")}>Usuarios</button>
          <button onClick={() => setView("ai")}>IA</button>
          <button onClick={() => setView("logs")}>Logs</button>
        </div>

        {/* ================= DASHBOARD ================= */}
        {view === "dashboard" && (
          <div>
            <h2>Estado general</h2>

            <p>🟢 Server: {system.server}</p>
            <p>🤖 IA: {ai.online ? "Online" : "Offline"}</p>
            <p>🔑 Token: {ai.token ? "OK" : "FALLA"}</p>
            <p>💾 RAM: {system.ram}</p>
            <p>⏱ Uptime: {system.uptime}</p>
          </div>
        )}

        {/* ================= USERS ================= */}
        {view === "users" && (
          <div>
            {users.map((u) => (
              <div key={u.id_usuario} style={styles.user}>
                <p>{u.nombre}</p>
                <p>{u.email}</p>

                <button onClick={() => setEdit(u)}>Editar</button>
                <button onClick={() => deleteUser(u.id_usuario)}>
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ================= IA ================= */}
        {view === "ai" && (
          <div>
            <h2>IA REAL STATUS</h2>

            <p>Modelo: {ai.model}</p>
            <p>Estado: {ai.online ? "Online" : "Offline"}</p>
            <p>Token: {ai.token ? "OK" : "ERROR"}</p>
            <p>{ai.message}</p>
          </div>
        )}

        {/* ================= LOGS ================= */}
        {view === "logs" && (
          <div>
            <h2>Logs sistema</h2>

            {logs.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>
        )}

        {/* ================= EDIT MODAL ================= */}
        {edit && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <input
                value={edit.nombre}
                onChange={(e) =>
                  setEdit({ ...edit, nombre: e.target.value })
                }
              />

              <input
                value={edit.email}
                onChange={(e) =>
                  setEdit({ ...edit, email: e.target.value })
                }
              />

              <select
                value={edit.role}
                onChange={(e) =>
                  setEdit({ ...edit, role: e.target.value })
                }
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>

              <button onClick={saveUser}>Guardar</button>
              <button onClick={() => setEdit(null)}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STYLE ================= */
const styles = {
  container: {
    minHeight: "100vh",
    background: "#05070a",
    display: "flex",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 1000,
    background: "#111",
    padding: 20,
    borderRadius: 20,
    color: "#fff",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
  },

  title: {
    color: "#00e5ff",
  },

  logout: {
    background: "red",
    color: "#fff",
    border: "none",
    padding: 10,
  },

  menu: {
    display: "flex",
    gap: 10,
    marginTop: 20,
  },

  user: {
    background: "#222",
    padding: 10,
    marginTop: 10,
  },

  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    background: "#000",
    padding: 20,
  },
};
