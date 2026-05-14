import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const API = "https://empatia-backend.onrender.com/api/users";
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [edit, setEdit] = useState(null);

  // 🔐 PROTECCIÓN REAL
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuario"));

    const role = (user?.role || "").toLowerCase().trim();

    if (role !== "admin") {
      alert("Acceso denegado");
      navigate("/user");
    }
  }, []);

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
