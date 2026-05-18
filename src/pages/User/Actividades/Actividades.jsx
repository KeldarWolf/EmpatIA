import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://empatia-backend.onrender.com";

export default function Actividades() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(
    sessionStorage.getItem("usuario") || "null"
  );

  const user = {
    id_usuario:
      storedUser?.id_usuario ||
      storedUser?.user?.id_usuario ||
      storedUser?.id ||
      null,
  };

  const [actividades, setActividades] = useState([]);
  const [selected, setSelected] = useState(null);

  const [gusto, setGusto] = useState(5);
  const [instrucciones, setInstrucciones] = useState("");

  /* =========================
     LOAD ACTIVIDADES
  ========================= */
  const loadActivities = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
      );

      const data = await res.json();
      setActividades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user?.id_usuario) loadActivities();
  }, []);

  /* =========================
     SELECT ACTIVIDAD
  ========================= */
  const selectActivity = (act) => {
    setSelected(act);
    setGusto(act.puntaje_agrado || 5);
    setInstrucciones(act.instrucciones_usuario || "");
  };

  /* =========================
     UPDATE ACTIVIDAD
  ========================= */
  const updateActivity = async () => {
    if (!selected) return;

    try {
      await fetch(
        `${API_URL}/api/registro-actividad/${selected.id_registro}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            puntaje_agrado: Number(gusto),
            instrucciones_usuario: instrucciones,
          }),
        }
      );

      setActividades((prev) =>
        prev.map((a) =>
          a.id_registro === selected.id_registro
            ? {
                ...a,
                puntaje_agrado: Number(gusto),
                instrucciones_usuario: instrucciones,
              }
            : a
        )
      );

      setSelected(null);
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
     INSTRUCCIONES VIEW
  ========================= */
  const getInstructions = () => {
    if (!selected) return "👈 Selecciona una actividad";

    return selected.instrucciones_usuario?.trim()
      ? selected.instrucciones_usuario
      : "⚠️ Sin instrucciones";
  };

  return (
    <div style={styles.layout}>

      {/* LEFT */}
      <div style={styles.left}>
        <h3>🧠 Instrucciones</h3>
        <div style={styles.box}>{getInstructions()}</div>

        {selected && (
          <div style={styles.box}>
            <p>📌 {selected.nombre_actividad}</p>
            <p>⭐ {selected.puntaje_agrado}/10</p>
          </div>
        )}
      </div>

      {/* CENTER */}
      <div style={styles.center}>
        <h2>🎯 Actividades</h2>

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
            <h3>✏️ Editar actividad</h3>

            <p>Puntaje</p>
            <input
              type="range"
              min="1"
              max="10"
              value={gusto}
              onChange={(e) => setGusto(Number(e.target.value))}
              style={{ width: "100%" }}
            />

            <p>🧠 Instrucciones</p>
            <textarea
              value={instrucciones}
              onChange={(e) => setInstrucciones(e.target.value)}
              style={{
                width: "100%",
                height: 120,
                borderRadius: 8,
                padding: 10,
              }}
            />

            <button onClick={updateActivity} style={styles.btn}>
              💾 Guardar cambios
            </button>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div style={styles.right}>
        <button onClick={() => navigate("/rutina")}>🧘 Rutina</button>
        <button onClick={() => navigate("/actividades")}>🎯 Actividades</button>
        <button onClick={() => navigate("/estadisticas")}>📊 Estadísticas</button>
      </div>
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    background: "#0f172a",
    color: "white",
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
  },
  card: {
    background: "#1f2937",
    padding: 15,
    borderRadius: 10,
    cursor: "pointer",
  },
  box: {
    marginTop: 10,
    padding: 10,
    background: "#1f2937",
    borderRadius: 10,
  },
  editor: {
    marginTop: 20,
    padding: 15,
    background: "#111827",
    borderRadius: 10,
  },
  btn: {
    marginTop: 10,
    width: "100%",
    padding: 10,
    background: "#2563eb",
    color: "white",
    border: 0,
    borderRadius: 8,
  },
};
