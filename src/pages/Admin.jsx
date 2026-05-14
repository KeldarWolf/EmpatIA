import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const API = "https://empatia-backend.onrender.com/api/users";
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [edit, setEdit] = useState(null);

  // =========================
  // LOAD USERS
  // =========================
  const loadUsers = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users", err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================
  // DELETE USER
  // =========================
  const deleteUser = async (id) => {
    if (!confirm("¿Eliminar usuario?")) return;

    await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    loadUsers();
  };

  // =========================
  // UPDATE USER
  // =========================
  const saveUser = async () => {
    await fetch(`${API}/${edit.id_usuario}`, {
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

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🛠 Admin Panel</h1>

        {/* ================= LIST ================= */}
        <div style={styles.list}>
          {users.map((u) => (
            <div key={u.id_usuario} style={styles.userCard}>
              <div>
                <h3>{u.nombre}</h3>
                <p>{u.email}</p>
                <p>{u.role}</p>
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

        {/* ================= MODAL ================= */}
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

              <div style={styles.modalActions}>
                <button onClick={saveUser}>Guardar</button>
                <button onClick={() => setEdit(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "radial-gradient(circle at center, #050505, #000)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    fontFamily: "Arial",
  },

  card: {
    width: "100%",
    maxWidth: 900,
    background: "rgba(10,10,10,0.95)",
    borderRadius: 20,
    padding: 20,
    border: "1px solid rgba(0,229,255,0.2)",
    boxShadow: "0 0 40px rgba(0,229,255,0.15)",
  },

  title: {
    textAlign: "center",
    color: "#00e5ff",
    fontSize: 26,
    textShadow: "0 0 10px rgba(0,229,255,0.5)",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 20,
  },

  userCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#111",
    padding: 15,
    borderRadius: 12,
    border: "1px solid rgba(0,229,255,0.1)",
    boxShadow: "0 0 10px rgba(0,229,255,0.05)",
  },

  actions: {
    display: "flex",
    gap: 10,
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
    width: 350,
    background: "#111",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #00e5ff",
    boxShadow: "0 0 30px rgba(0,229,255,0.2)",
  },

  modalActions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 15,
  },

  input: {
    width: "100%",
    marginTop: 10,
    padding: 10,
    background: "#000",
    color: "#fff",
    border: "1px solid #00e5ff",
    borderRadius: 6,
    outline: "none",
  },

  button: {
    background: "#00e5ff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 0 10px rgba(0,229,255,0.2)",
  },

  deleteBtn: {
    background: "#ff3b3b",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
