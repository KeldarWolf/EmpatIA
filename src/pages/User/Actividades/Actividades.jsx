import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://empatia-backend.onrender.com";

export default function Actividades() {
  const navigate = useNavigate();

  /* =========================
     SESSION USER FIX
  ========================= */
  const storedUser = JSON.parse(
    sessionStorage.getItem("usuario") || "null"
  );

  const user = {
    id_usuario:
      storedUser?.id_usuario ||
      storedUser?.user?.id_usuario ||
      storedUser?.id ||
      null,
    nombre:
      storedUser?.nombre ||
      storedUser?.user?.nombre ||
      "Usuario",
  };

  /* =========================
     STATES
  ========================= */
  const [actividades, setActividades] = useState([]);
  const [selected, setSelected] = useState(null);
  const [gusto, setGusto] = useState(5);

  /* =========================
     LOAD ACTIVIDADES USER
  ========================= */
  const loadActivities = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
      );

      const data = await res.json();
      setActividades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("ERROR:", err);
    }
  };

  useEffect(() => {
    if (user?.id_usuario) {
      loadActivities();
    }
  }, []);

  /* =========================
     SELECT ACTIVITY
  ========================= */
  const selectActivity = (act) => {
    setSelected(act);
    setGusto(act.puntaje_agrado || 5);
  };

  /* =========================
     UPDATE SCORE FIX
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
          }),
        }
      );

      setActividades((prev) =>
        prev.map((a) =>
          a.id_registro === selected.id_registro
            ? { ...a, puntaje_agrado: Number(gusto) }
            : a
        )
      );

      setSelected(null);
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
     INSTRUCCIÓN DESDE REGISTRO (FIX PRINCIPAL)
  ========================= */
  const getInstructions = () => {
    if (!selected) {
      return "👈 Selecciona una actividad";
    }

    // 🔥 AQUÍ ESTÁ EL FIX IMPORTANTE
    const instruction = selected.instrucciones_usuario;

    if (instruction && instruction.trim() !== "") {
      return instruction;
    }

    return "⚠️ Esta actividad no tiene una introducción guardada.";
  };

  /* =========================
     UI
  ========================= */
  return (
    <div style={styles.layout}>

      {/* LEFT */}
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

      {/* CENTER */}
      <div style={styles.center}>
        <h2>🎯 Mis Actividades</h2>

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
            <h3>✏️ Editar puntaje</h3>

            <input
              type="range"
              min="1"
              max="10"
              value={gusto}
              onChange={(e) => setGusto(Number(e.target.value))}
              style={{ width: "100%" }}
            />

            <button onClick={updateActivity} style={styles.btn}>
              💾 Guardar
            </button>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div style={styles.right}>
        <button onClick={() => navigate("/rutina")}>🧘 Rutina</button>
        <button onClick={() => navigate("/actividades")}>🎯 Actividades</button>
        <button onClick={() => navigate("/estadisticas")}>📊 Estadísticas</button>
        <button onClick={() => navigate("/diario")}>📓 Diario</button>
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
    padding: 10,
    background: "#2563eb",
    border: "none",
    color: "white",
    borderRadius: 8,
    width: "100%",
  },
};
