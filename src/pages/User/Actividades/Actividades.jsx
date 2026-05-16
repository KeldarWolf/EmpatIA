import { useEffect, useState } from "react";

const API_URL = "https://empatia-backend.onrender.com";

export default function Actividades() {
  const user = JSON.parse(localStorage.getItem("usuario") || "null");

  const [actividades, setActividades] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id_usuario) {
        console.log("SIN USER");
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
        );

        const data = await res.json();
        setActividades(data);
      } catch (err) {
        console.log("ERROR:", err);
      }
    };

    load();
  }, []);

  return (
    <div>
      <h1>Mis Actividades</h1>

      {actividades.length === 0 ? (
        <p>No hay actividades</p>
      ) : (
        actividades.map((a) => (
          <div key={a.id_registro}>
            <p>{a.nombre_actividad}</p>
            <p>⭐ {a.puntaje_agrado}</p>
            <p>{a.fecha}</p>
          </div>
        ))
      )}
    </div>
  );
}
