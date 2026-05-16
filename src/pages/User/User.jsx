import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URL = "https://empatia-backend.onrender.com";

// 🔎 detectar actividades
const activityTriggers = [
  "aburrido",
  "aburrida",
  "no sé qué hacer",
  "no se que hacer",
  "qué hago",
  "que hago",
  "actividad",
  "actividades",
  "aburrimiento",
];

// 🎯 categorías principales
const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
  "🤍 Hablar un poco",
  "❓ No sé qué hacer",
  "🔄 Cambiar respuestas rápidas",
];

// 🧠 actividades por categoría
const activityGroups = {
  musica: [
    [
      "Playlist relajante",
      "Escuchar lo-fi",
      "Música instrumental",
      "Escuchar lluvia",
      "Canción favorita",
      "Música energética",
      "Sonidos naturaleza",
      "Cerrar ojos y escuchar",
      "Descubrir música nueva",
      "Escuchar piano",
      "Cantar una canción",
    ],

    [
      "Escuchar jazz",
      "Música para dormir",
      "Rock suave",
      "Playlist feliz",
      "Escuchar guitarra",
      "Escuchar música triste",
      "Música ambiental",
      "Sonidos del mar",
      "Playlist focus",
      "Música clásica",
      "Escuchar algo nuevo",
    ],
  ],

  relajacion: [
    [
      "Respirar profundo",
      "Ducha relajante",
      "Cerrar los ojos",
      "Tomar agua",
      "Estiramientos suaves",
      "Meditar 5 minutos",
      "Escuchar sonidos lluvia",
      "Apagar pantallas",
      "Descansar un momento",
      "Escribir lo que siento",
      "Relajar hombros",
    ],

    [
      "Respirar lento",
      "Caminar tranquilo",
      "Tomar té",
      "Mirar el cielo",
      "Mover el cuerpo suave",
      "Relajar mandíbula",
      "Escuchar música suave",
      "Acostarse un rato",
      "Masajear manos",
      "Pausar pensamientos",
      "Mirar naturaleza",
    ],
  ],

  fisica: [
    [
      "Salir a caminar",
      "Ejercicio ligero",
      "Estiramientos",
      "Mover brazos",
      "Mover piernas",
      "Bailar una canción",
      "Salir a tomar aire",
      "Subir escaleras",
      "Caminar escuchando música",
      "Rutina corta",
      "Mover cuello y hombros",
    ],

    [
      "Trotar suave",
      "Saltar un poco",
      "Yoga",
      "Mover articulaciones",
      "Caminar sin celular",
      "Ejercicio corto",
      "Rutina rápida",
      "Salir al patio",
      "Mover espalda",
      "Activar el cuerpo",
      "Moverse 10 minutos",
    ],
  ],
};

