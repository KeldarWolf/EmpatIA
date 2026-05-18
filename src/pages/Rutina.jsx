import { useEffect, useState } from "react";
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

  const [selectedRutina, setSelectedRutina] = useState(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

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
        console.log("❌ NO USER");
        setLoading(false);
        return;
      }

      console.log("✅ USER:", user);

      const rutinasRes = await fetch(
        `${API_URL}/api/rutina/${user.id_usuario}`
      );

      const actividadesRes = await fetch(
        `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
      );

      const rutinasData = await rutinasRes.json();
      const actividadesData = await actividadesRes.json();

      console.log("📅 RUTINAS:", rutinasData);
      console.log("🎯 ACTIVIDADES:", actividadesData);

      /* =========================
         FIX ARRAY
      ========================= */
      const rutinasFinal = Array.isArray(rutinasData)
        ? rutinasData
        : rutinasData.data || [];

      const actividadesFinal = Array.isArray(actividadesData)
        ? actividadesData
        : actividadesData.data || [];

      setRutinas(rutinasFinal);
      setActividades(actividadesFinal);
    } catch (err) {
      console.log("❌ ERROR LOAD:", err);
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
          frecuencia: "Semanal",
        }),
      });

      const data = await res.json();

      console.log("✅ NUEVA RUTINA:", data);

      setRutinas((prev) => [data, ...prev]);

      setNombre("");
      setDescripcion("");
    } catch (err) {
      console.log("❌ ERROR CREATE:", err);
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

    try {
      const diasPayload = diasSeleccionados.map((i) => ({
        dia: diasSemana[i],
        hora: "08:00",
        descripcion: "Rutina personalizada",
      }));

      console.log("📅 DIAS:", diasPayload);

      const res = await fetch(
        `${API_URL}/api/rutina/dias`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_rutina: selectedRutina.id_rutina,
            dias: diasPayload,
          }),
        }
      );

      const data = await res.json();

      console.log("✅ SAVE:", data);

      alert("✔ Rutina guardada");
    } catch (err) {
      console.log("❌ ERROR SAVE:", err);
    }
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div style={styles.loading}>
        ⏳ Cargando rutinas...
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* =========================
         HEADER
      ========================= */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>
            🧘 Rutinas
          </h2>

          <small style={{ opacity: 0.7 }}>
            Organiza tus hábitos
          </small>
        </div>

        <button
          onClick={() => navigate("/user")}
          style={styles.backBtn}
        >
          ⬅ Volver
        </button>
      </div>

      {/* =========================
         GRID
      ========================= */}
      <div style={styles.grid}>

        {/* =========================
           LEFT
        ========================= */}
        <div style={styles.left}>

          <h3>➕ Nueva rutina</h3>

          <input
            type="text"
            placeholder="Nombre"
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
            <div style={styles.empty}>
              No hay rutinas creadas
            </div>
          ) : (
            rutinas.map((r) => (
              <div
                key={r.id_rutina}
                onClick={() => selectRutina(r)}
                style={{
                  ...styles.rutinaCard,
                  border:
                    selectedRutina?.id_rutina === r.id_rutina
                      ? "2px solid #22c55e"
                      : "2px solid transparent",
                }}
              >
                <h4 style={{ margin: 0 }}>
                  {r.nombre}
                </h4>

                <p style={styles.rutinaDesc}>
                  {r.descripcion || "Sin descripción"}
                </p>
              </div>
            ))
          )}
        </div>

        {/* =========================
           CENTER
        ========================= */}
        <div style={styles.center}>

          {!selectedRutina ? (
            <div style={styles.centerEmpty}>
              <h2>📅 Calendario semanal</h2>

              <p style={{ opacity: 0.7 }}>
                Selecciona una rutina
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
                        : "#1f2937",
                    }}
                  >
                    {dia}
                  </div>
                ))}
              </div>

              {diasSeleccionados.length > 0 && (
                <div style={styles.selectedInfo}>
                  ✔ {diasSeleccionados
                    .map((i) => diasSemana[i])
                    .join(", ")}
                </div>
              )}

              <button
                onClick={saveDias}
                style={styles.saveBtn}
              >
                💾 Guardar días
              </button>
            </>
          )}
        </div>

        {/* =========================
           RIGHT
        ========================= */}
        <div style={styles.right}>

          <h3>🎯 Actividades</h3>

          {actividades.length === 0 ? (
            <div style={styles.empty}>
              Sin actividades
            </div>
          ) : (
            actividades.map((a) => (
              <div
                key={a.id_registro}
                style={styles.activityCard}
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "white",
    fontSize: 22,
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
    padding: "10px 14px",
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
    borderRadius: 14,
  },

  center: {
    background: "#111827",
    padding: 20,
    borderRadius: 14,
    minHeight: 600,
  },

  right: {
    background: "#111827",
    padding: 15,
    borderRadius: 14,
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #374151",
    background: "#0f172a",
    color: "white",
    marginBottom: 10,
  },

  textarea: {
    width: "100%",
    height: 100,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #374151",
    background: "#0f172a",
    color: "white",
    marginBottom: 10,
  },

  createBtn: {
    width: "100%",
    padding: 12,
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  separator: {
    height: 1,
    background: "#1f2937",
    margin: "20px 0",
  },

  empty: {
    opacity: 0.6,
    marginTop: 20,
  },

  rutinaCard: {
    background: "#0f172a",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    cursor: "pointer",
    transition: "0.2s",
  },

  rutinaDesc: {
    opacity: 0.7,
    fontSize: 13,
  },

  centerEmpty: {
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
    userSelect: "none",
    transition: "0.2s",
  },

  selectedInfo: {
    background: "#052e16",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },

  saveBtn: {
    width: "100%",
    padding: 14,
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: "bold",
  },

  activityCard: {
    background: "#0f172a",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  score: {
    color: "#facc15",
  },
};
