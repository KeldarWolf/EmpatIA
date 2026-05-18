import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Actividades.css";

const API_URL = "https://empatia-backend.onrender.com";

export default function Actividades() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(sessionStorage.getItem("usuario") || "null");

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
     LOAD
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
    if (user?.id_usuario) {
      loadActivities();
    }
  }, []);

  /* =========================
     SELECT
  ========================= */
  const selectActivity = (act) => {
    setSelected(act);
    setGusto(act.puntaje_agrado || 5);
    setInstrucciones(act.instrucciones_usuario || "");
  };

  /* =========================
     UPDATE
  ========================= */
  const updateActivity = async () => {
    if (!selected) return;

    try {
      await fetch(
        `${API_URL}/api/registro-actividad/${selected.id_registro}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
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

  return (
    <div className="layout">
      {/* LEFT */}
      <div className="left">
        <h3>✏️ Editor</h3>

        {!selected ? (
          <div className="empty">
            👈 Selecciona una actividad
          </div>
        ) : (
          <>
            <div className="cardEdit">
              <h4>{selected.nombre_actividad}</h4>

              <p>⭐ Puntaje: {gusto}/10</p>

              <div className="ratingBox">
                <button
                  onClick={() => setGusto(Math.max(1, gusto - 1))}
                >
                  ➖
                </button>

                <div className="bigNumber">
                  {gusto}
                </div>

                <button
                  onClick={() => setGusto(Math.min(10, gusto + 1))}
                >
                  ➕
                </button>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={gusto}
                onChange={(e) =>
                  setGusto(Number(e.target.value))
                }
                className="slider"
              />
            </div>

            <div className="cardEdit">
              <h4>🧠 Instrucciones</h4>

              <textarea
                value={instrucciones}
                onChange={(e) =>
                  setInstrucciones(e.target.value)
                }
                className="textarea"
                placeholder="Escribe instrucciones..."
              />
            </div>

            <button
              onClick={updateActivity}
              className="saveBtn"
            >
              💾 Guardar cambios
            </button>
          </>
        )}
      </div>

      {/* CENTER */}
      <div className="center">
        <h2>🎯 Actividades</h2>

        <div className="grid">
          {actividades.map((act) => (
            <div
              key={act.id_registro}
              className={`card ${
                selected?.id_registro === act.id_registro
                  ? "selected"
                  : ""
              }`}
              onClick={() => selectActivity(act)}
            >
              <h3>{act.nombre_actividad}</h3>

              <p>
                ⭐ {act.puntaje_agrado}/10
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="right">
        <button onClick={() => navigate("/rutina")}>
          🧘 Rutina
        </button>

        <button onClick={() => navigate("/actividades")}>
          🎯 Actividades
        </button>

        <button onClick={() => navigate("/estadisticas")}>
          📊 Estadísticas
        </button>
      </div>
    </div>
  );
}
