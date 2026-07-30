const express = require("express");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.post("/comida", async (req, res) => {
  const { imagen } = req.body;
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "El servidor no tiene configurada OPENAI_API_KEY" });
  }
  if (!imagen) return res.status(400).json({ error: "Falta la imagen" });

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Eres un nutricionista que estima macronutrientes a partir de fotos de comida. " +
              "Responde ÚNICAMENTE con JSON válido, sin texto adicional ni markdown, con esta forma exacta: " +
              '{"nombre": string, "gramos_estimados": number, "kcal": number, "prot": number, "carb": number, "grasa": number, "confianza": "alta"|"media"|"baja"}. ' +
              "Estima la porción visible en el plato tal cual se ve. Si no puedes identificar comida en la imagen, responde con nombre: \"No identificado\" y todos los valores en 0.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Estima las calorías y macros de esta comida." },
              { type: "image_url", image_url: { url: imagen } },
            ],
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("Error de OpenAI (visión):", errText);
      return res.status(502).json({ error: "No se pudo analizar la foto" });
    }

    const data = await openaiRes.json();
    let texto = data.choices?.[0]?.message?.content || "{}";
    texto = texto.replace(/```json|```/g, "").trim();

    let estimado;
    try {
      estimado = JSON.parse(texto);
    } catch {
      return res.status(502).json({ error: "La IA no devolvió un formato reconocible, intenta con otra foto" });
    }

    res.json(estimado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al analizar la foto" });
  }
});

router.post("/texto", async (req, res) => {
  const { nombre, gramos } = req.body;
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "El servidor no tiene configurada OPENAI_API_KEY" });
  }
  if (!nombre) return res.status(400).json({ error: "Falta el nombre del alimento" });

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Eres un nutricionista que conoce los valores nutricionales aproximados de alimentos, incluyendo comida peruana y suplementos deportivos. " +
              "Responde ÚNICAMENTE con JSON válido, sin texto adicional ni markdown, con esta forma exacta: " +
              '{"nombre": string, "gramos_estimados": number, "kcal": number, "prot": number, "carb": number, "grasa": number}. ' +
              "Si te dan una cantidad en gramos, usa esa cantidad para el cálculo; si no, usa una porción típica y común de ese alimento.",
          },
          {
            role: "user",
            content: `Alimento: ${nombre}${gramos ? `. Cantidad: ${gramos}g` : ""}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("Error de OpenAI (texto):", errText);
      return res.status(502).json({ error: "No se pudo consultar la IA" });
    }

    const data = await openaiRes.json();
    let texto = data.choices?.[0]?.message?.content || "{}";
    texto = texto.replace(/```json|```/g, "").trim();

    let estimado;
    try {
      estimado = JSON.parse(texto);
    } catch {
      return res.status(502).json({ error: "La IA no devolvió un formato reconocible" });
    }

    res.json(estimado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al consultar la IA" });
  }
});

module.exports = router;
