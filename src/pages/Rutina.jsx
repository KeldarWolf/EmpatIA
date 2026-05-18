import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://empatia-backend.onrender.com";

const diasSemana = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const actividadesBase = [
  "Yoga",
  "Caminar",
  "Meditar",
  "Respirar",
  "Estiramientos",
  "Música",
  "Ducha relajante",
];

export default function Rutina() {
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

  // =========================
  // STATES
  // =========================

  const [selectedDias, setSelectedDias] = useState([]);
  const [selectedActs, setSelectedActs] = useState([]);

  const [hora, setHora] = useState("08:00");
  const [horaFin, setHoraFin] = useState("09:00");

  const [diaActivo, setDiaActivo] = useState("lunes");
  const [rutinaDia, setRutinaDia] = useState([]);

  // =========================
  // TOGGLES
  // =========================

  const toggleDia = (dia) => {
    setSelectedDias((prev) =>
      prev.includes(dia)
        ? prev.filter((d) => d !== dia)
        : [...prev, dia]
    );
  };

  const toggleAct = (act) => {
    setSelectedActs((prev) =>
      prev.includes(act)
        ? prev.filter((a) => a !== act)
        : [...prev, act]
    );
  };

  // =========================
  // SAVE RUTINA
  // =========================

  const saveRutina = async () => {
    try {
      const res = await fetch(`${API_URL}/api/rutina-eventos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          dias: selectedDias,
          actividades: selectedActs,
          hora,
          hora_fin: horaFin,
          duracion: 60,
          titulo: "Rutina",
          descripcion: "",
        }),
      });

      const data = await res.json();

      console.log("✅ GUARDADO:", data);
      alert("Rutina guardada");
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // LOAD DIA
  // =========================

  const loadDia = async (dia) => {
    setDiaActivo(dia);

    try {
      const res = await fetch(
        `${API_URL}/api/rutina-eventos/${user.id_usuario}/${dia}`
      );

      const data = await res.json();
      setRutinaDia(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user.id_usuario) loadDia("lunes");
  }, []);

  // =========================
  // TOGGLE DONE
  // =========================

  const toggleDone = async (item) => {
    try {
      await fetch(
        `${API_URL}/api/rutina-eventos/${item.id_evento}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            completado: !item.completado,
          }),
        }
      );

      loadDia(diaActivo);
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="rutina-page">

      <h2>🧘 Rutina</h2>

      {/* =========================
          DÍAS
      ========================= */}
      <div className="rutina-box">
        <h4>Días</h4>

        <div className="rutina-row">
          {diasSemana.map((d) => (
            <button
              key={d}
              onClick={() => toggleDia(d)}
              className={`rutina-btn ${
                selectedDias.includes(d)
                  ? "active-green"
                  : ""
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* =========================
          ACTIVIDADES
      ========================= */}
      <div className="rutina-box">
        <h4>Actividades</h4>

        <div className="rutina-row">
          {actividadesBase.map((a) => (
            <button
              key={a}
              onClick={() => toggleAct(a)}
              className={`rutina-btn ${
                selectedActs.includes(a)
                  ? "active-blue"
                  : ""
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* =========================
          HORARIO
      ========================= */}
      <div className="rutina-box">
        <h4>Horario</h4>

        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
        />

        <input
          type="time"
          value={horaFin}
          onChange={(e) => setHoraFin(e.target.value)}
        />
      </div>

      {/* SAVE */}
      <button
        onClick={saveRutina}
        className="rutina-save"
      >
        💾 Guardar rutina
      </button>

      {/* =========================
          SELECT DÍA
      ========================= */}
      <div className="rutina-box">
        <h4>Ver día</h4>

        <div className="rutina-row">
          {diasSemana.map((d) => (
            <button
              key={d}
              onClick={() => loadDia(d)}
              className={`rutina-day-btn ${
                diaActivo === d
                  ? "rutina-day-active"
                  : ""
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* =========================
          LISTA DÍA
      ========================= */}
      <div className="rutina-box">
        <h4>📅 {diaActivo}</h4>

        {rutinaDia.length === 0 && (
          <p>No hay actividades</p>
        )}

        {rutinaDia.map((r) => (
          <div
            key={r.id_evento}
            className="rutina-card"
          >
            <div>
              <b>{r.actividad}</b>
              <p>
                {r.hora} - {r.hora_fin}
              </p>
            </div>

            <button
              onClick={() => toggleDone(r)}
              className="rutina-done"
              style={{
                background: r.completado
                  ? "#22c55e"
                  : "#ef4444",
              }}
            >
              {r.completado ? "Hecho" : "Pendiente"}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: 20,
          padding: 10,
        }}
      >
        ⬅ Volver
      </button>
    </div>
  );
}
