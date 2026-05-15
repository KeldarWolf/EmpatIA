import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();

  const API = "https://empatia-backend.onrender.com/api/users";

  const [users, setUsers] = useState([]);
  const [section, setSection] = useState("dashboard");

  // =========================
  // AUTH CHECK
  // =========================
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

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
    if (!window.confirm("¿Eliminar usuario?")) return;

    await fetch(`${API}/${id}`, { method: "DELETE" });
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
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>🛠 EMPATIA ADMIN</h1>

          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>

        {/* MENU BUTTONS */}
        <div style={styles.menu}>
          <button style={styles.menuBtn} onClick={() => setSection("dashboard")}>Dashboard</button>
          <button style={styles.menuBtn} onClick={() => setSection("users")}>Usuarios</button>
          <button style={styles.menuBtn} onClick={() => setSection("logs")}>Logs</button>
          <button style={styles.menuBtn} onClick={() => setSection("metrics")}>Métricas</button>
          <button style={styles.menuBtn} onClick={() => setSection("ai")}>IA</button>
          <button style={styles.menuBtn} onClick={() => setSection("reports")}>Reportes</button>
        </div>

        {/* =========================
            DASHBOARD
        ========================= */}
        {section === "dashboard" && (
          <div style={styles.statsGrid}>

            <div style={styles.statCard}>
              <h3>🟢 Servidor</h3>
              <p>Operativo</p>
            </div>

            <div style={styles.statCard}>
              <h3>👥 Usuarios</h3>
              <p>{users.length}</p>
            </div>

            <div style={styles.statCard}>
              <h3>🤖 IA</h3>
              <p>Activa</p>
            </div>

            <div style={styles.statCard}>
              <h3>📊 Sistema</h3>
              <p>Estable</p>
            </div>

          </div>
        )}

        {/* =========================
            USERS CRUD
        ========================= */}
        {section === "users" && (
          <div style={styles.box}>
            <h2 style={styles.sectionTitle}>Gestión de usuarios</h2>

            {users.map((u) => (
              <div key={u.id_usuario} style={styles.card}>
                <div>
                  <h3 style={styles.name}>{u.nombre}</h3>
                  <p style={styles.text}>{u.email}</p>
                  <span style={styles.role}>{u.role}</span>
                </div>

                <div style={styles.actions}>
                  <button style={styles.editBtn}>Editar</button>
                  <button style={styles.deleteBtn} onClick={() => deleteUser(u.id_usuario)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================
            LOGS (tipo consola)
        ========================= */}
        {section === "logs" && (
          <div style={styles.logBox}>
            <h2 style={styles.sectionTitle}>📜 Logs del sistema</h2>

            <div style={styles.logLine}>[OK] Usuario admin inició sesión</div>
            <div style={styles.logLine}>[AI] Respuesta generada correctamente</div>
            <div style={styles.logLine}>[WARN] Intento de acceso denegado</div>
            <div style={styles.logLine}>[DB] Usuario eliminado</div>
            <div style={styles.logLine}>[SEC] Sesión validada</div>
          </div>
        )}

        {/* =========================
            METRICS
        ========================= */}
        {section === "metrics" && (
          <div style={styles.statsGrid}>

            <div style={styles.statCard}>
              <h3>CPU</h3>
              <p>28%</p>
            </div>

            <div style={styles.statCard}>
              <h3>RAM</h3>
              <p>61%</p>
            </div>

            <div style={styles.statCard}>
              <h3>API</h3>
              <p>1.204 req</p>
            </div>

            <div style={styles.statCard}>
              <h3>IA LAT</h3>
              <p>1.1s</p>
            </div>

          </div>
        )}

        {/* =========================
            IA STATUS
        ========================= */}
        {section === "ai" && (
          <div style={styles.logBox}>
            <h2 style={styles.sectionTitle}>🤖 IA Status</h2>

            <div style={styles.logLine}>[OK] Modelo conectado</div>
            <div style={styles.logLine}>[OK] IA emocional activa</div>
            <div style={styles.logLine}>[INFO] 92 conversaciones hoy</div>
          </div>
        )}

        {/* =========================
            REPORTS
        ========================= */}
        {section === "reports" && (
          <div style={styles.box}>
            <h2 style={styles.sectionTitle}>Reportes</h2>

            <button style={styles.button}>Exportar usuarios</button>
            <button style={styles.button}>Descargar PDF</button>
            <button style={styles.button}>Reporte IA</button>
            <button style={styles.button}>Auditoría</button>
          </div>
        )}

        {/* FOOTER */}
        <button style={styles.backButton} onClick={logout}>
          Cerrar sesión
        </button>

      </div>
    </div>
  );
}

/* =========================
   CYBERPUNK STYLE
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
    maxWidth: 1100,
    background: "rgba(15,22,32,0.9)",
    borderRadius: 20,
    padding: 20,
    border: "1px solid rgba(0,229,255,0.15)",
    boxShadow: "0 0 50px rgba(0,229,255,0.08)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    color: "#00e5ff",
  },

  logoutBtn: {
    background: "#ff3b3b",
    border: "none",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },

  menu: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 20,
  },

  menuBtn: {
    background: "rgba(0,229,255,0.12)",
    border: "1px solid rgba(0,229,255,0.25)",
    color: "#00e5ff",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: 15,
  },

  statCard: {
    background: "#0f1620",
    padding: 15,
    borderRadius: 12,
    border: "1px solid rgba(0,229,255,0.15)",
    color: "#fff",
  },

  box: {
    background: "#0f1620",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  sectionTitle: {
    color: "#00e5ff",
    marginBottom: 10,
  },

  card: {
    display: "flex",
    justifyContent: "space-between",
    padding: 12,
    marginBottom: 10,
    background: "#111a24",
    borderRadius: 10,
    border: "1px solid rgba(0,229,255,0.1)",
  },

  name: { color: "#fff" },
  text: { color: "#aaa" },
  role: { color: "#00e5ff", fontSize: 12 },

  actions: {
    display: "flex",
    gap: 10,
  },

  editBtn: {
    background: "#00e5ff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
  },

  deleteBtn: {
    background: "#ff3b3b",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    color: "#fff",
  },

  logBox: {
    background: "#050a10",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    border: "1px solid rgba(0,229,255,0.15)",
  },

  logLine: {
    fontFamily: "monospace",
    color: "#00e5ff",
    marginBottom: 6,
  },

  button: {
    width: "100%",
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    background: "transparent",
    border: "1px solid #00e5ff",
    color: "#00e5ff",
    cursor: "pointer",
  },

  backButton: {
    marginTop: 15,
    width: "100%",
    padding: 10,
    borderRadius: 10,
    background: "#00e5ff",
    border: "none",
    fontWeight: "bold",
  },
};
