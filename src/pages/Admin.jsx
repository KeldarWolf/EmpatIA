import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const API = "https://empatia-backend.onrender.com/api/users";
  const CHAT_API = "https://empatia-backend.onrender.com/chat";

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [edit, setEdit] = useState(null);
  const [section, setSection] = useState("dashboard");

  const [aiStatus, setAiStatus] = useState("checking");
  const [tokensUsed, setTokensUsed] = useState(0);
  const [aiResponse, setAiResponse] = useState("");

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
  // USERS
  // =========================
  const loadUsers = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    loadUsers();
    testAI();
  }, []);

  // =========================
  // TEST IA REAL
  // =========================
  const testAI = async () => {
    try {
      setAiStatus("online");

      const res = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "di ok" })
      });

      const data = await res.json();

      setAiResponse(data.reply);
      setTokensUsed((t) => t + 10);
    } catch {
      setAiStatus("error");
    }
  };

  // =========================
  // CRUD
  // =========================
  const deleteUser = async (id) => {
    if (!confirm("¿Eliminar usuario?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    loadUsers();
  };

  const saveUser = async () => {
    await fetch(`${API}/${edit.id_usuario}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit),
    });

    setEdit(null);
    loadUsers();
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>🛠 EMPATIA ADMIN</h1>

          <button style={styles.logoutBtn} onClick={logout}>
            Cerrar sesión
          </button>
        </div>

        {/* MENU BOTONES */}
        <div style={styles.menu}>
          <button style={styles.menuBtn} onClick={() => setSection("dashboard")}>Dashboard</button>
          <button style={styles.menuBtn} onClick={() => setSection("users")}>Usuarios</button>
          <button style={styles.menuBtn} onClick={() => setSection("ai")}>IA</button>
          <button style={styles.menuBtn} onClick={() => setSection("logs")}>Logs</button>
        </div>

        {/* DASHBOARD REAL */}
        {section === "dashboard" && (
          <div style={styles.statsGrid}>

            <div style={styles.cardStat}>
              <h3>👥 Usuarios</h3>
              <p>{users.length}</p>
            </div>

            <div style={styles.cardStat}>
              <h3>🤖 IA</h3>
              <p>{aiStatus}</p>
            </div>

            <div style={styles.cardStat}>
              <h3>🪙 Tokens IA</h3>
              <p>{tokensUsed}</p>
            </div>

            <div style={styles.cardStat}>
              <h3>⚡ Estado</h3>
              <p>Activo</p>
            </div>

          </div>
        )}

        {/* USERS CRUD */}
        {section === "users" && (
          <div style={styles.list}>
            {users.map((u) => (
              <div key={u.id_usuario} style={styles.card}>

                <div>
                  <h3 style={styles.name}>{u.nombre}</h3>
                  <p style={styles.text}>{u.email}</p>
                  <span style={styles.role}>{u.role}</span>
                </div>

                <div style={styles.actions}>
                  <button style={styles.editBtn} onClick={() => setEdit(u)}>
                    Editar
                  </button>

                  <button style={styles.deleteBtn} onClick={() => deleteUser(u.id_usuario)}>
                    Eliminar
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* IA REAL */}
        {section === "ai" && (
          <div style={styles.panel}>

            <h2 style={styles.h2}>🤖 Estado IA</h2>

            <div style={styles.log}>Estado: {aiStatus}</div>
            <div style={styles.log}>Respuesta: {aiResponse}</div>
            <div style={styles.log}>Tokens usados: {tokensUsed}</div>

            <button style={styles.menuBtn} onClick={testAI}>
              Probar IA
            </button>

          </div>
        )}

        {/* LOGS */}
        {section === "logs" && (
          <div style={styles.panel}>
            <div style={styles.log}>✔ Sistema activo</div>
            <div style={styles.log}>✔ IA conectada</div>
            <div style={styles.log}>✔ BD funcionando</div>
          </div>
        )}

        {/* MODAL */}
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

              <button style={styles.menuBtn} onClick={saveUser}>Guardar</button>
              <button style={styles.deleteBtn} onClick={() => setEdit(null)}>Cancelar</button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* =========================
   EMPATIA STYLE
========================= */

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
    maxWidth: 1100,
    background: "rgba(10,15,22,0.9)",
    borderRadius: 20,
    padding: 20,
    border: "1px solid rgba(0,229,255,0.2)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
    marginTop: 20,
    flexWrap: "wrap",
  },

  menuBtn: {
    background: "#00e5ff22",
    border: "1px solid #00e5ff55",
    color: "#00e5ff",
    padding: 10,
    borderRadius: 8,
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: 10,
    marginTop: 20,
  },

  cardStat: {
    background: "#111",
    padding: 15,
    borderRadius: 10,
    color: "#fff",
  },

  list: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  card: {
    display: "flex",
    justifyContent: "space-between",
    background: "#111",
    padding: 15,
    borderRadius: 10,
  },

  name: { color: "#fff" },
  text: { color: "#aaa" },
  role: { color: "#00e5ff" },

  actions: {
    display: "flex",
    gap: 10,
  },

  editBtn: {
    background: "#00e5ff",
    border: "none",
    padding: 8,
    borderRadius: 6,
  },

  deleteBtn: {
    background: "#ff3b3b",
    border: "none",
    color: "#fff",
    padding: 8,
    borderRadius: 6,
  },

  panel: {
    marginTop: 20,
    background: "#111",
    padding: 15,
    borderRadius: 10,
  },

  log: {
    color: "#ccc",
    marginBottom: 10,
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
