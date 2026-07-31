const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function generarCodigoInvitacion() {
  return crypto.randomBytes(3).toString("hex").toUpperCase(); // ej. "A1B2C3"
}

router.post("/registro", async (req, res) => {
  const { email, password, esEntrenador, codigoEntrenador, nombre } = req.body;

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: "Email y contraseña (mínimo 6 caracteres) son requeridos" });
  }

  try {
    const existe = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email.toLowerCase()]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese email" });
    }

    let entrenadorId = null;
    if (codigoEntrenador && codigoEntrenador.trim()) {
      const entrenador = await pool.query(
        "SELECT id, limite_clientes FROM usuarios WHERE codigo_invitacion = $1 AND rol = 'entrenador'",
        [codigoEntrenador.trim().toUpperCase()]
      );
      if (entrenador.rows.length === 0) {
        return res.status(400).json({ error: "Código de entrenador inválido" });
      }
      const entr = entrenador.rows[0];
      if (entr.limite_clientes != null) {
        const conteo = await pool.query("SELECT COUNT(*) FROM usuarios WHERE entrenador_id = $1", [entr.id]);
        if (Number(conteo.rows[0].count) >= entr.limite_clientes) {
          return res.status(400).json({ error: "Este entrenador alcanzó el límite de su plan actual" });
        }
      }
      entrenadorId = entr.id;
    }

    const hash = await bcrypt.hash(password, 10);
    const rol = esEntrenador ? "entrenador" : "usuario";
    const codigoInvitacion = esEntrenador ? generarCodigoInvitacion() : null;

    const result = await pool.query(
      `INSERT INTO usuarios (email, password_hash, rol, entrenador_id, codigo_invitacion, nombre)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [email.toLowerCase(), hash, rol, entrenadorId, codigoInvitacion, nombre?.trim() || null]
    );
    const usuarioId = result.rows[0].id;
    const token = jwt.sign({ usuarioId }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la cuenta" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT id, password_hash FROM usuarios WHERE email = $1", [
      (email || "").toLowerCase(),
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }
    const usuario = result.rows[0];
    const ok = await bcrypt.compare(password, usuario.password_hash);
    if (!ok) return res.status(401).json({ error: "Email o contraseña incorrectos" });
    const token = jwt.sign({ usuarioId: usuario.id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const result = await pool.query(
    "SELECT id, email, nombre, rol, entrenador_id, codigo_invitacion, plan, limite_clientes, estado_suscripcion FROM usuarios WHERE id = $1",
    [req.usuarioId]
  );
  res.json(result.rows[0] || null);
});

router.put("/nombre", requireAuth, async (req, res) => {
  const { nombre } = req.body;
  await pool.query("UPDATE usuarios SET nombre = $1 WHERE id = $2", [nombre?.trim() || null, req.usuarioId]);
  res.json({ ok: true, nombre: nombre?.trim() || null });
});

module.exports = router;
