const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.post("/", async (req, res) => {
  const { mensaje, historial } = req.body;
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "El servidor no tiene configurada OPENAI_API_KEY" });
  }
  if (!mensaje) return res.status(400).json({ error: "Falta el mensaje" });

  try {
    const perfilRes = await pool.query("SELECT * FROM perfiles WHERE usuario_id = $1", [req.usuarioId]);
    const perfil = perfilRes.rows[0];

    const nutriRes = await pool.query(
      "SELECT * FROM nutricion_dias WHERE usuario_id = $1 AND fecha = CURRENT_DATE",
      [req.usuarioId]
    );
    const comidasHoy = nutriRes.rows[0]?.comidas || [];

    const entrenoRes = await pool.query(
      "SELECT * FROM entrenamientos WHERE usuario_id = $1 ORDER BY fecha DESC LIMIT 5",
      [req.usuarioId]
    );

    const medidasRes = await pool.query(
      "SELECT * FROM medidas_corporales WHERE usuario_id = $1 ORDER BY fecha DESC LIMIT 5",
      [req.usuarioId]
    );

    const contexto = `Eres un asesor experto en fitness y nutrición para una app peruana llamada Entrena Perú.
Responde en español, de forma breve, cálida y directa, basándote en los datos reales del usuario.
No des diagnósticos médicos ni reemplaces a un profesional de salud; para temas médicos sugiere consultar a un doctor.

Perfil: ${JSON.stringify(perfil)}
Comidas registradas hoy: ${JSON.stringify(comidasHoy)}
Últimos entrenamientos: ${JSON.stringify(entrenoRes.rows)}
Últimas medidas corporales (balanza): ${JSON.stringify(medidasRes.rows)}`;

    const mensajes = [
      { role: "system", content: contexto },
      ...(historial || []).slice(-6),
      { role: "user", content: mensaje },
    ];

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: mensajes,
        temperature: 0.6,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("Error de OpenAI:", errText);
      return res.status(502).json({ error: "El asesor de IA no respondió correctamente" });
    }

    const data = await openaiRes.json();
    const respuesta = data.choices?.[0]?.message?.content || "No pude generar una respuesta.";
    res.json({ respuesta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al consultar al asesor" });
  }
});

module.exports = router;
