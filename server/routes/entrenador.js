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

router.get("/clientes", requireEntrenador, async (req, res) => {
  const clientes = await pool.query(
    `SELECT u.id, u.email, u.creado_en,
       (SELECT MAX(fecha) FROM entrenamientos e WHERE e.usuario_id = u.id) AS ultima_sesion
     FROM usuarios u
     WHERE u.entrenador_id = $1
     ORDER BY u.creado_en DESC`,
    [req.usuarioId]
  );

  const entrenador = await pool.query(
    "SELECT codigo_invitacion, plan, limite_clientes, estado_suscripcion FROM usuarios WHERE id = $1",
    [req.usuarioId]
  );

  res.json({ clientes: clientes.rows, entrenador: entrenador.rows[0] });
});

module.exports = router;
