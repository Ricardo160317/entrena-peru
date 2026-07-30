const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const habitos = await pool.query("SELECT * FROM habitos WHERE usuario_id = $1 ORDER BY id ASC", [req.usuarioId]);
  const registros = await pool.query(
    `SELECT r.* FROM habito_registros r
     JOIN habitos h ON h.id = r.habito_id
     WHERE h.usuario_id = $1
     ORDER BY r.fecha ASC`,
    [req.usuarioId]
  );
  res.json({ habitos: habitos.rows, registros: registros.rows });
});

router.post("/", async (req, res) => {
  const { nombre, emoji } = req.body;
  if (!nombre) return res.status(400).json({ error: "Falta el nombre del hábito" });
  const result = await pool.query(
    "INSERT INTO habitos (usuario_id, nombre, emoji) VALUES ($1,$2,$3) RETURNING *",
    [req.usuarioId, nombre, emoji || "✅"]
  );
  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM habitos WHERE id = $1 AND usuario_id = $2", [req.params.id, req.usuarioId]);
  res.json({ ok: true });
});

// Marca/desmarca un hábito para una fecha (toggle)
router.post("/:id/toggle", async (req, res) => {
  const { fecha } = req.body;
  const dueño = await pool.query("SELECT id FROM habitos WHERE id = $1 AND usuario_id = $2", [req.params.id, req.usuarioId]);
  if (dueño.rows.length === 0) return res.status(404).json({ error: "Hábito no encontrado" });

  const existente = await pool.query("SELECT id FROM habito_registros WHERE habito_id = $1 AND fecha = $2", [req.params.id, fecha]);
  if (existente.rows.length > 0) {
    await pool.query("DELETE FROM habito_registros WHERE id = $1", [existente.rows[0].id]);
    return res.json({ marcado: false });
  }
  await pool.query("INSERT INTO habito_registros (habito_id, fecha) VALUES ($1,$2)", [req.params.id, fecha]);
  res.json({ marcado: true });
});

module.exports = router;
