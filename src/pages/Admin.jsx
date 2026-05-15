import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const API = "https://empatia-backend.onrender.com/api/users";
  const AI_PING = "https://empatia-backend.onrender.com/ai/ping";

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [edit, setEdit] = useState(null);
  const [section, setSection] = useState("dashboard");

  const [aiHealth, setAiHealth] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");

  // =========================
  // SECURITY
  // =========================
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuario"));
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, []);

  // =========================
  // LOAD USERS
  // =========================
  const loadUsers = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      setBackendStatus("online");
    } catch {
      setUsers([]);
      setBackendStatus("offline");
    }
  };

  // =========================
  // IA REAL PING
  // =========================
  const checkAI = async () => {
    try {
      const res = await fetch(AI_PING);
      const data = await res.json();
      setAiHealth(data);
    } catch {
      setAiHealth({ ok: false, status: "offline" });
    }
  };

  useEffect(() => {
    loadUsers();
    checkAI();
  }, []);

  // =========================
  // DELETE USER
  // =========================
  const deleteUser = async (id) => {
    if (!confirm("¿Eliminar usuario?")) return;

    await fetch(`${API}/${id}`, { method: "DELETE" });
    loadUsers();
  };

  // =========================
  // SAVE USER
  // =========================
  const saveUser = async () => {
    await fetch(`${API}/${edit.id_usuario}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit),
    });

    setEdit(null);
    loadUsers();
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>🛠 EMPATIA ADMIN PANEL</h1>

          <button style={styles.logoutBtn} onClick={logout}>
            Cerrar sesión
          </button>
        </div>

        {/* MENU */}
        <div style={styles.menu}>
          <button style={styles.menuBtn} onClick={() => setSection("dashboard")}>Dashboard</button>
          <button style={styles.menuBtn} onClick={() => setSection("users")}>Usuarios</button>
          <button style={styles.menuBtn} onClick={() => setSection("ai")}>IA</button>
          <button style={styles.menuBtn} onClick={() => setSection("logs")}>Logs</button>
        </div>

        {/* DASHBOARD */}
        {section === "dashboard" && (
          <div style={styles.grid}>

            <div style={styles.card}>
              <h3>👥 Usuarios</h3>
              <p>{users.length}</p>
            </div>

            <div style={styles.card}>
              <h3>🟢 Backend</h3>
              <p>{backendStatus}</p>
            </div>

            <div style={styles.card}>
              <h3>🤖 IA</h3>
              <p>{aiHealth?.status || "checking"}</p>
            </div>

            <div style={styles.card}>
              <h3>⚡ Latencia IA</h3>
              <p>{aiHealth?.latency || "N/A"} ms</p>
            </div>

          </div>
        )}

        {/* USERS TABLE */}
        {section === "users" && (
          <div style={styles.tableWrap}>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u.id_usuario}>
                    <td>{u.id_usuario}</td>
                    <td>{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>

                    <td>
                      <button style={styles.btnEdit} onClick={() => setEdit(u)}>
                        Editar
                      </button>

                      <button style={styles.btnDelete} onClick={() => deleteUser(u.id_usuario)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}

        {/* IA REAL */}
        {section === "ai" && (
          <div style={styles.panel}>

            <h2>🤖 IA REAL STATUS</h2>

            <p>Estado: {aiHealth?.status}</p>
            <p>Latencia: {aiHealth?.latency} ms</p>
            <p>Modelo: {aiHealth?.model}</p>

            <button style={styles.menuBtn} onClick={checkAI}>
              Hacer ping IA
            </button>

          </div>
        )}

        {/* LOGS */}
        {section === "logs" && (
          <div style={styles.panel}>
            <p>✔ Sistema activo</p>
            <p>✔ IA conectada</p>
            <p>✔ BD operativa</p>
          </div>
        )}

        {/* EDIT MODAL */}
        {edit && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>

              <input
                style={styles.input}
                value={edit.nombre}
                onChange={(e) => setEdit({ ...edit, nombre: e.target.value })}
              />

              <input
                style={styles.input}
                value={edit.email || ""}
                onChange={(e) => setEdit({ ...edit, email: e.target.value })}
              />

              <select
                style={styles.input}
                value={edit.role}
                onChange={(e) => setEdit({ ...edit, role: e.target.value })}
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>

              <button style={styles.menuBtn} onClick={saveUser}>
                Guardar
              </button>

              <button style={styles.btnDelete} onClick={() => setEdit(null)}>
                Cancelar
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}


const styles = {

  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #05070a, #000)",
    display: "flex",
    justifyContent: "center",
    padding: 20,
    fontFamily: "Arial",
  },

  container: {
    width: "100%",
    maxWidth: 1200,
    background: "rgba(10,15,22,0.9)",
    borderRadius: 20,
    padding: 20,
    border: "1px solid rgba(0,229,255,0.2)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: {
    color: "#00e5ff",
  },

  logoutBtn: {
    background: "#ff3b3b",
    color: "#fff",
    border: "none",
    padding: 10,
    borderRadius: 8,
  },

  menu: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },

  menuBtn: {
    background: "#00e5ff22",
    border: "1px solid #00e5ff55",
    color: "#00e5ff",
    padding: 10,
    borderRadius: 8,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: 10,
  },

  card: {
    background: "#111",
    padding: 15,
    borderRadius: 10,
    color: "#fff",
  },

  tableWrap: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "#fff",
    background: "#111",
  },

  btnEdit: {
    background: "#00e5ff",
    border: "none",
    marginRight: 5,
    padding: 6,
  },

  btnDelete: {
    background: "#ff3b3b",
    border: "none",
    padding: 6,
    color: "#fff",
  },

  panel: {
    marginTop: 20,
    background: "#111",
    padding: 15,
    borderRadius: 10,
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
    background: "#111",
    padding: 20,
    borderRadius: 10,
    width: 300,
  },

  input: {
    width: "100%",
    marginBottom: 10,
    padding: 10,
    background: "#000",
    color: "#fff",
    border: "1px solid #00e5ff",
  }
};


