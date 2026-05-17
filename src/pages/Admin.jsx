// ============================================
// src/pages/Admin.jsx
// ============================================

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API =
  "https://empatia-backend.onrender.com/api/users";

export default function Admin() {

  const navigate = useNavigate();

  // ============================================
  // VALIDAR SESION
  // ============================================

  useEffect(() => {

    const session =
      sessionStorage.getItem("usuario");

    if (!session) {

      navigate("/", {
        replace: true,
      });
    }

  }, []);

  // ============================================
  // CERRAR SESION AL SALIR
  // ============================================

  useEffect(() => {

    return () => {

      sessionStorage.removeItem(
        "usuario"
      );

    };

  }, []);

  // ============================================
  // STATES
  // ============================================

  const [tab, setTab] =
    useState("users");

  const [users, setUsers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [logs, setLogs] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [serverStatus, setServerStatus] =
    useState("checking");

  // ============================================
  // LOGS
  // ============================================

  const addLog = (msg) => {

    setLogs((prev) => [

      {
        msg,
        time:
          new Date().toLocaleTimeString(),
      },

      ...prev,

    ].slice(0, 50));
  };

  // ============================================
  // SERVER
  // ============================================

  const checkServer = async () => {

    try {

      const res = await fetch(API, {
        method: "HEAD",
      });

      setServerStatus(
        res.ok
          ? "online"
          : "offline"
      );

      addLog(
        res.ok
          ? "Servidor ONLINE"
          : "Servidor OFFLINE"
      );

    } catch {

      setServerStatus("offline");

      addLog(
        "Servidor OFFLINE"
      );
    }
  };

  // ============================================
  // USERS
  // ============================================

  const loadUsers = async () => {

    setLoading(true);

    try {

      const res =
        await fetch(API);

      if (!res.ok) {

        throw new Error(
          "Error servidor"
        );
      }

      const data =
        await res.json();

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );

      addLog(
        `✅ ${data.length} usuarios cargados`
      );

    } catch (e) {

      console.log(e);

      setUsers([]);

      addLog(
        "❌ Error cargando usuarios"
      );

    } finally {

      setLoading(false);
    }
  };

  // ============================================
  // INIT
  // ============================================

  useEffect(() => {

    loadUsers();

    checkServer();

  }, []);

  // ============================================
  // FILTER
  // ============================================

  const filtered = useMemo(() => {

    const t =
      search.toLowerCase();

    return users.filter((u) =>

      u.nombre
        ?.toLowerCase()
        .includes(t)

      ||

      u.email
        ?.toLowerCase()
        .includes(t)
    );

  }, [users, search]);

  // ============================================
  // DELETE
  // ============================================

  const deleteUser = (id) => {

    if (
      !window.confirm(
        "¿Eliminar usuario?"
      )
    ) return;

    setUsers((prev) =>
      prev.filter(
        (u) => u._id !== id
      )
    );

    addLog(
      `Usuario eliminado: ${id}`
    );
  };

  // ============================================
  // UI
  // ============================================

  return (

    <div style={styles.layout}>

      <div style={styles.topbar}>

        <h2 style={styles.title}>
          🛠 EmpatIA Admin
        </h2>

        <div style={styles.tabs}>

          <button
            style={
              tab === "dashboard"
                ? styles.tabActive
                : styles.tab
            }
            onClick={() =>
              setTab("dashboard")
            }
          >
            📊 Dashboard
          </button>

          <button
            style={
              tab === "users"
                ? styles.tabActive
                : styles.tab
            }
            onClick={() =>
              setTab("users")
            }
          >
            👤 Usuarios
          </button>

          <button
            style={
              tab === "logs"
                ? styles.tabActive
                : styles.tab
            }
            onClick={() =>
              setTab("logs")
            }
          >
            📜 Logs
          </button>

          <button
            style={styles.tab}
            onClick={loadUsers}
          >
            🔄 Recargar
          </button>

          <button
            style={styles.tab}
            onClick={() => {
              sessionStorage.clear();

              navigate("/", {
                replace: true,
              });
            }}
          >
            ⬅ Salir
          </button>

        </div>
      </div>

      <div style={styles.main}>

        {tab === "dashboard" && (

          <div style={styles.cards}>

            <div style={styles.card}>
              👤 Usuarios
              <br />
              <b>{users.length}</b>
            </div>

            <div style={styles.card}>

              ⚡ Servidor:

              {" "}

              {serverStatus ===
                "online" && (
                <b
                  style={{
                    color:
                      "#00ff88",
                  }}
                >
                  🟢 ONLINE
                </b>
              )}

              {serverStatus ===
                "offline" && (
                <b
                  style={{
                    color:
                      "#ff3b3b",
                  }}
                >
                  🔴 OFFLINE
                </b>
              )}

              {serverStatus ===
                "checking" && (
                <b>
                  ⏳ Checking...
                </b>
              )}

            </div>

          </div>
        )}

        {tab === "users" && (

          <>

            <input
              style={styles.input}
              placeholder="🔎 Buscar usuario..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            {loading ? (

              <p>
                Cargando usuarios...
              </p>

            ) : (

              <table style={styles.table}>

                <thead>

                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Acción</th>
                  </tr>

                </thead>

                <tbody>

                  {filtered.map((u) => (

                    <tr key={u._id}>

                      <td>
                        {
                          u.nombre
                          || "Sin nombre"
                        }
                      </td>

                      <td>
                        {u.email}
                      </td>

                      <td>

                        <button
                          style={styles.danger}
                          onClick={() =>
                            deleteUser(
                              u._id
                            )
                          }
                        >
                          Eliminar
                        </button>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            )}

          </>
        )}

        {tab === "logs" && (

          <div style={styles.logsBox}>

            {logs.map((l, i) => (

              <div key={i}>

                {l.time}
                {" — "}
                {l.msg}

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

// ============================================
// STYLES
// ============================================

const styles = {

  layout: {
    minHeight: "100vh",
    background: "#0f0f1a",
    color: "#fff",
    fontFamily: "Arial",
  },

  topbar: {
    padding: "15px",
    background: "#1a1a2e",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
  },

  tabs: {
    display: "flex",
    gap: "10px",
  },

  tab: {
    padding: "10px 15px",
    background: "#16213e",
    border: "none",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
  },

  tabActive: {
    padding: "10px 15px",
    background: "#00e5ff",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  main: {
    padding: "20px",
  },

  cards: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },

  card: {
    background: "#16213e",
    padding: "20px",
    borderRadius: "8px",
    minWidth: "180px",
  },

  input: {
    padding: "12px",
    width: "100%",
    maxWidth: "400px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "none",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#16213e",
  },

  danger: {
    background: "#ff3b3b",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
  },

  logsBox: {
    background: "#16213e",
    padding: "15px",
    borderRadius: "8px",
    maxHeight: "70vh",
    overflowY: "auto",
  },
};
