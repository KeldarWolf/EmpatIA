import express from "express";
import fetch from "node-fetch";

const app = express();

app.use(express.json());

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await r.json();

    // 🔌 DEVOLUCIÓN DIRECTA (SIN FILTRO)
    res.json(data);

  } catch (error) {
    console.error("CHAT ERROR:", error);
    res.status(500).json(error);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("🚀 Chat listo en puerto", PORT);
});
