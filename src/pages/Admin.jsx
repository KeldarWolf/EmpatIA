
Comentarios de criterio
El sistema incorpora autenticación, diferenciación de perfiles y un panel administrativo funcional básico, permitiendo:

visualización de usuarios,
edición de registros,
eliminación de cuentas,
y navegación administrativa general.
Además, sí se evidencia un CRUD funcional básico asociado a la gestión de usuarios, considerando:

creación mediante registro autónomo,
visualización,
edición,
y eliminación.
Sin embargo, existe una diferencia importante entre las funcionalidades efectivamente implementadas y el alcance funcional declarado en el propio informe para el perfil administrador.

En el documento se establece explícitamente que el panel administrativo:

“Muestra el estado en tiempo real de los servicios (servidor, usuarios activos, funcionamiento de la IA) y permite ejecutar acciones clave como gestión de usuarios, revisión de logs y control del sistema.”

Asimismo, en los casos de uso se indica que el administrador debe:

supervisar el sistema,
visualizar estadísticas generales,
revisar interacciones anonimizadas,
y generar reportes de uso.
No obstante, durante la validación funcional  estas funcionalidades no lograron evidenciarse de manera operativa dentro del panel administrador.

Actualmente, el módulo administrativo se limita principalmente a:

visualización básica de usuarios,
edición simple,
y eliminación de registros.
No se observaron funcionalidades reales relacionadas con:

monitoreo en tiempo real,
estado operativo del servidor,
métricas del sistema,
funcionamiento de la IA,
revisión de logs,
reportes,
auditoría,
ni herramientas concretas de supervisión administrativa.
Por lo tanto, aunque el perfil administrador sí posee funcionalidad parcial y CRUD básico sobre usuarios, todavía no evidencia completamente el nivel de gestión y supervisión definido dentro de los requerimientos, casos de uso y descripción funcional del propio proyecto.

Adicionalmente, durante la validación funcional se detectó un problema de manejo de sesión, ya que después de cerrar sesión fue posible volver a acceder a páginas administrativas utilizando navegación del navegador sin volver a solicitar autenticación, lo que evidencia:

invalidación incompleta de sesión,
ausencia de control adecuado de caché,
y debilidad en protección de rutas administrativas.
Se recomienda fortalecer significativamente el perfil administrador incorporando:

monitoreo real del sistema,
métricas operativas,
logs funcionales,
reportes,
trazabilidad,
herramientas de supervisión,
y mejoras de seguridad asociadas al manejo de sesiones y control de acceso




import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const API = "https://empatia-backend.onrender.com/api/users";
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [edit, setEdit] = useState(null);

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

  const deleteUser = async (id) => {
    if (!confirm("¿Eliminar usuario?")) return;

    await fetch(`${API}/${id}`, { method: "DELETE" });
    loadUsers();
  };

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

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <h1 style={styles.title}>🛠 Admin Panel</h1>
        </div>

        {/* LIST */}
        <div style={styles.list}>
          {users.map((u) => (
            <div key={u.id_usuario} style={styles.card}>
              <div>
                <h3 style={styles.name}>{u.nombre}</h3>
                <p style={styles.text}>{u.email}</p>
                <span style={styles.role}>{u.role}</span>
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

        {/* MODAL */}
        {edit && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h2 style={styles.modalTitle}>Editar usuario</h2>

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

/* =========================
   EMPATIA CYBERPUNK STYLE
========================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #0b0f14, #05070a)",
    display: "flex",
    justifyContent: "center",
    padding: 20,
    fontFamily: "Arial",
  },

  container: {
    width: "100%",
    maxWidth: 1000,
    background: "rgba(15, 22, 32, 0.85)",
    borderRadius: 20,
    border: "1px solid rgba(0,229,255,0.15)",
    boxShadow: "0 0 50px rgba(0,229,255,0.08)",
    padding: 20,
    backdropFilter: "blur(10px)",
  },

  header: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 20,
  },

  title: {
    color: "#00e5ff",
    textShadow: "0 0 12px rgba(0,229,255,0.6)",
    fontSize: 26,
    letterSpacing: 1,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    background: "rgba(10, 15, 22, 0.9)",
    border: "1px solid rgba(0,229,255,0.12)",
    boxShadow: "0 0 15px rgba(0,229,255,0.05)",
    transition: "0.2s",
  },

  name: {
    color: "#fff",
    margin: 0,
  },

  text: {
    color: "#aaa",
    fontSize: 13,
    margin: "4px 0",
  },

  role: {
    color: "#00e5ff",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  actions: {
    display: "flex",
    gap: 10,
  },

  editBtn: {
    background: "#00e5ff",
    border: "none",
    padding: "7px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 0 10px rgba(0,229,255,0.3)",
    transition: "0.2s",
  },

  deleteBtn: {
    background: "#ff3b3b",
    border: "none",
    padding: "7px 12px",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 0 10px rgba(255,59,59,0.2)",
  },

  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(6px)",
  },

  modalBox: {
    width: 380,
    background: "rgba(15, 22, 32, 0.95)",
    padding: 22,
    borderRadius: 14,
    border: "1px solid rgba(0,229,255,0.25)",
    boxShadow: "0 0 40px rgba(0,229,255,0.15)",
  },

  modalTitle: {
    color: "#00e5ff",
    marginBottom: 12,
    textAlign: "center",
  },

  input: {
    width: "100%",
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    background: "#0b0f14",
    border: "1px solid rgba(0,229,255,0.25)",
    color: "#fff",
    outline: "none",
  },

  modalActions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 15,
    gap: 10,
  },

  saveBtn: {
    flex: 1,
    background: "#00e5ff",
    border: "none",
    padding: 10,
    borderRadius: 8,
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 0 12px rgba(0,229,255,0.3)",
  },

  cancelBtn: {
    flex: 1,
    background: "transparent",
    border: "1px solid #ff3b3b",
    color: "#ff3b3b",
    padding: 10,
    borderRadius: 8,
    cursor: "pointer",
  },
};
