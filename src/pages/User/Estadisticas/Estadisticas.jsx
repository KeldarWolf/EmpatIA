import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://empatia-backend.onrender.com";

export default function Estadisticas() {
  const navigate = useNavigate();

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

  const [actividades, setActividades] = useState([]);
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================================
     LOAD DATA
  ========================================= */
  useEffect(() => {
    if (!user?.id_usuario) return;

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [actRes, rutinaRes] = await Promise.all([
        fetch(
          `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
        ),
        fetch(
          `${API_URL}/api/rutina-eventos/${user.id_usuario}`
        ),
      ]);

      const actividadesData = await actRes.json();
      const rutinasData = await rutinaRes.json();

      setActividades(
        Array.isArray(actividadesData)
          ? actividadesData
          : []
      );

      setRutinas(
        Array.isArray(rutinasData)
          ? rutinasData
          : []
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     ESTADÍSTICAS BASE
  ========================================= */

  const totalActividades = actividades.length;

  const totalRutinas = rutinas.length;

  const completadas = rutinas.filter(
    (r) => r.completado
  ).length;

  const pendientes = totalRutinas - completadas;

  const progreso =
    totalRutinas > 0
      ? Math.round(
          (completadas / totalRutinas) * 100
        )
      : 0;

  const promedioGusto =
    totalActividades > 0
      ? (
          actividades.reduce(
            (acc, a) =>
              acc +
              Number(a.puntaje_agrado || 0),
            0
          ) / totalActividades
        ).toFixed(1)
      : 0;

  /* =========================================
     FAVORITAS
  ========================================= */

  const favoritas = [...actividades]
    .sort(
      (a, b) =>
        Number(b.puntaje_agrado || 0) -
        Number(a.puntaje_agrado || 0)
    )
    .slice(0, 5);

  /* =========================================
     ACTIVIDADES MÁS REPETIDAS
  ========================================= */

  const repetidasMap = {};

  rutinas.forEach((r) => {
    if (!repetidasMap[r.titulo]) {
      repetidasMap[r.titulo] = 0;
    }

    repetidasMap[r.titulo]++;
  });

  const repetidas = Object.entries(repetidasMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  /* =========================================
     HORARIOS MÁS USADOS
  ========================================= */

  const horarios = {
    manana: 0,
    tarde: 0,
    noche: 0,
  };

  rutinas.forEach((r) => {
    if (!r.hora) return;

    const hora = parseInt(r.hora.split(":")[0]);

    if (hora >= 5 && hora < 12) {
      horarios.manana++;
    } else if (hora >= 12 && hora < 19) {
      horarios.tarde++;
    } else {
      horarios.noche++;
    }
  });

  /* =========================================
     RACHA
  ========================================= */

  const racha = useMemo(() => {
    const fechas = [
      ...new Set(
        rutinas
          .filter((r) => r.completado)
          .map((r) => r.fecha)
      ),
    ].sort();

    if (fechas.length === 0) return 0;

    let streak = 1;

    for (let i = fechas.length - 1; i > 0; i--) {
      const actual = new Date(fechas[i]);

      const anterior = new Date(
        fechas[i - 1]
      );

      const diff =
        (actual - anterior) /
        (1000 * 60 * 60 * 24);

      if (diff <= 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [rutinas]);

  /* =========================================
     ACTIVIDAD SEMANAL
  ========================================= */

  const weekData = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();

      d.setDate(d.getDate() - i);

      const key = d
        .toISOString()
        .split("T")[0];

      const hechas = rutinas.filter(
        (r) =>
          r.fecha?.startsWith(key) &&
          r.completado
      ).length;

      days.push({
        date: key,
        hechas,
      });
    }

    return days;
  }, [rutinas]);

  /* =========================================
     CALENDARIO HEATMAP
  ========================================= */

  const heatmap = useMemo(() => {
    const map = {};

    rutinas.forEach((r) => {
      if (!map[r.fecha]) {
        map[r.fecha] = 0;
      }

      if (r.completado) {
        map[r.fecha]++;
      }
    });

    return map;
  }, [rutinas]);

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div style={styles.loading}>
        Cargando estadísticas...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* =====================================
          HEADER
      ===================================== */}

      <div style={styles.header}>
        <div>
          <h1>📊 Estadísticas</h1>

          <p style={{ opacity: 0.7 }}>
            Visualiza tu progreso y hábitos
          </p>
        </div>

        <button
          onClick={() => navigate("/user")}
          style={styles.backBtn}
        >
          ⬅ Volver
        </button>
      </div>

      {/* =====================================
          TOP CARDS
      ===================================== */}

      <div style={styles.topGrid}>
        <div style={styles.progressCard}>
          <div
            style={{
              ...styles.circle,
              background: `conic-gradient(
                #22c55e 0%,
                #22c55e ${progreso}%,
                #1f2937 ${progreso}%,
                #1f2937 100%
              )`,
            }}
          >
            <div style={styles.circleInner}>
              <h1>{progreso}%</h1>
              <p>Completado</p>
            </div>
          </div>
        </div>

        <div style={styles.cards}>
          <div style={styles.card}>
            <h1>{totalRutinas}</h1>
            <p>Rutinas</p>
          </div>

          <div style={styles.card}>
            <h1>{completadas}</h1>
            <p>Completadas</p>
          </div>

          <div style={styles.card}>
            <h1>{pendientes}</h1>
            <p>Pendientes</p>
          </div>

          <div style={styles.card}>
            <h1>{promedioGusto}</h1>
            <p>Promedio gusto</p>
          </div>

          <div style={styles.card}>
            <h1>{racha}</h1>
            <p>Racha 🔥</p>
          </div>
        </div>
      </div>

      {/* =====================================
          ACTIVIDAD SEMANAL
      ===================================== */}

      <div style={styles.section}>
        <h2>📅 Actividad semanal</h2>

        <div style={styles.chart}>
          {weekData.map((d, i) => (
            <div key={i} style={styles.chartItem}>
              <div
                style={{
                  ...styles.chartBar,
                  height: `${d.hechas * 40}px`,
                }}
              />

              <span>
                {d.date.slice(5)}
              </span>

              <small>{d.hechas}</small>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================
          HORARIOS
      ===================================== */}

      <div style={styles.section}>
        <h2>⏰ Horarios más usados</h2>

        <div style={styles.grid3}>
          <div style={styles.infoCard}>
            <h1>🌞</h1>
            <h2>{horarios.manana}</h2>
            <p>Mañana</p>
          </div>

          <div style={styles.infoCard}>
            <h1>🌆</h1>
            <h2>{horarios.tarde}</h2>
            <p>Tarde</p>
          </div>

          <div style={styles.infoCard}>
            <h1>🌙</h1>
            <h2>{horarios.noche}</h2>
            <p>Noche</p>
          </div>
        </div>
      </div>

      {/* =====================================
          FAVORITAS
      ===================================== */}

      <div style={styles.section}>
        <h2>❤️ Actividades favoritas</h2>

        {favoritas.length === 0 ? (
          <p>No hay actividades</p>
        ) : (
          favoritas.map((a) => (
            <div
              key={a.id_registro}
              style={styles.row}
            >
              <div>
                <strong>
                  {a.nombre_actividad}
                </strong>

                <p style={{ opacity: 0.6 }}>
                  {a.frecuencia_deseada}
                </p>
              </div>

              <div style={styles.badge}>
                ⭐ {a.puntaje_agrado}/10
              </div>
            </div>
          ))
        )}
      </div>

      {/* =====================================
          MÁS REPETIDAS
      ===================================== */}

      <div style={styles.section}>
        <h2>🔁 Más repetidas</h2>

        {repetidas.map((r, i) => (
          <div key={i} style={styles.row}>
            <strong>{r[0]}</strong>

            <div style={styles.badge}>
              {r[1]} veces
            </div>
          </div>
        ))}
      </div>

      {/* =====================================
          CALENDARIO
      ===================================== */}

      <div style={styles.section}>
        <h2>🗓 Calendario de progreso</h2>

        <div style={styles.heatmap}>
          {Object.entries(heatmap)
            .slice(-30)
            .map(([fecha, total]) => (
              <div
                key={fecha}
                title={`${fecha} - ${total} actividades`}
                style={{
                  ...styles.heatDay,
                  background:
                    total >= 5
                      ? "#22c55e"
                      : total >= 3
                      ? "#4ade80"
                      : total >= 1
                      ? "#166534"
                      : "#1f2937",
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================
   STYLES
========================================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b1120",
    color: "white",
    padding: 20,
    fontFamily: "Arial",
  },

  loading: {
    minHeight: "100vh",
    background: "#0b1120",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  backBtn: {
    background: "#1e293b",
    border: "none",
    color: "white",
    padding: "10px 16px",
    borderRadius: 10,
    cursor: "pointer",
  },

  topGrid: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 25,
  },

  progressCard: {
    background: "#111827",
    padding: 30,
    borderRadius: 20,
    minWidth: 320,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  circle: {
    width: 220,
    height: 220,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  circleInner: {
    width: 170,
    height: 170,
    borderRadius: "50%",
    background: "#0b1120",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  cards: {
    flex: 1,
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 15,
  },

  card: {
    background: "#111827",
    padding: 20,
    borderRadius: 16,
  },

  section: {
    background: "#111827",
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
  },

  chart: {
    display: "flex",
    alignItems: "flex-end",
    gap: 12,
    height: 220,
    marginTop: 20,
  },

  chartItem: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  chartBar: {
    width: 35,
    background: "#22c55e",
    borderRadius: 10,
    transition: "0.3s",
  },

  grid3: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 15,
    marginTop: 15,
  },

  infoCard: {
    background: "#1e293b",
    padding: 20,
    borderRadius: 16,
    textAlign: "center",
  },

  row: {
    background: "#1e293b",
    padding: 15,
    borderRadius: 12,
    marginTop: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  badge: {
    background: "#14532d",
    padding: "8px 14px",
    borderRadius: 10,
  },

  heatmap: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(18px, 1fr))",
    gap: 6,
    marginTop: 20,
  },

  heatDay: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
};
