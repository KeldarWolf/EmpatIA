import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://empatia-backend.onrender.com/api/users";

export default function Admin() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // CARGAR USUARIOS
  // =========================
  const loadUsers = async () => {
    setLoading(true);

    try {
      const res = await fetch(API);
      const data = await res.json();

      setUsers(data || []);

      setLogs((prev) => [
        { msg: "Usuarios cargados", time: new Date().toLocaleTimeString() },
        ...prev,
      ]);
    } catch (e) {
      setLogs((prev) => [
        { msg: "Error cargando usuarios", time: new Date().toLocaleTimeString() },
        ...prev,
      ]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================
  // FILTRO BUSCADOR
  // =========================
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const t = search.toLowerCase();
      return (
        u.nombre?.toLowerCase().includes(t) ||
        u.email?.toLowerCase().includes(t)
      );
    });
  }, [users, search]);

  // =========================
  // DELETE (SOLO UI)
  // =========================
  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u._id !== id));

    setLogs((prev) => [
      { msg: `Usuario eliminado ${id}`, time: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  };

  return (
    <div style={styles.layout}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={styles.title}>🛠 EmpatIA Admin</h2>

        <button style={styles.button} onClick={() => navigate("/")}>
          ⬅ Salir
        </button>

        <button style={styles.button} onClick={loadUsers}>
          🔄 Recargar
        </button>

        <div style={styles.stats}>
          <p>👤 Usuarios: {users.length}</p>
          <p>⚡ Activos: {Math.floor(users.length * 0.7)}</p>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>

        {/* HEADER */}
        <div style={styles.header}>
          <h2>Panel de Control</h2>

          <input
            style={styles.input}
            placeholder="🔎 Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div style={styles.tableBox}>

          {loading ? (
            <p style={{ color: "#00e5ff" }}>Cargando...</p>
          ) : (
            <table style={styles.table}>

              <thead>
                <tr>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Acción</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td style={styles.td}>{u.nombre || "Sin nombre"}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={styles.status}>🟢 activo</span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.danger}
                        onClick={() => deleteUser(u._id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          )}

        </div>

        {/* LOGS */}
        <div style={styles.logs}>
          <h3>📜 Logs</h3>

          {logs.slice(0, 6).map((l, i) => (
            <div key={i}>
              {l.time} — {l.msg}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    background: "#0a0f1c",
    color: "#e6f1ff",
    fontFamily: "Arial",
  },

  sidebar: {
    width: "240px",
    background: "#0f172a",
    padding: "20px",
    borderRight: "1px solid #1e293b",
  },

  title: {
    color: "#00e5ff",
    marginBottom: "20px",
  },

  button: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    background: "#111827",
    border: "1px solid #1e293b",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },

  stats: {
    marginTop: "20px",
    opacity: 0.8,
  },

  main: {
    flex: 1,
    padding: "20px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
    alignItems: "center",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    width: "250px",
    outline: "none",
  },

  tableBox: {
    background: "#111827",
    padding: "15px",
    borderRadius: "12px",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    padding: "12px",
    borderBottom: "1px solid #1e293b",
    textAlign: "left",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #1e293b",
  },

  status: {
    color: "#00ff9d",
  },

  danger: {
    background: "#ff3b3b",
    border: "none",
    padding: "6px 10px",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },

  logs: {
    marginTop: "20px",
    background: "#111827",
    padding: "15px",
    borderRadius: "12px",
    fontSize: "12px",
    maxHeight: "140px",
    overflowY: "auto",
  },
};
