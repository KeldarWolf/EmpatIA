import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const API = "https://empatia-backend.onrender.com/api/users";
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [edit, setEdit] = useState(null);

  // =========================
  // DASHBOARD STATES
  // =========================
  const [serverStatus, setServerStatus] = useState("OFFLINE");
  const [iaStatus, setIaStatus] = useState("ONLINE");
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalChats, setTotalChats] = useState(124);

  const [logs, setLogs] = useState([
    "🟢 Sistema iniciado correctamente",
    "🤖 IA funcionando correctamente",
    "👤 Admin inició sesión",
  ]);

  // =========================
  // LOAD USERS
  // =========================
  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();

      setUsers(data);

      // usuarios activos simulados
      setActiveUsers(
        data.filter((u) => u.online === true).length || 3
      );

    } catch (err) {
      console.error("Error loading users", err);
    }
  };

  // =========================
  // CHECK SERVER
  // =========================
  const checkServer = async () => {
    try {
      const res = await fetch(
        "https://empatia-backend.onrender.com/health"
      );

      if (res.ok) {
        setServerStatus("ONLINE");
      } else {
        setServerStatus("OFFLINE");
      }
    } catch {
      setServerStatus("OFFLINE");
    }
  };

  // =========================
  // PROTECT ROUTE
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      navigate("/login", { replace: true });
      return;
    }

    loadUsers();
    checkServer();

    const interval = setInterval(() => {
      checkServer();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // DELETE USER
  // =========================
  const deleteUser = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLogs((prev) => [
        `🗑 Usuario eliminado ID ${id}`,
        ...prev,
      ]);

      loadUsers();

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // SAVE USER
  // =========================
  const saveUser = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API}/${edit.id_usuario}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: edit.nombre,
          email: edit.email,
          role: edit.role,
        }),
      });

      setLogs((prev) => [
        `✏ Usuario actualizado: ${edit.nombre}`,
        ...prev,
      ]);

      setEdit(null);

      loadUsers();

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    navigate("/login", { replace: true });

    window.location.reload();
  };

  // =========================
  // EXPORT REPORT
  // =========================
  const exportReport = () => {
    const report = {
      fecha: new Date(),
      usuarios: users,
      logs,
      serverStatus,
      iaStatus,
    };

    const blob = new Blob(
      [JSON.stringify(report, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "reporte-admin.json";

    a.click();

    setLogs((prev) => [
      "📄 Reporte descargado",
      ...prev,
    ]);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            ⚡ EMPATIA ADMIN PANEL
          </h1>

          <button
            style={styles.logoutBtn}
            onClick={logout}
          >
            Cerrar sesión
          </button>
        </div>

        {/* STATS */}
        <div style={styles.statsGrid}>

          <div style={styles.statCard}>
            <h2>{users.length}</h2>
            <p>Usuarios Totales</p>
          </div>

          <div style={styles.statCard}>
            <h2>{activeUsers}</h2>
            <p>Usuarios Activos</p>
          </div>

          <div style={styles.statCard}>
            <h2>{serverStatus}</h2>
            <p>Servidor</p>
          </div>

          <div style={styles.statCard}>
            <h2>{iaStatus}</h2>
            <p>IA</p>
          </div>

          <div style={styles.statCard}>
            <h2>{totalChats}</h2>
            <p>Chats Hoy</p>
          </div>

        </div>

        {/* ACTIONS */}
        <div style={styles.topActions}>
          <button
            style={styles.reportBtn}
            onClick={exportReport}
          >
            Descargar Reporte
          </button>
        </div>

        {/* USERS */}
        <div style={styles.list}>
          {users.map((u) => (
            <div key={u.id_usuario} style={styles.card}>

              <div>
                <h3 style={styles.name}>
                  {u.nombre}
                </h3>

                <p style={styles.text}>
                  {u.email}
                </p>

                <span style={styles.role}>
                  {u.role}
                </span>
              </div>

              <div style={styles.actions}>

                <button
                  style={styles.editBtn}
                  onClick={() => setEdit(u)}
                >
                  Editar
                </button>

                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteUser(u.id_usuario)}
                >
                  Eliminar
                </button>

              </div>
            </div>
          ))}
        </div>

        {/* LOGS */}
        <div style={styles.logsBox}>

          <div style={styles.logsHeader}>
            <h2 style={styles.logsTitle}>
              📡 Logs del Sistema
            </h2>
          </div>

          {logs.map((log, index) => (
            <div key={index} style={styles.logItem}>
              {log}
            </div>
          ))}

        </div>

        {/* MODAL */}
        {edit && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>

              <h2 style={styles.modalTitle}>
                Editar Usuario
              </h2>

              <input
                style={styles.input}
                value={edit.nombre}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    nombre: e.target.value,
                  })
                }
              />

              <input
                style={styles.input}
                value={edit.email || ""}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    email: e.target.value,
                  })
                }
              />

              <select
                style={styles.input}
                value={edit.role}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    role: e.target.value,
                  })
                }
              >
                <option value="user">
                  user
                </option>

                <option value="admin">
                  admin
                </option>
              </select>

              <div style={styles.modalActions}>

                <button
                  style={styles.saveBtn}
                  onClick={saveUser}
                >
                  Guardar
                </button>

                <button
                  style={styles.cancelBtn}
                  onClick={() => setEdit(null)}
                >
                  Cancelar
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* =========================
   CYBERPUNK STYLE
