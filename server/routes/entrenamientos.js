const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM entrenamientos WHERE usuario_id = $1 ORDER BY fecha ASC, id ASC",
    [req.usuarioId]
  );
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { fecha, lugar, grupo, ejercicios, duracion_min } = req.body;
  const result = await pool.query(
    `INSERT INTO entrenamientos (usuario_id, fecha, lugar, grupo, ejercicios, duracion_min)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.usuarioId, fecha, lugar, grupo, JSON.stringify(ejercicios), duracion_min || null]
  );
  res.json(result.rows[0]);
});

module.exports = router;