export default function User() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("usuario") || "null"
  );

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [frase, setFrase] = useState("");

  const [loading, setLoading] = useState(false);

  const [waitingForYes, setWaitingForYes] =
    useState(false);

  const [currentCategory, setCurrentCategory] =
    useState(null);

  const [currentPage, setCurrentPage] =
    useState(0);

  const [writingActivity, setWritingActivity] =
    useState(false);

  // 🚀 init
  useEffect(() => {
    setMessages([
      {
        role: "ai",
        text: `Hola ${user?.nombre || "🤍"}, estoy aquí.`,
      },
      {
        role: "ai",
        text: "Cuéntame cómo te sientes...",
      },
    ]);

    const interval = setInterval(() => {
      setFrase(
        frases[Math.floor(Math.random() * frases.length)]
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [user?.nombre]);

  // 🔎 detectar trigger
  const shouldTriggerActivity = (text) => {
    const lower = text.toLowerCase();

    return activityTriggers.some((word) =>
      lower.includes(word)
    );
  };

  // ✅ respuesta positiva
  const isPositiveResponse = (text) => {
    const lower = text.toLowerCase().trim();

    return [
      "si",
      "sí",
      "vale",
      "ok",
      "quiero",
      "dale",
      "claro",
      "por favor",
    ].some((w) => lower.includes(w));
  };

  // 🤖 IA
  const askAI = async (message) => {
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();

      if (
        data?.reply &&
        typeof data.reply === "string"
      ) {
        return data.reply;
      }

      return null;

    } catch (e) {
      console.error("Error conexión IA", e);
      return null;
    }
  };

  // 🎯 mostrar categoría
  const showCategoryOptions = (category, page = 0) => {
    const activities =
      activityGroups[category][page];

    setCurrentCategory(category);
    setCurrentPage(page);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "🤍 Estas opciones podrían ayudarte:",
        options: [
          ...activities,
          "❓ No sé cuál",
          "🔄 Cambiar respuestas rápidas",
          "✍️ Escribir actividad",
        ],
      },
    ]);
  };

  // 💬 enviar mensaje
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", text },
    ]);

    setInput("");
    setLoading(true);

    // ✍️ escribir actividad
    if (writingActivity) {
      let data = [];

      try {
        data = JSON.parse(
          localStorage.getItem("actividades") || "[]"
        );
      } catch {
        data = [];
      }

      const nueva = {
        texto: text,
        tipo: "Actividad personalizada",
        fecha: new Date().toISOString(),
      };

      localStorage.setItem(
        "actividades",
        JSON.stringify([...data, nueva])
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `✅ Actividad guardada: ${text}`,
        },
      ]);

      setWritingActivity(false);

      setTimeout(() => {
        navigate("/actividades");
      }, 1400);

      setLoading(false);
      return;
    }

    // ✅ respondió sí
    if (
      waitingForYes &&
      isPositiveResponse(text)
    ) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "¿Qué te gustaría probar?",
          options: mainOptions,
        },
      ]);

      setWaitingForYes(false);
      setLoading(false);
      return;
    }

    // 🎯 detectar actividad
    if (shouldTriggerActivity(text)) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "🤍 ¿Quieres que te acompañe con una actividad?",
        },
      ]);

      setWaitingForYes(true);
      setLoading(false);

      return;
    }

    // 🤖 IA normal
    const reply = await askAI(text);

    if (reply) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: reply,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "🤍 Ahora mismo no puedo conversar, pero puedo acompañarte con una actividad. ¿Quieres?",
        },
      ]);

      setWaitingForYes(true);
    }

    setLoading(false);
  };

  // 🔘 botones
  const handleOptionClick = (opt) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", text: opt },
    ]);

    // 🎵 música
    if (opt.includes("Música")) {
      showCategoryOptions("musica");
      return;
    }

    // 🧘 relajación
    if (opt.includes("Relajación")) {
      showCategoryOptions("relajacion");
      return;
    }

    // 🏃 física
    if (opt.includes("Actividad física")) {
      showCategoryOptions("fisica");
      return;
    }

    // 🤍 hablar
    if (opt.includes("Hablar")) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "🤍 Estoy aquí contigo. Puedes contarme lo que quieras.",
        },
      ]);
      return;
    }

    // ❓ no sé
    if (opt.includes("No sé")) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "🤍 A veces cuesta decidir. Elige lo que más te llame aunque sea poquito.",
        },
      ]);
      return;
    }

    // 🔄 cambiar
    if (
      opt.includes("Cambiar respuestas rápidas")
    ) {
      if (!currentCategory) return;

      const totalPages =
        activityGroups[currentCategory].length;

      const nextPage =
        (currentPage + 1) % totalPages;

      showCategoryOptions(
        currentCategory,
        nextPage
      );

      return;
    }

    // ✍️ escribir actividad
    if (opt.includes("Escribir actividad")) {
      setWritingActivity(true);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "🤍 Escribe la actividad que te gustaría hacer.",
        },
      ]);

      return;
    }

    // ✅ guardar actividad
    let data = [];

    try {
      data = JSON.parse(
        localStorage.getItem("actividades") || "[]"
      );
    } catch {
      data = [];
    }

    const nueva = {
      texto: opt,
      tipo: "Actividad",
      fecha: new Date().toISOString(),
    };

    localStorage.setItem(
      "actividades",
      JSON.stringify([...data, nueva])
    );

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: `✅ Actividad guardada: ${opt}`,
      },
      {
        role: "ai",
        text: "Redirigiendo...",
      },
    ]);

    setTimeout(() => {
      navigate("/actividades");
    }, 1400);
  };

  // 🚪 logout
  const logout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <div className="app-layout">

      <div className="left-panel">
        <h4>💡 Acompañamiento</h4>

        <div className="quote-box">
          {frase}
        </div>

        <div
          style={{
            marginTop: 20,
            color: "#00e5ff",
          }}
        >
          👤 {user?.nombre || "Usuario"}
        </div>

        <button
          onClick={logout}
          className="logout-btn"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="center-panel">
        <ChatBox
          messages={messages}
          onOptionClick={handleOptionClick}
        />

        <InputBox
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          loading={loading}
        />
      </div>

      <div className="right-panel">
        <button
          onClick={() => navigate("/rutina")}
        >
          🧘 Rutina
        </button>

        <button
          onClick={() => navigate("/actividades")}
        >
          🎯 Actividades
        </button>

        <button
          onClick={() => navigate("/estadisticas")}
        >
          📊 Estadísticas
        </button>

        <button
          onClick={() => navigate("/diario")}
        >
          📓 Diario
        </button>
      </div>
    </div>
  );
}
