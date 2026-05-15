import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const API = "https://empatia-backend.onrender.com";

  const navigate = useNavigate();

  const [section, setSection] = useState("dashboard");

  const [users, setUsers] = useState([]);
  const [edit, setEdit] = useState(null);

  const [backendStatus, setBackendStatus] = useState("checking");
  const [aiStatus, setAiStatus] = useState("checking");
  const [aiLatency, setAiLatency] = useState(null);

  const [logs, setLogs] = useState([]);

  // =========================
  // LOAD USERS (REAL DB)
  // =========================
  const loadUsers = async () => {
    try {
      const res = await fetch(`${API}/api/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  };

  // =========================
  // DELETE USER
  // =========================
  const deleteUser = async (id) => {
    if (!confirm("¿Eliminar usuario?")) return;

    await fetch(`${API}/api/users/${id}`, {
      method: "DELETE",
    });

    loadUsers();

    setLogs((p) => [
      "🗑 Usuario eliminado",
      ...p.slice(0, 10),
    ]);
  };

  // =========================
  // UPDATE USER
  // =========================
  const saveUser = async () => {
    await fetch(`${API}/api/users/${edit.id_usuario}`, {
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

    setLogs((p) => [
      "✏️ Usuario actualizado",
      ...p.slice(0, 10),
    ]);
  };

  // =========================
  // BACKEND CHECK
  // =========================
  const checkBackend = async () => {
    try {
      const res = await fetch(`${API}/`);
      setBackendStatus(res.ok ? "online" : "error");
    } catch {
      setBackendStatus("offline");
    }
  };

  // =========================
  // IA CHECK REAL
  // =========================
  const checkAI = async () => {
    try {
      const start = Date.now();

      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "test" }),
      });

      await res.json();

      setAiLatency(Date.now() - start);
      setAiStatus("online");

    } catch {
      setAiStatus("offline");
    }
  };

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    loadUsers();
    checkBackend();
    checkAI();

    const interval = setInterval(() => {
      checkBackend();
      checkAI();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  // =========================
  // UI STATUS COLOR
  // =========================
  const color = (s) =>
    s === "online"
      ? "#00ff9d"
      : s === "offline"
      ? "#ff3b3b"
      : "#ffaa00";

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>🛠 EMPATIA ADMIN</h1>

          <button style={styles.logout} onClick={logout}>
            Cerrar sesión
          </button>
        </div>

        {/* MENU */}
        <div style={styles.menu}>
          <button onClick={() => setSection("dashboard")} style={styles.btn}>Dashboard</button>
          <button onClick={() => setSection("users")} style={styles.btn}>Usuarios</button>
          <button onClick={() => setSection("ai")} style={styles.btn}>IA</button>
          <button onClick={() => setSection("logs")} style={styles.btn}>Logs</button>
        </div>

        {/* DASHBOARD */}
        {section === "dashboard" && (
          <div style={styles.grid}>

            <div style={styles.card}>
              <h3>Backend</h3>
              <p style={{ color: color(backendStatus) }}>
                {backendStatus}
              </p>
            </div>

            <div style={styles.card}>
              <h3>IA</h3>
              <p style={{ color: color(aiStatus) }}>
                {aiStatus}
              </p>
              <small>{aiLatency} ms</small>
            </div>

            <div style={styles.card}>
              <h3>Usuarios BD</h3>
              <p>{users.length}</p>
            </div>

          </div>
        )}

        {/* USERS (REAL CRUD) */}
        {section === "users" && (
          <div style={styles.list}>

            {users.map((u) => (
              <div key={u.id_usuario} style={styles.card}>

                <div>
                  <h3>{u.nombre}</h3>
                  <p>{u.email}</p>
                  <small>{u.role}</small>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setEdit(u)}>Editar</button>
                  <button onClick={() => deleteUser(u.id_usuario)}>
                    Eliminar
                  </button>
                </div>

              </div>
            ))}

          </div>
        )}

        {/* IA */}
        {section === "ai" && (
          <div style={styles.box}>
            <h2>🤖 IA Real</h2>

            <p>
              Estado:{" "}
              <b style={{ color: color(aiStatus) }}>
                {aiStatus}
              </b>
            </p>

            <p>Latencia: {aiLatency} ms</p>

            <button onClick={checkAI}>Probar IA</button>
          </div>
        )}

        {/* LOGS */}
        {section === "logs" && (
          <div style={styles.box}>
            <h2>Logs</h2>
            <p>✔ CRUD activo</p>
            <p>✔ IA activa</p>
            <p>✔ Backend conectado</p>
          </div>
        )}

        {/* EDIT MODAL */}
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
