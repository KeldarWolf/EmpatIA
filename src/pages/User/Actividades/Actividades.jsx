import { useEffect, useState } from "react";

const API_URL = "https://empatia-backend.onrender.com";

export default function Actividades() {
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [actividades, setActividades] = useState([]);
  const [selected, setSelected] = useState(null);
  const [gusto, setGusto] = useState(5);
  const [loading, setLoading] = useState(false);

  // =========================
  // CARGAR ACTIVIDADES POR USUARIO
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
      console.log("ERROR LOAD:", err);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  // =========================
  // SELECCIONAR ACTIVIDAD
  // =========================
  const selectActivity = (act) => {
    setSelected(act);
    setGusto(act.puntaje_agrado || 5);
  };

  // =========================
  // ACTUALIZAR ACTIVIDAD
  // =========================
  const updateActivity = async () => {
    if (!selected) return;

    setLoading(true);

    try {
      await fetch(
        `${API_URL}/api/registro-actividad/${selected.id_registro}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
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
    } catch (err) {
      console.log("ERROR UPDATE:", err);
    }

    setLoading(false);
  };

  return (
    <div style={styles.layout}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>🎯 Mis Actividades</h2>

        <p>Selecciona una actividad para ver detalles.</p>

        {selected && (
          <div style={styles.box}>
            <h3>📌 Seleccionada</h3>
            <p>{selected.nombre_actividad}</p>
            <p>⭐ {selected.puntaje_agrado}/10</p>
          </div>
        )}
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <h1>📋 Actividades</h1>

        {actividades.length === 0 && (
          <p>❌ No hay actividades registradas aún</p>
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
              <p>
                📅{" "}
                {act.fecha
                  ? new Date(act.fecha).toLocaleDateString()
                  : "sin fecha"}
              </p>
            </div>
          ))}
        </div>

        {/* EDITOR */}
        {selected && (
          <div style={styles.editor}>
            <h2>✏️ Editar</h2>

            <input
              type="range"
              min="1"
              max="10"
              value={gusto}
              onChange={(e) => setGusto(e.target.value)}
              style={{ width: "100%" }}
            />

            <p>⭐ {gusto}/10</p>

            <button
              onClick={updateActivity}
              disabled={loading}
              style={styles.btn}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

// =========================
// ESTILOS
// =========================
const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    background: "#0f172a",
    color: "white",
    fontFamily: "Arial",
  },

  sidebar: {
    width: "25%",
    padding: 20,
    background: "#111827",
  },

  main: {
    flex: 1,
    padding: 20,
    overflowY: "auto",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
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
    padding: 20,
    background: "#111827",
    borderRadius: 10,
  },

  box: {
    marginTop: 15,
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
    cursor: "pointer",
  },
};