========================= */

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #08111f, #020305)",
    padding: 20,
    fontFamily: "Arial",
    color: "#fff",
  },

  container: {
    maxWidth: 1200,
    margin: "0 auto",
    background: "rgba(12,18,28,0.92)",
    borderRadius: 22,
    padding: 24,
    border: "1px solid rgba(0,229,255,0.15)",
    boxShadow: "0 0 60px rgba(0,229,255,0.08)",
    backdropFilter: "blur(10px)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  title: {
    color: "#00e5ff",
    textShadow: "0 0 15px rgba(0,229,255,0.6)",
  },

  logoutBtn: {
    background: "#ff3b3b",
    border: "none",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px,1fr))",
    gap: 15,
    marginBottom: 25,
  },

  statCard: {
    background: "rgba(0,0,0,0.35)",
    padding: 20,
    borderRadius: 16,
    border: "1px solid rgba(0,229,255,0.2)",
    textAlign: "center",
    boxShadow: "0 0 20px rgba(0,229,255,0.08)",
  },

  topActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 20,
  },

  reportBtn: {
    background: "#00e5ff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  card: {
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(0,229,255,0.12)",
    borderRadius: 15,
    padding: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    margin: 0,
  },

  text: {
    color: "#aaa",
    margin: "5px 0",
  },

  role: {
    color: "#00e5ff",
    fontSize: 12,
    textTransform: "uppercase",
  },

  actions: {
    display: "flex",
    gap: 10,
  },

  editBtn: {
    background: "#00e5ff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },

  deleteBtn: {
    background: "#ff3b3b",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  logsBox: {
    marginTop: 30,
    background: "rgba(0,0,0,0.35)",
    borderRadius: 16,
    padding: 20,
    border: "1px solid rgba(0,229,255,0.15)",
  },

  logsHeader: {
    marginBottom: 15,
  },

  logsTitle: {
    color: "#00e5ff",
  },

  logItem: {
    padding: 10,
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    color: "#ccc",
    fontSize: 14,
  },

  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(6px)",
  },

  modalBox: {
    width: 380,
    background: "#0b1018",
    padding: 22,
    borderRadius: 16,
    border: "1px solid rgba(0,229,255,0.2)",
  },

  modalTitle: {
    color: "#00e5ff",
    textAlign: "center",
    marginBottom: 15,
  },

  input: {
    width: "100%",
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    background: "#05070c",
    border: "1px solid rgba(0,229,255,0.2)",
    color: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },

  modalActions: {
    display: "flex",
    gap: 10,
    marginTop: 15,
  },

  saveBtn: {
    flex: 1,
    background: "#00e5ff",
    border: "none",
    padding: 10,
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer",
  },

  cancelBtn: {
    flex: 1,
    background: "transparent",
    border: "1px solid #ff3b3b",
    color: "#ff3b3b",
    padding: 10,
    borderRadius: 10,
    cursor: "pointer",
  },
};
