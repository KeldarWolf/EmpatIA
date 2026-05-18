import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://empatia-backend.onrender.com";

export default function Rutina() {
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("usuario") || "null");

  const [rutinas, setRutinas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [selectedRutina, setSelectedRutina] = useState(null);

  // 🔥 CALENDARIO (RESTAURADO)
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);

  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  /* =========================
     LOAD RUTINAS
  ========================= */
  const loadRutinas = async () => {
    try {
      if (!user?.id_usuario) return;

      const res = await fetch(
        `${API_URL}/api/rutina/${user.id_usuario}`
      );

      const data = await res.json();
      setRutinas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user?.id_usuario) loadRutinas();
  }, []);

  /* =========================
     CREAR RUTINA
  ========================= */
  const createRutina = async () => {
    if (!nombre.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/rutina`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          nombre,
          descripcion,
          frecuencia: "semanal",
        }),
      });

      const data = await res.json();

      setRutinas((prev) => [data, ...prev]);
      setNombre("");
      setDescripcion("");
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
     SELECT RUTINA
  ========================= */
  const selectRutina = (r) => {
    setSelectedRutina(r);

    // 🔥 reset calendario al cambiar rutina
    setDiasSeleccionados([]);
  };

  /* =========================
     TOGGLE CALENDARIO (FIX UX)
  ========================= */
  const toggleDia = (index) => {
    setDiasSeleccionados((prev) =>
      prev.includes(index)
        ? prev.filter((d) => d !== index)
        : [...prev, index]
    );
  };

  /* =========================
     GUARDAR DÍAS EN BD
  ========================= */
  const saveDias = async () => {
    if (!selectedRutina) return;

    const diasPayload = diasSeleccionados.map((i) => ({
      dia: diasSemana[i],
      hora: "08:00",
      descripcion: "Rutina personalizada",
    }));

    try {
      await fetch(`${API_URL}/api/rutina/dias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_rutina: selectedRutina.id_rutina,
          dias: diasPayload,
        }),
      });

      alert("✔ Días guardados en BD");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <h2>🧘 Rutina</h2>

        <button onClick={() => navigate("/user")} style={styles.back}>
          ⬅ Volver
        </button>
      </div>

      <div style={styles.grid}>

        {/* LEFT */}
        <div style={styles.left}>
          <h3>➕ Crear Rutina</h3>

          <input
            placeholder="Nombre rutina"
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
            Crear
          </button>

          <hr />

          <h3>📋 Rutinas</h3>

          {rutinas.map((r) => (
            <div
              key={r.id_rutina}
              onClick={() => selectRutina(r)}
              style={{
                ...styles.card,
                border:
                  selectedRutina?.id_rutina === r.id_rutina
                    ? "2px solid #22c55e"
                    : "none",
              }}
            >
              <b>{r.nombre}</b>
              <p>{r.descripcion}</p>
            </div>
          ))}
        </div>

        {/* CENTER (CALENDARIO RESTAURADO COMPLETO) */}
        <div style={styles.center}>
          <h3>📅 Calendario de rutina</h3>

          {!selectedRutina ? (
            <p>👈 Selecciona una rutina</p>
          ) : (
            <>
              <h4>{selectedRutina.nombre}</h4>

              {/* 🔥 CALENDARIO VISUAL ORIGINAL RESTAURADO */}
              <div style={styles.days}>
                {diasSemana.map((dia, i) => (
                  <div
                    key={i}
                    onClick={() => toggleDia(i)}
                    style={{
                      ...styles.day,
                      background: diasSeleccionados.includes(i)
                        ? "#22c55e"
                        : "#111827",
                      transform: diasSeleccionados.includes(i)
                        ? "scale(1.05)"
                        : "scale(1)",
                      transition: "0.2s",
                    }}
                  >
                    {dia}
                  </div>
                ))}
              </div>

              <button onClick={saveDias} style={styles.btn}>
                💾 Guardar en BD
              </button>

              {/* preview UX */}
              {diasSeleccionados.length > 0 && (
                <p style={{ marginTop: 10, opacity: 0.8 }}>
                  Seleccionados:{" "}
                  {diasSeleccionados.map((i) => diasSemana[i]).join(", ")}
                </p>
              )}
            </>
          )}
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          <h3>ℹ Info</h3>

          <p>✔ Rutinas por usuario</p>
          <p>✔ Calendario interactivo</p>
          <p>✔ Guardado en PostgreSQL</p>
          <p>✔ Relación rutina → días</p>
        </div>

      </div>
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  page: {
    height: "100vh",
    background: "#0f172a",
    color: "white",
    fontFamily: "Arial",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: 15,
    borderBottom: "1px solid #1f2937",
  },

  grid: {
    display: "flex",
    gap: 10,
    padding: 10,
  },

  left: {
    width: "30%",
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
    width: "25%",
    background: "#111827",
    padding: 15,
    borderRadius: 10,
  },

  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    background: "#0b0f14",
    color: "white",
    border: "none",
    borderRadius: 6,
  },

  textarea: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    background: "#0b0f14",
    color: "white",
    border: "none",
    borderRadius: 6,
  },

  btn: {
    width: "100%",
    padding: 10,
    background: "#22c55e",
    border: "none",
    color: "white",
    borderRadius: 8,
    cursor: "pointer",
  },

  card: {
    padding: 10,
    marginBottom: 8,
    background: "#0b0f14",
    cursor: "pointer",
    borderRadius: 8,
  },

  days: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    gap: 5,
    margin: "10px 0",
  },

  day: {
    padding: 10,
    textAlign: "center",
    cursor: "pointer",
    borderRadius: 6,
    userSelect: "none",
  },

  back: {
    padding: "6px 12px",
    background: "#1f2937",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};
