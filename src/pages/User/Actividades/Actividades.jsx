import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://empatia-backend.onrender.com";

export default function Actividades() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [actividades, setActividades] = useState([]);
  const [actividadDB, setActividadDB] = useState([]); // 👈 BD de instrucciones
  const [selected, setSelected] = useState(null);
  const [gusto, setGusto] = useState(5);

  // =========================
  // CARGAR ACTIVIDADES USUARIO
  // =========================
  const loadActivities = async () => {
    try {
      if (!user?.id_usuario) return;

      const res = await fetch(
        `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
      );

      const data = await res.json();

      setActividades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("ERROR ACTIVIDADES:", err);
    }
  };

  // =========================
  // CARGAR ACTIVIDADES BD (CATÁLOGO)
  // =========================
  const loadActividadDB = async () => {
    try {
      const res = await fetch(`${API_URL}/api/actividad`);
      const data = await res.json();
      setActividadDB(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("ERROR BD ACTIVIDAD:", err);
    }
  };

  useEffect(() => {
    loadActivities();
    loadActividadDB();
  }, []);

  // =========================
  // SELECT
  // =========================
  const selectActivity = (act) => {
    setSelected(act);
    setGusto(act.puntaje_agrado || 5);
  };

  // =========================
  // UPDATE
  // =========================
  const updateActivity = async () => {
    if (!selected) return;

    await fetch(
      `${API_URL}/api/registro-actividad/${selected.id_registro}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          puntaje_agrado: Number(gusto),
        }),
      }
    );

    setActividades((prev) =>
      prev.map((a) =>
        a.id_registro === selected.id_registro
          ? { ...a, puntaje_agrado: gusto }
          : a
      )
    );

    setSelected(null);
  };

  // =========================
  // INSTRUCCIONES DESDE BD
  // =========================
  const getInstructions = () => {
    if (!selected) {
      return "👈 Selecciona una actividad para ver instrucciones.";
    }

    const name = selected.nombre_actividad?.toLowerCase() || "";

    const match = actividadDB.find(
      (a) => a.nombre?.toLowerCase() === name
    );

    return (
      match?.instrucciones ||
      "✨ Realiza la actividad con calma y sin presión."
    );
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={styles.layout}>

      {/* IZQUIERDA */}
      <div style={styles.left}>
        <h3>🧠 Instrucciones</h3>

        <div style={styles.box}>
          {getInstructions()}
        </div>

        {selected && (
          <div style={styles.box}>
            <p>📌 {selected.nombre_actividad}</p>
            <p>⭐ {selected.puntaje_agrado}/10</p>
          </div>
        )}
      </div>

      {/* CENTRO */}
      <div style={styles.center}>
        <h2>🎯 Mis Actividades</h2>

        {actividades.length === 0 && (
          <p>No tienes actividades aún</p>
        )}

        <div style={styles.grid}>
          {actividades.map((act) => (
            <div
              key={act.id_registro}
              style={styles.card}
              onClick={() => selectActivity(act)}
            >
              <h3>{act.nombre_actividad}</h3>
              <p>⭐ {act.puntaje_agrado}/10</p>
            </div>
          ))}
        </div>

        {selected && (
          <div style={styles.editor}>
            <h3>✏️ Editar</h3>

            <input
              type="range"
              min="1"
              max="10"
              value={gusto}
              onChange={(e) => setGusto(e.target.value)}
              style={{ width: "100%" }}
            />

            <button onClick={updateActivity} style={styles.btn}>
              💾 Guardar
            </button>
          </div>
        )}
      </div>

      {/* DERECHA */}
      <div style={styles.right}>
        <button onClick={() => navigate("/rutina")}>🧘 Rutina</button>
        <button onClick={() => navigate("/actividades")}>🎯 Actividades</button>
        <button onClick={() => navigate("/estadisticas")}>📊 Estadísticas</button>
        <button onClick={() => navigate("/diario")}>📓 Diario</button>

        <hr />

        <button onClick={() => navigate("/user")}>🔙 Volver</button>
      </div>

    </div>
  );
}

/* =========================
   ESTILOS
========================= */
const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    background: "#0f172a",
    color: "white",
    fontFamily: "Arial",
  },

  left: {
    width: "20%",
    padding: 20,
    background: "#111827",
  },

  center: {
    flex: 1,
    padding: 20,
    overflowY: "auto",
  },

  right: {
    width: "20%",
    padding: 20,
    background: "#111827",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 10,
    marginTop: 20,
  },

  card: {
    background: "#1f2937",
    padding: 15,
    borderRadius: 10,
    cursor: "pointer",
  },

  editor: {
    marginTop: 20,
    padding: 15,
    background: "#111827",
    borderRadius: 10,
  },

  box: {
    marginTop: 10,
    padding: 10,
    background: "#1f2937",
    borderRadius: 10,
  },

  btn: {
    marginTop: 10,
    padding: 10,
    width: "100%",
    background: "#2563eb",
    border: "none",
    color: "white",
    borderRadius: 8,
  },
};
