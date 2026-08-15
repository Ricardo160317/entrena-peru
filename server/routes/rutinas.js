const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

async function requireEntrenador(req, res, next) {
  const result = await pool.query("SELECT rol FROM usuarios WHERE id = $1", [req.usuarioId]);
  if (result.rows[0]?.rol !== "entrenador") {
    return res.status(403).json({ error: "Solo disponible para cuentas de entrenador" });
  }
  next();
}

async function esClienteDelEntrenador(entrenadorId, clienteId) {
  const r = await pool.query("SELECT id FROM usuarios WHERE id = $1 AND entrenador_id = $2", [clienteId, entrenadorId]);
  return r.rows.length > 0;
}

// ---------- Favoritas (entrenador) ----------

router.get("/favoritas", requireEntrenador, async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM rutinas_favoritas WHERE entrenador_id = $1 ORDER BY creado_en DESC",
    [req.usuarioId]
  );
  res.json(result.rows);
});

router.post("/favoritas", requireEntrenador, async (req, res) => {
  const { nombre, grupo, ejercicios } = req.body;
  if (!nombre || !grupo || !Array.isArray(ejercicios) || ejercicios.length === 0) {
    return res.status(400).json({ error: "Faltan datos de la rutina" });
  }
  const result = await pool.query(
    "INSERT INTO rutinas_favoritas (entrenador_id, nombre, grupo, ejercicios) VALUES ($1,$2,$3,$4) RETURNING *",
    [req.usuarioId, nombre, grupo, JSON.stringify(ejercicios)]
  );
  res.json(result.rows[0]);
});

router.delete("/favoritas/:id", requireEntrenador, async (req, res) => {
  await pool.query("DELETE FROM rutinas_favoritas WHERE id = $1 AND entrenador_id = $2", [req.params.id, req.usuarioId]);
  res.json({ ok: true });
});

// ---------- Asignar una favorita a un cliente ----------

router.post("/asignar", requireEntrenador, async (req, res) => {
  const { clienteId, rutinaFavoritaId } = req.body;
  const esCliente = await esClienteDelEntrenador(req.usuarioId, clienteId);
  if (!esCliente) return res.status(403).json({ error: "Ese usuario no es tu cliente" });

  const favorita = await pool.query("SELECT * FROM rutinas_favoritas WHERE id = $1 AND entrenador_id = $2", [
    rutinaFavoritaId,
    req.usuarioId,
  ]);
  if (favorita.rows.length === 0) return res.status(404).json({ error: "Rutina favorita no encontrada" });
  const fav = favorita.rows[0];

  const result = await pool.query(
    `INSERT INTO rutinas_asignadas (cliente_id, grupo, origen, rutina_favorita_id, ejercicios, asignado_por, generado_en)
     VALUES ($1,$2,'entrenador',$3,$4,$5, NOW())
     ON CONFLICT (cliente_id, grupo) DO UPDATE SET
       origen='entrenador', rutina_favorita_id=$3, ejercicios=$4, asignado_por=$5, generado_en=NOW()
     RETURNING *`,
    [clienteId, fav.grupo, fav.id, fav.ejercicios, req.usuarioId]
  );
  res.json(result.rows[0]);
});

// ---------- Generar con IA (el entrenador para un cliente, o cualquier usuario para sí mismo) ----------

