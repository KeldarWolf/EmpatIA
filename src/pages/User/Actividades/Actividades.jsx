import { useEffect, useState } from "react";
import "./actividades.css";

const API_URL = "https://empatia-backend.onrender.com";

export default function Actividades() {
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [actividades, setActividades] = useState([]);
  const [selected, setSelected] = useState(null);
  const [gusto, setGusto] = useState(5);
  const [loading, setLoading] = useState(false);

  // =========================
  // CARGAR DESDE BD
  // =========================
  const loadActivities = async () => {
    try {
      if (!user?.id_usuario) return;

      const res = await fetch(`${API_URL}/mis-actividades/${user.id_usuario}`);
      const data = await res.json();

      setActividades(data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  // =========================
  // SELECCIONAR
  // =========================
  const selectActivity = (act) => {
    setSelected(act);
    setGusto(act.puntaje_agrado || 5);
  };

  // =========================
  // GUARDAR CAMBIO (PATCH BD)
  // =========================
  const updateActivity = async () => {
    if (!selected) return;

    setLoading(true);

    try {
      await fetch(`${API_URL}/registro-actividad/${selected.id_registro}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          puntaje_agrado: Number(gusto),
        }),
      });

      // actualizar local
      setActividades((prev) =>
        prev.map((a) =>
          a.id_registro === selected.id_registro
            ? { ...a, puntaje_agrado: gusto }
            : a
        )
      );

      setSelected(null);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="layout">

      {/* =========================
          SIDEBAR IZQUIERDA
      ========================= */}
      <div className="sidebar">
        <h2>🧠 Instrucciones</h2>

        <p>
          Aquí puedes ver y modificar tus actividades.
        </p>

        <ul>
          <li>✔ Selecciona una actividad</li>
          <li>✔ Ajusta cuánto te gustó</li>
          <li>✔ Guarda cambios en BD</li>
        </ul>

        <hr />

        {selected && (
          <div className="infoBox">
            <h3>📌 Seleccionada</h3>
            <p>{selected.nombre_actividad}</p>
            <p>
              ⭐ Gusto actual: {selected.puntaje_agrado}/10
            </p>
          </div>
        )}
      </div>

      {/* =========================
          CONTENIDO PRINCIPAL
      ========================= */}
      <div className="main">

        <h1>🎯 Tus Actividades</h1>

        {actividades.length === 0 && (
          <p>No tienes actividades aún</p>
        )}

        {/* LISTA */}
        <div className="grid">
          {actividades.map((act) => (
            <div
              key={act.id_registro}
              className="card"
              onClick={() => selectActivity(act)}
            >
              <h3>{act.nombre_actividad}</h3>

              <p>
                ⭐ Gusto: {act.puntaje_agrado}/10
              </p>

              <p>
                📅{" "}
                {new Date(act.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {/* =========================
            EDITOR
        ========================= */}
        {selected && (
          <div className="editor">

            <h2>✏️ Editar actividad</h2>

            <p>{selected.nombre_actividad}</p>

            <input
              type="range"
              min="1"
              max="10"
              value={gusto}
              onChange={(e) => setGusto(e.target.value)}
            />

            <div>
              ⭐ {gusto}/10
            </div>

            <button
              onClick={updateActivity}
              disabled={loading}
            >
              💾 {loading ? "Guardando..." : "Guardar cambios"}
            </button>

          </div>
        )}

      </div>

      {/* =========================
          ESTILOS
      ========================= */}
      <style>{`
        .layout {
          display: flex;
          height: 100vh;
          background: #0f172a;
          color: white;
          font-family: Arial;
        }

        .sidebar {
          width: 25%;
          padding: 20px;
          background: #111827;
          border-right: 1px solid #1f2937;
        }

        .main {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
          margin-top: 20px;
        }

        .card {
          background: #1f2937;
          padding: 15px;
          border-radius: 10px;
          cursor: pointer;
          transition: 0.2s;
        }

        .card:hover {
          background: #374151;
        }

        .editor {
          margin-top: 20px;
          padding: 20px;
          background: #111827;
          border-radius: 10px;
        }

        button {
          margin-top: 10px;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: #2563eb;
          color: white;
          cursor: pointer;
        }

        input[type="range"] {
          width: 100%;
        }

        .infoBox {
          margin-top: 20px;
          padding: 10px;
          background: #1f2937;
          border-radius: 10px;
        }
      `}</style>

    </div>
  );
}
