import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://empatia-backend.onrender.com";

export default function Rutina() {
  const navigate = useNavigate();

  /* =========================
     USER FIX
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
  };

  /* =========================
     STATES
  ========================= */
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
      if (!user?.id_usuario) {
        console.log("No existe id_usuario");
        return;
      }

      setLoading(true);

      console.log("USER:", user);

      const [rutinasRes, actividadesRes] = await Promise.all([
        fetch(`${API_URL}/api/rutina/${user.id_usuario}`),
        fetch(
          `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
        ),
      ]);

      const rutinasData = await rutinasRes.json();
      const actividadesData = await actividadesRes.json();

      console.log("RUTINAS:", rutinasData);
      console.log("ACTIVIDADES:", actividadesData);

      setRutinas(
        Array.isArray(rutinasData)
          ? rutinasData
          : rutinasData.data || []
      );

      setActividades(
        Array.isArray(actividadesData)
          ? actividadesData
          : actividadesData.data || []
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =========================
     CREATE RUTINA
  ========================= */
  const createRutina = async () => {
    if (!nombre.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/rutina`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
  const selectRutina = (rutina) => {
    setSelectedRutina(rutina);
    setDiasSeleccionados([]);
  };

  /* =========================
     TOGGLE DAY
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_rutina: selectedRutina.id_rutina,
          dias: diasPayload,
        }),
      });

      alert("✔ Rutina guardada");
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loaderCard}>
          ⏳ Cargando rutina...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>🧘 Rutina Pro</h2>
          <small style={{ opacity: 0.7 }}>
            Organiza tu semana
          </small>
        </div>

        <button
          onClick={() => navigate("/user")}
          style={styles.backBtn}
        >
          ⬅ Volver
        </button>
      </div>

      <div style={styles.grid}>

        {/* ================= LEFT ================= */}
        <div style={styles.left}>

          <h3>➕ Nueva rutina</h3>

          <input
            placeholder="Nombre rutina"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={styles.input}
          />

          <textarea
            placeholder="Descripción..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={styles.textarea}
          />

          <button
            onClick={createRutina}
            style={styles.createBtn}
          >
            Crear rutina
          </button>

          <div style={styles.separator} />

          <h3>📋 Mis rutinas</h3>

          {rutinas.length === 0 ? (
            <p style={{ opacity: 0.6 }}>
              No tienes rutinas
            </p>
          ) : (
            rutinas.map((r) => (
              <div
                key={r.id_rutina}
                onClick={() => selectRutina(r)}
                style={{
                  ...styles.card,
                  border:
                    selectedRutina?.id_rutina === r.id_rutina
                      ? "2px solid #22c55e"
                      : "2px solid transparent",
                }}
              >
                <h4 style={{ margin: 0 }}>
                  {r.nombre}
                </h4>

                <p style={styles.cardDesc}>
                  {r.descripcion}
                </p>
              </div>
            ))
          )}
        </div>

        {/* ================= CENTER ================= */}
        <div style={styles.center}>

          {!selectedRutina ? (
            <div style={styles.emptyCenter}>
              <h2>📅 Calendario semanal</h2>

              <p style={{ opacity: 0.7 }}>
                Selecciona una rutina para comenzar
              </p>
            </div>
          ) : (
            <>
              <div style={styles.centerHeader}>
                <div>
                  <h2 style={{ margin: 0 }}>
                    {selectedRutina.nombre}
                  </h2>

                  <small style={{ opacity: 0.7 }}>
                    {selectedRutina.descripcion}
                  </small>
                </div>

                <div style={styles.counter}>
                  {diasSeleccionados.length} días
                </div>
              </div>

              <div style={styles.daysGrid}>
                {diasSemana.map((dia, i) => (
                  <div
                    key={i}
                    onClick={() => toggleDia(i)}
                    style={{
                      ...styles.dayCard,
                      background: diasSeleccionados.includes(i)
                        ? "#22c55e"
                        : "#111827",
                      transform: diasSeleccionados.includes(i)
                        ? "scale(1.03)"
                        : "scale(1)",
                    }}
                  >
                    {dia}
                  </div>
                ))}
              </div>

              {diasSeleccionados.length > 0 && (
                <div style={styles.selectedBox}>
                  ✔ {diasSeleccionados
                    .map((i) => diasSemana[i])
                    .join(", ")}
                </div>
              )}

              <button
                onClick={saveDias}
                style={styles.saveBtn}
              >
                💾 Guardar rutina
              </button>
            </>
          )}
        </div>

        {/* ================= RIGHT ================= */}
        <div style={styles.right}>

          <h3>🎯 Actividades</h3>

          {actividades.length === 0 ? (
            <div style={styles.emptyActivity}>
              Sin actividades
            </div>
          ) : (
            actividades.map((a) => (
              <div
                key={a.id_registro}
                style={styles.activity}
              >
                <h4 style={{ margin: 0 }}>
                  {a.nombre_actividad}
                </h4>

                <p style={styles.score}>
                  ⭐ {a.puntaje_agrado || 0}/10
                </p>

                <small style={{ opacity: 0.7 }}>
                  {a.instrucciones_usuario
                    ? a.instrucciones_usuario.slice(0, 70)
                    : "Sin instrucciones"}
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
   STYLES
========================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    fontFamily: "Arial",
  },

  loading: {
    height: "100vh",
    background: "#0f172a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  loaderCard: {
    background: "#111827",
    padding: 30,
    borderRadius: 15,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottom: "1px solid #1f2937",
  },

  backBtn: {
    background: "#1f2937",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: 10,
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "28% 1fr 28%",
    gap: 15,
    padding: 15,
  },

  left: {
    background: "#111827",
    padding: 15,
    borderRadius: 15,
  },

  center: {
    background: "#111827",
    padding: 20,
    borderRadius: 15,
    minHeight: 600,
  },

  right: {
    background: "#111827",
    padding: 15,
    borderRadius: 15,
  },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    border: "1px solid #374151",
    background: "#0b0f14",
    color: "white",
  },

  textarea: {
    width: "100%",
    height: 100,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #374151",
    background: "#0b0f14",
    color: "white",
    marginBottom: 10,
  },

  createBtn: {
    width: "100%",
    padding: 12,
    background: "#22c55e",
    border: "none",
    color: "white",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  separator: {
    height: 1,
    background: "#1f2937",
    margin: "20px 0",
  },

  card: {
    background: "#0b0f14",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    cursor: "pointer",
    transition: "0.2s",
  },

  cardDesc: {
    opacity: 0.7,
    fontSize: 13,
  },

  emptyCenter: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  centerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  counter: {
    background: "#1e293b",
    padding: "8px 14px",
    borderRadius: 20,
  },

  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    gap: 10,
    marginBottom: 20,
  },

  dayCard: {
    padding: 15,
    borderRadius: 12,
    textAlign: "center",
    cursor: "pointer",
    transition: "0.2s",
    userSelect: "none",
  },

  selectedBox: {
    background: "#052e16",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },

  saveBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  activity: {
    background: "#0b0f14",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  score: {
    color: "#facc15",
  },

  emptyActivity: {
    opacity: 0.6,
    marginTop: 20,
  },
};