async function generarRutinaConIA({ grupo, perfilCliente }) {
  const guiaPorObjetivo =
    perfilCliente.objetivo === "bajar"
      ? `Objetivo de bajar grasa: usa reps más altas (12-20 según el ejercicio) y descansos cortos entre series para maximizar la densidad de la sesión sin sacrificar la intensidad (así se preserva el músculo mientras se pierde grasa). Incluye 1 ejercicio final de acondicionamiento (ej. burpees, mountain climbers, sentadilla con salto) si el equipo lo permite.`
      : `Usa reps de 6-8 para los movimientos compuestos principales y 10-15 para accesorios/aislamiento (rango estándar de hipertrofia).`;
  const prompt = `Genera una rutina de ejercicios para el grupo muscular "${grupo}" (opciones de grupo: empuje=pecho/hombro/tríceps, tiron=espalda/bíceps, pierna, abdomen, full=cardio/full body).
Perfil de la persona: objetivo=${perfilCliente.objetivo}, nivel de actividad=${perfilCliente.nivel}, equipo disponible=${JSON.stringify(perfilCliente.equipo || [])}.
Lesiones o molestias a evitar: ${JSON.stringify(perfilCliente.lesiones || [])} (si la lista no está vacía, evita ejercicios que carguen esas zonas; por ejemplo si dice "rodilla", evita sentadillas profundas o saltos).
${guiaPorObjetivo}
Responde ÚNICAMENTE con JSON válido, sin texto ni markdown, con este formato exacto:
{"ejercicios": [{"nombre": string, "series": number, "reps": string}]}
Incluye entre 4 y 6 ejercicios variados y realistas, usando solo equipo de la lista disponible (o ninguno si la lista está vacía, usando peso corporal).`;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!openaiRes.ok) throw new Error("No se pudo generar la rutina con IA");
  const data = await openaiRes.json();
  let texto = data.choices?.[0]?.message?.content || "{}";
  texto = texto.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(texto);
  return parsed.ejercicios || [];
}

router.post("/asignar-ia", requireEntrenador, async (req, res) => {
  const { clienteId, grupo } = req.body;
  const esCliente = await esClienteDelEntrenador(req.usuarioId, clienteId);
  if (!esCliente) return res.status(403).json({ error: "Ese usuario no es tu cliente" });

  try {
    const perfilResult = await pool.query("SELECT objetivo, nivel, equipo, lesiones FROM perfiles WHERE usuario_id = $1", [clienteId]);
    const perfilCliente = perfilResult.rows[0] || { objetivo: "mantener", nivel: "moderado", equipo: [], lesiones: [] };
    const ejercicios = await generarRutinaConIA({ grupo, perfilCliente });

    const result = await pool.query(
      `INSERT INTO rutinas_asignadas (cliente_id, grupo, origen, ejercicios, asignado_por, generado_en)
       VALUES ($1,$2,'ia',$3,$4, NOW())
       ON CONFLICT (cliente_id, grupo) DO UPDATE SET
         origen='ia', rutina_favorita_id=NULL, ejercicios=$3, asignado_por=$4, generado_en=NOW()
       RETURNING *`,
      [clienteId, grupo, JSON.stringify(ejercicios), req.usuarioId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo generar la rutina con IA" });
  }
});

// Autoservicio: cualquier usuario genera/renueva su propia rutina de un grupo con IA
router.post("/mi-ia", async (req, res) => {
  const { grupo } = req.body;
  try {
    const perfilResult = await pool.query("SELECT objetivo, nivel, equipo, lesiones FROM perfiles WHERE usuario_id = $1", [req.usuarioId]);
    const perfilCliente = perfilResult.rows[0] || { objetivo: "mantener", nivel: "moderado", equipo: [], lesiones: [] };
    const ejercicios = await generarRutinaConIA({ grupo, perfilCliente });

    const result = await pool.query(
      `INSERT INTO rutinas_asignadas (cliente_id, grupo, origen, ejercicios, asignado_por, generado_en)
       VALUES ($1,$2,'ia',$3,$1, NOW())
       ON CONFLICT (cliente_id, grupo) DO UPDATE SET
         origen='ia', rutina_favorita_id=NULL, ejercicios=$3, asignado_por=$1, generado_en=NOW()
       RETURNING *`,
      [req.usuarioId, grupo, JSON.stringify(ejercicios)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo generar la rutina con IA" });
  }
});

// ---------- El cliente consulta sus rutinas asignadas ----------

router.get("/mias", async (req, res) => {
  const result = await pool.query("SELECT * FROM rutinas_asignadas WHERE cliente_id = $1", [req.usuarioId]);
  res.json(result.rows);
});

router.delete("/mias/:grupo", async (req, res) => {
  await pool.query("DELETE FROM rutinas_asignadas WHERE cliente_id = $1 AND grupo = $2", [req.usuarioId, req.params.grupo]);
  res.json({ ok: true });
});

module.exports = router;
