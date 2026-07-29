const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM perfiles WHERE usuario_id = $1", [req.usuarioId]);
  res.json(result.rows[0] || null);
});

router.put("/", async (req, res) => {
  const { peso, altura, edad, sexo, nivel, objetivo, equipo, grasa_pct, musculo_pct, agua_pct, visceral, dias_entreno } = req.body;
  await pool.query(
    `INSERT INTO perfiles (usuario_id, peso, altura, edad, sexo, nivel, objetivo, equipo, grasa_pct, musculo_pct, agua_pct, visceral, dias_entreno, actualizado_en)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, NOW())
     ON CONFLICT (usuario_id) DO UPDATE SET
       peso=$2, altura=$3, edad=$4, sexo=$5, nivel=$6, objetivo=$7, equipo=$8,
       grasa_pct=$9, musculo_pct=$10, agua_pct=$11, visceral=$12, dias_entreno=$13, actualizado_en=NOW()`,
    [req.usuarioId, peso, altura, edad, sexo, nivel, objetivo, JSON.stringify(equipo || []), grasa_pct, musculo_pct, agua_pct, visceral, dias_entreno || 3]
  );

  // Si vienen datos de balanza, también los guardamos como un punto histórico
  if (grasa_pct || musculo_pct || agua_pct || visceral) {
    await pool.query(
      `INSERT INTO medidas_corporales (usuario_id, fecha, peso, grasa_pct, musculo_pct, agua_pct, visceral)
       VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [req.usuarioId, peso, grasa_pct, musculo_pct, agua_pct, visceral]
    );
  }

  const result = await pool.query("SELECT * FROM perfiles WHERE usuario_id = $1", [req.usuarioId]);
  res.json(result.rows[0]);
});

router.get("/medidas", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM medidas_corporales WHERE usuario_id = $1 ORDER BY fecha ASC",
    [req.usuarioId]
  );
  res.json(result.rows);
});

router.post("/medidas", async (req, res) => {
  const { fecha, peso, grasa_pct, musculo_pct, agua_pct, visceral, cintura, pecho, brazo, pierna, cadera, foto } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO medidas_corporales
        (usuario_id, fecha, peso, grasa_pct, musculo_pct, agua_pct, visceral, cintura, pecho, brazo, pierna, cadera, foto)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [req.usuarioId, fecha || new Date().toISOString().slice(0, 10), peso, grasa_pct, musculo_pct, agua_pct, visceral, cintura, pecho, brazo, pierna, cadera, foto]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo guardar la medición" });
  }
});

router.delete("/medidas/:id", async (req, res) => {
  await pool.query("DELETE FROM medidas_corporales WHERE id = $1 AND usuario_id = $2", [req.params.id, req.usuarioId]);
  res.json({ ok: true });
});

module.exports = router;
