import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://empatia-backend.onrender.com";

export default function Rutina() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const today = new Date();

  const [rutinas, setRutinas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState(null);

  // =========================
  // CARGAR DESDE BD
  // =========================
  const loadRutinas = async () => {
    if (!user?.id_usuario) return;

    try {
      const res = await fetch(
        `${API_URL}/api/rutina/${user.id_usuario}`
      );
      const data = await res.json();
      setRutinas(data || []);
    } catch (err) {
      console.log("ERROR LOAD:", err);
    }
  };

  useEffect(() => {
    loadRutinas();
  }, []);

  // =========================
  // CREAR RUTINA
  // =========================
  const createRutina = async () => {
    if (!nombre.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/rutina`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          nombre,
          descripcion,
          frecuencia: "diaria",
        }),
      });

      const data = await res.json();

      setRutinas((prev) => [...prev, data]);

      setNombre("");
      setDescripcion("");
    } catch (err) {
      console.log("ERROR CREATE:", err);
    }

    setLoading(false);
  };

  // =========================
  // ELIMINAR / DESACTIVAR
  // =========================
  const deleteRutina = async (id) => {
    try {
      await fetch(`${API_URL}/api/rutina/${id}`, {
        method: "DELETE",
      });

      setRutinas((prev) => prev.filter((r) => r.id_rutina !== id));
    } catch (err) {
      console.log("ERROR DELETE:", err);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <h1>🧘 Rutina</h1>

        <button onClick={() => navigate("/user")} style={styles.back}>
          ⬅ Volver
        </button>
      </div>

      <div style={styles.grid}>

        {/* IZQUIERDA - CREAR */}
        <div style={styles.left}>
          <h3>➕ Nueva rutina</h3>

          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={styles.input}
          />

          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={styles.textarea}
          />

          <button onClick={createRutina} style={styles.btn}>
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>

        {/* CENTRO - LISTA */}
        <div style={styles.center}>
          <h2>📋 Mis rutinas</h2>

          {rutinas.length === 0 && (
            <p>No tienes rutinas creadas</p>
          )}

          {rutinas.map((r) => (
            <div
              key={r.id_rutina}
              style={styles.card}
              onClick={() => setSelected(r)}
            >
              <h3>{r.nombre}</h3>
              <p>{r.descripcion}</p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRutina(r.id_rutina);
                }}
                style={styles.delete}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        {/* DERECHA - INFO */}
        <div style={styles.right}>
          <h3>ℹ️ Detalle</h3>

          {selected ? (
            <>
              <p><b>{selected.nombre}</b></p>
              <p>{selected.descripcion}</p>
              <p>Frecuencia: {selected.frecuencia}</p>
            </>
          ) : (
            <p>Selecciona una rutina</p>
          )}
        </div>

      </div>
    </div>
  );
}

// =========================
// ESTILOS
// =========================
const styles = {
  page: {
    background: "#0b0f14",
    color: "white",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: 20,
    borderBottom: "1px solid #1f2a37",
  },

  back: {
    padding: "8px 14px",
    background: "#1f2937",
    color: "white",
    border: "none",
    borderRadius: 8,
  },

  grid: {
    display: "flex",
    flex: 1,
    gap: 15,
    padding: 15,
  },

  left: {
    width: 280,
    background: "#111827",
    padding: 15,
    borderRadius: 10,
  },

  center: {
    flex: 1,
    background: "#111827",
    padding: 15,
    borderRadius: 10,
  },

  right: {
    width: 280,
    background: "#111827",
    padding: 15,
    borderRadius: 10,
  },

  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    background: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: 8,
  },

  textarea: {
    width: "100%",
    padding: 10,
    height: 80,
    marginBottom: 10,
    background: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: 8,
  },

  btn: {
    width: "100%",
    padding: 10,
    background: "#22c55e",
    border: "none",
    borderRadius: 8,
    color: "white",
  },

  card: {
    background: "#0f172a",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    cursor: "pointer",
  },

  delete: {
    marginTop: 8,
    background: "#ef4444",
    border: "none",
    padding: 6,
    borderRadius: 6,
    color: "white",
  },
};
