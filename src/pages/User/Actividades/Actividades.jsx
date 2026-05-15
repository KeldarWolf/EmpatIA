import { useEffect, useState } from "react";

const API = "https://empatia-backend.onrender.com";

export default function Actividades() {
  const user = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [actividades, setActividades] = useState([]);
  const [selected, setSelected] = useState(null);
  const [gusto, setGusto] = useState(5);
  const [editId, setEditId] = useState(null);

  // =========================
  // CARGAR BD
  // =========================
  useEffect(() => {
    const load = async () => {
      if (!user?.id_usuario) return;

      const res = await fetch(
        `${API}/mis-actividades/${user.id_usuario}`
      );

      const data = await res.json();
      setActividades(data);
    };

    load();
  }, []);

  // =========================
  // SELECCIONAR
  // =========================
  const seleccionar = (act) => {
    setSelected(act);
    setGusto(act.puntaje_agrado || 5);
    setEditId(act.id_registro);
  };

  // =========================
  // GUARDAR O EDITAR
  // =========================
  const guardar = async () => {
    if (!selected) return;

    if (editId) {
      // UPDATE
      await fetch(`${API}/registro-actividad/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          puntaje_agrado: gusto,
        }),
      });
    } else {
      // NUEVO (si algún día lo usas aquí)
      await fetch(`${API}/registro-actividad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          nombre_actividad: selected.nombre_actividad,
          puntaje_agrado: gusto,
          frecuencia_deseada: "media",
          reaccion: "positiva",
        }),
      });
    }

    // refrescar
    const res = await fetch(
      `${API}/mis-actividades/${user.id_usuario}`
    );

    const data = await res.json();
    setActividades(data);

    setSelected(null);
    setEditId(null);
  };

  return (
    <div className="container">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>🎯 Actividades</h2>

        {actividades.map((a) => (
          <button
            key={a.id_registro}
            className="btn"
            onClick={() => seleccionar(a)}
          >
            {a.nombre_actividad}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div className="main">

        {selected && (
          <div className="card">

            <h2>{selected.nombre_actividad}</h2>

            <p>⭐ Gusto: {gusto}/10</p>

            <input
              type="range"
              min="1"
              max="10"
              value={gusto}
              onChange={(e) => setGusto(Number(e.target.value))}
            />

            <button className="saveBtn" onClick={guardar}>
              💾 {editId ? "Actualizar" : "Guardar"}
            </button>

          </div>
        )}

        <div className="list">
          <h2>📌 Guardadas</h2>

          {actividades.map((a) => (
            <div key={a.id_registro} className="cardSaved">

              <h3>{a.nombre_actividad}</h3>

              <p>⭐ {a.puntaje_agrado}/10</p>

              <button onClick={() => seleccionar(a)}>
                ✏️ Editar
              </button>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
