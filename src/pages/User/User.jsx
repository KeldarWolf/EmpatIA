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

// =========================
// MENÚ PRINCIPAL
// =========================

const mainOptions = [
  "🎵 Música",
  "🧘 Relajación",
  "🏃 Actividad física",
  "✍️ Escribir actividad",
  "❓ No sé cuál",
];

// =========================
// SUB MENÚS
// =========================

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

  const [frase, setFrase] =
    useState("");

  // ============================================
  // INIT
  // ============================================

  useEffect(() => {

    setMessages([
      {
        role: "ai",
        text: `Hola ${
          user?.nombre || "🤍"
        }, estoy aquí contigo.`,
      },

      {
        role: "ai",
        text:
          "Cuéntame cómo te sientes o elige una actividad 👇",

        options: mainOptions,
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

      // ERROR BACKEND
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
  // SAVE ACTIVITY
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
  // HANDLE OPTION CLICK
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

      // ============================
      // SUB MENUS
      // ============================

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

      // ============================
      // RESET MENU
      // ============================

      if (opt === "❓ No sé cuál") {

        setMessages((prev) => [
          ...prev,

          {
            role: "ai",

            text:
              "Te dejo opciones 👇",

            options:
              mainOptions,
          },
        ]);

        return;
      }

      // ============================
      // WRITE ACTIVITY
      // ============================

      if (
        opt.includes(
          "Escribir"
        )
      ) {

        setMessages((prev) => [
          ...prev,

          {
            role: "ai",

            text:
              "✍️ Escribe tu actividad:",
          },
        ]);

        return;
      }

      // ============================
      // SAVE ACTIVITY
      // ============================

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
      // IA RESPONSE
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
