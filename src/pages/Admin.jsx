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
  // SAFE AUTH (EVITA BLANK SCREEN)
  // =========================
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return navigate("/login");

      const user = JSON.parse(raw);
      if (!user || user.role !== "admin") {
        navigate("/login");
      }
    } catch (e) {
      localStorage.clear();
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
  // USERS SAFE FETCH
  // =========================
  const loadUsers = async () => {
    try {
      const res = await fetch(USERS_API);

      if (!res.ok) {
        addLog("Error API usuarios");
        return;
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      addLog("Usuarios cargados");
    } catch {
      addLog("Fallo usuarios");
    }
  };

  // =========================
  // IA STATUS SAFE
  // =========================
  const loadAI = async () => {
    try {
      const res = await fetch(AI_API);

      if (!res.ok) {
        setAi({ online: false, token: false, model: "error", message: "offline" });
        return;
      }

      const data = await res.json();
      setAi(data);
    } catch {
      setAi({ online: false, token: false, model: "error", message: "sin conexión" });
    }
  };

  // =========================
  // SYSTEM SAFE
  // =========================
  const loadSystem = async () => {
    try {
      const res = await fetch(SYSTEM_API);

      if (!res.ok) return;

      const data = await res.json();
      setSystem(data);
    } catch {}
  };

  // =========================
  // INIT
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
  // DELETE SAFE
  // =========================
  const deleteUser = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;

    try {
      await fetch(`${USERS_API}/${id}`, {
        method: "DELETE",
      });

      addLog(`Usuario eliminado ${id}`);
      loadUsers();
    } catch {
      addLog("Error eliminar usuario");
    }
  };

  // =========================
  // SAVE SAFE
  // =========================
  const saveUser = async () => {
    try {
      await fetch(`${USERS_API}/${edit.id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edit),
      });

      setEdit(null);
      loadUsers();
      addLog("Usuario actualizado");
    } catch {
      addLog("Error al actualizar");
    }
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
          <h1 style={styles.title}>🛠 EMPATIA ADMIN</h1>
          <button style={styles.logout} onClick={logout}>
            Salir
          </button>
        </div>

        {/* MENU */}
        <div style={styles.menu}>
          <button onClick={() => setView("dashboard")}>Dashboard</button>
          <button onClick={() => setView("users")}>Usuarios</button>
          <button onClick={() => setView("ai")}>IA</button>
          <button onClick={() => setView("logs")}>Logs</button>
        </div>

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div>
            <h2>Estado</h2>
            <p>🟢 Server: {system.server || "..."}</p>
            <p>🤖 IA: {ai.online ? "Online" : "Offline"}</p>
            <p>🔑 Token: {ai.token ? "OK" : "FAIL"}</p>
            <p>💾 RAM: {system.ram || "0"}</p>
            <p>⏱ Uptime: {system.uptime || "0"}</p>
          </div>
        )}

        {/* USERS */}
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

        {/* IA */}
        {view === "ai" && (
          <div>
            <h2>IA STATUS</h2>
            <p>Modelo: {ai.model || "..."}</p>
            <p>Estado: {ai.online ? "Online" : "Offline"}</p>
            <p>{ai.message}</p>
          </div>
        )}

        {/* LOGS */}
        {view === "logs" && (
          <div>
            <h2>Logs</h2>
            {logs.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>
        )}

        {/* MODAL SAFE */}
        {edit && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <input
                value={edit?.nombre || ""}
                onChange={(e) =>
                  setEdit({ ...edit, nombre: e.target.value })
                }
              />

              <input
                value={edit?.email || ""}
                onChange={(e) =>
                  setEdit({ ...edit, email: e.target.value })
                }
              />

              <select
                value={edit?.role || "user"}
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

/* STYLE MINIMO */
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
    maxWidth: 900,
    background: "#111",
    padding: 20,
    borderRadius: 20,
    color: "#fff",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
  },

  title: { color: "#00e5ff" },

  logout: {
    background: "red",
    color: "#fff",
    border: "none",
    padding: 10,
  },

  menu: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },

  user: {
    background: "#222",
    padding: 10,
    marginTop: 10,
  },

  modal: {
    position: "fixed",
    inset: 0,
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
