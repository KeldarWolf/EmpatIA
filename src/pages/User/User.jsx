const sendMessage = async () => {
  if (!input.trim()) return;

  const text = input;
  const lower = text.toLowerCase();

  setMessages((prev) => [...prev, { role: "user", text }]);
  setInput("");
  setLoading(true);

  // =========================
  // 🔥 DETECCIÓN ACTIVIDADES
  // =========================
  const triggerActivity =
    lower.includes("no sé") ||
    lower.includes("no se") ||
    lower.includes("que hacer") ||
    lower.includes("estoy aburrido") ||
    lower.includes("aburrido") ||
    lower.includes("actividad") ||
    lower.includes("actividades");

  // =========================
  // 🎯 SI ES ACTIVIDAD → BOTONES
  // =========================
  if (triggerActivity) {
    const options = [
      "Caminar",
      "Meditar",
      "Música",
      "Respirar",
      "Estiramientos",
      "Escribir lo que siento",
      "Ducha relajante",
      "Ejercicio ligero",
      "Salir a tomar aire",
      "Ordenar espacio",
    ];

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "Estoy contigo 🤍 elige algo que te ayude:",
        options,
      },
    ]);

    setLoading(false);
    return;
  }

  // =========================
  // 🤖 IA REAL (CASO NORMAL)
  // =========================
  try {
    const reply = await askAI(text, user?.nombre);

    // 🧠 respuestas cortas obligadas
    const shortReply = reply?.split(".")[0];

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: shortReply || "Te escucho 🤍",
      },
    ]);
  } catch (e) {
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "Te escucho 🤍",
      },
    ]);
  }

  setLoading(false);
};
