import { useState } from "react";

const actividadesBase = [
  { id: 1, nombre: "🎵 Música", descripcion: "Escuchar música relajante" },
  { id: 2, nombre: "🧘 Relajación", descripcion: "Respiración guiada" },
  { id: 3, nombre: "🚶 Ejercicio ligero", descripcion: "Caminar suave" },
  { id: 4, nombre: "📖 Lectura", descripcion: "Leer algo tranquilo" },
  { id: 5, nombre: "🎨 Creatividad", descripcion: "Dibujar o crear algo" },
];

export default function Actividades() {
  const [selected, setSelected] = useState(null);
  const [gusto, setGusto] = useState(5);
  const [guardadas, setGuardadas] = useState([]);
  const [editId, setEditId] = useState(null);

  // =========================
  // SELECT
  // =========================
  const seleccionarActividad = (act) => {
    setSelected(act);
    setGusto(5);
    setEditId(null);
  };

  // =========================
  // GUARDAR / ACTUALIZAR
  // =========================
  const guardarActividad = () => {
    if (!selected) return;

    // EDITAR
    if (editId !== null) {
      setGuardadas((prev) =>
        prev.map((a) =>
          a.id === editId ? { ...a, gusto: Number(gusto) } : a
        )
      );

      setEditId(null);
      setSelected(null);
      return;
    }

    // NUEVA
    const nueva = {
      id: Date.now(),
      nombre: selected.nombre,
      descripcion: selected.descripcion,
      gusto: Number(gusto),
      fecha: new Date(),
    };

    setGuardadas((prev) => [nueva, ...prev]);
    setSelected(null);
  };

  // =========================
  // EDITAR
  // =========================
  const editarActividad = (act) => {
    setSelected(act);
    setGusto(act.gusto);
    setEditId(act.id);
  };

  return (
    <div className="container">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>🎯 Actividades</h2>

        {actividadesBase.map((act) => (
          <button
            key={act.id}
            className="btn"
            onClick={() => seleccionarActividad(act)}
          >
            {act.nombre}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div className="main">

        {/* ACTIVIDAD SELECCIONADA */}
        {selected && (
          <div className="card">

            <h2>{selected.nombre}</h2>
            <p>{selected.descripcion}</p>

            <div className="gustoBox">

              <h3>⭐ ¿Qué tanto te gustó?</h3>

              <input
                type="range"
                min="1"
                max="10"
                value={gusto}
                onChange={(e) =>
                  setGusto(Number(e.target.value))
                }
                className="range"
              />

              <div className="gustoValue">
                {gusto}/10
              </div>

              <button className="saveBtn" onClick={guardarActividad}>
                💾 {editId ? "Actualizar" : "Guardar"}
              </button>

            </div>
          </div>
        )}

        {/* GUARDADAS */}
        <div className="list">

          <h2>📌 Actividades guardadas</h2>

          {guardadas.length === 0 && (
            <p>No hay actividades aún</p>
          )}

          {guardadas.map((act) => (
            <div key={act.id} className="cardSaved">

              <h3>{act.nombre}</h3>
              <p>⭐ Gusto: {act.gusto}/10</p>
              <p>
                📅 {new Date(act.fecha).toLocaleDateString()}
              </p>

              <button
                className="editBtn"
                onClick={() => editarActividad(act)}
              >
                ✏️ Editar
              </button>

            </div>
          ))}
        </div>

      </div>

      {/* =========================
          CSS ABAJO (TODO EN UNO)
      ========================== */}
      <style>{`
        .container {
          display: flex;
          height: 100vh;
          background: #0b0f19;
          color: white;
          font-family: Arial;
        }

        .sidebar {
          width: 260px;
          padding: 20px;
          background: #111827;
        }

        .btn {
          width: 100%;
          margin: 8px 0;
          padding: 10px;
          border: none;
          border-radius: 10px;
          background: #1f2937;
          color: white;
          cursor: pointer;
        }

        .main {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .card {
          background: #1f2937;
          padding: 20px;
          border-radius: 12px;
        }

        .gustoBox {
          margin-top: 15px;
        }

        .range {
          width: 100%;
          cursor: pointer;
        }

        .gustoValue {
          margin-top: 10px;
          font-size: 22px;
          font-weight: bold;
        }

        .saveBtn {
          margin-top: 10px;
          padding: 10px;
          border: none;
          border-radius: 10px;
          background: #38bdf8;
          color: white;
          cursor: pointer;
        }

        .list {
          margin-top: 20px;
        }

        .cardSaved {
          background: #111827;
          padding: 15px;
          margin-top: 10px;
          border-radius: 12px;
        }

        .editBtn {
          margin-top: 10px;
          padding: 6px 10px;
          border: none;
          border-radius: 8px;
          background: #f59e0b;
          cursor: pointer;
        }
      `}</style>

    </div>
  );
}
