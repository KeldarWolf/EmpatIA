import { useEffect, useState } from "react";

export default function Admin() {
  const API = "https://empatia-backend.onrender.com/api/users";

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
        <p style={styles.subtitle}>CRUD Usuarios EmpatIA</p>

        {/* ================= LIST ================= */}
        <div style={styles.list}>
          {users.map((u) => (
            <div key={u.id_usuario} style={styles.userCard}>
              <div>
                <h3 style={styles.name}>{u.nombre}</h3>
                <p style={styles.text}>{u.email}</p>
                <p style={styles.role}>{u.role}</p>
              </div>

              <div style={styles.actions}>
                <button
                  style={styles.editBtn}
                  onClick={() => setEdit(u)}
                >
                  Editar
                </button>

                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteUser(u.id_usuario)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ================= MODAL EDIT ================= */}
        {edit && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h2 style={{ color: "#00e5ff" }}>Editar usuario</h2>

              <input
                style={styles.input}
                value={edit.nombre}
                onChange={(e) =>
                  setEdit({ ...edit, nombre: e.target.value })
                }
              />

              <input
                style={styles.input}
                value={edit.email || ""}
                onChange={(e) =>
                  setEdit({ ...edit, email: e.target.value })
                }
              />

              <select
                style={styles.input}
                value={edit.role}
                onChange={(e) =>
                  setEdit({ ...edit, role: e.target.value })
                }
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>

              <div style={styles.modalActions}>
                <button style={styles.saveBtn} onClick={saveUser}>
                  Guardar
                </button>

                <button
                  style={styles.cancelBtn}
                  onClick={() => setEdit(null)}
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
    color: "#00e5ff",
    textAlign: "center",
  },

  subtitle: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 20,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  userCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#111",
    padding: 15,
    borderRadius: 12,
    border: "1px solid rgba(0,229,255,0.1)",
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
    fontSize: 12,
  },

  actions: {
    display: "flex",
    gap: 10,
  },

  editBtn: {
    background: "#00e5ff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
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

  modalActions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 15,
  },

  saveBtn: {
    flex: 1,
    marginRight: 5,
    padding: 10,
    background: "#00e5ff",
    border: "none",
    fontWeight: "bold",
  },

  cancelBtn: {
    flex: 1,
    marginLeft: 5,
    padding: 10,
    background: "#ff3b3b",
    border: "none",
    color: "#fff",
  },
};

