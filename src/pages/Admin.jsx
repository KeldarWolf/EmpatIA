import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const API = "https://empatia-backend.onrender.com/api/users";

  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================
  const [users, setUsers] = useState([]);
  const [edit, setEdit] = useState(null);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [loadingUsers, setLoadingUsers] =
    useState(false);

  const [error, setError] = useState("");

  // dashboard
  const [serverStatus, setServerStatus] =
    useState("OFFLINE");

  const [iaStatus] = useState("ONLINE");

  const [activeUsers, setActiveUsers] =
    useState(0);

  const [totalChats] = useState(124);

  const [logs, setLogs] = useState([
    "🟢 Sistema iniciado",
    "🤖 IA funcionando",
    "👤 Admin autenticado",
  ]);

  // =========================
  // AUTH CHECK
  // =========================
  useEffect(() => {
    const token =
      localStorage.getItem("token");

    const role =
      localStorage.getItem("role");

    if (!token || role !== "admin") {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    setCheckingAuth(false);

    loadUsers();

    checkServer();

    const interval = setInterval(() => {
      checkServer();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // LOAD USERS
  // =========================
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);

      const token =
        localStorage.getItem("token");

      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(
          "Error obteniendo usuarios"
        );
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setUsers(data);

        setActiveUsers(
          data.filter(
            (u) => u.online === true
          ).length || 3
        );
      } else {
        setUsers([]);
      }

    } catch (err) {
      console.error(err);

      setError(
        "No se pudieron cargar usuarios"
      );

    } finally {
      setLoadingUsers(false);
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
  // DELETE USER
  // =========================
  const deleteUser = async (id) => {
    const confirmDelete =
      window.confirm(
        "¿Eliminar usuario?"
      );

    if (!confirmDelete) return;

    try {
      const token =
        localStorage.getItem("token");

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
      const token =
        localStorage.getItem("token");

      await fetch(
        `${API}/${edit.id_usuario}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            nombre: edit.nombre,
            email: edit.email,
            role: edit.role,
          }),
        }
      );

      setLogs((prev) => [
        `✏ Usuario actualizado ${edit.nombre}`,
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

    navigate("/login", {
      replace: true,
    });
  };

  // =========================
  // REPORT
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
      {
        type: "application/json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "reporte-admin.json";

    a.click();

    setLogs((prev) => [
      "📄 Reporte exportado",
      ...prev,
    ]);
  };

  // =========================
  // LOADING AUTH
  // =========================
  if (checkingAuth) {
    return (
      <div style={styles.loadingScreen}>
        Verificando sesión...
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            ⚡ EMPATIA ADMIN
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
            <p>Usuarios</p>
          </div>

          <div style={styles.statCard}>
            <h2>{activeUsers}</h2>
            <p>Activos</p>
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
            <p>Chats</p>
          </div>

        </div>

        {/* ACTIONS */}
        <div style={styles.actionsTop}>
          <button
            style={styles.reportBtn}
            onClick={exportReport}
          >
            Descargar reporte
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* LOADING */}
        {loadingUsers && (
          <div style={styles.loading}>
            Cargando usuarios...
          </div>
        )}

        {/* USERS */}
        <div style={styles.list}>

          {Array.isArray(users) &&
            users.map((u) => (
              <div
                key={u.id_usuario}
                style={styles.card}
              >

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
                    onClick={() =>
                      setEdit(u)
                    }
                  >
                    Editar
                  </button>

                  <button
                    style={styles.deleteBtn}
                    onClick={() =>
                      deleteUser(
                        u.id_usuario
                      )
                    }
                  >
                    Eliminar
                  </button>

                </div>

              </div>
            ))}

        </div>

        {/* LOGS */}
        <div style={styles.logsBox}>

          <h2 style={styles.logsTitle}>
            📡 Logs del sistema
          </h2>

          {logs.map((log, i) => (
            <div
              key={i}
              style={styles.logItem}
            >
              {log}
            </div>
          ))}

        </div>

        {/* MODAL */}
        {edit && (
          <div style={styles.modal}>

            <div style={styles.modalBox}>

              <h2 style={styles.modalTitle}>
                Editar usuario
              </h2>

              <input
                style={styles.input}
                value={edit.nombre}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    nombre:
                      e.target.value,
                  })
                }
              />

              <input
                style={styles.input}
                value={edit.email || ""}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    email:
                      e.target.value,
                  })
                }
              />

              <select
                style={styles.input}
                value={edit.role}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    role:
                      e.target.value,
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

              <div
                style={
                  styles.modalActions
                }
              >

                <button
                  style={styles.saveBtn}
                  onClick={saveUser}
                >
                  Guardar
                </button>

                <button
                  style={
                    styles.cancelBtn
                  }
                  onClick={() =>
                    setEdit(null)
                  }
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

// =========================
// STYLES
// =========================

const styles = {
  page: {
    minHeight: "100vh",
    padding: 20,
    background:
      "radial-gradient(circle at top, #08111f, #020305)",
    fontFamily: "Arial",
    color: "#fff",
  },

  loadingScreen: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#020305",
    color: "#00e5ff",
    fontSize: 22,
  },

  container: {
    maxWidth: 1200,
    margin: "0 auto",
    background:
      "rgba(12,18,28,0.95)",
    borderRadius: 20,
    padding: 24,
    border:
      "1px solid rgba(0,229,255,0.15)",
    boxShadow:
      "0 0 60px rgba(0,229,255,0.08)",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  title: {
    color: "#00e5ff",
    textShadow:
      "0 0 15px rgba(0,229,255,0.5)",
  },

  logoutBtn: {
    background: "#ff3b3b",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: 15,
    marginBottom: 25,
  },

  statCard: {
    background:
      "rgba(0,0,0,0.3)",
    borderRadius: 15,
    padding: 20,
    textAlign: "center",
    border:
      "1px solid rgba(0,229,255,0.12)",
  },

  actionsTop: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 20,
  },

  reportBtn: {
    background: "#00e5ff",
    border: "none",
    padding: "10px 15px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  errorBox: {
    background:
      "rgba(255,0,0,0.15)",
    border:
      "1px solid rgba(255,0,0,0.3)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },

  loading: {
    marginBottom: 15,
    color: "#00e5ff",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  card: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 14,
    background:
      "rgba(0,0,0,0.35)",
    border:
      "1px solid rgba(0,229,255,0.1)",
  },

  name: {
    margin: 0,
  },

  text: {
    color: "#aaa",
    margin: "4px 0",
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
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },

  deleteBtn: {
    background: "#ff3b3b",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  logsBox: {
    marginTop: 30,
    background:
      "rgba(0,0,0,0.3)",
    borderRadius: 16,
    padding: 20,
    border:
      "1px solid rgba(0,229,255,0.12)",
  },

  logsTitle: {
    color: "#00e5ff",
    marginBottom: 15,
  },

  logItem: {
    padding: 10,
    borderBottom:
      "1px solid rgba(255,255,255,0.05)",
    color: "#ccc",
    fontSize: 14,
  },

  modal: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: 380,
    background: "#0b1018",
    padding: 22,
    borderRadius: 15,
    border:
      "1px solid rgba(0,229,255,0.2)",
  },

  modalTitle: {
    color: "#00e5ff",
    marginBottom: 15,
    textAlign: "center",
  },

  input: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
    border:
      "1px solid rgba(0,229,255,0.15)",
    background: "#05070c",
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
    cursor: "pointer",
    fontWeight: "bold",
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
