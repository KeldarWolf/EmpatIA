import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://empatia-backend.onrender.com";

export default function Actividades() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(sessionStorage.getItem("usuario") || "null");

  const user = {
    id_usuario: storedUser?.id_usuario || null,
    nombre: storedUser?.nombre || "Usuario",
  };

  const [actividades, setActividades] = useState([]);
  const [actividadDB, setActividadDB] = useState([]);

  const [selected, setSelected] = useState(null);
  const [gusto, setGusto] = useState(5);

  const [instruction, setInstruction] = useState("");
  const [editInstruction, setEditInstruction] = useState("");

  /* =========================
     LOAD ACTIVIDADES
  ========================= */
  const loadActivities = async () => {
    const res = await fetch(
      `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
    );

    const data = await res.json();
    setActividades(data || []);
  };

  const loadActividadDB = async () => {
    const res = await fetch(`${API_URL}/api/actividad`);
    const data = await res.json();
    setActividadDB(data || []);
  };

  useEffect(() => {
    if (!user.id_usuario) navigate("/", { replace: true });
    loadActivities();
    loadActividadDB();
  }, []);

  /* =========================
     SELECT ACTIVITY
  ========================= */
  const selectActivity = (act) => {
    setSelected(act);
    setGusto(act.puntaje_agrado || 5);

    // 🔥 PRIORIDAD: instrucción usuario
    const userInstruction = act.instrucciones_usuario;

    if (userInstruction) {
      setInstruction(userInstruction);
      setEditInstruction(userInstruction);
      return;
    }

    // fallback catálogo
    const match = actividadDB.find(
      (a) =>
        a.nombre?.toLowerCase() ===
        act.nombre_actividad?.toLowerCase()
    );

    const base = match?.instrucciones || null;

    setInstruction(base);
    setEditInstruction(base || "");
  };

  /* =========================
     UPDATE PUNTAJE
  ========================= */
  const updateActivity = async () => {
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
  };

  /* =========================
     UPDATE INSTRUCCION USER
  ========================= */
  const saveInstruction = async () => {
    await fetch(
      `${API_URL}/api/registro-actividad/${selected.id_registro}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instrucciones_usuario: editInstruction,
        }),
      }
    );

    setInstruction(editInstruction);

    setActividades((prev) =>
      prev.map((a) =>
        a.id_registro === selected.id_registro
          ? {
              ...a,
              instrucciones_usuario: editInstruction,
            }
          : a
      )
    );
  };

  return (
    <div style={styles.layout}>
      {/* LEFT */}
      <div style={styles.left}>
        <h3>🧠 Instrucciones</h3>

        {!selected ? (
          <div style={styles.box}>👈 Selecciona una actividad</div>
        ) : instruction ? (
          <div style={styles.box}>
            <p>{instruction}</p>

            <textarea
              style={styles.textarea}
              value={editInstruction}
              onChange={(e) =>
                setEditInstruction(e.target.value)
              }
            />

            <button style={styles.btn} onClick={saveInstruction}>
              💾 Guardar instrucción
            </button>
          </div>
        ) : (
          <div style={styles.box}>
            ⚠️ Esta actividad no tiene instrucción
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
            <h3>Editar puntaje</h3>

            <input
              type="range"
              min="1"
              max="10"
              value={gusto}
              onChange={(e) =>
                setGusto(Number(e.target.value))
              }
              style={{ width: "100%" }}
            />

            <button onClick={updateActivity} style={styles.btn}>
              Guardar puntaje
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
