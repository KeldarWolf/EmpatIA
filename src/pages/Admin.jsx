import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

export default function Admin() {
  const API =
    "https://empatia-backend.onrender.com/api/users";

  // =========================
  // IA STATUS API
  // =========================
  // CREA ESTE ENDPOINT EN TU BACKEND:
  //
  // GET /api/ai-status
  //
  // Debe responder:
  //
  // {
  //   "online": true,
  //   "model": "Gemini 2.5 Flash",
  //   "token": true
  // }
  //
  // =========================

  const AI_API =
    "https://empatia-backend.onrender.com/api/ai-status";

  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================
  const [users, setUsers] =
    useState([]);

  const [edit, setEdit] =
    useState(null);

  const [view, setView] =
    useState("dashboard");

  const [logs, setLogs] =
    useState([]);

  const [serverStatus,
    setServerStatus] =
    useState("Verificando...");

  const [aiStatus,
    setAiStatus] =
    useState({
      online: false,
      model: "Desconocido",
      token: false,
    });

  const [metrics,
    setMetrics] =
    useState({
      ram: 0,
      cpu: 0,
      requests: 0,
    });

  // =========================
  // SECURITY
  // =========================
  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem(
          "user"
        );

      if (!savedUser) {
        navigate("/login");
        return;
      }

      const user =
        JSON.parse(savedUser);

      if (
        user.role !== "admin"
      ) {
        navigate("/login");
      }

    } catch (err) {
      console.error(err);

      localStorage.clear();

      navigate("/login");
    }
  }, []);

  // =========================
  // LOAD USERS
  // =========================
  const loadUsers = async () => {
    try {
      const res = await fetch(
        API
      );

      const data =
        await res.json();

      if (Array.isArray(data)) {
        setUsers(data);

        setServerStatus(
          "Operativo"
        );

        addLog(
          "Usuarios cargados"
        );

      } else {
        setUsers([]);

        setServerStatus(
          "Error"
        );
      }

    } catch (err) {
      console.error(err);

      setServerStatus(
        "Sin conexión"
      );

      addLog(
        "Error backend"
      );
    }
  };

  // =========================
  // LOAD AI STATUS
  // =========================
  const loadAIStatus =
    async () => {
      try {
        const res =
          await fetch(
            AI_API
          );

        const data =
          await res.json();

        setAiStatus({
          online:
            data.online,
          model:
            data.model,
          token:
            data.token,
        });

        addLog(
          "Estado IA actualizado"
        );

      } catch (err) {
        console.error(err);

        setAiStatus({
          online: false,
          model:
            "Sin conexión",
          token: false,
        });

        addLog(
          "Error IA"
        );
      }
    };

  // =========================
  // FAKE METRICS SIMPLE
  // =========================
  // Simula métricas dinámicas
  // mientras no tengas backend real
  // =========================
  const loadMetrics = () => {
    setMetrics({
      ram:
        Math.floor(
          Math.random() * 30
        ) + 40,

      cpu:
        Math.floor(
          Math.random() * 30
        ) + 20,

      requests:
        Math.floor(
          Math.random() * 2000
        ) + 500,
    });
  };

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    loadUsers();

    loadAIStatus();

    loadMetrics();

    const interval =
      setInterval(() => {
        loadMetrics();

        loadAIStatus();
      }, 8000);

    return () =>
      clearInterval(
        interval
      );
  }, []);

  // =========================
  // LOGS
  // =========================
  const addLog = (text) => {
    const now =
      new Date().toLocaleTimeString();

    setLogs((prev) => [
      `${now} - ${text}`,
      ...prev,
    ]);
  };

  // =========================
  // DELETE USER
  // =========================
  const deleteUser =
    async (id) => {
      try {
        const ok =
          window.confirm(
            "¿Eliminar usuario?"
          );

        if (!ok) return;

        await fetch(
          `${API}/${id}`,
          {
            method:
              "DELETE",
          }
        );

        addLog(
          `Usuario eliminado ${id}`
        );

        loadUsers();

      } catch (err) {
        console.error(err);

        addLog(
          "Error eliminando usuario"
        );
      }
    };

  // =========================
  // SAVE USER
  // =========================
  const saveUser =
    async () => {
      try {
        await fetch(
          `${API}/${edit.id_usuario}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                nombre:
                  edit.nombre,

                email:
                  edit.email,

                role:
                  edit.role,
              }),
          }
        );

        addLog(
          `Usuario editado ${edit.nombre}`
        );

        setEdit(null);

        loadUsers();

      } catch (err) {
        console.error(err);

        addLog(
          "Error editando usuario"
        );
      }
    };

  // =========================
  // EXPORT USERS
  // =========================
  const exportUsers = () => {
    const data =
      JSON.stringify(
        users,
        null,
        2
      );

    const blob =
      new Blob([data], {
        type:
          "application/json",
      });

    const url =
      window.URL.createObjectURL(
        blob
      );

    const a =
      document.createElement(
        "a"
      );

    a.href = url;

    a.download =
      "usuarios.json";

    a.click();

    addLog(
      "Reporte exportado"
    );
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.clear();

    navigate("/login", {
      replace: true,
    });

    window.location.reload();
  };

  return (
    <div style={styles.container}>

      {/* =========================
          DASHBOARD
      ========================= */}
      {view ===
        "dashboard" && (
        <div style={styles.card}>

          <div
            style={
              styles.topBar
            }
          >

            <h1
              style={
                styles.title
              }
            >
              🛠 EMPATIA ADMIN
            </h1>

            <button
              style={
                styles.logoutBtn
              }
              onClick={
                logout
              }
            >
              Salir
            </button>

          </div>

          <p
            style={
              styles.subtitle
            }
          >
            Supervisión del
            sistema
          </p>

          {/* =========================
              SYSTEM STATUS
          ========================= */}
          <div style={styles.box}>

            <h3
              style={
                styles.sectionTitle
              }
            >
              Estado sistema
            </h3>

            <p>
              🟢 Servidor:
              {
                serverStatus
              }
            </p>

            <p>
              👥 Usuarios:
              {
                users.length
              }
            </p>

            <p>
              🤖 IA:
              {aiStatus.online
                ? " Operativa"
                : " Desconectada"}
            </p>

            <p>
              🔑 Token IA:
              {aiStatus.token
                ? " válido"
                : " inválido"}
            </p>

          </div>

          {/* =========================
              METRICS
          ========================= */}
          <div style={styles.box}>

            <h3
              style={
                styles.sectionTitle
              }
            >
              Métricas
            </h3>

            <p>
              CPU:
              {
                metrics.cpu
              }
              %
            </p>

            <p>
              RAM:
              {
                metrics.ram
              }
              %
            </p>

            <p>
              Requests:
              {
                metrics.requests
              }
            </p>

            <p>
              Admins:
              {
                users.filter(
                  (u) =>
                    u.role ===
                    "admin"
                ).length
              }
            </p>

          </div>

          {/* =========================
              IA STATUS
          ========================= */}
          <div style={styles.box}>

            <h3
              style={
                styles.sectionTitle
              }
            >
              Estado IA
            </h3>

            <p>
              Modelo:
              {
                aiStatus.model
              }
            </p>

            <p>
              Estado:
              {aiStatus.online
                ? " Online"
                : " Offline"}
            </p>

            <p>
              API Key:
              {aiStatus.token
                ? " Detectada"
                : " No detectada"}
            </p>

          </div>

          {/* =========================
              ACTIONS
          ========================= */}
          <div style={styles.box}>

            <h3
              style={
                styles.sectionTitle
              }
            >
              Acciones
            </h3>

            <button
              style={
                styles.button
              }
              onClick={() =>
                setView(
                  "users"
                )
              }
            >
              Usuarios
            </button>

            <button
              style={
                styles.button
              }
              onClick={() =>
                setView(
                  "logs"
                )
              }
            >
              Logs
            </button>

            <button
              style={
                styles.button
              }
              onClick={
                exportUsers
              }
            >
              Exportar reporte
            </button>

            <button
              style={
                styles.dangerButton
              }
              onClick={() => {
                addLog(
                  "Cache limpiada"
                );

                alert(
                  "Cache limpiada"
                );
              }}
            >
              Limpiar cache
            </button>

          </div>

        </div>
      )}

      {/* =========================
          USERS
      ========================= */}
      {view === "users" && (
        <div
          style={
            styles.bigPanel
          }
        >

          <div
            style={
              styles.topBar
            }
          >

            <h2
              style={
                styles.title
              }
            >
              👥 Usuarios
            </h2>

            <button
              style={
                styles.backBtn
              }
              onClick={() =>
                setView(
                  "dashboard"
                )
              }
            >
              ← Volver
            </button>

          </div>

          <div
            style={
              styles.userList
            }
          >

            {users.map((u) => (
              <div
                key={
                  u.id_usuario
                }
                style={
                  styles.userCard
                }
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

          <h2
            style={styles.title}
          >
            📜 Logs
          </h2>

          <div
            style={
              styles.logsBox
            }
          >

            {logs.map(
              (
                log,
                index
              ) => (
                <div
                  key={index}
                  style={
                    styles.log
                  }
                >
                  {log}
                </div>
              )
            )}

          </div>

          <button
            style={
              styles.backButton
            }
            onClick={() =>
              setView(
                "dashboard"
              )
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

          <div
            style={
              styles.modalBox
            }
          >

            <h2
              style={
                styles.title
              }
            >
              Editar usuario
            </h2>

            <input
              style={
                styles.input
              }
              value={
                edit.nombre
              }
              onChange={(e) =>
                setEdit({
                  ...edit,
                  nombre:
                    e.target
                      .value,
                })
              }
            />

            <input
              style={
                styles.input
              }
              value={
                edit.email
              }
              onChange={(e) =>
                setEdit({
                  ...edit,
                  email:
                    e.target
                      .value,
                })
              }
            />

            <select
              style={
                styles.input
              }
              value={
                edit.role
              }
              onChange={(e) =>
                setEdit({
                  ...edit,
                  role:
                    e.target
                      .value,
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
                styles.actions
              }
            >

              <button
                style={
                  styles.editBtn
                }
                onClick={
                  saveUser
                }
              >
                Guardar
              </button>

              <button
                style={
                  styles.deleteBtn
                }
                onClick={() =>
                  setEdit(
                    null
                  )
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
    justifyContent:
      "center",
    alignItems: "center",
    padding: 20,
    fontFamily: "Arial",
  },

  card: {
    width: "90%",
    maxWidth: 550,
    background:
      "rgba(10,10,10,0.92)",
    borderRadius: 20,
    padding: 25,
    border:
      "1px solid rgba(0,229,255,0.2)",
    boxShadow:
      "0 0 40px rgba(0,229,255,0.15)",
  },

  bigPanel: {
    width: "95%",
    maxWidth: 1100,
    background:
      "rgba(10,10,10,0.92)",
    borderRadius: 20,
    padding: 25,
    border:
      "1px solid rgba(0,229,255,0.2)",
    boxShadow:
      "0 0 40px rgba(0,229,255,0.15)",
  },

  topBar: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    color: "#00e5ff",
  },

  subtitle: {
    color: "#aaa",
    marginBottom: 20,
  },

  sectionTitle: {
    color: "#00e5ff",
    marginBottom: 10,
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
    background:
      "transparent",
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

  logoutBtn: {
    background: "#ff3b3b",
    border: "none",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: 8,
    cursor: "pointer",
  },

  backBtn: {
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

  logsBox: {
    maxHeight: 350,
    overflowY: "auto",
  },

  log: {
    background:
      "rgba(255,255,255,0.03)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    color: "#ddd",
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

  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent:
      "center",
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
    border:
      "1px solid #333",
    background: "#000",
    color: "#fff",
    boxSizing: "border-box",
  },
};
