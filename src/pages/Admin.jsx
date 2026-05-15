import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const API =
    "https://empatia-backend.onrender.com/api/users";

  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================
  const [users, setUsers] = useState([]);
  const [edit, setEdit] = useState(null);

  const [section, setSection] =
    useState("dashboard");

  // =========================
  // LOAD USERS
  // =========================
  const loadUsers = async () => {
    try {
      const res = await fetch(API);

      const data = await res.json();

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }

    } catch (err) {
      console.error(
        "Error loading users",
        err
      );

      setUsers([]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================
  // DELETE USER
  // =========================
  const deleteUser = async (id) => {
    try {
      const confirmDelete =
        window.confirm(
          "¿Eliminar usuario?"
        );

      if (!confirmDelete) return;

      await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

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
      await fetch(
        `${API}/${edit.id_usuario}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            nombre: edit.nombre,
            email: edit.email,
            role: edit.role,
          }),
        }
      );

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
    localStorage.removeItem("user");

    localStorage.removeItem("token");

    navigate("/login");
  };

  // =========================
  // EXPORT USERS
  // =========================
  const exportUsers = () => {
    const data = JSON.stringify(
      users,
      null,
      2
    );

    const blob = new Blob([data], {
      type: "application/json",
    });

    const url =
      window.URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "usuarios-empatia.json";

    a.click();
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>

          <h1 style={styles.title}>
            🛠 EMPATIA ADMIN PANEL
          </h1>

          <button
            style={styles.logoutBtn}
            onClick={logout}
          >
            Cerrar sesión
          </button>

        </div>

        {/* MENU */}
        <div style={styles.menu}>

          <button
            style={styles.menuBtn}
            onClick={() =>
              setSection("dashboard")
            }
          >
            Dashboard
          </button>

          <button
            style={styles.menuBtn}
            onClick={() =>
              setSection("users")
            }
          >
            Usuarios
          </button>

          <button
            style={styles.menuBtn}
            onClick={() =>
              setSection("logs")
            }
          >
            Logs
          </button>

          <button
            style={styles.menuBtn}
            onClick={() =>
              setSection("metrics")
            }
          >
            Métricas
          </button>

          <button
            style={styles.menuBtn}
            onClick={() =>
              setSection("ai")
            }
          >
            IA
          </button>

          <button
            style={styles.menuBtn}
            onClick={() =>
              setSection("reports")
            }
          >
            Reportes
          </button>

        </div>

        {/* =========================
            DASHBOARD
        ========================= */}
        {section === "dashboard" && (
          <div style={styles.statsGrid}>

            <div style={styles.statCard}>
              <h3 style={styles.statTitle}>
                🟢 Servidor
              </h3>

              <p style={styles.statValue}>
                Operativo
              </p>
            </div>

            <div style={styles.statCard}>
              <h3 style={styles.statTitle}>
                👥 Usuarios
              </h3>

              <p style={styles.statValue}>
                {users.length}
              </p>
            </div>

            <div style={styles.statCard}>
              <h3 style={styles.statTitle}>
                🤖 IA
              </h3>

              <p style={styles.statValue}>
                Funcionando
              </p>
            </div>

            <div style={styles.statCard}>
              <h3 style={styles.statTitle}>
                📊 Sesiones
              </h3>

              <p style={styles.statValue}>
                12 activas
              </p>
            </div>

          </div>
        )}

        {/* =========================
            USERS
        ========================= */}
        {section === "users" && (
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

                  <div
                    style={styles.actions}
                  >

                    <button
                      style={
                        styles.editBtn
                      }
                      onClick={() =>
                        setEdit(u)
                      }
                    >
                      Editar
                    </button>

                    <button
                      style={
                        styles.deleteBtn
                      }
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
        )}

        {/* =========================
            LOGS
        ========================= */}
        {section === "logs" && (
          <div style={styles.logsBox}>

            <h2 style={styles.sectionTitle}>
              📜 Logs del sistema
            </h2>

            <div style={styles.log}>
              ✅ Administrador inició sesión
            </div>

            <div style={styles.log}>
              🤖 IA funcionando
            </div>

            <div style={styles.log}>
              🔒 Validación de sesión
              correcta
            </div>

            <div style={styles.log}>
              🗑 Usuario eliminado
            </div>

            <div style={styles.log}>
              ⚡ Sistema operativo
            </div>

          </div>
        )}

        {/* =========================
            METRICS
        ========================= */}
        {section === "metrics" && (
          <div style={styles.statsGrid}>

            <div style={styles.statCard}>
              <h3 style={styles.statTitle}>
                CPU
              </h3>

              <p style={styles.statValue}>
                32%
              </p>
            </div>

            <div style={styles.statCard}>
              <h3 style={styles.statTitle}>
                RAM
              </h3>

              <p style={styles.statValue}>
                58%
              </p>
            </div>

            <div style={styles.statCard}>
              <h3 style={styles.statTitle}>
                API Requests
              </h3>

              <p style={styles.statValue}>
                1.204
              </p>
            </div>

            <div style={styles.statCard}>
              <h3 style={styles.statTitle}>
                IA Response
              </h3>

              <p style={styles.statValue}>
                1.2s
              </p>
            </div>

          </div>
        )}

        {/* =========================
            IA
        ========================= */}
        {section === "ai" && (
          <div style={styles.logsBox}>

            <h2 style={styles.sectionTitle}>
              🤖 Estado IA
            </h2>

            <div style={styles.log}>
              ✅ Modelo conectado
            </div>

            <div style={styles.log}>
              💬 Conversaciones hoy:
              84
            </div>

            <div style={styles.log}>
              ⚡ Tiempo promedio:
              1.2 segundos
            </div>

            <div style={styles.log}>
              🧠 Respuestas operativas
            </div>

          </div>
        )}

        {/* =========================
            REPORTS
        ========================= */}
        {section === "reports" && (
          <div style={styles.reportBox}>

            <button
              style={styles.reportBtn}
            >
              Descargar PDF
            </button>

            <button
              style={styles.reportBtn}
              onClick={exportUsers}
            >
              Exportar usuarios
            </button>

            <button
              style={styles.reportBtn}
            >
              Reporte IA
            </button>

            <button
              style={styles.reportBtn}
            >
              Reporte sistema
            </button>

          </div>
        )}

        {/* =========================
            MODAL
        ========================= */}
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

/* =========================
   STYLES
========================= */

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #0b0f14, #05070a)",
    display: "flex",
    justifyContent: "center",
    padding: 20,
    fontFamily: "Arial",
  },

  container: {
    width: "100%",
    maxWidth: 1200,
    background:
      "rgba(15,22,32,0.9)",
    borderRadius: 20,
    padding: 20,
    border:
      "1px solid rgba(0,229,255,0.15)",
    boxShadow:
      "0 0 50px rgba(0,229,255,0.08)",
    backdropFilter: "blur(10px)",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    color: "#00e5ff",
    textShadow:
      "0 0 12px rgba(0,229,255,0.6)",
  },

  logoutBtn: {
    background: "#ff3b3b",
    border: "none",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  menu: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 25,
  },

  menuBtn: {
    background:
      "rgba(0,229,255,0.12)",
    color: "#00e5ff",
    border:
      "1px solid rgba(0,229,255,0.25)",
    padding: "10px 15px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 15,
  },

  statCard: {
    background:
      "rgba(10,15,22,0.9)",
    padding: 20,
    borderRadius: 14,
    border:
      "1px solid rgba(0,229,255,0.15)",
  },

  statTitle: {
    color: "#aaa",
  },

  statValue: {
    color: "#00e5ff",
    fontSize: 24,
    fontWeight: "bold",
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
    padding: 16,
    borderRadius: 14,
    background:
      "rgba(10,15,22,0.9)",
    border:
      "1px solid rgba(0,229,255,0.12)",
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
    background:
      "rgba(10,15,22,0.9)",
    padding: 20,
    borderRadius: 14,
  },

  sectionTitle: {
    color: "#00e5ff",
    marginBottom: 15,
  },

  log: {
    color: "#ccc",
    padding: 12,
    marginBottom: 10,
    background:
      "rgba(255,255,255,0.03)",
    borderRadius: 8,
  },

  reportBox: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  reportBtn: {
    background: "#00e5ff",
    border: "none",
    padding: "12px 15px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "rgba(0,0,0,0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: 380,
    background:
      "rgba(15,22,32,0.95)",
    padding: 22,
    borderRadius: 14,
    border:
      "1px solid rgba(0,229,255,0.25)",
  },

  modalTitle: {
    color: "#00e5ff",
    textAlign: "center",
  },

  input: {
    width: "100%",
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    background: "#0b0f14",
    border:
      "1px solid rgba(0,229,255,0.25)",
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
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },

  cancelBtn: {
    flex: 1,
    background: "transparent",
    border: "1px solid #ff3b3b",
    color: "#ff3b3b",
    padding: 10,
    borderRadius: 8,
    cursor: "pointer",
  },
};
