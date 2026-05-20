// ============================================
// src/pages/Rutina/Rutina.jsx
// ============================================

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import "./Rutina.css";

const API_URL =
  "https://empatia-backend.onrender.com";

export default function Rutina() {

  const navigate =
    useNavigate();

  /* =========================================
     SESSION SAFE
  ========================================= */

  let storedUser = null;

  try {

    const sessionUser =
      sessionStorage.getItem(
        "usuario"
      );

    if (
      sessionUser &&
      sessionUser !== "undefined"
    ) {

      storedUser =
        JSON.parse(
          sessionUser
        );
    }

  } catch (err) {

    console.log(
      "SESSION ERROR:",
      err
    );

    storedUser = null;
  }

  const user = {

    id_usuario:
      storedUser?.id_usuario ||
      storedUser?.user
        ?.id_usuario ||
      storedUser?.id ||
      null,

    nombre:
      storedUser?.nombre ||
      storedUser?.user
        ?.nombre ||
      "Usuario",
  };

  /* =========================================
     FIX LOGIN
  ========================================= */

  useEffect(() => {

    if (!user.id_usuario) {

      console.log(
        "❌ SESION INVALIDA"
      );

      navigate("/", {
        replace: true,
      });
    }

  }, [
    user.id_usuario,
    navigate,
  ]);

  /* =========================================
     MOBILE PANELS
  ========================================= */

  const [leftOpen,
    setLeftOpen] =
    useState(false);

  const [rightOpen,
    setRightOpen] =
    useState(false);

  /* =========================================
     DATA
  ========================================= */

  const [actividades,
    setActividades] =
    useState([]);

  const [eventos,
    setEventos] =
    useState([]);

  const [
    selectedActivity,
    setSelectedActivity,
  ] = useState(null);

  /* =========================================
     FORM
  ========================================= */

  const [titulo,
    setTitulo] =
    useState("");

  const [descripcion,
    setDescripcion] =
    useState("");

  const [hora,
    setHora] =
    useState("");

  const [horaFin,
    setHoraFin] =
    useState("");

  const [duracion,
    setDuracion] =
    useState(30);

  /* =========================================
     DATE
  ========================================= */

  const [selectedDate,
    setSelectedDate] =
    useState(new Date());

  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDateLocal =
    (date) => {

      const year =
        date.getFullYear();

      const month = String(
        date.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        date.getDate()
      ).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

  /* =========================================
     LOAD ACTIVITIES
  ========================================= */

  const loadActivities =
    async () => {

      try {

        const res =
          await fetch(
            `${API_URL}/api/registro-actividad/usuario/${user.id_usuario}`
          );

        const data =
          await res.json();

        setActividades(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.log(err);
      }
    };

  /* =========================================
     LOAD EVENTS
  ========================================= */

  const loadEvents =
    async () => {

      try {

        const res =
          await fetch(
            `${API_URL}/api/rutina-eventos/${user.id_usuario}`
          );

        const data =
          await res.json();

        setEventos(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.log(err);
      }
    };

  /* =========================================
     INIT
  ========================================= */

  useEffect(() => {

    if (user?.id_usuario) {

      loadActivities();

      loadEvents();
    }

  }, [user?.id_usuario]);

  /* =========================================
     SELECT ACTIVITY
  ========================================= */

  const selectActivity =
    (act) => {

      setSelectedActivity(
        act
      );

      setTitulo(
        act.nombre_actividad ||
        ""
      );

      setLeftOpen(true);
    };

  /* =========================================
     CREATE EVENT
  ========================================= */

  const createEvent =
    async () => {

      if (!titulo.trim()) {

        alert(
          "Ingrese título"
        );

        return;
      }

      if (!hora) {

        alert(
          "Seleccione hora"
        );

        return;
      }

      try {

        const payload = {

          id_usuario:
            user.id_usuario,

          id_registro:
            selectedActivity
              ?.id_registro ||
            null,

          titulo,

          descripcion,

          fecha:
            formatDateLocal(
              selectedDate
            ),

          hora,

          hora_fin:
            horaFin || null,

          duracion,
        };

        const res =
          await fetch(
            `${API_URL}/api/rutina-eventos`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const data =
          await res.json();

        if (!res.ok) {

          alert(
            data.error ||
            "Error creando evento"
          );

          return;
        }

        await loadEvents();

        setTitulo("");

        setDescripcion("");

        setHora("");

        setHoraFin("");

        setDuracion(30);

        setSelectedActivity(
          null
        );

        alert(
          "Rutina guardada"
        );

      } catch (err) {

        console.log(err);

        alert(
          "Error conexión servidor"
        );
      }
    };

  /* =========================================
     DELETE EVENT
  ========================================= */

  const deleteEvent =
    async (
      id_evento
    ) => {

      try {

        await fetch(
          `${API_URL}/api/rutina-eventos/${id_evento}`,
          {
            method:
              "DELETE",
          }
        );

        await loadEvents();

      } catch (err) {

        console.log(err);
      }
    };

  /* =========================================
     TOGGLE COMPLETE
  ========================================= */

  const toggleComplete =
    async (
      evento
    ) => {

      try {

        await fetch(
          `${API_URL}/api/rutina-eventos/${evento.id_evento}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                completado:
                  !evento.completado,
              }),
          }
        );

        await loadEvents();

      } catch (err) {

        console.log(err);
      }
    };

  /* =========================================
     FILTER EVENTS
  ========================================= */

  const currentDate =
    formatDateLocal(
      selectedDate
    );

  const eventosDia =
    useMemo(() => {

      return eventos
        .filter(
          (evento) =>
            evento.fecha?.slice(
              0,
              10
            ) === currentDate
        )
        .sort((a, b) =>
          a.hora.localeCompare(
            b.hora
          )
        );

    }, [
      eventos,
      currentDate,
    ]);

  /* =========================================
     CALENDAR
  ========================================= */

  const currentMonth =
    selectedDate.getMonth();

  const currentYear =
    selectedDate.getFullYear();

  const today =
    new Date();

  const daysInMonth =
    new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();

  let firstDay =
    new Date(
      currentYear,
      currentMonth,
      1
    ).getDay();

  firstDay =
    firstDay === 0
      ? 6
      : firstDay - 1;

  const days = [];

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    days.push(null);
  }

  for (
    let i = 1;
    i <= daysInMonth;
    i++
  ) {

    days.push(i);
  }

  /* =========================================
     CHANGE MONTH
  ========================================= */

  const changeMonth =
    (dir) => {

      setSelectedDate(
        new Date(
          currentYear,
          currentMonth + dir,
          1
        )
      );
    };

  return (

    <div className="page">

      <div className="header">

        <div>

          <h1>
            🧘 Rutina Inteligente
          </h1>

          <p>
            Organiza actividades
            por día, semana o mes
          </p>

        </div>

        <button
          className="back-btn"
          onClick={() =>
            navigate(
              "/usuario"
            )
          }
        >
          ⬅ Volver
        </button>

      </div>

    </div>
  );
}
