import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const API = "https://empatia-backend.onrender.com";

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [edit, setEdit] = useState(null);
  const [section, setSection] = useState("dashboard");

  const [status, setStatus] = useState({
    backend: "checking",
    ai: "checking",
  });

  /* =========================
     LOAD USERS (FIX REAL)
  ========================= */
  const loadUsers = async () => {
    try {
      const res = await fetch(`${API}/api/users`);

      const data = await res.json();

      console.log("USERS:", data);

      if (!res.ok) throw new Error("API error");

      setUsers(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("CRUD ERROR:", err);
      setUsers([]);
    }
  };

  /* =========================
     DELETE USER
  ========================= */
  const deleteUser = async (id) => {
    if (!confirm("¿Eliminar usuario?")) return;

    await fetch(`${API}/api/users/${id}`, {
      method: "DELETE",
    });

    loadUsers();
  };

  /* =========================
     SAVE USER
  ========================= */
  const saveUser = async () => {
    await fetch(`${API}/api/users/${edit.id_usuario}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: edit.nombre,
        email: edit.email,
        role: edit.role,
      }),
    });

    setEdit(null);
    loadUsers();
  };

  /* =========================
     BACKEND CHECK
  ========================= */
  const checkBackend = async () => {
    try {
      const res = await fetch(`${API}/`);

      setStatus((p) => ({
        ...p,
        backend: res.ok ? "online" : "error",
      }));

    } catch {
      setStatus((p) => ({
        ...p,
        backend: "offline",
      }));
    }
  };

  /* =========================
     IA CHECK
  ========================= */
  const checkAI = async () => {
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "test",
        }),
      });

      setStatus((p) => ({
        ...p,
        ai: res.ok ? "online" : "error",
      }));

    } catch {
      setStatus((p) => ({
        ...p,
        ai: "offline",
      }));
    }
  };

  /* =========================
     INIT
  ========================= */
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

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <h1 style={styles.title}>🛠 EMPATIA ADMIN</h1>

        {/* MENU */}
        <div style={styles.menu}>
          <button onClick={() => setSection("dashboard")}>Dashboard</button>
          <button onClick={() => setSection("users")}>Usuarios</button>
        </div>

        {/* DASHBOARD */}
        {section === "dashboard" && (
          <div style={styles.grid}>

            <div style={styles.card}>
              Backend: {status.backend}
            </div>

            <div style={styles.card}>
              IA: {status.ai}
            </div>

            <div style={styles.card}>
              Usuarios: {users.length}
            </div>

          </div>
        )}

        {/* USERS */}
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

        {/* EDIT */}
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

/* =========================
   STYLE SIMPLE EMPATIA
========================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#05070a",
    color: "#fff",
    padding: 20,
  },

  container: {
    maxWidth: 1000,
    margin: "auto",
  },

  title: {
    color: "#00e5ff",
  },

  menu: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 10,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  card: {
    background: "#111820",
    padding: 15,
    borderRadius: 10,
  },

  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    background: "#111",
    padding: 20,
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
};
