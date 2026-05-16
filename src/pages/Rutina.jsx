import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://empatia-backend.onrender.com";

export default function Rutina() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [rutinas, setRutinas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [selectedRutina, setSelectedRutina] = useState(null);

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

  // =========================
  // CARGAR RUTINAS
  // =========================
  const loadRutinas = async () => {
    try {
      if (!user?.id_usuario) return;

      const res = await fetch(
        `${API_URL}/api/rutina/${user.id_usuario}`
      );

      const data = await res.json();
      setRutinas(data || []);
    } catch (err) {
      console.log("ERROR LOAD:", err);
    }
  };

  useEffect(() => {
    loadRutinas();
  }, []);

  // =========================
  // CREAR RUTINA
  // =========================
  const createRutina = async () => {
    if (!nombre.trim()) return;

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
  };

  // =========================
  // AGREGAR DÍAS A RUTINA
  // =========================
  const saveDias = async () => {
    if (!selectedRutina) return;

    const diasPayload = diasSeleccionados.map((d) => ({
      dia: d,
      hora: "08:00",
      descripcion: "Rutina personalizada",
    }));

    await fetch(`${API_URL}/api/rutina/dias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_rutina: selectedRutina.id_rutina,
        dias: diasPayload,
      }),
    });

    alert("Días guardados en rutina");
    setDiasSeleccionados([]);
  };

  // =========================
  // TOGGLE DÍAS
  // =========================
  const toggleDia = (index) => {
    setDiasSeleccionados((prev) =>
      prev.includes(index)
        ? prev.filter((d) => d !== index)
        : [...prev, index]
    );
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <h2>🧘 Rutina</h2>

        <button
          onClick={() => navigate("/user")}
          style={styles.back}
        >
          ⬅ Volver
        </button>
      </div>

      <div style={styles.grid}>

        {/* ================= LEFT ================= */}
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

          <hr style={{ margin: "15px 0" }} />

          <h3>📋 Mis Rutinas</h3>

          {rutinas.map((r) => (
            <div
              key={r.id_rutina}
              style={{
                ...styles.card,
                border:
                  selectedRutina?.id_rutina === r.id_rutina
                    ? "2px solid #22c55e"
                    : "none",
              }}
              onClick={() => setSelectedRutina(r)}
            >
              <p><b>{r.nombre}</b></p>
              <small>{r.descripcion}</small>
            </div>
          ))}
        </div>

        {/* ================= CENTER ================= */}
        <div style={styles.center}>

          <h3>📅 Días de rutina</h3>

          {!selectedRutina && (
            <p>Selecciona una rutina</p>
          )}

          {selectedRutina && (
            <>
              <p>
                Rutina: <b>{selectedRutina.nombre}</b>
              </p>

              <div style={styles.days}>
                {diasSemana.map((d, i) => (
                  <div
                    key={i}
                    onClick={() => toggleDia(i)}
                    style={{
                      ...styles.day,
                      background: diasSeleccionados.includes(i)
                        ? "#22c55e"
                        : "#111827",
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              <button onClick={saveDias} style={styles.btn}>
                Guardar días
              </button>
            </>
          )}
        </div>

        {/* ================= RIGHT ================= */}
        <div style={styles.right}>
          <h3>ℹ Info</h3>

          <p>
            Aquí creas rutinas y defines qué días se repiten.
          </p>

          <p>
            Todo queda guardado por usuario en la base de datos.
          </p>
        </div>

      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    height: "100vh",
    background: "#0b0f14",
    color: "white",
    fontFamily: "Arial",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: 15,
    borderBottom: "1px solid #1f2a37",
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
  },

  textarea: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    background: "#0b0f14",
    color: "white",
    border: "none",
  },

  btn: {
    width: "100%",
    padding: 10,
    background: "#22c55e",
    border: "none",
    color: "white",
    cursor: "pointer",
    marginTop: 5,
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
    padding: 8,
    textAlign: "center",
    cursor: "pointer",
    borderRadius: 6,
  },

  back: {
    padding: "6px 12px",
    background: "#1f2937",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};
