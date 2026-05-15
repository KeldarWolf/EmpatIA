import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {

  const navigate = useNavigate();

  const API =
    "https://empatia-backend.onrender.com/api/users";

  const [users, setUsers] = useState([]);

  const [section, setSection] =
    useState("dashboard");

  // =========================
  // SECURITY
  // =========================
  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (!user || user.role !== "admin") {
      navigate("/login");
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
      console.log(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================
  // DELETE USER
  // =========================
  const deleteUser = async (id) => {

    if (!window.confirm("¿Eliminar usuario?"))
      return;

    await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    loadUsers();
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/login");

    window.location.reload();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* TITLE */}
        <h1 style={styles.title}>
          🛠 Panel Admin
        </h1>

        <p style={styles.subtitle}>
          Supervisión y control del sistema
        </p>

        {/* DASHBOARD */}
        <div style={styles.box}>
          <h3 style={styles.sectionTitle}>
            Estado del sistema
          </h3>

          <p>✔ Servidor activo</p>

          <p>
            ✔ Usuarios conectados: {users.length}
          </p>

          <p>✔ IA emocional: online</p>

          <p>✔ Sesiones activas: 12</p>
        </div>

        {/* MENU */}
        <div style={styles.box}>
          <h3 style={styles.sectionTitle}>
            Acciones administrativas
          </h3>

          <button
            style={styles.button}
            onClick={() => setSection("users")}
          >
            👥 Ver usuarios
          </button>

          <button
            style={styles.button}
            onClick={() => setSection("logs")}
          >
            📜 Logs del sistema
          </button>

          <button
            style={styles.button}
            onClick={() => setSection("metrics")}
          >
            📊 Métricas
          </button>

          <button
            style={styles.button}
            onClick={() => setSection("ai")}
          >
            🤖 Estado IA
          </button>

          <button
            style={styles.button}
            onClick={() => setSection("reports")}
          >
            📁 Reportes
          </button>

          <button
            style={styles.dangerButton}
          >
            Reiniciar sistema
          </button>
        </div>

        {/* =========================
            USERS CRUD
        ========================= */}
        {section === "users" && (
          <div style={styles.box}>

            <h3 style={styles.sectionTitle}>
              Gestión de usuarios
            </h3>

            {users.map((u) => (
              <div
                key={u.id_usuario}
                style={styles.userCard}
              >

                <div>
                  <strong>{u.nombre}</strong>

                  <p style={styles.userText}>
                    {u.email}
                  </p>

                  <span style={styles.role}>
                    {u.role}
                  </span>
                </div>

                <div style={styles.actions}>

                  <button
                    style={styles.editBtn}
                  >
                    Editar
                  </button>

                  <button
                    style={styles.deleteBtn}
                    onClick={() =>
                      deleteUser(u.id_usuario)
                    }
                  >
                    Eliminar
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

        {/* =========================
            LOGS
        ========================= */}
        {section === "logs" && (
          <div style={styles.box}>

            <h3 style={styles.sectionTitle}>
              📜 Logs del sistema
            </h3>

            <div style={styles.log}>
              ✅ Usuario admin inició sesión
            </div>

            <div style={styles.log}>
              🤖 IA respondió correctamente
            </div>

            <div style={styles.log}>
              ⚠ Intento de acceso denegado
            </div>

            <div style={styles.log}>
              🗑 Usuario eliminado
            </div>

            <div style={styles.log}>
              🔒 Validación de sesión completada
            </div>

          </div>
        )}

        {/* =========================
            METRICS
        ========================= */}
        {section === "metrics" && (
          <div style={styles.box}>

            <h3 style={styles.sectionTitle}>
              📊 Métricas operativas
            </h3>

            <div style={styles.metric}>
              CPU: 32%
            </div>

            <div style={styles.metric}>
              RAM: 58%
            </div>

            <div style={styles.metric}>
              Requests API: 1.204
            </div>

            <div style={styles.metric}>
              Tiempo respuesta IA: 1.2s
            </div>

          </div>
        )}

        {/* =========================
            IA
        ========================= */}
        {section === "ai" && (
          <div style={styles.box}>

            <h3 style={styles.sectionTitle}>
              🤖 Estado IA
            </h3>

            <div style={styles.log}>
              ✔ Modelo IA conectado
            </div>

            <div style={styles.log}>
              ✔ Conversaciones hoy: 84
            </div>

            <div style={styles.log}>
              ✔ Tiempo promedio: 1.2 segundos
            </div>

            <div style={styles.log}>
              ✔ Sistema emocional operativo
            </div>

          </div>
        )}

        {/* =========================
            REPORTS
        ========================= */}
        {section === "reports" && (
          <div style={styles.box}>

            <h3 style={styles.sectionTitle}>
              📁 Reportes del sistema
            </h3>

            <button style={styles.button}>
              Descargar reporte PDF
            </button>

            <button style={styles.button}>
              Exportar usuarios
            </button>

            <button style={styles.button}>
              Reporte IA
            </button>

            <button style={styles.button}>
              Auditoría sistema
            </button>

          </div>
        )}

        {/* FOOTER */}
        <button
          style={styles.backButton}
          onClick={logout}
        >
          Cerrar sesión
        </button>

      </div>
    </div>
  );
}

const styles = {

  container: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at center, #050505, #000)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    fontFamily: "Arial",
  },

  card: {
    width: "95%",
    maxWidth: "900px",
    background: "rgba(10,10,10,0.92)",
    borderRadius: "20px",
    padding: "25px",
    boxShadow:
      "0 0 40px rgba(0,229,255,0.15)",
    border:
      "1px solid rgba(0,229,255,0.2)",
  },

  title: {
    color: "#00e5ff",
    textAlign: "center",
    marginBottom: "5px",
  },

  subtitle: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: "20px",
  },

  box: {
    background: "#111",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "15px",
    color: "#ddd",
  },

  sectionTitle: {
    color: "#00e5ff",
    marginBottom: "12px",
  },

  button: {
    width: "100%",
    padding: "10px",
    marginTop: "8px",
    borderRadius: "8px",
    border:
      "1px solid rgba(0,229,255,0.3)",
    background: "transparent",
    color: "#00e5ff",
    cursor: "pointer",
  },

  dangerButton: {
    width: "100%",
    padding: "10px",
    marginTop: "8px",
    borderRadius: "8px",
    border: "none",
    background: "#ff3b3b",
    color: "#fff",
    cursor: "pointer",
  },

  backButton: {
    width: "100%",
    marginTop: "15px",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#00e5ff",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
  },

  userCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "#1a1a1a",
    borderRadius: "10px",
    marginBottom: "10px",
    border:
      "1px solid rgba(0,229,255,0.15)",
  },

  userText: {
    color: "#aaa",
    fontSize: "13px",
    margin: "5px 0",
  },

  role: {
    color: "#00e5ff",
    fontSize: "12px",
    textTransform: "uppercase",
  },

  actions: {
    display: "flex",
    gap: "10px",
  },

  editBtn: {
    background: "#00e5ff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  deleteBtn: {
    background: "#ff3b3b",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  log: {
    background: "#1a1a1a",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "8px",
  },

  metric: {
    background: "#1a1a1a",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "8px",
    color: "#00e5ff",
    fontWeight: "bold",
  },

};
