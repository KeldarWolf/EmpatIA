import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URL = "https://empatia-backend.onrender.com";

// =========================
// ACTIVIDADES
// =========================
const actividades = [
  {
    nombre: "🎵 Música",
    prompt:
      "Recomienda una actividad musical relajante y explica cómo hacerla paso a paso.",
  },
  {
    nombre: "🧘 Relajación",
    prompt:
      "Explica una actividad simple de relajación guiada para alguien con ansiedad.",
  },
  {
    nombre: "🚶 Ejercicio ligero",
    prompt:
      "Explica un ejercicio suave y fácil para mejorar el ánimo.",
  },
  {
    nombre: "📖 Lectura",
    prompt:
      "Recomienda una actividad de lectura tranquila y cómo disfrutarla.",
  },
  {
    nombre: "🎨 Creatividad",
    prompt:
      "Explica una actividad creativa relajante y entretenida.",
  },
];

export default function User() {
  const navigate = useNavigate();

  // =========================
  // CHAT
  // =========================
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // =========================
  // ACTIVIDADES
  // =========================
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityResponse, setActivityResponse] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // GUSTO
  // =========================
  const [gusto, setGusto] = useState(5);
  const [savedActivities, setSavedActivities] = useState([]);

  // =========================
  // FRASE MOTIVACIONAL
  // =========================
  const [frase, setFrase] = useState("");

  useEffect(() => {
    const random =
      frases[Math.floor(Math.random() * frases.length)];

    setFrase(random);

    const user = localStorage.getItem("nombre") || "Usuario";

    setMessages([
      {
        sender: "bot",
        text: `Hola ${user} 💙 estoy aquí contigo`,
      },
      {
        sender: "bot",
        text: "Cuéntame cómo te sientes...",
      },
    ]);
  }, []);

  // =========================
  // ENVIAR MENSAJE
  // =========================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { sender: "user", text: input },
    ];

    setMessages(newMessages);

    const userInput = input;

    setInput("");

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userInput,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            data.reply ||
            "Estoy aquí contigo 💙",
        },
      ]);
    } catch (err) {
      console.log(err);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "⚠ Error al conectar con EmpatIA",
        },
      ]);
    }
  };

  // =========================
  // ACTIVIDAD IA
  // =========================
  const openActivity = async (activity) => {
    setSelectedActivity(activity);
    setActivityResponse([]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: activity.prompt,
        }),
      });

      const data = await res.json();

      const lines = (
        data.reply ||
        "No pude generar la actividad."
      ).split("\n");

      setActivityResponse(lines);
    } catch (err) {
      console.log(err);

      setActivityResponse([
        "⚠ Error cargando actividad",
      ]);
    }

    setLoading(false);
  };

  // =========================
  // GUARDAR ACTIVIDAD
  // =========================
  const guardarActividad = () => {
    if (!selectedActivity) return;

    const nuevaActividad = {
      nombre: selectedActivity.nombre,
      gusto,
      fecha: new Date(),
    };

    setSavedActivities((prev) => [
      nuevaActividad,
      ...prev,
    ]);
  };

  return (
    <div className="user-container">
      {/* =========================
          SIDEBAR
      ========================== */}
      <div className="sidebar">
        <h2>🎯 Actividades</h2>

        <p>Haz click en una actividad</p>

        {actividades.map((act, index) => (
          <button
            key={index}
            className="activity-btn"
            onClick={() => openActivity(act)}
          >
            {act.nombre}
          </button>
        ))}

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          ⬅ Volver
        </button>
      </div>

      {/* =========================
          MAIN
      ========================== */}
      <div className="main-content">
        {/* =========================
            FRASE
        ========================== */}
        <div className="frase-box">
          ✨ {frase}
        </div>

        {/* =========================
            CHAT
        ========================== */}
        <div className="chat-section">
          <h2>💬 Acompañamiento</h2>

          <ChatBox messages={messages} />

          <InputBox
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
          />
        </div>

        {/* =========================
            ACTIVIDAD
        ========================== */}
        {selectedActivity && (
          <div className="activity-box">
            <h2>
              🤖 🧠 Actividad:{" "}
              {selectedActivity.nombre}
            </h2>

            {loading && (
              <p>
                🤖 Estoy preparando cómo ayudarte...
              </p>
            )}

            {!loading && (
              <>
                <div className="ia-response">
                  {activityResponse.map((msg, i) => (
                    <p key={i}>{msg}</p>
                  ))}
                </div>

                {/* =========================
                    GUSTO
                ========================== */}
                <div className="gusto-box">
                  <h3>
                    ⭐ ¿Qué tanto te gustó?
                  </h3>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={gusto}
                    onChange={(e) =>
                      setGusto(e.target.value)
                    }
                    className="gusto-range"
                  />

                  <div className="gusto-value">
                    {gusto}/10
                  </div>

                  <button
                    className="save-btn"
                    onClick={guardarActividad}
                  >
                    💾 Guardar actividad
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* =========================
            ACTIVIDADES GUARDADAS
        ========================== */}
        <div className="saved-box">
          <h2>📌 Tus actividades</h2>

          {savedActivities.length === 0 && (
            <p>
              Aún no guardas actividades 💙
            </p>
          )}

          {savedActivities.map((act, index) => (
            <div
              key={index}
              className="saved-card"
            >
              <h3>{act.nombre}</h3>

              <p>
                ⭐ Gusto: {act.gusto}/10
              </p>

              <p>
                📅{" "}
                {new Date(
                  act.fecha
                ).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {/* =========================
            AYUDA
        ========================== */}
        <div className="help-box">
          <h2>🧠 Ayuda</h2>

          <p>
            Haz click en una actividad y la IA
            te explicará cómo hacerla
          </p>
        </div>
      </div>
    </div>
  );
}
