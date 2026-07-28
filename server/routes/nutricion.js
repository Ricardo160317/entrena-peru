const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM nutricion_dias WHERE usuario_id = $1 ORDER BY fecha ASC",
    [req.usuarioId]
  );
  res.json(result.rows);
});

router.put("/:fecha", async (req, res) => {
  const { fecha } = req.params;
  const { comidas } = req.body;
  const result = await pool.query(
    `INSERT INTO nutricion_dias (usuario_id, fecha, comidas)
     VALUES ($1,$2,$3)
     ON CONFLICT (usuario_id, fecha) DO UPDATE SET comidas = $3
     RETURNING *`,
    [req.usuarioId, fecha, JSON.stringify(comidas)]
  );
  res.json(result.rows[0]);
});

module.exports = router;
