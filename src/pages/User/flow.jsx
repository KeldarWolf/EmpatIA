// 🧠 Lógica del flujo conversacional

export const getInitialOptions = () => ({
  text: "¿Qué tipo de actividad quieres?",
  options: ["Relajación", "Motivación", "Ejercicio"],
});

export const getActivityOptions = (tipo) => {
  const opciones = {
    Relajación: [
      "Respirar profundo 5 min 🧘",
      "Escuchar música tranquila 🎧",
      "Cerrar ojos 3 min 😌",
    ],
    Motivación: [
      "Escribir 3 metas ✍️",
      "Leer algo inspirador 📖",
      "Decir 3 cosas buenas 💬",
    ],
    Ejercicio: [
      "Caminar 10 min 🚶",
      "Estiramientos 🧎",
      "Saltar 2 min 🤸",
    ],
  };

  return {
    text: `Opciones de ${tipo}:`,
    options: [
      ...opciones[tipo],
      "🔄 Cambiar opciones",
      "✍️ Escribir mi propia actividad",
    ],
  };
};