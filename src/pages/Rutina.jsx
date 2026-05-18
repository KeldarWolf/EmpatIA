import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://empatia-backend.onrender.com";

export default function Rutina() {
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("usuario") || "null");

  const [rutinas, setRutinas] = useState([]);
  const [actividades, setActividades] = useState([]);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [selectedRutina, setSelectedRutina] = useState(null);
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);

  const [loading, setLoading] = useState(true);

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
     LOAD DATA
  ========================= */
  const loadData = async () => {
    try {
      setLoading(true);

      const [rutinasRes, actividadesRes] = await Promise.all([
        fetch(`${API_URL}/api/rutina/${user.id_usuario}`),
        fetch(`${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`),
      ]);

      const rutinasData = await rutinasRes.json();
      const actividadesData = await actividadesRes.json();

      setRutinas(Array.isArray(rutinasData) ? rutinasData : []);
      setActividades(Array.isArray(actividadesData) ? actividadesData : []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id_usuario) loadData();
  }, []);

  /* =========================
     CREATE RUTINA
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
    setDiasSeleccionados([]);
  };

  /* =========================
     TOGGLE DIA
  ========================= */
  const toggleDia = (index) => {
    setDiasSeleccionados((prev) =>
      prev.includes(index)
        ? prev.filter((d) => d !== index)
        : [...prev, index]
    );
  };

  /* =========================
     SAVE DIAS
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

      alert("✔ Rutina actualizada");
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
     UI LOADING
  ========================= */
  if (loading) {
    return (
      <div style={styles.loading}>
        Cargando rutina...
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <h2>🧘 Rutina Pro</h2>

        <button onClick={() => navigate("/user")} style={styles.back}>
          ⬅ Volver
        </button>
      </div>

      <div style={styles.grid}>

        {/* ================= LEFT ================= */}
        <div style={styles.left}>
          <h3>➕ Crear rutina</h3>

          <input
            placeholder="Nombre"
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
              <p style={{ opacity: 0.7, fontSize: 12 }}>
                {r.descripcion}
              </p>
            </div>
          ))}
        </div>

        {/* ================= CENTER ================= */}
        <div style={styles.center}>
          <h3>📅 Calendario semanal</h3>

          {!selectedRutina ? (
            <p>Selecciona una rutina</p>
          ) : (
            <>
              <h4>{selectedRutina.nombre}</h4>

              <p style={styles.counter}>
                Días seleccionados: {diasSeleccionados.length}
              </p>

              <div style={styles.days}>
                {diasSemana.map((dia, i) => (
                  <div
                    key={i}
                    onClick={() => toggleDia(i)}
                    style={{
                      ...styles.day,
                      background: diasSeleccionados.includes(i)
                        ? "#22c55e"
                        : "#0b0f14",
                    }}
                  >
                    {dia}
                  </div>
                ))}
              </div>

              {diasSeleccionados.length > 0 && (
                <p style={{ opacity: 0.7 }}>
                  ✔ {diasSeleccionados.map(i => diasSemana[i]).join(", ")}
                </p>
              )}

              <button onClick={saveDias} style={styles.btn}>
                Guardar rutina
              </button>
            </>
          )}
        </div>

        {/* ================= RIGHT ================= */}
        <div style={styles.right}>
          <h3>🎯 Actividades</h3>

          {actividades.length === 0 ? (
            <p style={{ opacity: 0.6 }}>Sin actividades</p>
          ) : (
            actividades.map((a) => (
              <div key={a.id_registro} style={styles.activity}>
                <b>{a.nombre_actividad}</b>
                <p>⭐ {a.puntaje_agrado}/10</p>
                <small>
                  {a.instrucciones_usuario?.slice(0, 60)}
                </small>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

/* =========================
   STYLES PRO UX
========================= */
const styles = {
  page: {
    height: "100vh",
    background: "#0f172a",
    color: "white",
    fontFamily: "Arial",
  },

  loading: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    background: "#0f172a",
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
    width: "28%",
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
    width: "28%",
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
    borderRadius: 8,
    cursor: "pointer",
  },

  day: {
    padding: 10,
    textAlign: "center",
    borderRadius: 6,
    cursor: "pointer",
    userSelect: "none",
  },

  days: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    gap: 5,
    margin: "10px 0",
  },

  activity: {
    padding: 10,
    marginBottom: 8,
    background: "#0b0f14",
    borderRadius: 8,
  },

  counter: {
    opacity: 0.7,
    marginBottom: 10,
  },

  back: {
    padding: "6px 12px",
    background: "#1f2937",
    color: "white",
    border: "none",
    borderRadius: 6,
  },
};
