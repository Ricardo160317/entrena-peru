const jwt = require("jsonwebtoken");
const { pool } = require("../db");

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No autenticado" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const existe = await pool.query("SELECT id FROM usuarios WHERE id = $1", [payload.usuarioId]);
    if (existe.rows.length === 0) {
      return res.status(401).json({ error: "Sesión inválida o expirada" });
    }
    req.usuarioId = payload.usuarioId;
    next();
  } catch {
    return res.status(401).json({ error: "Sesión inválida o expirada" });
  }
}

module.exports = { requireAuth };
