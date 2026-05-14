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
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #0b0f14, #05070a)",
    display: "flex",
    justifyContent: "center",
    padding: 20,
    fontFamily: "Arial"
  },

  container: {
    width: "100%",
    maxWidth: 950,
    background: "rgba(15, 22, 32, 0.9)",
    borderRadius: 18,
    border: "1px solid rgba(0,229,255,0.15)",
    boxShadow: "0 0 40px rgba(0,229,255,0.08)",
    padding: 20
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },

  title: {
    color: "#00e5ff",
    textShadow: "0 0 10px rgba(0,229,255,0.4)",
    margin: 0
  },

  back: {
    background: "transparent",
    border: "1px solid #00e5ff",
    color: "#00e5ff",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer"
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  },

  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    background: "#0f1620",
    border: "1px solid rgba(0,229,255,0.1)"
  },

  name: {
    color: "#fff",
    margin: 0
  },

  text: {
    color: "#aaa",
    fontSize: 13,
    margin: "4px 0"
  },

  role: {
    color: "#00e5ff",
    fontSize: 12
  },

  actions: {
    display: "flex",
    gap: 10
  },

  editBtn: {
    background: "#00e5ff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold"
  },

  deleteBtn: {
    background: "#ff3b3b",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer"
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
    alignItems: "center"
  },

  modalBox: {
    width: 360,
    background: "#0f1620",
    padding: 20,
    borderRadius: 12,
    border: "1px solid rgba(0,229,255,0.3)"
  },

  modalTitle: {
    color: "#00e5ff",
    marginBottom: 10
  },

  input: {
    width: "100%",
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    background: "#0b0f14",
    border: "1px solid rgba(0,229,255,0.3)",
    color: "#fff",
    outline: "none"
  },

  modalActions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 15,
    gap: 10
  },

  saveBtn: {
    flex: 1,
    background: "#00e5ff",
    border: "none",
    padding: 10,
    borderRadius: 8,
    fontWeight: "bold",
    cursor: "pointer"
  },

  cancelBtn: {
    flex: 1,
    background: "transparent",
    border: "1px solid #ff3b3b",
    color: "#ff3b3b",
    padding: 10,
    borderRadius: 8,
    cursor: "pointer"
  }
};
