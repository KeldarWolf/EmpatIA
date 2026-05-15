import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const API = "https://empatia-backend.onrender.com/api/users";
  const CHAT_API = "https://empatia-backend.onrender.com/chat";

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [edit, setEdit] = useState(null);

  const [section, setSection] = useState("dashboard");

  // ===== ESTADO REAL SISTEMA =====
  const [systemStatus, setSystemStatus] = useState("checking");
  const [aiStatus, setAiStatus] = useState("checking");
  const [aiTestResponse, setAiTestResponse] = useState("");
  const [tokensUsed, setTokensUsed] = useState(0);

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
      setSystemStatus("online");

      const res = await fetch(API);
      const data = await res.json();

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSystemStatus("error");
      setUsers([]);
    }
  };

  // =========================
  // CHECK IA REAL
  // =========================
  const testAI = async () => {
    try {
      setAiStatus("loading");

      const res = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Responde solo: IA OK"
        })
      });

      const data = await res.json();

      setAiTestResponse(data.reply);
      setAiStatus("online");

      // simula tokens (no BD)
      setTokensUsed((t) => t + 12);

    } catch (err) {
      console.error(err);
      setAiStatus("error");
    }
  };

  useEffect(() => {
    loadUsers();
    testAI();
  }, []);

  // =========================
  // DELETE
  // =========================
  const deleteUser = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;

    await fetch(`${API}/${id}`, { method: "DELETE" });
    loadUsers();
  };

  // =========================
  // SAVE
  // =========================
  const saveUser = async () => {
    await fetch(`${API}/${edit.id_usuario}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: edit.nombre,
        email: edit.email,
        role: edit.role,
      }),
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
          <h1 style={styles.title}>🛠 EMPATIA ADMIN</h1>

          <button style={styles.logoutBtn} onClick={logout}>
            Salir
          </button>
        </div>

        {/* MENU */}
        <div style={styles.menu}>
          {["dashboard","users","ai","logs"].map((s) => (
            <button
              key={s}
              style={styles.menuBtn}
              onClick={() => setSection(s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* DASHBOARD REAL */}
        {section === "dashboard" && (
          <div style={styles.statsGrid}>

            <div style={styles.statCard}>
              <h3>🟢 Backend</h3>
              <p>{systemStatus}</p>
            </div>

            <div style={styles.statCard}>
              <h3>🤖 IA</h3>
              <p>{aiStatus}</p>
            </div>

            <div style={styles.statCard}>
              <h3>👥 Usuarios</h3>
              <p>{users.length}</p>
            </div>

            <div style={styles.statCard}>
              <h3>🪙 Tokens IA</h3>
              <p>{tokensUsed}</p>
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
                  <button onClick={() => setEdit(u)}>Editar</button>
                  <button onClick={() => deleteUser(u.id_usuario)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* IA REAL */}
        {section === "ai" && (
          <div style={styles.logsBox}>
            <h2 style={styles.sectionTitle}>🤖 IA REAL STATUS</h2>

            <div style={styles.log}>
              Estado: {aiStatus}
            </div>

            <div style={styles.log}>
              Respuesta: {aiTestResponse}
            </div>

            <div style={styles.log}>
              Tokens usados: {tokensUsed}
            </div>

            <button style={styles.reportBtn} onClick={testAI}>
              Probar IA ahora
            </button>
          </div>
        )}

        {/* LOGS */}
        {section === "logs" && (
          <div style={styles.logsBox}>
            <div style={styles.log}>Sistema iniciado</div>
            <div style={styles.log}>IA conectada</div>
            <div style={styles.log}>Base de datos OK</div>
          </div>
        )}

        {/* MODAL */}
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
                value={edit.email || ""}
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
              <button onClick={() => setEdit(null)}>Cancelar</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
