// ============================================
// src/pages/User/User.jsx
// ============================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./user.css";

import ChatBox from "./ChatBox";
import InputBox from "./InputBox";
import frases from "./frases";

const API_URL =
  "https://empatia-backend.onrender.com";

// ============================================
// MENÚ PRINCIPAL
// ============================================

const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
  "✍️ Escribir actividad",
  "❓ No sé cuál",
];

// ============================================
// SUB MENÚS
// ============================================

const subOptions = {

  "🎵 Música": [
    "Cantar",
    "Lo-fi",
    "Piano suave",
    "Música relajante",
    "Sonidos lluvia",
  ],

  "🧘 Relajación": [
    "Respirar profundo",
    "Meditar",
    "Estiramientos",
    "Ducha relajante",
    "Cerrar ojos",
  ],

  "🏃 Actividad física": [
    "Caminar",
    "Bailar",
    "Yoga",
    "Trotar suave",
    "Mover cuerpo",
  ],
};

export default function User() {

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("usuario") || "null"
  );

  const [messages, setMessages] =
    useState([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [writingActivity, setWritingActivity] =
    useState(false);

  const [frase, setFrase] =
    useState("");

  // ============================================
  // INIT
  // ============================================

  useEffect(() => {

    setMessages([
      {
        role: "ai",

        text:
          `Hola ${
            user?.nombre || "🤍"
          }, estoy aquí contigo.`,
      },

      {
        role: "ai",

        text:
          "Cuéntame cómo te sientes...",
      },
    ]);

    setFrase(
      frases[
        Math.floor(
          Math.random() * frases.length
        )
      ]
    );

    const interval = setInterval(() => {

      setFrase(
        frases[
          Math.floor(
            Math.random() * frases.length
          )
        ]
      );

    }, 6000);

    return () =>
      clearInterval(interval);

  }, []);

  // ============================================
  // IA
  // ============================================

  const askAI = async (
    message
  ) => {

    try {

      const res = await fetch(
        `${API_URL}/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message,
          }),
        }
      );

      const data =
        await res.json();

      if (
        !res.ok ||
        data?.errorType
      ) {

        return {
          error: true,
        };
      }

      return data;

    } catch (err) {

      console.log(err);

      return {
        error: true,
      };
    }
  };

  // ============================================
  // GUARDAR ACTIVIDAD
  // ============================================

  const saveActivity = async (
    nombre
  ) => {

    try {

      const data = JSON.parse(
        localStorage.getItem(
          "actividades"
        ) || "[]"
      );

      const nueva = {
        texto: nombre,
        fecha: new Date().toISOString(),
      };

      localStorage.setItem(
        "actividades",

        JSON.stringify([
          ...data,
          nueva,
        ])
      );

    } catch (err) {

      console.log(
        "Error guardando actividad"
      );
    }
  };

  // ============================================
  // OPTIONS
  // ============================================

  const handleOptionClick =
    async (opt) => {

      setMessages((prev) => [
        ...prev,

        {
          role: "user",
          text: opt,
        },
      ]);

      // ============================================
      // SI
      // ============================================

      if (opt === "Sí") {

        setMessages((prev) => [
          ...prev,

          {
            role: "ai",

            text:
              "✨ Elige una categoría:",

            options:
              mainOptions,
          },
        ]);

        return;
      }

      // ============================================
      // NO
      // ============================================

      if (opt === "No") {

        setMessages((prev) => [
          ...prev,

          {
            role: "ai",

            text:
              "🤍 Está bien, seguiré aquí contigo.",
          },
        ]);

        return;
      }

      // ============================================
      // SUBMENÚ
      // ============================================

      if (subOptions[opt]) {

        setMessages((prev) => [
          ...prev,

          {
            role: "ai",

            text:
              `Elige una opción de ${opt}:`,

            options:
              subOptions[opt],
          },
        ]);

        return;
      }

      // ============================================
      // RESET
      // ============================================

      if (opt === "❓ No sé cuál") {

        setMessages((prev) => [
          ...prev,

          {
            role: "ai",

            text:
              "Te dejo algunas opciones 👇",

            options:
              mainOptions,
          },
        ]);

        return;
      }

      // ============================================
      // ESCRIBIR ACTIVIDAD
      // ============================================

      if (
        opt.includes(
          "Escribir"
        )
      ) {

        setWritingActivity(true);

        setMessages((prev) => [
          ...prev,

          {
            role: "ai",

            text:
              "✍️ Escribe tu actividad personalizada:",
          },
        ]);

        return;
      }

      // ============================================
      // GUARDAR ACTIVIDAD
      // ============================================

      await saveActivity(opt);

      setMessages((prev) => [
        ...prev,

        {
          role: "ai",

          text:
            `✅ Actividad guardada: ${opt}`,
        },
      ]);
    };

  // ============================================
  // SEND MESSAGE
  // ============================================

  const sendMessage =
    async () => {

      if (
        !input.trim() ||
        loading
      ) {
        return;
      }

      const text =
        input.trim();

      const lower =
        text.toLowerCase();

      setMessages((prev) => [
        ...prev,

        {
          role: "user",
          text,
        },
      ]);

      setInput("");

      setLoading(true);

      // ============================================
      // DETECTAR ACTIVIDAD
      // ============================================

      if (
        lower.includes("actividad") ||
        lower.includes("actividades") ||
        lower.includes("no sé qué hacer") ||
        lower.includes("nose que hacer") ||
        lower.includes("me siento mal") ||
        lower.includes("aburrido") ||
        lower.includes("triste") ||
        lower.includes("ansioso") ||
        lower.includes("solo") ||
        lower.includes("ayuda")
      ) {

        setMessages((prev) => [
          ...prev,

          {
            role: "ai",

            text:
              "🤍 ¿Deseas iniciar una actividad para sentirte mejor?",

            options: [
              "Sí",
              "No",
            ],
          },
        ]);

        setLoading(false);

        return;
      }

      // ============================================
      // ESCRIBIR ACTIVIDAD
      // ============================================

      if (writingActivity) {

        await saveActivity(text);

        setMessages((prev) => [
          ...prev,

          {
            role: "ai",

            text:
              `✅ Actividad personalizada guardada: ${text}`,
          },
        ]);

        setWritingActivity(false);

        setLoading(false);

        return;
      }

      // ============================================
      // IA
      // ============================================

      const response =
        await askAI(text);

      // ============================================
      // ERROR IA
      // ============================================

      if (response?.error) {

        setMessages((prev) => [
          ...prev,

          {
            role: "ai",

            text:
              "🤍 Lo siento, ahora mismo no puedo entablar una conversación.",
          },

          {
            role: "ai",

            text:
              "Pero puedo ayudarte con una actividad para sentirte mejor 👇",

            options:
              mainOptions,
          },
        ]);

        setLoading(false);

        return;
      }

      // ============================================
      // RESPUESTA IA
      // ============================================

      setMessages((prev) => [
        ...prev,

        {
          role: "ai",

          text:
            response.reply ||
            "🤍 No pude responder.",
        },
      ]);

      setLoading(false);
    };

  // ============================================
  // UI
  // ============================================

  return (
    <div className="app-layout">

      {/* LEFT */}

      <div className="left-panel">

        <h4>
          💡 Acompañamiento
        </h4>

        <div className="quote-box">
          {frase}
        </div>

        <div
          className="user-name"
        >
          👤{" "}
          {user?.nombre ||
            "Usuario"}
        </div>

      </div>

      {/* CENTER */}

      <div className="center-panel">

        <ChatBox
          messages={messages}
          onOptionClick={
            handleOptionClick
          }
        />

        <InputBox
          input={input}
          setInput={setInput}
          sendMessage={
            sendMessage
          }
          loading={loading}
        />

      </div>

      {/* RIGHT */}

      <div className="right-panel">

        <button
          onClick={() =>
            navigate("/rutina")
          }
        >
          🧘 Rutina
        </button>

        <button
          onClick={() =>
            navigate(
              "/actividades"
            )
          }
        >
          🎯 Actividades
        </button>

        <button
          onClick={() =>
            navigate(
              "/estadisticas"
            )
          }
        >
          📊 Estadísticas
        </button>

        <button
          onClick={() =>
            navigate("/diario")
          }
        >
          📓 Diario
        </button>

      </div>

    </div>
  );
}
