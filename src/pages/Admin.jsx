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

/* =========================
   ESTILOS (si ya los tienes, ignóralo)
========================= */
const styles = {
  container: {
    minHeight: "100vh",
    background: "radial-gradient(circle, #000, #050505)",
    display: "flex",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 900,
    background: "#111",
    padding: 20,
    borderRadius: 12,
    color: "#fff",
  },

  title: {
    textAlign: "center",
    color: "#00e5ff",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 20,
  },

  userCard: {
    display: "flex",
    justifyContent: "space-between",
    background: "#1a1a1a",
    padding: 10,
    borderRadius: 8,
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
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    background: "#222",
    padding: 20,
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  modalActions: {
    display: "flex",
    justifyContent: "space-between",
  },
};
