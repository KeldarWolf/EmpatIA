import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Rutina.css";

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
  // LOAD EVENTOS
  // =========================
  const loadEventos = async () => {
    if (!user.id_usuario) return;

    try {
      const res = await fetch(
        `${API_URL}/api/rutina-eventos/${user.id_usuario}`
      );

      const data = await res.json();
      setEventos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("ERROR LOAD:", err);
    }
  };

  useEffect(() => {
    loadEventos();
  }, []);

  // =========================
  // FILTRAR POR FECHA
  // =========================
  const eventosDia = eventos.filter((e) => e.fecha === fecha);

  // =========================
  // CREAR EVENTO
  // =========================
  const crearEvento = async () => {
    if (!form.titulo || !fecha) return;

    try {
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
    } catch (err) {
      console.log("ERROR CREATE:", err);
    }
  };

  // =========================
  // COMPLETAR
  // =========================
  const toggleDone = async (id, actual) => {
    try {
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
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // DELETE
  // =========================
  const eliminar = async (id) => {
    try {
      await fetch(`${API_URL}/api/rutina-eventos/${id}`, {
        method: "DELETE",
      });

      setEventos((prev) =>
        prev.filter((e) => e.id_evento !== id)
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="rutina-layout">

      {/* ================= LEFT ================= */}
      <div className="rutina-left">

        <h2>🧘 Rutina</h2>

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <div className="form-box">

          <input
            placeholder="Título"
            value={form.titulo}
            onChange={(e) =>
              setForm({ ...form, titulo: e.target.value })
            }
          />

          <input
            type="time"
            value={form.hora}
            onChange={(e) =>
              setForm({ ...form, hora: e.target.value })
            }
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
          />

          <button onClick={crearEvento}>
            ➕ Agregar
          </button>

        </div>

        <button onClick={() => navigate("/actividades")}>
          🎯 Actividades
        </button>

        <button onClick={() => navigate("/estadisticas")}>
          📊 Estadísticas
        </button>

      </div>

      {/* ================= CENTER ================= */}
      <div className="rutina-center">

        <h3>
          📅 {fecha || "Selecciona un día"}
        </h3>

        {eventosDia.length === 0 && (
          <p>No hay actividades en este día</p>
        )}

        {eventosDia.map((e) => (
          <div
            key={e.id_evento}
            className={`card-evento ${
              e.completado ? "done" : ""
            }`}
          >

            <div>
              <h4>{e.titulo}</h4>
              <p>{e.descripcion}</p>
              <small>⏰ {e.hora}</small>
            </div>

            <div className="actions">

              <button
                onClick={() =>
                  toggleDone(e.id_evento, e.completado)
                }
              >
                {e.completado ? "↩️" : "✔️"}
              </button>

              <button onClick={() => eliminar(e.id_evento)}>
                🗑️
              </button>

            </div>

          </div>
        ))}

      </div>

      {/* ================= RIGHT ================= */}
      <div className="rutina-right">
        <button onClick={() => navigate("/rutina")}>
          🧘 Rutina
        </button>

        <button onClick={() => navigate("/actividades")}>
          🎯 Actividades
        </button>

        <button onClick={() => navigate("/estadisticas")}>
          📊 Estadísticas
        </button>
      </div>

    </div>
  );
}
