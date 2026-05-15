import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const API =
    "https://empatia-backend.onrender.com/api/users";

  const navigate = useNavigate();

  const [view, setView] =
    useState("dashboard");

  const [users, setUsers] = useState([]);

  const [edit, setEdit] = useState(null);

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
      console.error(err);

      setUsers([]);
    }
  };

  // =========================
  // LOAD ONLY WHEN USERS VIEW
  // =========================
  useEffect(() => {
    if (view === "users") {
      loadUsers();
    }
  }, [view]);

  // =========================
  // DELETE USER
  // =========================
  const deleteUser = async (id) => {
    try {
      const ok = window.confirm(
        "¿Eliminar usuario?"
      );

      if (!ok) return;

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

  return (
    <div style={styles.container}>

      {/* =========================
          DASHBOARD
      ========================= */}
      {view === "dashboard" && (
        <div style={styles.card}>

          <h1 style={styles.title}>
            🛠 Panel Admin
          </h1>

          <p style={styles.subtitle}>
            Zona administrativa EMPATIA
          </p>

          <div style={styles.box}>
            <h3 style={styles.sectionTitle}>
              Estado del sistema
            </h3>

            <p>
              ✔ Servidor activo
            </p>

            <p>
              ✔ Usuarios conectados:
              12
            </p>

            <p>
              ✔ IA emocional:
              online
            </p>
          </div>

          <div style={styles.box}>
            <h3 style={styles.sectionTitle}>
              Acciones rápidas
            </h3>

            <button
              style={styles.button}
              onClick={() =>
                setView("users")
              }
            >
              Ver usuarios
            </button>

            <button
              style={styles.button}
              onClick={() =>
                setView("logs")
              }
            >
              Logs del sistema
            </button>

            <button
              style={styles.button}
              onClick={() =>
                setView("metrics")
              }
            >
              Métricas
            </button>

            <button
              style={styles.button}
              onClick={() =>
                setView("ai")
              }
            >
              Estado IA
            </button>

            <button
              style={styles.dangerButton}
            >
              Reiniciar sistema
            </button>
          </div>

          <button
            style={styles.backButton}
            onClick={() =>
              navigate("/")
            }
          >
            Volver
          </button>

        </div>
      )}

      {/* =========================
          USERS
      ========================= */}
      {view === "users" && (
        <div style={styles.bigPanel}>

          <div style={styles.topBar}>
            <h2 style={styles.title}>
              👥 Usuarios
            </h2>

            <button
              style={styles.backMini}
              onClick={() =>
                setView("dashboard")
              }
            >
              ← Volver
            </button>
          </div>

          <div style={styles.userList}>

            {Array.isArray(users) &&
              users.map((u) => (
                <div
                  key={u.id_usuario}
                  style={styles.userCard}
                >

                  <div>
                    <h3
                      style={
                        styles.userName
                      }
                    >
                      {u.nombre}
                    </h3>

                    <p
                      style={
                        styles.userEmail
                      }
                    >
                      {u.email}
                    </p>

                    <span
                      style={
                        styles.userRole
                      }
                    >
                      {u.role}
                    </span>
                  </div>

                  <div
                    style={
                      styles.actions
                    }
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

        </div>
      )}

      {/* =========================
          LOGS
      ========================= */}
      {view === "logs" && (
        <div style={styles.card}>

          <h2 style={styles.title}>
            📜 Logs
          </h2>

          <div style={styles.box}>
            <p>
              ✅ Admin inició
              sesión
            </p>

            <p>
              🤖 IA funcionando
            </p>

            <p>
              🔒 Validación
              correcta
            </p>

            <p>
              ⚠ Intento de acceso
              denegado
            </p>
          </div>

          <button
            style={styles.backButton}
            onClick={() =>
              setView("dashboard")
            }
          >
            Volver
          </button>

        </div>
      )}

      {/* =========================
          METRICS
      ========================= */}
      {view === "metrics" && (
        <div style={styles.card}>

          <h2 style={styles.title}>
            📊 Métricas
          </h2>

          <div style={styles.box}>
            <p>CPU: 32%</p>

            <p>RAM: 58%</p>

            <p>
              API Requests:
              1.204
            </p>

            <p>
              IA Response: 1.2s
            </p>
          </div>

          <button
            style={styles.backButton}
            onClick={() =>
              setView("dashboard")
            }
          >
            Volver
          </button>

        </div>
      )}

      {/* =========================
          IA
      ========================= */}
      {view === "ai" && (
        <div style={styles.card}>

          <h2 style={styles.title}>
            🤖 Estado IA
          </h2>

          <div style={styles.box}>
            <p>
              ✔ Modelo conectado
            </p>

            <p>
              ✔ Respuestas activas
            </p>

            <p>
              ✔ Conversaciones:
              84
            </p>
          </div>

          <button
            style={styles.backButton}
            onClick={() =>
              setView("dashboard")
            }
          >
            Volver
          </button>

        </div>
      )}

      {/* =========================
          MODAL
      ========================= */}
      {edit && (
        <div style={styles.modal}>

          <div style={styles.modalBox}>

            <h2 style={styles.title}>
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
              value={edit.email}
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

            <div style={styles.actions}>

              <button
                style={styles.editBtn}
                onClick={saveUser}
              >
                Guardar
              </button>

              <button
                style={styles.deleteBtn}
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
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at center, #050505, #000)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    fontFamily: "Arial",
  },

  card: {
    width: "90%",
    maxWidth: 500,
    background:
      "rgba(10,10,10,0.9)",
    borderRadius: 20,
    padding: 25,
    boxShadow:
      "0 0 40px rgba(0,229,255,0.15)",
    border:
      "1px solid rgba(0,229,255,0.2)",
  },

  bigPanel: {
    width: "95%",
    maxWidth: 1100,
    background:
      "rgba(10,10,10,0.9)",
    borderRadius: 20,
    padding: 25,
    boxShadow:
      "0 0 40px rgba(0,229,255,0.15)",
    border:
      "1px solid rgba(0,229,255,0.2)",
  },

  title: {
    color: "#00e5ff",
    textAlign: "center",
  },

  subtitle: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 20,
  },

  sectionTitle: {
    color: "#00e5ff",
  },

  box: {
    background: "#111",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    color: "#ddd",
  },

  button: {
    width: "100%",
    padding: 10,
    marginTop: 8,
    borderRadius: 8,
    border:
      "1px solid rgba(0,229,255,0.3)",
    background: "transparent",
    color: "#00e5ff",
    cursor: "pointer",
  },

  dangerButton: {
    width: "100%",
    padding: 10,
    marginTop: 8,
    borderRadius: 8,
    border: "none",
    background: "#ff3b3b",
    color: "#fff",
    cursor: "pointer",
  },

  backButton: {
    width: "100%",
    marginTop: 15,
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#00e5ff",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
  },

  topBar: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  backMini: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    background: "#00e5ff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  userList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  userCard: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    background: "#111",
    padding: 15,
    borderRadius: 12,
  },

  userName: {
    color: "#fff",
    margin: 0,
  },

  userEmail: {
    color: "#aaa",
  },

  userRole: {
    color: "#00e5ff",
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
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },

  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: 350,
    background: "#111",
    padding: 20,
    borderRadius: 15,
  },

  input: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    border: "1px solid #333",
    background: "#000",
    color: "#fff",
    boxSizing: "border-box",
  },
};
