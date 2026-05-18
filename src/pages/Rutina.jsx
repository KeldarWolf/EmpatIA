import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://empatia-backend.onrender.com";

export default function Rutina() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(sessionStorage.getItem("usuario") || "null");

  const user = {
    id_usuario:
      storedUser?.id_usuario ||
      storedUser?.user?.id_usuario ||
      storedUser?.id ||
      null,
  };

  const [fecha, setFecha] = useState("");
  const [eventos, setEventos] = useState([]);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    hora: "",
    duracion: 30,
  });

  // =========================
  // LOAD
  // =========================
  const loadEventos = async () => {
    if (!user.id_usuario) return;

    const res = await fetch(
      `${API_URL}/api/rutina-eventos/${user.id_usuario}`
    );

    const data = await res.json();
    setEventos(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadEventos();
  }, []);

  // =========================
  // FILTRAR
  // =========================
  const eventosDia = eventos.filter((e) => e.fecha === fecha);

  // =========================
  // CREATE
  // =========================
  const crearEvento = async () => {
    if (!form.titulo || !fecha) return;

    const res = await fetch(`${API_URL}/api/rutina-eventos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: user.id_usuario,
        titulo: form.titulo,
        descripcion: form.descripcion,
        fecha,
        hora: form.hora,
        duracion: form.duracion,
        completado: false,
      }),
    });

    const data = await res.json();
    setEventos((prev) => [...prev, data]);

    setForm({
      titulo: "",
      descripcion: "",
      hora: "",
      duracion: 30,
    });
  };

  // =========================
  // TOGGLE
  // =========================
  const toggleDone = async (id, actual) => {
    await fetch(`${API_URL}/api/rutina-eventos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completado: !actual,
      }),
    });

    setEventos((prev) =>
      prev.map((e) =>
        e.id_evento === id
          ? { ...e, completado: !actual }
          : e
      )
    );
  };

  // =========================
  // DELETE
  // =========================
  const eliminar = async (id) => {
    await fetch(`${API_URL}/api/rutina-eventos/${id}`, {
      method: "DELETE",
    });

    setEventos((prev) =>
      prev.filter((e) => e.id_evento !== id)
    );
  };

  // =========================
  // CSS INLINE
  // =========================
  const styles = {
    layout: {
      display: "flex",
      height: "100vh",
      background: "#0f172a",
      color: "white",
      fontFamily: "Arial",
    },

    left: {
      width: "25%",
      padding: 20,
      background: "#111827",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },

    center: {
      flex: 1,
      padding: 20,
      overflowY: "auto",
    },

    right: {
      width: "20%",
      padding: 20,
      background: "#111827",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    },

    input: {
      padding: 8,
      borderRadius: 8,
      border: "none",
      marginBottom: 8,
    },

    textarea: {
      padding: 8,
      borderRadius: 8,
      border: "none",
      height: 80,
      marginBottom: 8,
    },

    btn: {
      padding: 10,
      background: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
    },

    card: {
      background: "#1f2937",
      padding: 12,
      borderRadius: 10,
      marginBottom: 10,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    done: {
      opacity: 0.5,
      textDecoration: "line-through",
    },

    actions: {
      display: "flex",
      gap: 5,
    },
  };

  return (
    <div style={styles.layout}>

      {/* ================= LEFT ================= */}
      <div style={styles.left}>
        <h2>🧘 Rutina</h2>

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Título"
          value={form.titulo}
          onChange={(e) =>
            setForm({ ...form, titulo: e.target.value })
          }
          style={styles.input}
        />

        <input
          type="time"
          value={form.hora}
          onChange={(e) =>
            setForm({ ...form, hora: e.target.value })
          }
          style={styles.input}
        />

        <textarea
          placeholder="Descripción"
          value={form.descripcion}
          onChange={(e) =>
            setForm({
              ...form,
              descripcion: e.target.value,
            })
          }
          style={styles.textarea}
        />

        <button onClick={crearEvento} style={styles.btn}>
          ➕ Agregar
        </button>

        <button
          onClick={() => navigate("/actividades")}
          style={styles.btn}
        >
          🎯 Actividades
        </button>
      </div>

      {/* ================= CENTER ================= */}
      <div style={styles.center}>
        <h3>
          📅 {fecha || "Selecciona un día"}
        </h3>

        {eventosDia.length === 0 && (
          <p>No hay actividades</p>
        )}

        {eventosDia.map((e) => (
          <div
            key={e.id_evento}
            style={{
              ...styles.card,
              ...(e.completado ? styles.done : {}),
            }}
          >
            <div>
              <h4>{e.titulo}</h4>
              <p>{e.descripcion}</p>
              <small>⏰ {e.hora}</small>
            </div>

            <div style={styles.actions}>
              <button
                onClick={() =>
                  toggleDone(e.id_evento, e.completado)
                }
              >
                ✔️
              </button>

              <button onClick={() => eliminar(e.id_evento)}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= RIGHT ================= */}
      <div style={styles.right}>
        <button onClick={() => navigate("/rutina")} style={styles.btn}>
          🧘 Rutina
        </button>

        <button onClick={() => navigate("/actividades")} style={styles.btn}>
          🎯 Actividades
        </button>

        <button onClick={() => navigate("/estadisticas")} style={styles.btn}>
          📊 Estadísticas
        </button>
      </div>

    </div>
  );
}
